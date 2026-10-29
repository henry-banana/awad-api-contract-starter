# IA03 submission checklist



## Completed by the assistant

- Implemented all four v1 endpoints and legacy version headers.
- Kept test/ and CONTRACT.md unchanged from starter ee78c39.
- Added reversible 002 migrations for success storage, coordination leases,
  and the orders filter index.
- Committed AI-assisted risk predictions before the first src implementation.
- Preserved the first implementation run: contract 29/29, legacy 3/3.
- Wrote NOTES.md with prediction outcomes and eight ambiguity decisions.
- Added eight extra verification groups, including real child processes and
  a separately disclosed controlled lease fixture.
- Prepared a provisional 76/100 assessment; AI-LOG.md is excluded.

## Reproduce

Use Node 22.13 or newer. No npm dependencies are required.

On Linux, from a simple checkout path with no spaces or '#' characters:

```sh
npm run migrate
npm run seed
npm test
npm run contract
```

Use a fresh database for seed, which inserts another 200 rows on each run.
For a checkout path containing spaces or '#', use this Bash helper in Linux/WSL:

```sh
bash scripts/verify-linux.sh final
```

It copies the current source and unchanged tests into a new safe temporary
directory, creates a fresh database, then runs the four original commands.
It saves final-legacy.txt and contract-run-final.txt back in this repository.
It needs a Linux node and npm on PATH. Windows node.exe/npm are not substitutes
for the Linux executables used by the multi-instance hook.

Extra checks, also runnable directly on Windows:

```sh
node scripts/check-contract-edges.js
```

Do not use the helper's first mode again: it intentionally refuses to overwrite
contract-run-1.txt. Test logs are raw command output and have no inserted marker.

## Student action before submission

- Read NOTES.md and the implementation; verify that the explanations match
  your understanding.  identifies AI-assisted prose and code changes.
- Write AI-LOG.md yourself from the actual prompts and decisions. Do not invent
  a rejection, manual edit, or personal finding that did not happen.
- Update SELF_ASSESSMENT_REPORT.md with justified scores and evidence.
- Commit your additions and rebuild the ZIP with .git included, excluding data/
  and node_modules/. Rename it to 23120262_<revised-total>.zip.
- After updating the report and committing, run `python scripts/package-submission.py`.
  It derives the ZIP name from the report and checks the archive contents.
  Add `--overwrite` only when intentionally replacing an existing archive.
- Check the archive includes both contract logs and all three required reports.
- Submit through your student Google account after checking the current
  Classroom status. No submission has been made by the assistant.
