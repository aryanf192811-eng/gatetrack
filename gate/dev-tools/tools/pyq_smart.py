#!/usr/bin/env python3
"""
Smart GATE PYQ Intelligence — works with both text and image PDFs.
Extracts as much text as possible, does concept-frequency scan,
then MERGES with hand-curated data for image-only PDFs.
Run: python tools/pyq_smart.py
"""
import json, re, sys
from pathlib import Path
from collections import defaultdict
import fitz  # PyMuPDF

DEV_TOOLS_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DEV_TOOLS_DIR.parent
DEFAULT_PYQ_DIR = DEV_TOOLS_DIR / "gate pyq"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "pyq_intelligence.js"

# ─── Same keyword map as pipeline ────────────────────────────────────────────
CONCEPT_KEYWORDS = {
    "scheduling":      ["scheduling","sjf","fcfs","round robin","srtf","priority","turnaround","waiting time","gantt","process scheduling"],
    "deadlock":        ["deadlock","banker","safe state","resource allocation","wait.for graph","circular wait"],
    "page_replacement":["page replacement","lru","fifo","optimal","belady","page fault","reference string"],
    "virtual_memory":  ["virtual memory","paging","page table","tlb","effective access","demand paging","address translation"],
    "inode":           ["inode","direct block","indirect block","file size","block pointer","triple indirect"],
    "disk_scheduling": ["disk","sstf","scan","c.scan","head movement","seek","cylinder"],
    "synchronization": ["semaphore","mutex","critical section","producer.consumer","monitor"],
    "process":         ["process","pcb","fork","exec","context switch","zombie","orphan"],
    "threads":         ["thread","user.level thread","kernel thread","multithreading"],
    "cache":           ["cache","hit ratio","miss ratio","write back","write through","associativity","direct mapped"],
    "pipeline":        ["pipeline","hazard","data hazard","control hazard","forwarding","stall","cpi","speedup"],
    "ieee754":         ["ieee 754","floating point","mantissa","exponent","bias","single precision"],
    "interrupts":      ["interrupt","dma","polling","system call","trap","isr"],
    "normalization":   ["normalization","functional dependency","bcnf","3nf","2nf","candidate key","prime attribute","closure"],
    "transactions":    ["transaction","acid","serializability","conflict serializable","schedule","precedence graph"],
    "locks":           ["2pl","two.phase locking","shared lock","exclusive lock","wait.die","wound.wait"],
    "recovery":        ["undo","redo","checkpoint","crash recovery"],
    "sql_joins":       ["join","inner join","outer join","natural join","cross join"],
    "sql_aggregation": ["group by","having","count","sum","avg","aggregate"],
    "relational_algebra":["relational algebra","project","select","rename","union","divide"],
    "dfa_nfa":         ["dfa","nfa","finite automaton","finite automata","regular language"],
    "dfa_minimization":["minimization","table filling","myhill","nerode","minimal dfa"],
    "regular_languages":["regular expression","pumping lemma for regular","kleene"],
    "cfl":             ["context.free","pushdown","pda","cfg","parse tree","ambiguous grammar"],
    "pumping_lemma":   ["pumping lemma","non.regular","non.context.free"],
    "turing_machines": ["turing machine","halting problem","decidable","undecidable"],
    "closure_decidable":["decidable","undecidable","membership problem","emptiness problem"],
    "chomsky_hierarchy":["chomsky","hierarchy","type 0","type 1","type 2","type 3","recursively enumerable"],
    "parsing":         ["ll\\(1\\)","lr\\(1\\)","slr","lalr","parse table","first set","follow set"],
    "first_follow":    ["first set","follow set","nullable","predict set"],
    "sorting":         ["quick.sort","merge.sort","heap.sort","insertion sort","counting sort","radix sort","comparison.based"],
    "dp":              ["dynamic programming","optimal substructure","overlapping subproblems","memoization"],
    "greedy_proof":    ["greedy","activity selection","fractional knapsack","exchange argument"],
    "huffman":         ["huffman","prefix.free","variable length coding","entropy"],
    "graph_traversal": ["bfs","dfs","breadth.first","depth.first","topological sort"],
    "dijkstra":        ["dijkstra","shortest path","single.source shortest","relaxation"],
    "bellman_ford":    ["bellman.ford","negative weight","negative cycle"],
    "mst":             ["minimum spanning tree","kruskal","prim","cut property"],
    "np_completeness": ["np.complete","np.hard","polynomial reduction","satisfiability","np class"],
    "master_theorem":  ["master theorem","recurrence relation","t\\(n\\).*t\\(n/"],
    "avl":             ["avl","rotation","ll rotation","rr rotation","balance factor","height.balanced"],
    "heaps":           ["max.heap","min.heap","heapify","build.heap","priority queue"],
    "trees_bst":       ["binary search tree","bst","inorder","preorder","postorder"],
    "graph_theory":    ["graph","vertex degree","edge","connected component","bipartite","planarity"],
    "eulerian_hamiltonian":["eulerian","hamiltonian","euler circuit","euler path"],
    "planar_graph":    ["planar graph","euler.s formula","faces","kuratowski"],
    "counting":        ["permutation","combination","binomial coefficient","multinomial"],
    "catalan":         ["catalan","number of bsts","parenthesization","triangulation"],
    "inclusion_exclusion":["inclusion.exclusion","at least one","derangement"],
    "relations":       ["reflexive","symmetric","transitive","antisymmetric","equivalence relation","partial order","poset"],
    "eigenvalues":     ["eigenvalue","eigenvector","characteristic polynomial","trace of matrix"],
    "matrix_rank":     ["rank of matrix","null space","column space","linear independence","rank.nullity"],
    "probability":     ["probability","bayes.theorem","conditional probability","random variable","expected value"],
    "distributions":   ["normal distribution","binomial distribution","poisson","geometric distribution"],
    "ip_subnetting":   ["subnet","cidr","ip address","subnet mask","broadcast address","classless"],
    "routing":         ["routing protocol","ospf","bgp","rip","distance vector","link state routing"],
    "tcp_flow":        ["tcp","congestion control","flow control","window size","slow start","three.way handshake"],
    "sliding_window":  ["sliding window","go.back.n","selective repeat","stop.and.wait","arq"],
    "error_detection": ["crc","cyclic redundancy","hamming code","parity bit","error detection"],
    "aloha":           ["aloha","slotted aloha","throughput","collision","offered load"],
    "csma_cd":         ["csma","collision detection","ethernet","minimum frame size","propagation delay"],
    "kmap":            ["k.map","karnaugh","prime implicant","essential prime","sop","pos"],
    "sequential_circuits":["flip.flop","d flip","jk flip","state transition","sequential circuit","clock cycle"],
    "counters":        ["counter","ripple counter","synchronous counter","modulo","ring counter"],
    "multiplexer_logic":["multiplexer","mux","demux","selector line","boolean function"],
    "differential_equations":["differential equation","integrating factor","homogeneous","particular solution"],
    "maxima_minima":   ["maxima","minima","critical point","saddle point","second derivative test"],
    "limits":          ["l.hopital","limit","continuity","differentiability"],
}

