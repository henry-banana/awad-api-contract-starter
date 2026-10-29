# 
"""Package a clean IA03 checkout, preserving .git and the first-run evidence."""
import argparse
import re
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--allow-missing-ai-log", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    if git(root, "status", "--porcelain"):
        parser.error("Commit all intended files before packaging the repository.")
    git(root, "diff", "--exit-code", "ee78c39", "--", "test", "CONTRACT.md")
    git(root, "diff", "--exit-code", "1fb91f0", "--", "contract-run-1.txt")

    report = (root / "SELF_ASSESSMENT_REPORT.md").read_text(encoding="utf-8")
    student_id = re.search(r"^Student ID: (\d+)$", report, re.M).group(1)
    total = int(re.search(r"^Total I claim: (\d+) / 100$", report, re.M).group(1))
    claims = []
    for line in report.splitlines():
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) == 4 and re.match(r"^[1-6]\. ", cells[0]):
            maximum, claim = int(cells[1]), int(cells[2])
            if not 0 <= claim <= maximum:
                parser.error("A criterion claim is outside its permitted range.")
            claims.append(claim)
    if len(claims) != 6 or sum(claims) != total:
        parser.error("The six criterion claims must sum to Total I claim.")

    required = [".git/HEAD", "src/v1.js", "src/app.js", "CONTRACT.md", "NOTES.md",
                "contract-run-1.txt", "contract-run-final.txt", "SELF_ASSESSMENT_REPORT.md"]
    has_ai_log = (root / "AI-LOG.md").is_file()
    if not has_ai_log and not args.allow_missing_ai_log:
        parser.error("AI-LOG.md is missing. Use --allow-missing-ai-log only for a draft.")
    if has_ai_log:
        required.append("AI-LOG.md")
    missing = [name for name in required if not (root / name).is_file()]
    if missing:
        parser.error(f"Missing required files: {missing}")

    archive = root.parent / f"{student_id}_{total}.zip"
    if archive.exists() and not args.overwrite:
        parser.error(f"Archive already exists: {archive}. Use --overwrite to replace it.")
    files = []
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        if relative.parts[0] == "data" or any(part in {"node_modules", "__pycache__"} for part in relative.parts):
            continue
        if path.is_file():
            files.append((path, relative.as_posix()))
    with ZipFile(archive, "w", ZIP_DEFLATED) as zipped:
        for path, name in files:
            zipped.write(path, name)
    with ZipFile(archive) as zipped:
        assert zipped.testzip() is None, "ZIP integrity check failed"
        names = set(zipped.namelist())
        assert all(name in names for name in required), "Required file missing from ZIP"
        assert not any(name.startswith("data/") or "node_modules" in name.split("/") for name in names)
        for path, name in files:
            assert zipped.read(name) == path.read_bytes(), f"Archive bytes differ: {name}"
    print(f"Archive: {archive}")
    print(f"Files: {len(files)}; total claimed: {total}/100; ZIP integrity and source bytes verified.")
    print("Draft: AI-LOG.md is intentionally missing." if not has_ai_log else "AI-LOG.md is included.")


if __name__ == "__main__":
    main()
