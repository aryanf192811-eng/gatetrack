"""Cleanup: removes excess blank lines from data.js. Run: python tools/cleanup_js.py data.js"""
import re, sys
from pathlib import Path

DEFAULT_DATA_JS = Path(__file__).resolve().parents[2] / "data" / "data.js"

path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DATA_JS
text = path.read_text(encoding="utf-8", errors="ignore")
lines_before = text.count('\n')
# Collapse 4+ consecutive blank lines to 2
cleaned = re.sub(r'\n{4,}', '\n\n\n', text)
lines_after = cleaned.count('\n')
path.write_text(cleaned, encoding="utf-8")
print(f"Removed {lines_before - lines_after} extra blank lines. File: {path.stat().st_size // 1024} KB")
