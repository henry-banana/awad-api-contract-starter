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
The unchanged test suite will also run under Linux Node through WSL, because the
multi-instance hook cannot launch npm correctly in this Windows environment.

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

Outcome: pending the first implementation run.

### P2: Internal errors

Section 2: internal errors have a fixed, generic detail sentence that must never
contain a stack trace, SQL message, table name, or file path.

Prediction: a broad catch may reuse the starter's legacy e.message handler and
leak database internals, or an eagerly prepared SQL statement may throw outside
the v1 error boundary. Every v1 request needs its own problem-details catch.

Outcome: pending the first implementation run.

## First implementation run

Pending. contract-run-1.txt will be captured once, after the first implementation,
and committed before any subsequent source fix.

## Ambiguities and decisions

Pending implementation and review. Proposed wording will be kept here rather
than editing the frozen CONTRACT.md.

## Student-only work remaining

- Write AI-LOG.md from the actual interaction and decisions.
- Review these notes and identify any genuinely independent personal findings.
- Do not relabel an AI-assisted prediction or finding as unaided student work.
