#!/usr/bin/env python3
"""
GATE PYQ Intelligence Pipeline
Processes all PDFs in 'gate pyq/' folder and produces pyq_intelligence.js
Uses PyMuPDF (fitz) for text extraction.
Run: python tools/pyq_pipeline.py
"""
import json, re, sys, os
from pathlib import Path
from collections import defaultdict

DEV_TOOLS_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DEV_TOOLS_DIR.parent
DEFAULT_PYQ_DIR = DEV_TOOLS_DIR / "gate pyq"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "pyq_intelligence.js"

# ─── Try to import PDF library ───────────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    PDF_LIB = "fitz"
except ImportError:
    try:
        import pdfplumber
        PDF_LIB = "pdfplumber"
    except ImportError:
        print("ERROR: Install PyMuPDF or pdfplumber: pip install pymupdf")
        sys.exit(1)

# ─── Concept detection keyword map ───────────────────────────────────────────
CONCEPT_KEYWORDS = {
    "scheduling": ["scheduling","sjf","fcfs","round robin","srtf","priority","cpu burst","turnaround","waiting time","gantt"],
    "deadlock": ["deadlock","banker","safe state","resource allocation","wait-for","circular wait","hold and wait","mutex","starvation"],
    "page_replacement": ["page replacement","lru","fifo","optimal","belady","page fault","reference string","frames","thrashing"],
    "virtual_memory": ["virtual memory","paging","page table","tlb","effective access","page size","address translation","demand paging"],
    "inode": ["inode","direct block","indirect block","file size","block pointer","triple indirect","double indirect"],
    "disk_scheduling": ["disk","sstf","scan","c-scan","head movement","seek","cylinder","rotation"],
    "synchronization": ["semaphore","mutex","critical section","producer consumer","monitor","wait\\(","signal\\(","deadlock prevention"],
    "process": ["process","pcb","fork","exec","context switch","process state","zombie","orphan"],
    "threads": ["thread","user.level thread","kernel thread","m:n","1:1","blocking system call","multithreading"],
    "cache": ["cache","hit ratio","miss ratio","write back","write through","cache line","associativity","direct mapped","set associative"],
    "memory_allocation": ["first fit","best fit","worst fit","buddy","fragmentation","compaction","contiguous allocation"],
    "pipeline": ["pipeline","hazard","data hazard","control hazard","forwarding","stall","bubble","cpi","speedup","stages"],
    "cache_mapping": ["tag","index","offset","block size","set associative","cache miss","cold miss","capacity miss","conflict miss"],
    "ieee754": ["ieee","floating point","mantissa","exponent","bias","single precision","double precision","normalized"],
    "interrupts": ["interrupt","dma","polling","i/o","trap","system call","interrupt handler","isr"],
    "normalization": ["normalization","functional dependency","bcnf","3nf","2nf","1nf","canonical","closure","candidate key","prime attribute"],
    "transactions": ["transaction","acid","serializability","conflict serializable","precedence graph","schedule","commit","rollback"],
    "locks": ["2pl","two phase locking","shared lock","exclusive lock","lock compatibility","deadlock","wait-die","wound-wait"],
    "recovery": ["undo","redo","checkpoint","log","recovery","crash","force","steal","no-steal","no-force"],
    "sql_joins": ["join","inner join","outer join","natural join","cross join","equi-join","cartesian"],
    "sql_aggregation": ["group by","having","count","sum","avg","min","max","aggregate"],
    "relational_algebra": ["relational algebra","project","select","join","rename","union","intersection","difference","division"],
    "dfa_nfa": ["dfa","nfa","finite automaton","finite automata","states","transitions","regular language","epsilon","δ"],
    "dfa_minimization": ["minimization","table filling","myhill","nerode","equivalent states","minimal dfa"],
    "regular_languages": ["regular expression","regular language","closure","pumping lemma","kleene star","concat"],
    "cfl": ["context.free","pushdown","pda","cfg","grammar","parse tree","ambiguous","derivation","cnf"],
    "pumping_lemma": ["pumping lemma","non-regular","non-context-free","proof"],
    "turing_machines": ["turing machine","tm","halting","decidable","undecidable","semi-decidable","recursive"],
    "closure_decidable": ["decidable","undecidable","membership","emptiness","equivalence","finiteness"],
    "rice_theorem": ["rice","semantic property","non-trivial"],
    "chomsky_hierarchy": ["type 0","type 1","type 2","type 3","chomsky","hierarchy","recursively enumerable"],
    "parsing": ["ll(1)","lr(1)","slr","lalr","parser","parse table","first","follow","production","grammar"],
    "first_follow": ["first set","follow set","nullable","epsilon production","predict"],
    "sdts": ["attribute grammar","synthesized","inherited","syntax directed","semantic action"],
    "sorting": ["quicksort","mergesort","heapsort","insertion sort","bubble sort","counting sort","radix sort","comparison sort","stable sort","in-place"],
    "dp": ["dynamic programming","optimal substructure","overlapping subproblems","memoization","top-down","bottom-up"],
    "greedy_proof": ["greedy","activity selection","optimal","local optimum","exchange argument"],
    "huffman": ["huffman","prefix.free","variable length","entropy","encoding","compression"],
    "graph_traversal": ["bfs","dfs","breadth first","depth first","traversal","visited","queue","stack"],
    "dijkstra": ["dijkstra","shortest path","single source","relaxation","priority queue","non-negative"],
    "bellman_ford": ["bellman.ford","negative weight","negative cycle","shortest path"],
    "mst": ["minimum spanning tree","kruskal","prim","mst","cut property","cycle property"],
    "np_completeness": ["np","np-complete","np-hard","polynomial reduction","satisfiability","sat","clique","vertex cover","3-sat"],
    "master_theorem": ["master theorem","recurrence","t(n)","divide","conquer","a.*t.*n/b"],
    "avl": ["avl","balanced bst","rotation","ll rotation","rr rotation","lr rotation","balance factor"],
    "heaps": ["heap","max-heap","min-heap","heapify","priority queue","extract-max","build-heap"],
    "trees_bst": ["binary search tree","bst","inorder","preorder","postorder","successor","predecessor"],
    "graph_theory": ["graph","vertex","edge","degree","connected","component","bipartite","coloring","planar"],
    "eulerian_hamiltonian": ["eulerian","hamiltonian","euler circuit","euler path","hamilton cycle"],
    "planar_graph": ["planar","euler formula","faces","k5","k3,3","kuratowski","four color"],
    "counting": ["permutation","combination","binomial","multinomial","counting","arrangements","selections"],
    "catalan": ["catalan","bst","parenthesization","triangulation"],
    "inclusion_exclusion": ["inclusion.exclusion","principle","union","complement","at least"],
    "relations": ["relation","reflexive","symmetric","transitive","antisymmetric","equivalence","partial order","total order","poset"],
    "eigenvalues": ["eigenvalue","eigenvector","characteristic polynomial","trace","determinant","diagonalization","cayley-hamilton"],
    "matrix_rank": ["rank","null space","column space","row space","linear independence","basis","dimension","rank-nullity"],
    "linear_transform": ["linear transformation","kernel","image","injective","surjective","bijective"],
    "probability": ["probability","bayes","conditional","independent","random variable","expected value","variance"],
    "distributions": ["normal","gaussian","binomial","poisson","exponential","geometric","bernoulli","uniform"],
    "ip_subnetting": ["subnet","cidr","ip address","subnet mask","broadcast","network address","classful","classless"],
    "routing": ["routing","ospf","bgp","rip","distance vector","link state","routing table"],
    "tcp_flow": ["tcp","congestion","flow control","window","slow start","aimd","rtt","throughput"],
    "sliding_window": ["sliding window","go-back-n","selective repeat","arq","stop-and-wait","efficiency"],
    "error_detection": ["crc","checksum","hamming","parity","error detection","error correction","generator polynomial"],
    "aloha": ["aloha","slotted aloha","pure aloha","efficiency","throughput","offered load","collision"],
    "csma_cd": ["csma","collision detection","ethernet","minimum frame size","propagation delay","contention"],
    "kmap": ["k-map","karnaugh","prime implicant","essential","sop","pos","minimization","boolean"],
    "sequential_circuits": ["flip-flop","d flip-flop","jk","sr","t flip-flop","sequential","clock","state transition"],
    "counters": ["counter","ripple counter","synchronous counter","mod","binary counter","ring counter"],
    "multiplexer_logic": ["multiplexer","mux","demux","selector","universal gate","boolean implementation"],
    "registers": ["register","shift register","siso","sipo","piso","serial","parallel"],
    "differential_equations": ["differential equation","ode","integrating factor","homogeneous","particular solution"],
    "laplace": ["laplace","transform","s-domain","initial value","final value"],
    "fourier_series": ["fourier","series","harmonic","periodic","coefficients","odd","even function"],
    "maxima_minima": ["maxima","minima","critical point","hessian","saddle point","second derivative"],
    "limits": ["limit","continuity","l'hopital","squeeze theorem","derivative","differentiation"],
}

