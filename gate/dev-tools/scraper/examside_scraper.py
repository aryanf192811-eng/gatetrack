"""
ExamSIDE GATE CSE Question Scraper v2.1
=========================================
Fetches GATE CSE questions from questions.examside.com using their
SvelteKit __data.json API endpoints.
"""

import json
import time
import re
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

BASE_URL = "https://questions.examside.com"

# Set UTF-8 output for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# All GATE CSE chapter URLs
CHAPTERS = {
    "Operating Systems": {
        "subject_key": "operating-systems",
        "chapters": [
            ("Process Concepts and CPU Scheduling", "process-concepts-and-cpu-scheduling"),
            ("Synchronization and Concurrency", "synchronization-and-concurrency"),
            ("Deadlocks", "deadlocks"),
            ("Memory Management", "memory-management"),
            ("File System IO and Protection", "file-system-io-and-protection"),
        ]
    },
    "Algorithms": {
        "subject_key": "algorithms",
        "chapters": [
            ("P and NP Concepts", "p-and-np-concepts"),
            ("Searching and Sorting", "searching-and-sorting"),
            ("Greedy Method", "greedy-method"),
            ("Dynamic Programming", "dynamic-programming"),
            ("Complexity Analysis", "complexity-analysis-and-asymptotic-notations"),
            ("Divide and Conquer", "divide-and-conquer-method"),
        ]
    },
    "Digital Logic": {
        "subject_key": "digital-logic",
        "chapters": [
            ("Boolean Algebra", "boolean-algebra"),
            ("K Maps", "k-maps"),
            ("Combinational Circuits", "combinational-circuits"),
            ("Number Systems", "number-systems"),
            ("Sequential Circuits", "sequential-circuits"),
        ]
    },
    "Database Management System": {
        "subject_key": "database-management-system",
        "chapters": [
            ("ER Diagrams", "er-diagrams"),
            ("Functional Dependencies and Normalization", "functional-dependencies-and-normalization"),
            ("SQL", "structured-query-language"),
            ("Relational Algebra", "relational-algebra"),
            ("Transactions and Concurrency", "transactions-and-concurrency"),
            ("File Structures and Indexing", "file-structures-and-indexing"),
        ]
    },
    "Data Structures": {
        "subject_key": "data-structures",
        "chapters": [
            ("Arrays", "arrays"),
            ("Stacks and Queues", "stacks-and-queues"),
            ("Linked List", "linked-list"),
            ("Trees", "trees"),
            ("Graphs", "graphs"),
            ("Hashing", "hashing"),
        ]
    },
    "Computer Networks": {
        "subject_key": "computer-networks",
        "chapters": [
            ("Concepts of Layering", "concepts-of-layering"),
            ("Data Link Layer and Switching", "data-link-layer-and-switching"),
            ("Network Layer", "network-layer"),
            ("Application Layer Protocol", "application-layer-protocol"),
            ("Routing Algorithm", "routing-algorithm"),
            ("TCP UDP and Congestion Control", "tcp-udp-sockets-and-congestion-control"),
            ("LAN Technologies and Wi-Fi", "lan-technologies-and-wi-fi"),
            ("Network Security", "network-security"),
        ]
    },
    "Theory of Computation": {
        "subject_key": "theory-of-computation",
        "chapters": [
            ("Finite Automata and Regular Language", "finite-automata-and-regular-language"),
            ("Push Down Automata and CFL", "push-down-automata-and-context-free-language"),
            ("Undecidability", "undecidability"),
            ("Recursively Enumerable Language", "recursively-enumerable-language-and-turing-machine"),
        ]
    },
    "Compiler Design": {
        "subject_key": "compiler-design",
        "chapters": [
            ("Lexical Analysis", "lexical-analysis"),
            ("Parsing", "parsing"),
            ("Syntax Directed Translation", "syntax-directed-translation"),
            ("Code Generation and Optimization", "code-generation-and-optimization"),
        ]
    },
    "Discrete Mathematics": {
        "subject_key": "discrete-mathematics",
        "chapters": [
            ("Set Theory and Algebra", "set-theory-and-algebra"),
            ("Linear Algebra", "linear-algebra"),
            ("Graph Theory", "graph-theory"),
            ("Combinatorics", "combinatorics"),
            ("Mathematical Logic", "mathematical-logic"),
            ("Probability", "probability"),
            ("Calculus", "calculus"),
        ]
    },
    "General Aptitude": {
        "subject_key": "general-aptitude",
        "chapters": [
            ("Verbal Ability", "verbal-ability"),
            ("Numerical Ability", "numerical-ability"),
            ("Logical Reasoning", "logical-reasoning"),
        ]
    },
}

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://questions.examside.com/past-years/gate/gate-cse",
})

def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            resp = SESSION.get(url, timeout=20)
            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 429:
                time.sleep(10)
            else:
                return None
        except:
            time.sleep(2)
    return None

