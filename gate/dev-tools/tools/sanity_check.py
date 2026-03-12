import re, json
from pathlib import Path

DEFAULT_DATA_JS = Path(__file__).resolve().parents[2] / "public" / "data" / "data.js"

text = DEFAULT_DATA_JS.read_text(encoding='utf-8', errors='ignore')

blocks = re.findall(r'CONCEPTS DATA', text)
print(f'CONCEPTS blocks: {len(blocks)}')

m = re.search(r'const CONCEPTS=(\{[\s\S]*?\});\n', text)
if m:
    try:
        obj = json.loads(m.group(1))
        total = sum(len(v) for v in obj.values())
        print(f'Total concepts: {total}')
        for sid in sorted(obj):
            print(f'  {sid}: {len(obj[sid])}')
        missing = []
        for sid, lst in obj.items():
            for c in lst:
                for field in ['id','name','topic','definition','intuition','exam_trick']:
                    if not c.get(field):
                        missing.append(sid + '/' + c.get('id','?') + ' missing ' + field)
        print(f'Field issues: {len(missing)}')
        for x in missing[:10]:
            print('  BAD: ' + x)
    except Exception as ex:
        print('JSON ERROR: ' + str(ex))
else:
    print('NO CONCEPTS BLOCK FOUND')

m2 = re.search(r'const FLASHCARDS=(\{[\s\S]*?\});\n', text)
if m2:
    try:
        fc = json.loads(m2.group(1))
        total_fc = sum(len(v) for v in fc.values())
        print(f'Flashcards (sentence): {total_fc}')
    except Exception as ex:
        print('FLASHCARDS ERROR: ' + str(ex))
