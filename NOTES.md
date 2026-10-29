# IA03 notes

TDTH-FLAG

## Authorship and chronology

These notes were drafted with AI assistance at the student's request. TDTH-FLAG
marks AI-assisted material. They are not evidence of unaided student predictions
or an independently discovered student ambiguity. AI-LOG.md is reserved for the
student and has not been created by the assistant.

Starter commit: ee78c393bbec0c3715862b226a23644e35331f45.
Work date: 2026-10-29, Asia/Saigon. No commit date is backdated.
The assistant read CONTRACT.md and source files, but did not open test source.
Test execution and its reported names and assertion failures are allowed evidence.

## Baseline

Windows Node v24.16.0: migration initially failed because URL.pathname leaves a
drive prefix and percent escapes in a filesystem path. scripts/migrate.js now
uses fileURLToPath. This environment fix was made before API implementation.
Legacy: 3 passed. Contract: 0 passed, 27 failed, 2 cancelled in the multi-instance
setup hook. baseline-contract.txt preserves that run, not an implementation run.
Linux Node v22.13.1 through WSL, from a clean temporary path: legacy 3 passed;
contract 0 passed, 29 failed, 0 cancelled. baseline-contract-linux.txt records it.
Besides Windows npm launching, the unchanged multi-instance test hook uses a URL
pathname as its working directory, so spaces and '#' in the checkout path also
prevent startup. scripts/verify-linux.sh copies the repository without data or
.git into a safe temporary path, then runs the original commands and test files.
No test source or assertion is changed. The original Windows baseline is retained.

## Pre-implementation predictions

TDTH-FLAG

These two predictions are AI-assisted risk predictions, recorded and committed
before the first src change. The student has not supplied independent predictions.

### P1: JSON value equality

Section 4.2: "Two bodies are the same when they are equal as JSON values: key order
and whitespace do not matter, any other difference does."

Prediction: an implementation may fingerprint raw text or plain JSON.stringify
output and reject a valid replay after object keys are reordered. The rule needs
recursive object-key normalization while preserving array order and every value,
including unknown request fields. This interacts with section 1, which says that
unknown fields are ignored during processing.

Outcome: this mistake did not occur. contract-run-1.txt passes the section 4.2
JSON-value equality and replay checks. edge-checks.txt additionally verifies
nested unknown fields with reordered object keys and changed values.

### P2: Internal errors

Section 2: internal errors have a fixed, generic detail sentence that must never
contain a stack trace, SQL message, table name, or file path.

Prediction: a broad catch may reuse the starter's legacy e.message handler and
leak database internals, or an eagerly prepared SQL statement may throw outside
the v1 error boundary. Every v1 request needs its own problem-details catch.

Outcome: this mistake did not occur. contract-run-1.txt passes the section 2
internal-error check. The SQL exception printed in that log is server stderr,
not the HTTP response. edge-checks.txt separately injects an order-line failure
and confirms that the HTTP detail stays generic and the transaction rolls back.

## First implementation run

TDTH-FLAG

The first implementation passed all 29 contract tests, with 0 failures and
0 cancellations. The separate legacy run passed 3 of 3. There are no failing
implementation tests to explain. This is distinct from the intentionally red
starter baseline.

Evidence chronology:

1. d194383: AI-assisted predictions committed before changes to src.
2. bdda776: clean Linux baseline, legacy 3/3 and contract 0/29.
3. a1f2abb: first implementation in src and the new up/down migrations.
4. 1fb91f0: contract-run-1.txt and first-legacy.txt preserved before review edits.

The first log has never been overwritten. No test implementation was opened or
pasted into a repair prompt. No functional repair was needed after the first run.
The later src edit only removes the obsolete comment describing v1 as a stub.

The rubric's all-green fallback asks for three points the agent guessed at.
The following three points provide the same explanation that a failing test
would otherwise require:

| Point | Contract sentence or section | Implementation choice | Proposed clarification |
| --- | --- | --- | --- |
| A1 | Sections 1 and 4.2: ignore unknown fields, but any JSON-value difference changes identity | Unknown fields do not affect the order, but all of their values enter the recursive canonical fingerprint | State explicitly that unknown fields still participate in idempotency identity |
| A2 | Section 4.4: use a cursor with the same tableId | Embed the filter in the opaque cursor and reject a different or omitted filter; permit a different limit | State that changing tableId is 400 validation with parameter cursor, while changing limit is allowed |
| A3 | Section 4.2: the same key while the first request is being processed is 409 | A database-backed lease reserves the key; pending requests return 409 before business validation, then successful responses are stored atomically | Define the pending-request boundary, precedence, and abandoned-claim recovery |

The tests being green does not prove these wordings are unambiguous. The choices
and proposed text below are documentation findings, not changes to the contract.

## Ambiguities and decisions

TDTH-FLAG

All points below were identified by the assistant and require student review.
None is represented as an independently discovered student finding.

### A1: Unknown fields and request identity

Sections: 1 and 4.2.
Reading one: remove unknown fields before fingerprinting because they are ignored.
Reading two: ignore their business effect but include them in JSON-value equality.
Choice: reading two, because section 4.2 says any other difference matters.
Reason: removing fields silently changes the stated identity rule.
Proposed sentence: "Unknown request fields do not affect order processing, but
they and their values participate in idempotency fingerprint comparison."

### A2: Cursor/filter binding and changing page size

Section: 4.4.
Reading one: the client is responsible for using the same tableId; the server
may silently accept a different filter. Reading two: a different filter makes
the cursor invalid. A further question is whether limit is also bound.
Choice: bind tableId, reject mismatches, and allow limit to change.
Reason: tableId identifies the stream, while limit changes only how many rows
are read after the same position. No contract sentence binds limit.
Proposed sentence: "A cursor is bound to its tableId, including the absence of
a filter. Reusing it with another filter is 400 validation with parameter cursor.
Clients may change limit between pages."

### A3: In-flight request boundaries and recovery

Section: 4.2.
Reading one: only the order transaction counts as in flight. Reading two: the
key is in flight from reservation until successful commit or failed cleanup.
The contract also does not say whether a different body should be rejected as
422 while the first use has not yet succeeded.
Choice: reserve before field validation; a pending claim takes precedence and
returns 409 regardless of the second body's content after valid JSON parsing.
Reason: no completed response/fingerprint exists yet. Separate database leases
coordinate processes, and only successful responses enter idempotency_keys.
Claims expire after 60 seconds; ownership is checked again before creating an
order so a stale owner cannot commit after another request takes over.
Proposed sentence: "A key is in flight from reservation until success commit
or failure cleanup. Any other valid-JSON request with that pending key receives
409. An abandoned claim may be retried after a documented lease expires."

### A4: Retention beyond the minimum

Sections: 4.2 and 4.4.
Reading one: keys and cursors expire after exactly 24 hours. Reading two: 24 hours
is a minimum and indefinite validity is allowed.
Choice: keep successful keys indefinitely; position cursors have no expiry.
Reason: this satisfies "at least" without cleanup that could invalidate clients.
Proposed sentence: "This implementation does not automatically expire successful
idempotency keys or cursors; the guaranteed minimum validity is 24 hours."
No real 24-hour waiting experiment was performed; retention is verified by code
inspection and persistence/restart checks, not by a fabricated elapsed-time run.

### A5: Numeric URL spelling

Sections: 1, 4.1, 4.3, and 4.4.
Reading one: accept any string JavaScript can convert to an integer, including
1e1, +1, or 1.0. Reading two: URL integer values use unsigned decimal digits.
Choice: decimal digit strings; leading zeros are accepted. Range checks still
apply. Invalid resource IDs return 404; invalid query parameters return 400.
Reason: the integer value constraint should not accidentally accept whitespace
or JavaScript-specific numeric spellings.
Proposed sentence: "Path and query integer values use one or more ASCII decimal
digits; signs, decimal points, whitespace, and exponent notation are invalid."