# Subject detection from topic
SUBJECT_TOPICS = {
    "os": ["scheduling","deadlock","page_replacement","virtual_memory","inode","disk_scheduling",
           "synchronization","process","threads","memory_allocation","copy_on_write","working_set"],
    "coa": ["pipeline","cache","cache_mapping","ieee754","interrupts","memory_hierarchy","branch_prediction"],
    "algo": ["sorting","dp","greedy_proof","huffman","graph_traversal","dijkstra","bellman_ford",
             "mst","np_completeness","master_theorem","avl","heaps","trees_bst","matrix_chain",
             "lcs","string_matching","divide_conquer","ford_fulkerson","topological_sort","scc"],
    "dbms": ["normalization","transactions","locks","recovery","sql_joins","sql_aggregation",
             "relational_algebra","er_model","closure_fd","mvd","subquery","acid_isolation"],
    "toc": ["dfa_nfa","dfa_minimization","regular_languages","cfl","pumping_lemma","pda",
            "turing_machines","closure_decidable","rice_theorem","chomsky_hierarchy","chomsky_normal","mealy_moore"],
    "cd": ["parsing","first_follow","sdts","ll1_parsing","lalr1","ir_code","dag_ir",
           "activation_record","liveness","register_allocation","basic_block","peephole_opt"],
    "dm": ["graph_theory","eulerian_hamiltonian","planar_graph","counting","catalan",
           "inclusion_exclusion","relations","functions","graph_isomorphism","chromatic","pigeonhole"],
    "cn": ["ip_subnetting","routing","tcp_flow","sliding_window","error_detection",
           "aloha","csma_cd","dns","http","nat","ipv6","arp"],
    "dl": ["kmap","sequential_circuits","counters","multiplexer_logic","registers",
           "encoder_decoder","hazards_dl","pla_pal"],
    "la": ["eigenvalues","matrix_rank","linear_transform","quadratic_form","vector_spaces"],
    "calc": ["differential_equations","laplace","fourier_series","maxima_minima","limits",
             "partial_diff","double_integral"],
    "ps": ["probability","distributions","markov_chain","joint_dist","bernoulli_geometric","clt"],
    "ga": ["syllogism","number_series","percentage_profit","sets_venn"],
}