def decode_svelte_data(raw_json):
    """Extract data array from SvelteKit serialized format."""
    nodes = raw_json.get("nodes", [])
    for node in nodes:
        if isinstance(node, dict) and node.get("type") == "data":
            return node.get("data", [])
    return None

def resolve(val, data, cache=None, seen=None):
    """Recursively resolve SvelteKit referential data with memoization."""
    if seen is None: seen = set()
    if cache is None: cache = {}

    # Handle indices
    if isinstance(val, int) and 0 <= val < len(data):
        if val in cache: return cache[val]
        if val in seen: return "CIRCULAR"
        seen.add(val)
        res = resolve(data[val], data, cache, seen)
        cache[val] = res
        return res

    if isinstance(val, dict):
        # Special case: localization wrapper
        if len(val) == 1 and ('en' in val or 'hi' in val):
            k = 'en' if 'en' in val else 'hi'
            return resolve(val[k], data, cache, seen)

        # Generic dict resolution
        res = {}
        for k, v in val.items():
            res[k] = resolve(v, data, cache, seen.copy())
        return res

    if isinstance(val, list):
        return [resolve(v, data, cache, seen.copy()) for v in val]

    return val

def clean_text(text):
    """Clean HTML while preserving math."""
    if not text: return ""
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    entities = {'&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ', '&#39;': "'", '&quot;': '"'}
    for entity, char in entities.items():
        text = text.replace(entity, char)
    return text.strip()

def parse_question_objects(question_objs, subject, chapter):
    """Parse resolved question objects into our standard format."""
    parsed = []
    for q_orig in (question_objs or []):
        if not isinstance(q_orig, dict): continue

        q = q_orig
        if isinstance(q_orig.get('content'), dict) and 'content' in q_orig['content']:
            q = q_orig['content']
        elif isinstance(q_orig.get('question'), dict):
            q = q_orig['question']

        # Extract question text
        content_raw = q.get('content', q.get('statement', q.get('question', '')))
        if isinstance(content_raw, dict) and 'en' in content_raw:
            content_val = content_raw['en']
        elif isinstance(content_raw, dict) and 'content' in content_raw:
            content_val = content_raw['content']
            if isinstance(content_val, dict) and 'en' in content_val:
                content_val = content_val['en']
        else:
            content_val = content_raw

        content_text = clean_text(str(content_val) if content_val is not None else "")
        if len(content_text) < 5: continue

        # Extract options
        options_raw = q.get('options', q_orig.get('options', []))
        parsed_options = []
        if isinstance(options_raw, list):
            for opt in options_raw:
                val = opt
                if isinstance(opt, dict):
                    val = opt.get('content', opt.get('text', ''))
                    if isinstance(val, dict) and 'en' in val:
                        val = val['en']
                parsed_options.append(clean_text(str(val) if val is not None else ""))

        # Extract correct answer - try various paths
        correct_val = None
        # Priority: correct_options (list of identifiers like ['A'])
        c_opts = q.get('correct_options', q_orig.get('correct_options'))
        if isinstance(c_opts, list) and c_opts:
            correct_val = c_opts[0]

        # Priority 2: direct correct/answer/correct_index
        if correct_val is None or str(correct_val).lower() == 'none':
            correct_val = q.get('correct', q.get('answer', q_orig.get('correct', q_orig.get('answer'))))

        if isinstance(correct_val, dict) and 'en' in correct_val:
            correct_val = correct_val['en']

        correct_text = clean_text(str(correct_val) if correct_val is not None else "")

        # Handle identifier mapping (e.g., 'A' -> first option)
        if len(correct_text) == 1 and correct_text.upper() in 'ABCD' and parsed_options:
            idx = ord(correct_text.upper()) - ord('A')
            if 0 <= idx < len(parsed_options):
                correct_text = parsed_options[idx]
        elif len(correct_text) > 1 and correct_text.upper() in ['OPTION A', 'OPTION B', 'OPTION C', 'OPTION D'] and parsed_options:
             idx = ord(correct_text.upper()[-1]) - ord('A')
             if 0 <= idx < len(parsed_options):
                correct_text = parsed_options[idx]

        # Final check for c_idx
        c_idx = q.get('correct_index', q.get('correctIndex', q_orig.get('correct_index', q_orig.get('correctIndex'))))
        if (not correct_text or correct_text.lower() == 'none') and isinstance(c_idx, int):
            if 0 <= c_idx < len(parsed_options):
                correct_text = parsed_options[c_idx]

        # If still none, maybe it's a numeric answer (NAT)
        if (not correct_text or correct_text.lower() == 'none'):
            nat = q.get('answer_numeric', q_orig.get('answer_numeric'))
            if nat: correct_text = str(nat)

        # Year and Marks
        year = q.get('year', q_orig.get('year', 0))
        try:
            if isinstance(year, list) and year: year = year[0]
            if isinstance(year, str):
                m = re.search(r'\d{4}', year)
                year = int(m.group()) if m else 0
            year = int(year)
        except: year = 0

        try:
            m_raw = q.get('marks', q_orig.get('marks', 1))
            if isinstance(m_raw, list) and m_raw: m_raw = m_raw[0]
            marks = int(float(str(m_raw)))
        except: marks = 1

        parsed.append({
            'q': content_text,
            'options': parsed_options,
            'answer': correct_text,
            'year': year,
            'marks': marks,
            'subject': subject,
            'chapter': chapter,
            'type': str(q.get('type', q_orig.get('type', 'MCQ'))).upper(),
            'source': 'examside'
        })
    return parsed

