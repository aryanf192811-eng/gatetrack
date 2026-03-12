# extract_chunk.py
import sys
from pathlib import Path

DEV_TOOLS_DIR = Path(__file__).resolve().parents[1]
PYTHON_DEPS = DEV_TOOLS_DIR / 'python-deps'
if PYTHON_DEPS.exists():
    sys.path.insert(0, str(PYTHON_DEPS))

import pypdf

PDF_PATH = DEV_TOOLS_DIR / 'source-material' / 'gateopedia 13.pdf'
OUTPUT_PATH = DEV_TOOLS_DIR / 'temp' / 'chunk1.txt'

try:
    reader = pypdf.PdfReader(str(PDF_PATH))
    text = ""
    # Let's extract pages 12 to 17 (Calculus, usually early in the book)
    for i in range(12, 17):
        if i < len(reader.pages):
           text += f"--- PAGE {i} ---\n"
           text += reader.pages[i].extract_text() + "\n\n"

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Chunk extracted successfully.")
except Exception as e:
    print(f"Error: {e}")