def extract_text_fitz(path):
    doc = fitz.open(str(path))
    return "\n".join(page.get_text() for page in doc)

def extract_text_pdfplumber(path):
    import pdfplumber
    with pdfplumber.open(str(path)) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)

def extract_text(path):
    if PDF_LIB == "fitz":
        return extract_text_fitz(path)
    return extract_text_pdfplumber(path)

def detect_year(filename):
    m = re.search(r'(\d{4})', filename)
    return int(m.group(1)) if m else 0

def detect_concepts(text):
    text_l = text.lower()
    detected = []
    for concept_id, keywords in CONCEPT_KEYWORDS.items():
        pattern = '|'.join(keywords)
        if re.search(pattern, text_l):
            detected.append(concept_id)
    return detected

def guess_subject(concepts):
    scores = defaultdict(int)
    for c in concepts:
        for subj, clist in SUBJECT_TOPICS.items():
            if c in clist:
                scores[subj] += 1
    return max(scores, key=scores.get) if scores else "unknown"

def extract_questions_from_text(text, year):
    """Extract question blocks from raw PDF text."""
    questions = []
    # Split on Q. N. or question number patterns
    # Multiple patterns to handle different PDF layouts
    patterns = [
        r'(?:^|\n)\s*Q\.?\s*(\d+)[\.\)]\s*([\s\S]*?)(?=\n\s*Q\.?\s*\d+[\.\)]|\Z)',
        r'(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.\s+|\Z)',
    ]
    for pat in patterns:
        matches = re.findall(pat, text, re.MULTILINE)
        if len(matches) > 5:
            for num, qtext in matches:
                qtext = qtext.strip()
                if len(qtext) < 20:
                    continue
                opt_match = re.search(r'\(A\)(.*?)\(B\)(.*?)\(C\)(.*?)(?:\(D\)(.*?))?$', qtext, re.DOTALL)
                options, answer = [], None
                if opt_match:
                    options = [g.strip()[:80] for g in opt_match.groups() if g]
                # Try to find answer key
                ans_match = re.search(r'(?:ans(?:wer)?|key|solution)[\s:]*\(?([A-D])\)?', qtext, re.IGNORECASE)
                if ans_match:
                    answer = ans_match.group(1)
                # Trim question to before options
                q_clean = re.split(r'\(A\)', qtext)[0].strip()
                if len(q_clean) < 15:
                    continue
                concepts = detect_concepts(q_clean + " " + qtext)
                questions.append({
                    "id": f"pyq_{year}_{num}",
                    "year": year,
                    "subject": guess_subject(concepts),
                    "question": q_clean[:300],
                    "options": options[:4],
                    "answer": answer,
                    "concepts": concepts,
                    "raw_length": len(qtext)
                })
            if questions:
                break
    return questions