### A6: Content-Type enforcement

Sections: 1, 2, and 4.2.
Reading one: reject missing or non-JSON Content-Type using 415. Reading two: parse
the body as JSON and use the specified invalid-json or validation errors.
Choice: JSON parsing without adding 415 or a new problem type.
Reason: the contract specifies the client's Content-Type but gives no 415 type
or placement of such a check in its ordered validation steps.
Proposed sentence: "Clients send application/json; the server parses the body
as JSON regardless of Content-Type and uses only the ordered checks below."

### A7: Unsupported methods and trailing slashes

Sections: 2 and 4.
Reading one: normalize slashes and use 405 for an unsupported method. Reading two:
only the listed method/path pairs exist and other pairs return 404 not-found.
Choice: exact listed pairs and 404, including trailing-slash variants.
Reason: not-found covers unknown v1 routes, and no 405 problem type is defined.
Proposed sentence: "Routes match the listed method and path exactly; unsupported
methods and trailing-slash variants return 404 not-found."

### A8: Structural validation and child pointers

Sections: 2 and 4.2.
Reading one: a missing items array also requires errors for every absent child
field. Reading two: report its structural error and validate child fields only
when an array exists.
Choice: report /items for a non-array, plus any other independent field errors.
For a non-object line inside an array, report both required child fields.
Reason: children have no meaningful index when there is no array to traverse.
Proposed sentence: "Report every broken rule for fields that can be evaluated.
When items is not an array, report /items without inventing child indices."

### Independent student finding

TDTH-FLAG

No independent student finding has been supplied. The self-assessment does not
claim the highest band that requires one. A personal finding must be genuine,
not an assistant finding relabelled as the student's own.

## Review and additional verification

TDTH-FLAG

The assistant reviewed the diff against the starter and CONTRACT.md without
subagents. Frozen files have no diff. All added tables have matching migration
up/down files. The SQL queries bind values rather than interpolate request data.
No functional source defect was found in this review; a stale stub comment was
removed and AI markers were added to the migration path fix.

scripts/check-contract-edges.js contains additional checks derived from the
contract, separate from the supplied test suite. edge-checks.txt records eight
passing groups: migration down/up, nested JSON identity, 40 concurrent requests
across two processes, restart replay, transaction rollback/retry, cursor/filter
rules, legacy write/error headers, and lease recovery.

The 40-request run observed no 409 responses; it still checked one original
success and a single resulting order. A separately labelled controlled database
lease fixture checks 409 and expired-lease recovery deterministically. It is
not presented as an observed collision in the concurrent request run.

Expected private fixture errors appear only in server stderr. HTTP assertions
check that these details are not exposed to the client.

## Final verification

TDTH-FLAG

The clean final run under Linux Node v22.13.1 passed legacy 3/3 and contract
29/29, with no failed, cancelled, or skipped tests. Evidence: final-legacy.txt
and contract-run-final.txt. Both migrations were applied and 200 menu items
were seeded in a fresh temporary copy before those commands.

git diff against ee78c39 confirms test/ and CONTRACT.md are unchanged.
The first implementation log remains identical to its committed version in
1fb91f0. git diff --check reports no whitespace defects in the final changes.

scripts/package-submission.py produces the draft archive with .git, checks ZIP
integrity and frozen-file bytes, and excludes data/ and node_modules/. The
--allow-missing-ai-log option explicitly identifies the current archive as a
draft. The report's score and ZIP name both use 76 until the student supplies
and assesses the remaining personal work.

## Student-only work remaining

- Write AI-LOG.md from the actual interaction and decisions.
- Review these notes and identify any genuinely independent personal findings.
- Do not relabel an AI-assisted prediction or finding as unaided student work.
