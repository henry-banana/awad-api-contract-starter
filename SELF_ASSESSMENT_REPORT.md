# Self-assessment: IA03 API contract

TDTH-FLAG

Student ID: 23120262
Student: Tong Duong Thai Hoa
Date: 2026-10-29
Total I claim: 76 / 100

This is an AI-assisted provisional assessment. The student must review it before
submission. AI-LOG.md is intentionally left for the student to write.

| Criterion | Max | I claim | Evidence and reason |
| --- | ---: | ---: | --- |
| 1. Contract tests pass | 30 | 30 | contract-run-final.txt: 29/29; final-legacy.txt: 3/3; clean migrated and seeded Linux verification with the original test files |
| 2. Rules kept | 10 | 10 | No diff in test/ or CONTRACT.md against ee78c39; migrations/002_idempotency.up.sql and its matching down file contain all new tables |
| 3. Predictions before the agent ran | 10 | 0 | NOTES.md, Pre-implementation predictions, and d194383 precede the first src commit a1f2abb, but these were drafted by the assistant after the assignment-analysis interaction; there is no unaided student pre-agent prediction evidence |
| 4. First run explained | 20 | 20 | contract-run-1.txt was preserved in 1fb91f0; all 29 passed. NOTES.md, First implementation run, analyzes A1-A3 using the rubric's all-green fallback |
| 5. Ambiguous sentences | 20 | 16 | NOTES.md, A1-A8, gives sections, two readings, choices, reasons, and proposed sentences. No independent student finding has been supplied, so the highest band is not claimed |
| 6. AI-LOG.md | 10 | 0 | Reserved for the student; the assistant did not create the file |
| Total | 100 | 76 | Provisional total before the student supplies AI-LOG.md and reviews the evidence |

## What I did not manage

TDTH-FLAG

- AI-LOG.md is not included yet, as explicitly requested by the student.
- No unaided student prediction or independent student ambiguity is evidenced.
- The assignment deadline printed in the materials was 2026-10-28 at 22:00.
  This work was performed on 2026-10-29; no claim of on-time submission is made.
- The original multi-instance test setup fails on this Windows checkout and on
  a Linux path containing URL-escaped spaces or '#'. The suite was run unchanged
  under Linux Node v22.13.1 from a clean safe path. The workaround is documented
  and reproducible using scripts/verify-linux.sh.
- No real 24-hour waiting test was performed. The implementation has no automatic
  expiry of stored successful responses or cursors, and restart replay is checked.
- This assessment is not an instructor's grade and no Classroom submission has
  been made.

## What I would do differently

TDTH-FLAG

Have the student read the contract, write and commit personal predictions before
any agent analysis, then keep a contemporaneous personal AI log. Run the starter
from a simple Linux path first to separate environment failures from API defects.

## Submission checks

- The current draft archive is 23120262_76.zip and includes .git.
- data/ and node_modules/ are excluded.
- Add the real AI-LOG.md, reassess criterion 6, commit the changes, and rebuild
  the archive with a filename matching the revised total before submission.
- If the student supplies additional personal evidence, review the appropriate
  criterion without rewriting the existing history or first-run log.