def get_chapter_question_slugs(subject_key, chapter_key):
    """Get all question slugs from a chapter page."""
    url = f"{BASE_URL}/past-years/gate/gate-cse/{subject_key}/{chapter_key}/__data.json?x-sveltekit-invalidated=01"
    raw = fetch_json(url)
    if not raw: return []
    data = decode_svelte_data(raw)
    if not data or not isinstance(data, list): return []

    slugs = []
    # Pattern: Strings like "gate-cse-2015-marks-1...htm" or containing "gate-cse"
    for item in data:
        if isinstance(item, str) and 'gate-cse' in item.lower():
            # If it's already a full path, keep it
            if item.startswith('/'):
                slugs.append(item)
            else:
                # Prepend the question base path
                if '.htm' in item:
                    slugs.append(f"/past-years/gate/question/{item}")
                else:
                    # Some slugs might be fragments, treat with caution
                    if len(item) > 10:
                        slugs.append(f"/past-years/gate/question/{item}.htm")

    return list(set(slugs))

def scrape_question(question_path, subject, chapter):
    """Scrape a single question."""
    q_url = f"{BASE_URL}{question_path}" if question_path.startswith('/') else question_path
    data_url = q_url.rstrip('/') + "/__data.json?x-sveltekit-invalidated=01"
    raw = fetch_json(data_url)
    if not raw: return []
    data_block = decode_svelte_data(raw)
    if not data_block: return []

    # Extract questions
    main = data_block[0] if data_block and isinstance(data_block[0], dict) else {}
    q_ref = main.get('questions', main.get('items'))
    if q_ref is None: return []
    resolved_list = resolve(q_ref, data_block)
    if not isinstance(resolved_list, list): return []

    return parse_question_objects([q for q in resolved_list if isinstance(q, dict)], subject, chapter)

def demo_mode():
    print("DEMO MODE: Testing 'Deadlocks' chapter...")
    slugs = get_chapter_question_slugs("operating-systems", "deadlocks")
    print(f"  Slugs found: {len(slugs)}")
    if not slugs: slugs = ["/past-years/gate/question/a-system-has-6-identical-resources-and-n-processes-competing-gate-cse-2015-set-2-marks-1-2cotags3jdkjistw.htm"]

    all_qs = []
    for slug in slugs[:2]:
        print(f"  Fetching: {slug[:50]}...")
        qs = scrape_question(slug, "Operating Systems", "Deadlocks")
        all_qs.extend(qs)
        if qs:
            print(f"    OK: {qs[0]['q'][:50]}...")
        time.sleep(1)
    return all_qs

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--demo', action='store_true')
    parser.add_argument('--subject', type=str, default=None)
    parser.add_argument('--max', type=int, default=None)
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[2]
    output_path = project_root / 'data' / 'dataset_examside.js'

    if args.demo:
        questions = demo_mode()
        if questions:
            with open(output_path.with_name('dataset_examside_demo.js'), 'w', encoding='utf-8') as f:
                f.write(f"const EXAMSIDE_QUESTIONS = {json.dumps(questions, indent=2, ensure_ascii=False)};")
            print("Demo complete!")
    else:
        all_questions = []
        subjects = {k: v for k, v in CHAPTERS.items() if args.subject is None or k == args.subject}
        for sub, info in subjects.items():
            print(f"\nSubject: {sub}")
            for name, key in info['chapters']:
                print(f"  Chapter: {name}", end=' ', flush=True)
                slugs = get_chapter_question_slugs(info['subject_key'], key)
                if args.max: slugs = slugs[:args.max]
                print(f"({len(slugs)} qs)", end=' ', flush=True)
                chapter_qs = []
                for slug in slugs:
                    chapter_qs.extend(scrape_question(slug, sub, name))
                    time.sleep(0.2)
                print(f"Done: {len(chapter_qs)}")
                all_questions.extend(chapter_qs)

        if all_questions:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"const EXAMSIDE_QUESTIONS = {json.dumps(all_questions, indent=2, ensure_ascii=False)};\n")
                f.write("if (typeof module !== 'undefined') module.exports = EXAMSIDE_QUESTIONS;")
            print(f"\nTotal: {len(all_questions)} questions written.")