def process_all_pdfs(pyq_dir):
    pyq_dir = Path(pyq_dir)
    all_questions = []
    concept_frequency = defaultdict(int)
    concept_years = defaultdict(set)
    concept_pairs_count = defaultdict(int)

    pdfs = sorted(pyq_dir.glob("*.pdf"))
    print(f"Found {len(pdfs)} PDFs")

    for pdf_path in pdfs:
        year = detect_year(pdf_path.name)
        if year < 2007: continue
        print(f"  Processing {pdf_path.name} (year={year})...", end="", flush=True)
        try:
            text = extract_text(pdf_path)
            questions = extract_questions_from_text(text, year)
            all_questions.extend(questions)
            print(f" → {len(questions)} questions extracted")

            # Update frequency and trends
            for q in questions:
                for c in q['concepts']:
                    concept_frequency[c] += 1
                    concept_years[c].add(year)
                # Concept pairs
                clist = q['concepts']
                for i in range(len(clist)):
                    for j in range(i+1, len(clist)):
                        pair = tuple(sorted([clist[i], clist[j]]))
                        concept_pairs_count[pair] += 1
        except Exception as e:
            print(f" ERROR: {e}")

    return all_questions, concept_frequency, concept_years, concept_pairs_count

def compute_importance(cid, freq, years_set):
    """Composite importance: frequency + recency + spread."""
    latest = max(years_set) if years_set else 2015
    recency = 1.0 + (latest - 2015) * 0.08
    spread = min(len(years_set) / 5.0, 2.0)
    base = min(freq * 0.7, 8.0)
    return round(min(base + spread + recency, 10.0), 2)