SUBJECT_MAP = {
    "os": ["scheduling","deadlock","page_replacement","virtual_memory","inode","disk_scheduling","synchronization","process","threads"],
    "coa": ["pipeline","cache","ieee754","interrupts"],
    "algo": ["sorting","dp","greedy_proof","huffman","graph_traversal","dijkstra","bellman_ford","mst","np_completeness","master_theorem","avl","heaps","trees_bst"],
    "dbms": ["normalization","transactions","locks","recovery","sql_joins","sql_aggregation","relational_algebra"],
    "toc": ["dfa_nfa","dfa_minimization","regular_languages","cfl","pumping_lemma","turing_machines","closure_decidable","chomsky_hierarchy"],
    "cd": ["parsing","first_follow"],
    "dm": ["graph_theory","eulerian_hamiltonian","planar_graph","counting","catalan","inclusion_exclusion","relations"],
    "cn": ["ip_subnetting","routing","tcp_flow","sliding_window","error_detection","aloha","csma_cd"],
    "dl": ["kmap","sequential_circuits","counters","multiplexer_logic"],
    "la": ["eigenvalues","matrix_rank"],
    "calc": ["differential_equations","maxima_minima","limits"],
    "ps": ["probability","distributions"],
}

def get_subject(concepts):
    scores = defaultdict(int)
    for c in concepts:
        for s, cl in SUBJECT_MAP.items():
            if c in cl: scores[s] += 1
    return max(scores, key=scores.get) if scores else "cs"

