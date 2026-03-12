#!/usr/bin/env python3
"""
GATE Concept Intelligence Engine — Flashcard Generator v3
Extracts high-yield, structured flashcards from GATE textbooks.
Targets 30-50 meaningful cards per chapter.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path


# ═══ SUBJECT PAGE MAP (approximate for gateopedia 13.pdf) ═══
SECTION_MAP = [
    (1,   60,  "em"),   # Engineering Maths
    (61,  90,  "dm"),   # Discrete Maths
    (91,  170, "dl"),   # Digital Logic
    (171, 250, "coa"),  # COA
    (251, 290, "pds"),  # C & Data Structures
    (291, 330, "algo"), # Algorithms
    (331, 370, "toc"),  # TOC
    (371, 410, "cd"),   # Compiler Design
    (411, 450, "os"),   # OS
    (451, 500, "dbms"), # DBMS
    (501, 530, "cn"),   # Computer Networks
    (531, 541, "ga"),   # General Aptitude
]

EM_KEYWORDS = {
    "calc": ["limit", "continuity", "differentiab", "derivative", "maxima", "minima", "taylor", "integral", "newton-leibnitz", "lagrange", "definite", "indefinite"],
    "la":   ["matrix", "determinant", "eigen", "vector space", "rank", "nullity", "linear", "system of equation"],
    "dm":   ["proposition", "predicate", "tautology", "biconditional", "set theory", "relation", "graph theory", "poset", "lattice"],
    "ps":   ["probability", "random variable", "distribution", "bayes", "expectation", "variance", "binomial", "poisson", "normal"],
}

NOISE_PATTERNS = [
    r"gate wallah computer science.*?handbook",
    r"engineering mathematics\s+\d+\.\d+",
    r"published by:.*",
    r"all rights.*",
    r"copyright.*",
    r"fig\.\s*\d+\.\d+\.",
    r"^\s*\d+\s*$",
]

# ═══ HEAVY-DUTY EXTRACTION PATTERNS ═══
# Each returns (question, answer) or None
# Ordered from most-specific to least-specific

QA_PATTERNS = [
    # --- Definitions ---
    (r"^(.{4,60}?)\s+(?:is defined as|is known as|refers to|is said to be|is called)\s+(.{10,})$",
     lambda m: (f"Define: {cap(m.group(1))}?", cap(m.group(2)))),

    # --- Acronyms ---
    (r"^(.{2,20}?)\s+stands for\s+(.{5,})$",
     lambda m: (f"What does {cap(m.group(1))} stand for?", cap(m.group(2)))),

    # --- Consists of ---
    (r"^(.{4,60}?)\s+(?:consists of|is composed of|comprises)\s+(.{10,})$",
     lambda m: (f"What does {cap(m.group(1))} consist of?", cap(m.group(2)))),

    # --- Time / Space Complexity ---
    (r"time complexity(?:\sof)?\s+(.{4,60}?)\s+is\s+(O\([^)]+\))",
     lambda m: (f"Time complexity of {cap(m.group(1))}?", m.group(2).strip())),

    (r"space complexity(?:\sof)?\s+(.{4,60}?)\s+is\s+(O\([^)]+\))",
     lambda m: (f"Space complexity of {cap(m.group(1))}?", m.group(2).strip())),

    # --- The X of Y is Z ---
    (r"^the\s+(.{3,40}?)\s+of\s+(.{3,40}?)\s+is\s+(.{5,120})$",
     lambda m: (f"What is the {m.group(1).strip()} of {m.group(2).strip()}?", cap(m.group(3)))),

    # --- X is a Y ---
    (r"^(.{3,30}?)\s+is\s+(?:a|an)\s+(.{8,120})$",
     lambda m: (f"What is {cap(m.group(1))}?", f"{cap(m.group(1))} is a {m.group(2).strip()}")),

    # --- X means Y ---
    (r"^(.{3,30}?)\s+(?:means|denotes|implies)\s+(.{8,120})$",
     lambda m: (f"What does {cap(m.group(1))} mean?", cap(m.group(2)))),

    # --- In X, Y ---
    (r"^in\s+(.{4,40}?),\s+(.{10,120})$",
     lambda m: (f"What happens in {cap(m.group(1))}?", cap(m.group(2)))),

    # --- Advantage of X is Y ---
    (r"advantage\s+of\s+(.{3,60}?)\s+is\s+(.{8,120})$",
     lambda m: (f"Advantage of {cap(m.group(1))}?", cap(m.group(2)))),

    # --- Disadvantage of X is Y ---
    (r"disadvantage\s+of\s+(.{3,60}?)\s+is\s+(.{8,120})$",
     lambda m: (f"Disadvantage of {cap(m.group(1))}?", cap(m.group(2)))),

    # --- X is used for Y ---
    (r"^(.{4,60}?)\s+is\s+used\s+(?:for|to)\s+(.{10,120})$",
     lambda m: (f"What is {cap(m.group(1))} used for?", cap(m.group(2)))),

    # --- X is used when Y ---
    (r"^(.{4,60}?)\s+is\s+used\s+when\s+(.{10,120})$",
     lambda m: (f"When is {cap(m.group(1))} used?", cap(m.group(2)))),

    # --- X is a process of Y ---
    (r"^(.{4,60}?)\s+is\s+(?:the\s+)?process\s+of\s+(.{8,120})$",
     lambda m: (f"What is {cap(m.group(1))}?", cap(f"{m.group(1)} is the process of {m.group(2)}"))),

    # --- X requires Y ---
    (r"^(.{4,60}?)\s+requires\s+(.{8,120})$",
     lambda m: (f"What does {cap(m.group(1))} require?", cap(m.group(2)))),

    # --- X guarantees Y ---
    (r"^(.{4,60}?)\s+guarantees\s+(.{8,120})$",
     lambda m: (f"What does {cap(m.group(1))} guarantee?", cap(m.group(2)))),

    # --- X prevents Y ---
    (r"^(.{4,60}?)\s+prevents\s+(.{8,120})$",
     lambda m: (f"What does {cap(m.group(1))} prevent?", cap(m.group(2)))),

    # --- Colon definitions: "Term: definition text" ---
    (r"^([A-Z][a-zA-Z0-9\s\-/&]{2,40}):\s+(.{15,})$",
     lambda m: (f"Define: {m.group(1).strip()}?", cap(m.group(2)))),

    # --- If X then Y ---
    (r"^if\s+(.{5,60}?),\s+then\s+(.{10,120})$",
     lambda m: (f"If {m.group(1).strip()}, what happens?", cap(m.group(2)))),

    # --- X is the number of Y ---
    (r"^(.{4,50}?)\s+is(?:\s+the)?\s+number\s+of\s+(.{5,80})$",
     lambda m: (f"What is {cap(m.group(1))}?", f"{cap(m.group(1))} is the number of {m.group(2).strip()}")),

    # --- For X, Y ---
    (r"^for\s+(.{3,40}?),\s+(.{10,120})$",
     lambda m: (f"For {cap(m.group(1))}, what is the rule?", cap(m.group(2)))),

    # --- The difference between X and Y is Z ---
    (r"difference\s+between\s+(.{3,40}?)\s+and\s+(.{3,40}?)\s+is\s+(.{8,})$",
     lambda m: (f"Difference between {cap(m.group(1))} and {m.group(2).strip()}?", cap(m.group(3)))),

    # --- Formula lines: number = expression ---
    (r"^([A-Za-z\s\(\)\[\]]+)\s*=\s*(.{4,60})$",
     lambda m: (f"Formula: {m.group(1).strip()}?", f"{m.group(1).strip()} = {m.group(2).strip()}")),
]


def cap(s: str) -> str:
    s = s.strip()
    return s[0].upper() + s[1:] if s else s


def parse_args():
    p = argparse.ArgumentParser(description="GATE Concept Intelligence Engine — Flashcard Generator v3")
    p.add_argument("--pdf", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--start", type=int, required=True)
    p.add_argument("--end",   type=int, required=True)
    p.add_argument("--deps-path", default="")
    p.add_argument("--reset", action="store_true")
    return p.parse_args()


def load_pdf_reader(deps_path: str):
    if deps_path:
        sys.path.insert(0, deps_path)
    from pypdf import PdfReader
    return PdfReader


def section_subject(page_no: int) -> str:
    for s, e, sid in SECTION_MAP:
        if s <= page_no <= e:
            return sid
    return ""


def detect_subject(page_no: int, text: str, prev_sid: str) -> str:
    sec = section_subject(page_no)
    if sec == "em":
        scores = {k: sum(text.lower().count(kw) for kw in kws) for k, kws in EM_KEYWORDS.items()}
        best = max(scores, key=scores.get)
        if scores[best] > 0:
            return best
        return prev_sid if prev_sid in EM_KEYWORDS else "calc"
    return sec if sec else prev_sid


def clean_text(raw: str) -> str:
    t = raw.replace("\x00", " ")
    t = re.sub(r"\s+", " ", t).strip()
    for pat in NOISE_PATTERNS:
        t = re.sub(pat, " ", t, flags=re.IGNORECASE)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def split_sentences(text: str):
    """Split text into candidate sentences more aggressively."""
    # Split on period, semicolon, bullet, colon mid-paragraph
    parts = re.split(r'(?<=[.;!?])\s+|(?<=\n)\s*[•\-–]\s*|\s*;\s*', text)
    return [p.strip() for p in parts if p.strip()]


def is_valid_candidate(s: str) -> bool:
    if len(s) < 25 or len(s) > 350:
        return False
    alpha_count = sum(ch.isalpha() for ch in s)
    if alpha_count < 15:
        return False
    # Skip pure header/page-number lines
    if re.match(r'^\d+[\.\d]*\s+[A-Z]', s):
        return False
    # Skip lines that are just numbers
    if re.match(r'^[\d\s\.\,\+\-\=\/\(\)]+$', s):
        return False
    lower = s.lower()
    if lower.startswith(("table", "fig.", "figure", "example:", "note:", "solution:")):
        return False
    return True


def extract_all_qas(text: str, page_no: int):
    sentences = split_sentences(text)
    results = []
    seen_questions = set()

    for s in sentences:
        if not is_valid_candidate(s):
            continue
        for pattern, builder in QA_PATTERNS:
            m = re.match(pattern, s.strip(), re.IGNORECASE)
            if m:
                try:
                    pair = builder(m)
                    q, a = pair[0].strip(), pair[1].strip()
                    if len(q) < 10 or len(a) < 5:
                        continue
                    # Deduplicate on question text
                    q_key = re.sub(r'\s+', ' ', q.lower())
                    if q_key in seen_questions:
                        continue
                    seen_questions.add(q_key)
                    results.append({"q": q, "a": a})
                    break  # Only first matching pattern per sentence
                except Exception:
                    continue

    return results


def read_existing_js_deck(js_path: Path):
    """Read from data.js FLASHCARDS const format."""
    if not js_path.exists():
        return {}
    text = js_path.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r'const FLASHCARDS\s*=\s*(\{[\s\S]*?\});\s*\n', text)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except Exception:
        return {}


def write_js_deck(js_path: Path, deck: dict):
    """Write updated FLASHCARDS back into data.js."""
    text = js_path.read_text(encoding="utf-8", errors="ignore")
    payload = json.dumps(deck, ensure_ascii=False, indent=2)
    new_block = f"// ═══ FLASHCARDS DATA ═══\nconst FLASHCARDS={payload};\n"
    # Replace existing block
    updated = re.sub(
        r'// ═══ FLASHCARDS DATA ═══\nconst FLASHCARDS=\{[\s\S]*?\};\n',
        new_block,
        text
    )
    if updated == text:
        # Fallback: append before RC
        updated = text.replace("// ═══ REVISION CONTENT DATA ═══", new_block + "\n// ═══ REVISION CONTENT DATA ═══")
    js_path.write_text(updated, encoding="utf-8")


def append_cards(deck: dict, sid: str, cards: list) -> int:
    if sid not in deck:
        deck[sid] = []
    seen = {f"{c['q']}|||{c['a']}" for c in deck[sid] if isinstance(c, dict)}
    added = 0
    for c in cards:
        key = f"{c['q']}|||{c['a']}"
        if key not in seen:
            deck[sid].append(c)
            seen.add(key)
            added += 1
    return added


def main():
    args = parse_args()
    pdf_path = Path(args.pdf)
    out_path = Path(args.out)

    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}")
        sys.exit(1)

    PdfReader = load_pdf_reader(args.deps_path)
    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)

    start = max(1, args.start)
    end   = min(args.end, total_pages)
    print(f"Processing pages {start}–{end} of {total_pages}")

    deck = {} if args.reset else read_existing_js_deck(out_path)
    prev_sid = "ga"
    pages_done = 0
    cards_added = 0

    for p in range(start, end + 1):
        raw = reader.pages[p - 1].extract_text() or ""
        txt = clean_text(raw)
        sid = detect_subject(p, txt, prev_sid)
        prev_sid = sid
        page_cards = extract_all_qas(txt, p)
        if page_cards:
            n = append_cards(deck, sid, page_cards)
            cards_added += n
            pages_done += 1

    write_js_deck(out_path, deck)

    print(f"\n✅ Done!")
    print(f"   Pages with cards: {pages_done}")
    print(f"   New cards added:  {cards_added}")
    print(f"\nDeck sizes by subject:")
    for sid in sorted(deck.keys()):
        print(f"   {sid:6s}: {len(deck[sid])} cards")


if __name__ == "__main__":
    main()