def build_pyq_intelligence_js(all_questions, concept_frequency, concept_years, concept_pairs_count):
    # Build high yield ranking
    importance_scores = {}
    for cid, freq in concept_frequency.items():
        importance_scores[cid] = compute_importance(cid, freq, concept_years[cid])

    high_yield = sorted(importance_scores.items(), key=lambda x: x[1], reverse=True)[:30]

    # Subject lookup from SUBJECT_TOPICS (reverse map)
    concept_to_subject = {}
    for subj, clist in SUBJECT_TOPICS.items():
        for c in clist:
            concept_to_subject[c] = subj

    # Pretty label
    def label(cid):
        return cid.replace('_', ' ').title()

    # Build structured pyqs by subject
    pyqs_by_subject = defaultdict(list)
    for q in all_questions:
        pyqs_by_subject[q['subject']].append({
            "id": q['id'],
            "year": q['year'],
            "question": q['question'],
            "options": q['options'],
            "answer": q['answer'],
            "concepts": q['concepts'][:5],  # top 5 concepts
        })

    # Concept pairs list
    pairs = [
        {"concept_a": a, "concept_b": b, "count": cnt}
        for (a, b), cnt in sorted(concept_pairs_count.items(), key=lambda x: -x[1])
        if cnt >= 2
    ][:25]

    # Trends
    trends = {cid: sorted(list(yrs)) for cid, yrs in concept_years.items() if yrs}

    # High yield ranked list
    hy_ranked = [
        {
            "id": cid,
            "subject": concept_to_subject.get(cid, "cs"),
            "score": score,
            "label": label(cid),
            "freq": concept_frequency.get(cid, 0)
        }
        for cid, score in high_yield
    ]

    output = {
        "meta": {
            "generated": "2026-03-08",
            "total_questions": len(all_questions),
            "total_pdfs_processed": len(set(q['year'] for q in all_questions)),
            "years": sorted(set(q['year'] for q in all_questions))
        },
        "pyq_db": {k: v[:30] for k, v in pyqs_by_subject.items()},
        "concept_frequency": dict(sorted(concept_frequency.items(), key=lambda x: -x[1])[:50]),
        "concept_trends": {k: v for k, v in sorted(trends.items(), key=lambda x: -len(x[1]))[:30]},
        "concept_pairs": pairs,
        "importance_scores": dict(sorted(importance_scores.items(), key=lambda x: -x[1])[:40]),
        "high_yield_ranked": hy_ranked,
    }

    return output