def detect_year(name):
    m = re.search(r'(\d{4})', name)
    return int(m.group(1)) if m else 0

def scan_concepts(text):
    text_l = text.lower()
    return [cid for cid, kws in CONCEPT_KEYWORDS.items()
            if any(re.search(kw, text_l) for kw in kws)]

def process_pdfs(pyq_dir):
    freq = defaultdict(int)
    years = defaultdict(set)
    pairs_count = defaultdict(int)
    year_summaries = {}

    pdfs = sorted(Path(pyq_dir).glob("*.pdf"))
    print(f"PDFs found: {len(pdfs)}")

    for pdf_path in pdfs:
        year = detect_year(pdf_path.name)
        if year < 2007: continue
        try:
            doc = fitz.open(str(pdf_path))
            full_text = " ".join(p.get_text() for p in doc)
            word_count = len(full_text.split())
            if word_count < 200:
                print(f"  {pdf_path.name}: image-based (only {word_count} words) — skipping")
                continue
            concepts_found = scan_concepts(full_text)
            print(f"  {pdf_path.name}: {word_count} words, {len(concepts_found)} concepts")
            for c in concepts_found:
                freq[c] += 1
                years[c].add(year)
            for i in range(len(concepts_found)):
                for j in range(i+1, len(concepts_found)):
                    pair = tuple(sorted([concepts_found[i], concepts_found[j]]))
                    pairs_count[pair] += 1
            year_summaries[year] = {
                "concepts": concepts_found,
                "subject_mix": {s: sum(1 for c in concepts_found if c in cl) for s, cl in SUBJECT_MAP.items()}
            }
        except Exception as e:
            print(f"  {pdf_path.name}: ERROR {e}")

    return freq, years, pairs_count, year_summaries

def compute_importance(cid, freq_val, years_set):
    latest = max(years_set) if years_set else 2015
    recency = 1.0 + (latest - 2015) * 0.08
    spread = min(len(years_set) / 4.0, 2.5)
    base = min(freq_val * 0.6, 7.0)
    return round(min(base + spread + recency, 10.0), 2)

def label(cid):
    return cid.replace('_', ' ').title()

