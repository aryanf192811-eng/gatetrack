#!/usr/bin/env python3
"""
Fixes data.js: merges all CONCEPTS blocks into one, then re-injects cleanly.
Run: python tools/fix_concepts.py data.js
"""
import json, re, sys
from pathlib import Path

DEFAULT_DATA_JS = Path(__file__).resolve().parents[2] / "data" / "data.js"

def fix(data_js_path: Path):
    text = data_js_path.read_text(encoding="utf-8", errors="ignore")

    # Find all CONCEPTS blocks and merge them
    pattern = r'// ═══ CONCEPTS DATA ═══\nconst CONCEPTS=(\{[\s\S]*?\});\n'
    matches = re.findall(pattern, text)
    if not matches:
        print("No CONCEPTS block found."); return

    merged = {}
    for raw in matches:
        try:
            obj = json.loads(raw)
            for sid, cards in obj.items():
                if sid not in merged:
                    merged[sid] = []
                seen = {c['id'] for c in merged[sid]}
                merged[sid].extend(c for c in cards if c['id'] not in seen)
        except Exception as e:
            print(f"Parse error: {e}")

    # Remove ALL existing CONCEPTS blocks
    text = re.sub(pattern, '', text)

    # Find best insertion point
    marker = "// ═══ REVISION CONTENT DATA ═══"
    payload = json.dumps(merged, ensure_ascii=False, indent=2)
    new_block = f"\n// ═══ CONCEPTS DATA ═══\nconst CONCEPTS={payload};\n"
    if marker in text:
        text = text.replace(marker, new_block + "\n" + marker, 1)
    else:
        text += new_block

    data_js_path.write_text(text, encoding="utf-8")

    total = sum(len(v) for v in merged.values())
    print(f"✅ Fixed! Total concepts: {total}")
    for sid in sorted(merged):
        print(f"   {sid:6s}: {len(merged[sid])}")

if __name__ == "__main__":
    fix(Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DATA_JS)
