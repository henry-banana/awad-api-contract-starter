// The /v1 API. Implement it from CONTRACT.md — the contract is the spec.
//
// createV1(db) returns a handler for every request whose path is /v1 or starts
// with /v1/. The handler must answer the request and return true. Returning
// false (as this stub does) hands the request to the legacy code, which
// answers 404 { error: 'not_found' } — the wrong shape for /v1.
//
// Helpers you may use: send(), readRaw() in ./http.js.
// Schema: migrations/001_init.up.sql. Add new tables as migrations/002_*.sql.

// TDTH-FLAG
import { createHash, randomUUID } from 'node:crypto';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { send, readRaw } from './http.js';

const problems = {
  'invalid-json': [400, 'Malformed JSON'],
  validation: [400, 'Invalid request'],
  'idempotency-key-missing': [400, 'Idempotency-Key required'],
  'not-found': [404, 'Not found'],
  'idempotency-key-in-flight': [409, 'Request in progress'],
  'unknown-menu-item': [422, 'Unknown menu item'],
  'idempotency-key-reused': [422, 'Idempotency-Key reused'],
  internal: [500, 'Internal error'],
};

function problem(slug, detail, errors) {
  const [status, title] = problems[slug];
  const body = { type: `https://menu.example/problems/${slug}`, title, status, detail };
  if (errors !== undefined) body.errors = errors;
  return { status, body, headers: { 'content-type': 'application/problem+json' } };
}

const notFound = () => problem('not-found', 'The requested resource was not found.');
const inFlight = () => problem('idempotency-key-in-flight', 'A request with this key is still in progress.');
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const inRange = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;

// Sort object keys recursively, but keep array order and all unknown field values.
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function decimal(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return NaN;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : NaN;
}

function validateOrder(body) {
  if (!isObject(body)) return [{ pointer: '', detail: 'must be a JSON object' }];
  const errors = [];
  if (!inRange(body.tableId, 1, 200)) {
    errors.push({ pointer: '/tableId', detail: 'must be an integer from 1 to 200' });
  }
  if (!Array.isArray(body.items)) {
    errors.push({ pointer: '/items', detail: 'must be an array of 1 to 20 lines' });
    return errors;
  }
  if (!inRange(body.items.length, 1, 20)) {
    errors.push({ pointer: '/items', detail: 'must contain 1 to 20 lines' });
  }
  body.items.forEach((item, i) => {
    if (!isObject(item) || !inRange(item.menuItemId, 1, Number.MAX_SAFE_INTEGER)) {
      errors.push({ pointer: `/items/${i}/menuItemId`, detail: 'must be a positive integer' });
    }
    if (!isObject(item) || !inRange(item.qty, 1, 20)) {
      errors.push({ pointer: `/items/${i}/qty`, detail: 'must be an integer from 1 to 20' });
    }
  });
  return errors;
}