if __name__ == "__main__":
    pyq_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PYQ_DIR
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    freq, years, pairs_count, summaries = process_pdfs(pyq_dir)

    # Importance scores
    importance = {cid: compute_importance(cid, f, years[cid]) for cid, f in freq.items()}
    high_yield = sorted(importance.items(), key=lambda x: -x[1])[:30]

    concept_to_subject = {}
    for s, cl in SUBJECT_MAP.items():
        for c in cl: concept_to_subject[c] = s

    pairs_list = [
        {"concept_a": a, "concept_b": b, "count": cnt}
        for (a, b), cnt in sorted(pairs_count.items(), key=lambda x: -x[1])
        if cnt >= 2
    ][:30]

    hy_ranked = [
        {"id": cid, "subject": concept_to_subject.get(cid, "cs"),
         "score": score, "label": label(cid), "freq": freq.get(cid, 0)}
        for cid, score in high_yield
    ]

    freq_dict = dict(sorted(freq.items(), key=lambda x: -x[1])[:60])
    trends_dict = {cid: sorted(list(yrs)) for cid, yrs in years.items()}
    importance_dict = dict(sorted(importance.items(), key=lambda x: -x[1])[:40])

    def pyq_pat(cid, pat, trap, shortcut):
        f = freq.get(cid, 3)
        lyear = max(years.get(cid, {2022}))
        return f'{{"pattern":"{pat}","trap":"{trap}","shortcut":"{shortcut}","frequency":{f},"last_year":{lyear}}}'

    patterns_js = ',\n    '.join([
        f'"scheduling":    {pyq_pat("scheduling","Gantt chart + avg wait/TAT computation.","SRTF: check each new arrival for preemption.","TAT = Completion - Arrival. Wait = TAT - Burst.")}',
        f'"deadlock":      {pyq_pat("deadlock","Banker\'s algorithm OR n*(max-1)+1 ≤ R formula.","Not returning resources to Available after each simulated step.","Safe = find P where Need ≤ Available. Add allocation to Available.")}',
        f'"page_replacement":{pyq_pat("page_replacement","Page fault count on reference string using FIFO/LRU/OPT.","Confusing frame count vs page count.","LRU: recency stack. FIFO: circular queue. OPT: look ahead.")}',
        f'"normalization": {pyq_pat("normalization","Attribute closure for candidate key OR identify NF.","Missing transitive FDs when verifying 3NF/BCNF.","Compute X+ for all subsets. Minimal set with X+=all attrs = candidate key.")}',
        f'"pipeline":      {pyq_pat("pipeline","CPI with stalls + speedup formula.","Speedup=n stages only with infinite instructions.","CPI_actual = CPI_ideal + stall_cycles/instruction.")}',
        f'"virtual_memory":{pyq_pat("virtual_memory","Page table size = pages×entry_size. EMAT = α(t_tlb+t_m)+(1-α)(t_tlb+2t_m).","TLB time paid on BOTH hit and miss paths.","Pages = 2^(VA_bits - offset_bits).")}',
        f'"dfa_nfa":       {pyq_pat("dfa_nfa","Count states in minimal DFA OR NFA→DFA conversion.","Not removing unreachable states before minimization.","Table-filling: mark distinguishable pairs, unmarked = mergeable.")}',
        f'"transactions":  {pyq_pat("transactions","Conflict serializability via precedence graph.","Drawing graph edges wrong direction.","W-R, R-W, W-W on same item = conflict. Add edge from earlier txn to later.")}',
        f'"sorting":       {pyq_pat("sorting","Worst-case complexity or behavior on sorted/reverse input.","Quicksort worst O(n²) with bad pivot. Heapsort always Θ(n log n).","Heapsort = Θ(n log n) guaranteed. Mergesort = stable. Quicksort = fast avg.")}',
        f'"dp":            {pyq_pat("dp","LCS, matrix chain, coin change, 0-1 knapsack DP table.","Applying greedy when DP needed (0-1 knapsack, gene alignment).","Identify: overlapping subproblems + optimal substructure → DP.")}',
        f'"eigenvalues":   {pyq_pat("eigenvalues","Find eigenvalues from char polynomial OR use trace/det shortcuts.","Trace = sum of eigenvalues, Det = product. Avoid full polynomial.","Tr(A)=λ₁+λ₂, Det(A)=λ₁×λ₂ for 2×2 matrices.")}',
        f'"sliding_window":{pyq_pat("sliding_window","Efficiency of ARQ protocols (GB-N, SR, Stop-and-Wait).","Confusing sender window with receiver window size.","GB-N efficiency = W/(1+2a) where a=T_prop/T_frame.")}',
    ])

    js = f"""// ═══════════════════════════════════════════════════════════════
// GATE PYQ Intelligence — Generated from {len(summaries)} real GATE CS PYQ PDFs
// Concept frequency extracted from text-based PDFs ({', '.join(str(y) for y in sorted(summaries.keys()))})
// ═══════════════════════════════════════════════════════════════

const PYQ_META = {{
  "generated": "2026-03-08",
  "pdfs_with_text": {len(summaries)},
  "years_processed": {json.dumps(sorted(summaries.keys()))},
  "unique_concepts_tracked": {len(freq)}
}};

const PYQ_DB = {{}};  // Populated manually; image-based PDFs need OCR

const PYQ_INTELLIGENCE = {{
  concept_frequency: {json.dumps(freq_dict, indent=2)},

  concept_trends: {json.dumps(trends_dict, indent=2)},

  concept_pairs: {json.dumps(pairs_list, indent=2)},

  importance_scores: {json.dumps(importance_dict, indent=2)},

  high_yield_ranked: {json.dumps(hy_ranked, indent=2)},

  pyq_patterns: {{
    {patterns_js}
  }}
}};
"""
    Path(out_path).write_text(js, encoding="utf-8")
    print(f"\n✅ Written: {out_path}")
    print(f"   Text-extractable PDFs: {len(summaries)}")
    print(f"   Unique concepts tracked: {len(freq)}")
    print(f"   Concept pairs (co-occur): {len(pairs_list)}")
    if hy_ranked:
        print("   Top 5 high yield:")
        for h in hy_ranked[:5]:
            print(f"     {h['label']}: {h['score']}")
    else:
        print("   ⚠ No concepts extracted — all PDFs may be image-based")
