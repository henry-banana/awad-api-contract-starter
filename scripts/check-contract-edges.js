// TDTH-FLAG
// Extra checks written from CONTRACT.md. The supplied test source is not read.
import assert from 'node:assert/strict';
import { fork, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { open } from '../src/db.js';

if (process.argv.includes('--worker')) {
  const db = open();
  const server = createApp(db).listen(0, '127.0.0.1', () => {
    process.send({ port: server.address().port });
  });
  process.on('message', () => server.close(() => { db.close(); process.exit(0); }));
} else {
  await main();
}

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'ia03-edges-'));
  const dbPath = join(scratch, 'app.db');
  const env = { ...process.env, DB_PATH: dbPath };
  const migrate = (direction) => execFileSync(process.execPath, ['scripts/migrate.js', direction], {
    cwd: root, env, stdio: 'inherit',
  });
  migrate('up');
  migrate('down');
  migrate('up');
  console.log('PASS: new migration can be reverted and reapplied.');
  const fixture = open(dbPath);
  fixture.prepare('INSERT INTO menu_items (id, name, price_vnd) VALUES (?, ?, ?)').run(1, 'Item one', 45500);
  fixture.prepare('INSERT INTO menu_items (id, name, price_vnd) VALUES (?, ?, ?)').run(2, 'Item two', 15000);

  const workers = new Set();
  async function start() {
    const child = fork(fileURLToPath(import.meta.url), ['--worker'], { env, stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    workers.add(child);
    const [message] = await once(child, 'message');
    return { child, url: `http://127.0.0.1:${message.port}` };
  }
  async function stop(worker) {
    const exited = once(worker.child, 'exit');
    worker.child.send('stop');
    await exited;
    workers.delete(worker.child);
  }
  async function request(worker, path, options) {
    const response = await fetch(worker.url + path, { ...options, signal: AbortSignal.timeout(15000) });
    return { status: response.status, headers: response.headers, body: await response.json() };
  }
  const post = (worker, key, body) => request(worker, '/v1/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body),
  });
  const body = { tableId: 7, items: [{ menuItemId: 1, qty: 2 }, { menuItemId: 2, qty: 1 }] };

  try {
    const first = await start();
    const second = await start();
    const original = await post(first, 'nested-json', { ...body, extra: { z: 2, a: { y: 1, x: 0 } } });
    assert.equal(original.status, 201);
    assert.equal(original.body.totalVnd, 106000);
    const reordered = await post(second, 'nested-json', { extra: { a: { x: 0, y: 1 }, z: 2 }, items: body.items, tableId: 7 });
    assert.equal(reordered.status, 201);
    assert.deepEqual(reordered.body, original.body);
    assert.equal(reordered.headers.get('idempotent-replayed'), 'true');
    assert.equal((await post(first, 'nested-json', { ...body, extra: { z: 3, a: { x: 0, y: 1 } } })).status, 422);
    console.log('PASS: nested object key order replays; changed unknown field values conflict.');

    const concurrent = await Promise.all(Array.from({ length: 40 }, (_, i) => post(i % 2 ? first : second, 'two-process-race', body)));
    assert(concurrent.every((result) => result.status === 201 || result.status === 409));
    const successes = concurrent.filter((result) => result.status === 201);
    assert(successes.length > 0);
    assert.equal(successes.filter((result) => result.headers.get('idempotent-replayed') !== 'true').length, 1);
    for (const result of successes) assert.deepEqual(result.body, successes[0].body);
    const completed = await post(second, 'two-process-race', body);
    assert.equal(completed.status, 201);
    assert.equal(completed.headers.get('idempotent-replayed'), 'true');
    console.log(`PASS: 40 simultaneous requests across two processes created one order (${concurrent.filter((r) => r.status === 409).length} in-flight responses).`);

    await stop(first);
    const restarted = await start();
    const persisted = await post(restarted, 'nested-json', { ...body, extra: { a: { x: 0, y: 1 }, z: 2 } });
    assert.equal(persisted.status, 201);
    assert.deepEqual(persisted.body, original.body);
    assert.equal(persisted.headers.get('location'), original.headers.get('location'));
    assert.equal(persisted.headers.get('idempotent-replayed'), 'true');
    console.log('PASS: a restarted server replays the stored response from the shared database.');

    fixture.exec("CREATE TRIGGER edge_failure BEFORE INSERT ON order_items BEGIN SELECT RAISE(ABORT, 'edge-fixture-private'); END;");
    const failed = await post(restarted, 'rollback-and-retry', body);
    assert.equal(failed.status, 500);
    assert.equal(failed.body.detail, 'An internal error occurred.');
    assert(!JSON.stringify(failed.body).includes('edge-fixture-private'));
    fixture.exec('DROP TRIGGER edge_failure');
    assert.equal((await post(restarted, 'rollback-and-retry', body)).status, 201);
    const orders = await request(restarted, '/v1/orders');
    assert.equal(orders.body.items.length, 3);
    console.log('PASS: a failed order transaction rolls back and leaves its key reusable.');

    const page = await request(restarted, '/v1/orders?tableId=7&limit=1');
    assert.equal(page.status, 200);
    assert.equal(typeof page.body.nextCursor, 'string');
    const cursor = encodeURIComponent(page.body.nextCursor);
    const otherFilter = await request(second, `/v1/orders?tableId=8&cursor=${cursor}`);
    assert.equal(otherFilter.status, 400);
    assert(otherFilter.body.errors.some((error) => error.parameter === 'cursor'));
    const changedLimit = await request(second, `/v1/orders?tableId=7&limit=100&cursor=${cursor}`);
    assert.equal(changedLimit.status, 200);
    assert.equal(changedLimit.body.items.length, 2);
    assert.equal(changedLimit.body.nextCursor, null);
    const badParams = await request(second, '/v1/orders?tableId=0&limit=101&cursor=bad');
    assert.deepEqual(badParams.body.errors.map((error) => error.parameter).sort(), ['cursor', 'limit', 'tableId']);
    console.log('PASS: cursors bind tableId, permit page-size changes, and report all invalid query parameters.');

    for (const [path, options] of [
      ['/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"name":"New item","price":30}' }],
      ['/menu/1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{"price":40}' }],
      ['/menu/missing', undefined],
    ]) {
      const result = await request(second, path, options);
      assert.equal(result.headers.get('deprecation'), '@1792022400');
      assert.equal(result.headers.get('sunset'), 'Thu, 31 Dec 2026 23:59:59 GMT');
      assert.equal(result.headers.get('content-type'), 'application/json');
    }
    console.log('PASS: legacy writes and errors carry deprecation headers and keep the JSON media type.');
    // A controlled lease fixture makes in-flight and crash recovery deterministic;
    // the real concurrency check above intentionally makes no timing assertion.
    fixture.prepare('INSERT INTO idempotency_in_flight (key, owner, expires_at) VALUES (?, ?, ?)')
      .run('lease-recovery', 'abandoned-owner', Date.now() + 60000);
    const busy = await post(second, 'lease-recovery', body);
    assert.equal(busy.status, 409);
    assert.equal(busy.body.type, 'https://menu.example/problems/idempotency-key-in-flight');
    fixture.prepare('UPDATE idempotency_in_flight SET expires_at = ? WHERE key = ?')
      .run(Date.now() - 1, 'lease-recovery');
    assert.equal((await post(second, 'lease-recovery', body)).status, 201);
    console.log('PASS: a controlled live-lease fixture returns 409; an expired lease can be reclaimed.');
    console.log('All 8 extra verification groups passed.');
  } finally {
    await Promise.all([...workers].map((child) => new Promise((resolve) => {
      child.once('exit', resolve);
      if (child.connected) child.send('stop');
      else child.kill();
    })));
    fixture.close();
  }
}
