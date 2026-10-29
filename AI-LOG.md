# AI-LOG.md

> AI assistance record for CSC13114 — IA#2 Zero-downtime migration. Entries below describe the **discussion and materials produced in ChatGPT**, not proof that code was deployed or that the student ran the tests. Update this log if you later use AI again or actually incorporate/change the reference files.

## Usage

- One entry per task where an AI assistant contributed to the work.
- Keep entries concise and factual; this is an account of what happened, not a transcript.
- Record what was kept, changed, rejected, and done by hand.
- The student remains responsible for submitted work and must be able to explain it.

---

## 2026-10-13 — Understanding the IA#2 requirements and rubric

**Tool:** ChatGPT (with Superpowers and Matt Pocock skills referenced)  
**Asked for:** Explain what the zero-downtime `menu_items.price` → `price_vnd` assignment requires based on the prompt, rubric, Session 4 slides, and starter repository.  
**Kept:** The requirement breakdown: Expand → dual-write → backfill → read-new → rollback → stop-old → Contract; two live instances, backward-compatible `price` API, continuous traffic, Git tags, migration down scripts, and evidence files.  
**Changed:** No code changes were made or confirmed at this stage; the explanation was used as the basis for requesting a more detailed procedure.  
**Rejected:** A one-step rename/type conversion, because it breaks compatibility with an instance still running old code.  
**By hand:** I provided the assignment and reference materials and reviewed what needed to be done. No local implementation was reported at this stage.

---

## 2026-10-13 — Researching the starter and drafting an end-to-end procedure

**Tool:** ChatGPT  
**Asked for:** Research the starter repository and produce detailed instructions from setup to migration, dual-write, backfill, rolling deploy, rollback, Contract, and submission.  
**Kept:** The proposed version sequence (`v1`–`v4`), PowerShell command examples, database compatibility checks, and the requirement to test both old and new clients.  
**Changed:** Requested that the guide integrate evidence capture into each operation rather than merely instructing me to save logs afterward.  
**Rejected:** A guide that left `check-log.txt` collection as a separate manual copy-and-paste task.  
**By hand:** I specified that I would perform the actual commands and gather genuine run outputs myself; no user-run test or migration was confirmed in the conversation.

---

## 2026-10-13 — Designing evidence collection without assignment automation

**Tool:** ChatGPT  
**Asked for:** Make the procedure detailed enough to follow and submit, with terminal commands that append step labels and actual `npm run check` output automatically, but without step-runner scripts in the lecturer's repository.  
**Kept:** The terminal-based logging approach (`Add-Content`, `Tee-Object -Append`), one continuous `npm run traffic` log, and explicit PASS/FAIL conditions after each step.  
**Changed:** Defined a separation between reference materials and the submission repository; logging convenience must not perform migrations, deploys, or rollback on my behalf.  
**Rejected:** `run-all`/`step-1` scripts and fabricated or manually assembled successful traffic logs.  
**By hand:** I set the requirement that I would execute each migration, restart, rollback, test, and Git operation individually. Those executions were not reported as completed.

---

## 2026-10-13 — Reviewing the initial prepared workspace

**Tool:** ChatGPT  
**Asked for:** Prepare a complete set of source changes, migrations, tests, documentation, and an execution guide.  
**Kept:** The AI-generated source/migration examples and documentation ideas as reference material; the assistant also reported internal test and traffic rehearsals, which are **not** evidence of my own execution.  
**Changed:** Clarified that I had already cloned the lecturer's repository and needed an instruction kit to apply changes there, rather than a replacement repository created by AI.  
**Rejected:** Submitting or working directly from a prebuilt repository containing AI-generated `.git` history, version tags, and an already-completed workflow.  
**By hand:** I had cloned the starter repository myself, as stated in the conversation. No manual deployment or test results were provided by me.

---

## 2026-10-13 — Revising the deliverable into a manual execution kit

**Tool:** ChatGPT (with Superpowers and Matt Pocock skills referenced)  
**Asked for:** Revise the deliverable so I could work in my own cloned repository, using a complete step-by-step guide and separate optional reference files, with no prebuilt repository.  
**Kept:** `EXECUTION_GUIDE.md` (38-step PowerShell runbook), separate v2/v3/v4 code and test references, `002`/`003` migration examples, a backfill example, and Markdown report templates. These were provided for review and manual application, not confirmed as applied locally.  
**Changed:** The workflow now creates `002` at Expand and `003` only after both instances are on v4; it uses the starter migration command rather than introducing a custom `--target` interface. Guidance and references are kept outside the submission repository.  
**Rejected:** Pre-created `.git`/tags, prefilled traffic/check logs, and scripts that automatically execute the assignment steps.  
**By hand:** I retained control over editing/copying each file, checking its behavior, running commands, collecting logs, committing, tagging, zipping, and submitting. Completion of those local actions has not been confirmed in this chat.

---

## 2026-10-29 — Preparing this AI usage log

**Tool:** ChatGPT  
**Asked for:** Fill the lecturer's `AI-LOG` Markdown template with the AI-assisted work recorded in this conversation.  
**Kept:** The template's task-based fields (`Tool`, `Asked for`, `Kept`, `Changed`, `Rejected`, `By hand`) and a factual summary of the actual discussion.  
**Changed:** Distinguished materials generated by ChatGPT from actions I personally performed; did not treat the assistant's reported tests as my submission evidence.  
**Rejected:** Claims that I had already run migrations, rolling deploys, rollback, or achieved zero failures on my machine without accompanying real logs.  
**By hand:** I provided the AI-LOG template and requested this entry to be filled. I must review the entries against my actual usage and update them if I later apply or modify the reference code.
