# Self-assessment: IA03 API contract

Student ID: 23120262
Student: Tong Duong Thai Hoa
Date: 2026-10-29
Total I claim: 100 / 100

This self-assessment follows the six IA03 rubric criteria. The author confirmed
review of the work and clarified that the ideas recorded in NOTES.md were
provided by the author for the agent to expand. AI-assisted wording is distinct
from the origin of those ideas. That clarification is recorded on its actual
review date in NOTES.md, Authorship clarification, and AI-LOG.md.

| Criterion | Max | I claim | Evidence and reason |
| --- | ---: | ---: | --- |
| 1. Contract tests pass | 30 | 30 | contract-run-final.txt: 29/29; final-legacy.txt: 3/3. A clean Linux Node 22.13.1 review passed the same counts after migration and seed; see review-contract.txt and review-legacy.txt. |
| 2. Rules kept | 10 | 10 | git diff ee78c39 -- test CONTRACT.md is empty. Both new tables and the index are in migrations/002_idempotency.up.sql with a matching down file. review-edges.txt confirms successful down/up. |
| 3. Predictions before the agent ran | 10 | 10 | NOTES.md, P1 and P2: two quoted contract sentences/sections, a reason for each and an outcome. They were committed in d194383 before the first src implementation a1f2abb. The author clarified that the underlying ideas were supplied by the author and expanded by the agent; the earlier blanket AI-origin attribution is corrected in Authorship clarification. |
| 4. First run explained | 20 | 20 | contract-run-1.txt and first-legacy.txt were preserved in 1fb91f0: 29/29 contract and 3/3 legacy tests passed. git diff 1fb91f0 -- contract-run-1.txt is empty. NOTES.md, First implementation run, explains A1-A3 with contract sections, decisions and proposed wording using the all-green alternative. |
| 5. Ambiguous sentences | 20 | 20 | NOTES.md, Ambiguities and decisions: A1-A8 each have sections, two readings, a decision, a reason and proposed wording. The author's clarification identifies the ideas in these notes as author-supplied and the prose as agent-expanded. A1, unknown fields versus JSON-value request identity, is recorded as an author-supplied ambiguity rather than an independently originated agent finding. |
| 6. AI-LOG.md | 10 | 10 | AI-LOG.md records preparation, the implementation handover, the absence of functional fix prompts after the green first run, review requests and the author's origin correction. Kept, Changed and Rejected describe real decisions, including replacing the incorrect blanket AI-origin attribution. No test code was pasted into a fix prompt. |
| Total | 100 | 100 | 30 + 10 + 10 + 20 + 20 + 10. 
