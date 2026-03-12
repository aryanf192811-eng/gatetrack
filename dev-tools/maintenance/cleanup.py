import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
INDEX_HTML = PROJECT_ROOT / 'index.html'
def remove_lines(file_path, start_line, end_line):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Lines are 1-indexed for the user, so subtract 1 for 0-indexed python list
    del lines[start_line-1:end_line]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

remove_lines(INDEX_HTML, 2728, 2920)
print("Removed duplicate practice mode block.")