def write_output(data, output_path):
    js_content = f"""// ═══════════════════════════════════════════════════════════════
// GATE PYQ Intelligence — Auto-generated from real PYQ PDFs
// Source: {data['meta']['total_pdfs_processed']} year PDFs
// Total questions processed: {data['meta']['total_questions']}
// ═══════════════════════════════════════════════════════════════

const PYQ_META = {json.dumps(data['meta'], indent=2)};

const PYQ_DB = {json.dumps(data['pyq_db'], ensure_ascii=False, indent=2)};

const PYQ_INTELLIGENCE = {{
  concept_frequency: {json.dumps(data['concept_frequency'], indent=2)},
  concept_trends: {json.dumps(data['concept_trends'], indent=2)},
  concept_pairs: {json.dumps(data['concept_pairs'], indent=2)},
  importance_scores: {json.dumps(data['importance_scores'], indent=2)},
  high_yield_ranked: {json.dumps(data['high_yield_ranked'], indent=2)},
  pyq_patterns: {{
    "page_replacement": {{"pattern":"Page fault count using FIFO/LRU/OPT on given reference string.","trap":"Confusing frame count vs page count. LRU stack tracks RECENCY not frequency.","shortcut":"LRU: maintain stack. FIFO: circular queue. OPT: look-ahead.","frequency":{data['concept_frequency'].get('page_replacement',6)},"last_year":{max(data['concept_trends'].get('page_replacement',[2022]))}}},
    "deadlock": {{"pattern":"Banker's algorithm safe/unsafe OR deadlock formula n(max-1)+1<=R.","trap":"Not returning resources to Available after simulating each process in Banker's.","shortcut":"Safe = find process where Need <= Available. Add allocation to Available. Repeat.","frequency":{data['concept_frequency'].get('deadlock',8)},"last_year":{max(data['concept_trends'].get('deadlock',[2023]))}}},
    "scheduling": {{"pattern":"Gantt chart + avg waiting time / turnaround time computation.","trap":"SRTF: check every new arrival for preemption. Reset burst times carefully.","shortcut":"TAT = Completion - Arrival. Wait = TAT - Burst. Always draw Gantt first.","frequency":{data['concept_frequency'].get('scheduling',12)},"last_year":{max(data['concept_trends'].get('scheduling',[2023]))}}},
    "normalization": {{"pattern":"Attribute closure to find candidate keys OR identify normal form.","trap":"Missing transitive FDs when checking 3NF/BCNF. Check ALL attributes.","shortcut":"Compute X+ for all subsets. Minimal key whose closure = all attributes.","frequency":{data['concept_frequency'].get('normalization',8)},"last_year":{max(data['concept_trends'].get('normalization',[2023]))}}},
    "pipeline": {{"pattern":"CPI with stalls, speedup formula, or hazard identification.","trap":"Speedup = n only with infinite instructions. Real speedup is always lower.","shortcut":"CPI_actual = CPI_ideal + stalls/instruction. Draw pipeline diagram.","frequency":{data['concept_frequency'].get('pipeline',5)},"last_year":{max(data['concept_trends'].get('pipeline',[2023]))}}},
    "virtual_memory": {{"pattern":"Page table size = pages x entry_size. EMAT = hit*(t_tlb+t_mem) + miss*(t_tlb+2*t_mem).","trap":"Forgetting TLB time is added on BOTH hit and miss paths.","shortcut":"Pages = 2^(va_bits - offset_bits). Table = pages x entry_size.","frequency":{data['concept_frequency'].get('virtual_memory',7)},"last_year":{max(data['concept_trends'].get('virtual_memory',[2023]))}}},
    "dfa_nfa": {{"pattern":"Minimize DFA states or NFA to DFA conversion. Count states.","trap":"Not removing unreachable states before minimization. Includes trap/dead state.","shortcut":"Table filling algorithm: mark distinguishable pairs bottom-up.","frequency":{data['concept_frequency'].get('dfa_nfa',5)},"last_year":{max(data['concept_trends'].get('dfa_nfa',[2023]))}}},
    "transactions": {{"pattern":"Conflict serializability via precedence graph OR 2PL correctness.","trap":"Drawing precedence graph edges in wrong direction (writer→reader for W-R conflict).","shortcut":"Conflict: same data item, different transactions, at least one write.","frequency":{data['concept_frequency'].get('transactions',6)},"last_year":{max(data['concept_trends'].get('transactions',[2022]))}}}
  }}
}};
"""
    Path(output_path).write_text(js_content, encoding="utf-8")
    print(f"\n✅ Written to {output_path}")
    print(f"   Total questions: {data['meta']['total_questions']}")
    print(f"   Unique concepts tracked: {len(data['concept_frequency'])}")
    print(f"   Concept pairs: {len(data['concept_pairs'])}")
    print(f"   Top concept: {data['high_yield_ranked'][0]['label'] if data['high_yield_ranked'] else 'N/A'}")


if __name__ == "__main__":
    pyq_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PYQ_DIR
    output  = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    print(f"Processing PDFs from: {pyq_dir}")
    questions, freq, years, pairs = process_all_pdfs(pyq_dir)
    if not questions:
        print("⚠  No questions extracted — PDFs may be image-based. Try OCR pipeline.")
    data = build_pyq_intelligence_js(questions, freq, years, pairs)
    write_output(data, output)