export function createV1(db) {
  // Prepare statements at request time so database failures reach the v1 catch.
  function transaction(work) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  function orderView(row) {
    const items = db.prepare(`SELECT menu_item_id AS menuItemId, qty,
      unit_price_vnd AS unitPriceVnd FROM order_items WHERE order_id = ? ORDER BY line`).all(row.id);
    return { id: row.id, tableId: row.table_id, items, totalVnd: row.total_vnd, createdAt: row.created_at };
  }

  function replay(row, fingerprint) {
    if (row.fingerprint !== fingerprint) {
      return problem('idempotency-key-reused', 'This key was already used with a different body.');
    }
    return {
      status: row.response_status,
      body: JSON.parse(row.response_body),
      headers: { Location: row.location, 'Idempotent-Replayed': 'true' },
    };
  }

  function claimKey(key, fingerprint) {
    return transaction(() => {
      const stored = db.prepare('SELECT * FROM idempotency_keys WHERE key = ?').get(key);
      if (stored) return { response: replay(stored, fingerprint) };
      const now = Date.now();
      db.prepare('DELETE FROM idempotency_in_flight WHERE key = ? AND expires_at <= ?').run(key, now);
      const owner = randomUUID();
      const { changes } = db.prepare(`INSERT OR IGNORE INTO idempotency_in_flight
        (key, owner, expires_at) VALUES (?, ?, ?)`).run(key, owner, now + 60000);
      return changes ? { owner } : { response: inFlight() };
    });
  }

  async function placeOrder(req) {
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || key.length < 1 || key.length > 255) {
      return problem('idempotency-key-missing', 'Provide an Idempotency-Key of 1 to 255 characters.');
    }
    let body;
    try { body = JSON.parse(await readRaw(req)); }
    catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      return problem('invalid-json', 'The request body is not valid JSON.');
    }
    const fingerprint = createHash('sha256').update(canonicalJson(body)).digest('hex');
    const claim = claimKey(key, fingerprint);
    if (claim.response) return claim.response;
    try {
      // Other requests, including other instances, can observe the durable claim.
      await nextTurn();
      const errors = validateOrder(body);
      if (errors.length) return problem('validation', 'The request has invalid fields.', errors);
      return transaction(() => {
        const lease = db.prepare('SELECT owner, expires_at FROM idempotency_in_flight WHERE key = ?').get(key);
        if (!lease || lease.owner !== claim.owner || lease.expires_at <= Date.now()) return inFlight();
        const getMenu = db.prepare('SELECT price_vnd FROM menu_items WHERE id = ?');
        const unknown = [];
        const items = body.items.map((item, i) => {
          const menu = getMenu.get(item.menuItemId);
          if (!menu) unknown.push({ pointer: `/items/${i}/menuItemId`, detail: `menu item ${item.menuItemId} does not exist` });
          return { menuItemId: item.menuItemId, qty: item.qty, unitPriceVnd: menu?.price_vnd };
        });
        if (unknown.length) return problem('unknown-menu-item', 'The order names unknown menu items.', unknown);
        const totalVnd = items.reduce((total, item) => total + item.unitPriceVnd * item.qty, 0);
        const createdAt = new Date().toISOString();
        const { lastInsertRowid } = db.prepare(`INSERT INTO orders (table_id, total_vnd, created_at)
          VALUES (?, ?, ?)`).run(body.tableId, totalVnd, createdAt);
        const id = Number(lastInsertRowid);
        const insertLine = db.prepare(`INSERT INTO order_items
          (order_id, line, menu_item_id, qty, unit_price_vnd) VALUES (?, ?, ?, ?, ?)`);
        items.forEach((item, line) => insertLine.run(id, line, item.menuItemId, item.qty, item.unitPriceVnd));
        const order = { id, tableId: body.tableId, items, totalVnd, createdAt };
        const location = `/v1/orders/${id}`;
        db.prepare(`INSERT INTO idempotency_keys
          (key, fingerprint, response_status, location, response_body, created_at)
          VALUES (?, ?, 201, ?, ?, ?)`).run(key, fingerprint, location, JSON.stringify(order), createdAt);
        db.prepare('DELETE FROM idempotency_in_flight WHERE key = ? AND owner = ?').run(key, claim.owner);
        return { status: 201, body: order, headers: { Location: location } };
      });
    } finally {
      // Failed requests do not consume a key. Crashed owners have a bounded lease.
      db.prepare('DELETE FROM idempotency_in_flight WHERE key = ? AND owner = ?').run(key, claim.owner);
    }
  }

  function listOrders(url) {
    const params = url.searchParams;
    const tableId = params.has('tableId') ? decimal(params.get('tableId')) : null;
    const limit = params.has('limit') ? decimal(params.get('limit')) : 20;
    const errors = [];
    if (tableId !== null && !inRange(tableId, 1, 200)) {
      errors.push({ parameter: 'tableId', detail: 'must be an integer from 1 to 200' });
    }
    if (!inRange(limit, 1, 100)) errors.push({ parameter: 'limit', detail: 'must be an integer from 1 to 100' });
    let before = null;
    if (params.has('cursor')) {
      try {
        const text = params.get('cursor');
        if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('invalid encoding');
        const bytes = Buffer.from(text, 'base64url');
        if (bytes.toString('base64url') !== text) throw new Error('invalid encoding');
        const cursor = JSON.parse(bytes.toString('utf8'));
        if (!isObject(cursor) || cursor.v !== 1 || !inRange(cursor.before, 1, Number.MAX_SAFE_INTEGER) ||
          cursor.tableId !== tableId) throw new Error('invalid position or filter');
        before = cursor.before;
      } catch {
        errors.push({ parameter: 'cursor', detail: 'must be a readable cursor for the same tableId' });
      }
    }
    if (errors.length) return problem('validation', 'The request has invalid query parameters.', errors);
    const rows = db.prepare(`SELECT * FROM orders
      WHERE (? IS NULL OR table_id = ?) AND (? IS NULL OR id < ?)
      ORDER BY id DESC LIMIT ?`).all(tableId, tableId, before, before, limit + 1);
    const more = rows.length > limit;
    const page = rows.slice(0, limit);
    const nextCursor = more ? Buffer.from(JSON.stringify({ v: 1, before: page.at(-1).id, tableId })).toString('base64url') : null;
    return { status: 200, body: { items: page.map(orderView), nextCursor } };
  }

  async function dispatch(req, url) {
    if (url.pathname === '/v1/orders') {
      if (req.method === 'POST') return placeOrder(req);
      if (req.method === 'GET') return listOrders(url);
    }
    const match = /^\/v1\/(menu|orders)\/([^/]+)$/.exec(url.pathname);
    if (!match || req.method !== 'GET') return notFound();
    const id = decimal(match[2]);
    if (!inRange(id, 1, Number.MAX_SAFE_INTEGER)) return notFound();
    if (match[1] === 'menu') {
      const row = db.prepare('SELECT id, name, price_vnd AS priceVnd FROM menu_items WHERE id = ?').get(id);
      return row ? { status: 200, body: row } : notFound();
    }
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return row ? { status: 200, body: orderView(row) } : notFound();
  }

  return async function handleV1(req, res, url) {
    let response;
    try { response = await dispatch(req, url); }
    catch (error) {
      console.error(error);
      response = problem('internal', 'An internal error occurred.');
    }
    send(res, response.status, response.body, response.headers);
    return true;
  };
}
