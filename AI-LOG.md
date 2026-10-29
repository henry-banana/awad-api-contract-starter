# AI-LOG: IA03 API Contracts

This log covers requirements preparation in ChatGPT, implementation in Codex,
and the subsequent evidence review. The preparation chat alone did not perform
implementation; the separate Codex session and repository commits did.

Vietnamese requests below are transcribed without accents for ASCII-only
documentation. They retain the recorded requests rather than inventing more
detailed prompts after the event.

## Requirements preparation

Tool: ChatGPT, OpenAI.

Prompt: "Hay cho t biet cai bai tap nay yeu cau lam gi?"

Inputs: the assignment steps, starter repository, API Contracts slides and rubric.

Kept: the explanation of four v1 endpoints, errors, idempotency, pagination,
legacy compatibility, frozen files and required evidence.

Changed: the explanation was organized into preparation, predictions, first-run
capture, fixes and analysis, and submission evidence.

Rejected: no implementation proposal was rejected in this preparation chat;
implementation had not been delegated there.

By hand: the assignment materials and request for an explanation were supplied.
This entry makes no claim of manual coding or manual test execution.

The later preparation-log request was: "Dien conversation vao @AI-LOG.md".
It produced the requirements-only IA03 log, replacing an accidentally copied
IA02 log. The separate implementation session is recorded below.

## 2026-10-29: implementation and first-run evidence

Tool: Codex, OpenAI, with mattpocock-skills referenced.

Originating chat: Liet ke viec can lam IA#03.
Thread ID: 01a1857b-6c26-76f0-8ef2-9726b8d2a517.

Recorded handover request:

"Ok ban thuc hien lam di tru phan ai log de tui tu dien ra. @mattpocock-skills"

The preceding assignment breakdown supplied the scope: follow CONTRACT.md for
/v1, add section 5 legacy headers, keep test/ and CONTRACT.md unchanged, use
reversible migrations, preserve the first run and explain interpretations.
This is inherited context, not a claim of another verbatim user prompt.

Additional recorded instruction:

"phan co AI ho tro ban hay viet 1 doan nay nha, dung sai. TDTH-FLAG"

Kept: the four endpoints, shared-database idempotency, JSON-value fingerprints,
cursor pagination, problem responses and legacy headers. Implementation commit:
a1f2abb. First-run evidence commit: 1fb91f0.

Changed: scripts/migrate.js uses fileURLToPath for the Windows path issue.
scripts/verify-linux.sh runs unchanged tests from a safe Linux temporary path.
These environment changes are distinct from functional API repairs.

Fix prompts: no functional test-failure repair prompt was needed after the first
implementation because contract-run-1.txt already passed 29/29 and the legacy
run passed 3/3. No repair prompt or pasted test source is invented here.

Rejected: no functional implementation proposal was recorded as personally
rejected in this run. Actual later documentation rejections are recorded below.

By hand: the user authorized implementation, reserved the initial log-writing
task and requested attribution markers. Coding and automated test execution
were performed by the agent. The agent also expanded P1/P2 and A1-A8 into full
explanations. The author later clarified that the underlying ideas were supplied
by the author; that correction is recorded in the final entry below.

Results: the agent recorded green first and final runs. Additional checks cover
migration rollback, JSON identity, two-process concurrency, restart replay,
transaction rollback, cursor rules, legacy headers and lease recovery.
NOTES.md records the three all-green fallback points and eight decisions.

## 2026-10-29: review and report correction

Tool: Codex, OpenAI, using the mattpocock-skills research workflow and
verification against the local rubric, source, Git history and command results.

Review chat: Ra soat IA#03 truoc khi nop.
Thread ID: 01a185a4-9790-7231-944e-0475b392c0d8.

First review request:

"doc yeu cau va list ra nhung gi con thieu de nop bai 100d cua bai tap IA#03,
va nhung cho co y nghia tuong tu nhu can student kiem tra gi do, liet ke ra het."

Report-correction request:

"Ok check lai di @mattpocock-skills, do tui tai nham cai log bai cu.
Kiem tra va dien chuan report lai giup. Nhung phan ban check neu con can check
student gi do thi xoa giup luon nha."

Kept: verified first-run chronology, original logs, frozen-file comparison,
all-green explanations, eight decisions and reproducible Linux verification.
Fresh output is in review-legacy.txt, review-contract.txt and review-edges.txt.

Changed: this log now covers the implementation chat as well as preparation.
The report contains six evidence-based rows, the required limitations and
consistent arithmetic. Completed checks are stated as results in NOTES.md
and SUBMISSION_CHECKLIST.md.

Rejected: obsolete deferrals of completed verification are not retained;
the user explicitly requested their removal. Unsupported 100-point assessment
wording is replaced with 86 points because personal pre-agent predictions and
an additional independent ambiguity are not evidenced. Outdated draft-ZIP and
missing-AI-log claims are also removed. These are actual documentation changes,
not a fabricated rejection of implementation code.

By hand: the user identified the accidentally uploaded old log, supplied the
IA03 preparation log and requested corrections. The assistant retrieved the
implementation chat, inspected commits, ran verification and edited documents.
At this stage the assessment did not yet include the author's later clarification
about the origin of the ideas. No manual coding is attributed to the author.

No Classroom submission was performed. The original first-run log, supplied
tests and CONTRACT.md were not edited.

## 2026-10-29: author review and origin clarification

Tool: Codex, OpenAI, with mattpocock-skills referenced.

Request, transcribed without accents:

"Ban lam tang len 100 di, vi tui check ok het roi, phan nao con chua duoc thi
bo sung update mot chut vao."

The assistant asked for the prediction and personally identified ambiguity
content needed by the rubric. The author's recorded reply was:

"Nhu da viet trong notes a, tai tui dua y tuong de agent viet day du ma lai
khong ngo bi gan mac ai vao."

Kept: P1/P2, their contract references, reasons and outcomes; A1-A8 and their
existing choices; the original commits and raw test evidence.

Changed: the source attribution now distinguishes author-supplied ideas from
agent-expanded prose. The author's statement applies to the ideas already in
NOTES.md, including P1/P2 and A1. The report claims 10 for predictions and 20 for
ambiguities, bringing the six-criterion total to 100.

Rejected: the earlier blanket inference that the agent originated all ideas
because it wrote the full explanations. The author explicitly corrected that
inference. The earlier 86-point assessment is superseded by this clarification.

By hand: the author supplied the underlying ideas and confirmed review of the
work, as stated in the clarification. The agent expanded the prose and applied
the documentation updates. This is an author statement received during review,
not a new pre-implementation message or independently reconstructed chronology.

No source, supplied tests, CONTRACT.md, first-run log or Git history was changed
to support this update. The corresponding archive name is 23120262_100.zip.
