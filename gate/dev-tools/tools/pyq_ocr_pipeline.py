#!/usr/bin/env python3
"""
GATE PYQ Full OCR Intelligence Pipeline
Handles both text-based and image-based (scanned) PDFs.

Features:
- PDF → page images via PyMuPDF
- OCR via easyocr (pure Python, no system install)
- OCR cache in ocr_cache/ to avoid re-processing
- Question segmentation
- 70+ concept keyword detectors
- Concept frequency, pairs, trends, importance scores
- Outputs pyq_intelligence.js

Run: python tools/pyq_ocr_pipeline.py
"""
import json, re, sys, os, time
from pathlib import Path
from collections import defaultdict

DEV_TOOLS_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DEV_TOOLS_DIR.parent
DEFAULT_PYQ_DIR = DEV_TOOLS_DIR / "gate pyq"
DEFAULT_OUTPUT = PROJECT_ROOT / "public" / "data" / "pyq_intelligence.js"
DEFAULT_OCR_CACHE = DEV_TOOLS_DIR / "ocr_cache"

# ─── Imports ─────────────────────────────────────────────────────────────────
try:
    import fitz
except ImportError:
    print("Install PyMuPDF: pip install pymupdf")
    sys.exit(1)

# ─── 70+ Concept keyword registry ────────────────────────────────────────────
CONCEPTS = {
    # OS
    "scheduling":         ["scheduling","sjf","fcfs","round robin","srtf","priority scheduling","turnaround time","waiting time","gantt chart","preemptive","non-preemptive"],
    "deadlock":           ["deadlock","banker","safe state","resource allocation graph","wait-for graph","circular wait","hold and wait","no preemption"],
    "page_replacement":   ["page replacement","lru","fifo","optimal","belady","page fault","reference string","frame","thrashing"],
    "virtual_memory":     ["virtual memory","paging","page table","tlb","effective memory access","demand paging","address translation","page walk","multi-level page"],
    "inode":              ["inode","direct block","indirect block","file size calculation","block pointer","triple indirect","double indirect","single indirect"],
    "disk_scheduling":    ["disk scheduling","sstf","scan","c-scan","c-look","look","head movement","seek time","cylinder","rotational latency"],
    "synchronization":    ["semaphore","mutex","critical section","producer consumer","monitor","wait()","signal()","peterson","test and set","busy waiting"],
    "process":            ["process","pcb","fork()","exec()","context switch","process state","zombie process","orphan process","process creation"],
    "threads":            ["thread","user-level thread","kernel-level thread","m:n model","1:1 model","many-to-one","blocking system call","multithreading"],
    "copy_on_write":      ["copy-on-write","cow","shared pages","fork efficiency"],
    "memory_allocation":  ["first fit","best fit","worst fit","buddy system","fragmentation","compaction","contiguous allocation","memory partitioning"],
    "working_set":        ["working set","thrashing","page fault rate","locality","working set window"],
    "segmentation":       ["segmentation","segment table","base limit","external fragmentation","logical address"],
    "file_systems":       ["file system","directory","path","inode","ext","fat","file allocation","hard link","soft link","symbolic link"],
    # COA
    "pipeline":           ["pipeline","hazard","data hazard","control hazard","structural hazard","forwarding","data forwarding","stall","bubble","cpi","instruction throughput","pipeline stages","speedup"],
    "cache":              ["cache","hit ratio","miss ratio","write back","write through","cache line","associativity","direct mapped","set associative","fully associative","cold miss","conflict miss","capacity miss","average access time"],
    "ieee754":            ["ieee 754","floating point","mantissa","exponent","bias","single precision","double precision","normalized","denormalized","representation"],
    "interrupts":         ["interrupt","dma","polling","trap","system call interrupt","interrupt handler","isr","vectored interrupt","maskable"],
    "booth":              ["booth","multiplication algorithm","partial product","2's complement multiply"],
    "number_systems":     ["binary","hexadecimal","octal","2's complement","1's complement","sign magnitude","conversion","base"],
    # Algorithms
    "sorting":            ["quick sort","merge sort","heap sort","insertion sort","bubble sort","selection sort","counting sort","radix sort","bucket sort","comparison sort","in-place sort","stable sort","worst case sort"],
    "dp":                 ["dynamic programming","optimal substructure","overlapping subproblems","memoization","bottom-up","tabulation","recurrence"],
    "greedy":             ["greedy","activity selection","fractional knapsack","huffman","minimum cost","optimal greedy","exchange argument"],
    "huffman":            ["huffman","prefix code","variable length","entropy","huffman tree","optimal code"],
    "graph_traversal":    ["bfs","dfs","breadth first","depth first","topological sort","topological ordering","scc","strongly connected","kosaraju","tarjan"],
    "dijkstra":           ["dijkstra","single source shortest","shortest path","relaxation","priority queue","non-negative weight"],
    "bellman_ford":       ["bellman-ford","negative weight","negative cycle","shortest path negative"],
    "floyd_warshall":     ["floyd-warshall","all pairs shortest","transitive closure","apsp"],
    "mst":                ["minimum spanning tree","mst","kruskal","prim","cut property","cycle property","safe edge"],
    "np_completeness":    ["np-complete","np-hard","polynomial reduction","satisfiability","3-sat","vertex cover","clique","independent set","np class","npc","polynomial time"],
    "master_theorem":     ["master theorem","recurrence","t(n)","asymptotic","big-o","big-theta","big-omega","divide and conquer recurrence"],
    "avl":                ["avl tree","avl rotation","ll rotation","rr rotation","lr rotation","rl rotation","balance factor","height balanced"],
    "heaps":              ["max-heap","min-heap","heapify","build-heap","priority queue","heap sort","extract max","extract min"],
    "trees_bst":          ["binary search tree","bst","balanced bst","inorder successor","inorder predecessor","height of tree"],
    "hashing":            ["hashing","hash function","collision","open addressing","chaining","load factor","linear probing","quadratic probing"],
    "lcs":                ["lcs","longest common subsequence","edit distance","levenshtein","sequence alignment"],
    "matrix_chain":       ["matrix chain","matrix multiplication","optimal parenthesization"],
    "string_matching":    ["kmp","knuth-morris-pratt","rabin-karp","substring matching","pattern matching","failure function"],
    "ford_fulkerson":     ["max flow","min cut","ford-fulkerson","edmonds-karp","augmenting path","flow network"],
    # DBMS
    "normalization":      ["normalization","functional dependency","bcnf","3nf","2nf","1nf","canonical cover","closure","candidate key","prime attribute","lossless","dependency preserving"],
    "transactions":       ["transaction","acid","atomicity","consistency","isolation","durability","serializability","conflict serializable","view serializable","precedence graph","2pl"],
    "locks":              ["two-phase locking","2pl","shared lock","exclusive lock","lock compatibility","deadlock detection","wait-die","wound-wait","timestamp ordering"],
    "recovery":           ["undo log","redo log","checkpoint","crash recovery","force","steal","no-steal","no-force","write-ahead log","wal"],
    "sql_joins":          ["sql join","inner join","outer join","left join","right join","full join","natural join","cross join","equi-join"],
    "sql_aggregation":    ["group by","having clause","count(","sum(","avg(","min(","max(","aggregate function"],
    "relational_algebra": ["relational algebra","project","select","rename","join","union","intersection","set difference","cartesian product","divide"],
    "er_model":           ["er diagram","entity","relationship","attribute","cardinality","participation","weak entity","isa hierarchy"],
    "closure_fd":         ["attribute closure","fd closure","armstrong's","reflexivity","augmentation","transitivity","canonical","minimal cover"],
    "indexing":           ["b-tree","b+ tree","index","dense index","sparse index","clustering","non-clustering","primary index","secondary index"],
    # TOC
    "dfa_nfa":            ["dfa","nfa","finite automaton","finite automata","regular language","transition function","epsilon closure","state","accept state"],
    "dfa_minimization":   ["minimization","table filling","myhill-nerode","equivalent states","minimal dfa","distinguishable"],
    "regular_languages":  ["regular expression","regular language","closure property regular","pumping lemma regular","kleene star","union regex","concatenation"],
    "cfl":                ["context-free","pushdown automaton","pda","cfg","context-free grammar","parse tree","ambiguous grammar","cnf","gnf"],
    "pumping_lemma":      ["pumping lemma","non-regular","non-context-free","string z","uvwxy","uv^i w x^i y"],
    "turing_machines":    ["turing machine","tm","halting problem","decidable","undecidable","semi-decidable","recursive","recursively enumerable"],
    "closure_decidable":  ["decidable","undecidable","membership problem","emptiness problem","equivalence problem","finiteness"],
    "rice_theorem":       ["rice's theorem","semantic property","non-trivial property"],
    "chomsky_hierarchy":  ["chomsky hierarchy","type 0","type 1","type 2","type 3","context-sensitive","recursively enumerable","language class"],
    "mealy_moore":        ["mealy","moore","output function","state output","transition output","fsm with output"],
    # Compiler Design
    "parsing":            ["ll(1)","lr(1)","slr","lalr","lr(0)","parse table","shift-reduce","reduce-reduce","grammar conflict","action-goto"],
    "first_follow":       ["first set","follow set","nullable","epsilon-production","predict set","ll(1) condition"],
    "sdts":               ["syntax directed","attribute grammar","synthesized attribute","inherited attribute","l-attributed","s-attributed"],
    "activation_record":  ["activation record","stack frame","return address","local variables","access link","control link","display"],
    "liveness":           ["liveness analysis","live variable","reaching definition","data flow","use-def chain","def-use chain"],
    "register_allocation":["register allocation","graph coloring","interference graph","spilling","k-colorable"],
    "basic_block":        ["basic block","control flow graph","cfg","leader","entry block","exit block"],
    "lexical_analysis":   ["lexer","tokenizer","token","regular expression lexer","scanner","lex","flex","pattern matching lexical"],
    # Discrete Math
    "graph_theory":       ["graph","vertex","edge","degree","handshaking lemma","connected","component","bipartite","chromatic number","coloring"],
    "eulerian_hamiltonian":["eulerian circuit","eulerian path","hamiltonian cycle","hamiltonian path","euler condition","all edges"],
    "planar_graph":       ["planar graph","euler formula","v-e+f","faces","kuratowski","k5","k3,3","non-planar"],
    "counting":           ["permutation","combination","binomial coefficient","multinomial","pigeonhole","derangement","stars and bars"],
    "catalan":            ["catalan number","number of bsts","parenthesization","monotonic path","triangulation"],
    "inclusion_exclusion":["inclusion-exclusion principle","at least one","exactly k","derangement","sieve"],
    "relations":          ["reflexive","symmetric","transitive","antisymmetric","equivalence relation","partial order","total order","poset","hasse diagram","lattice"],
    "propositional_logic":["propositional logic","tautology","contradiction","satisfiable","cnf","dnf","boolean formula","predicate logic","quantifier"],
    "recurrence_relations":["recurrence relation","linear recurrence","homogeneous","characteristic equation","fibonacci"],
    # Linear Algebra
    "eigenvalues":        ["eigenvalue","eigenvector","characteristic polynomial","trace","determinant","diagonalization","cayley-hamilton","spectral"],
    "matrix_rank":        ["rank of matrix","null space","column space","row space","linear independence","basis","dimension","rank-nullity theorem","row reduction"],
    "linear_transform":   ["linear transformation","kernel","image","injective","surjective","bijective","matrix representation"],
    "systems_of_equations":["system of linear equations","gaussian elimination","row echelon","augmented matrix","consistent","inconsistent","infinite solutions"],
    # Probability & Stats
    "probability":        ["probability","bayes theorem","conditional probability","independent events","random variable","expected value","variance","standard deviation"],
    "distributions":      ["normal distribution","gaussian","binomial distribution","poisson distribution","exponential","geometric","bernoulli","uniform distribution"],
    "markov_chains":      ["markov chain","markov property","transition matrix","steady state","absorbing state"],
    # CN
    "ip_subnetting":      ["subnet","subnetting","cidr","ip address","subnet mask","broadcast address","network address","classless","classful","vlsm"],
    "routing":            ["routing protocol","ospf","bgp","rip","distance vector","link state","routing table","convergence","routing algorithm"],
    "tcp_flow":           ["tcp","congestion control","flow control","window size","slow start","aimd","congestion window","three-way handshake","rtt","bandwidth delay"],
    "sliding_window":     ["sliding window","go-back-n","selective repeat","stop-and-wait","arq protocol","efficiency","sender window","receiver window"],
    "error_detection":    ["crc","cyclic redundancy check","hamming code","parity bit","error detection","error correction","generator polynomial","remainder"],
    "aloha":              ["aloha","slotted aloha","pure aloha","throughput","collision","offered load","channel efficiency"],
    "csma_cd":            ["csma/cd","collision detection","ethernet","minimum frame size","propagation delay","jam signal","backoff"],
    "dns_http":           ["dns","domain name","http","tcp connection","persistent connection","non-persistent","web browser","url"],
    # Digital Logic
    "kmap":               ["k-map","karnaugh map","prime implicant","essential prime implicant","sop","pos","minimization","don't care"],
    "sequential_circuits":["flip-flop","d flip-flop","jk flip-flop","sr latch","t flip-flop","sequential circuit","clocked","state transition","excitation table"],
    "counters":           ["counter","ripple counter","synchronous counter","modulo counter","ring counter","johnson counter","binary counter"],
    "multiplexer_logic":  ["multiplexer","mux","demultiplexer","demux","selector","universal gate","boolean function implementation"],
    "registers":          ["register","shift register","siso","sipo","piso","pipeline register","serial","parallel load"],
    "encoder_decoder":    ["encoder","decoder","priority encoder","bcd","gray code","binary decoder"],
    # Calculus & GA
    "limits":             ["l'hopital","limit","continuity","differentiability","derivatives","chain rule","implicit differentiation"],
    "maxima_minima":      ["maxima","minima","critical point","hessian","saddle point","second derivative test","optimization"],
    "integration":        ["integration","definite integral","indefinite","fundamental theorem","area under curve","double integral","partial integral"],
    "numerical_methods":  ["newton-raphson","bisection method","trapezoidal","simpson","numerical integration","iterative method"],
    "sets_venn":          ["set theory","venn diagram","union","intersection","complement","power set","cartesian"],
    "number_series":      ["number series","next term","arithmetic progression","geometric progression","sequence"],
}

SUBJECT_MAP = {
    "os":   ["scheduling","deadlock","page_replacement","virtual_memory","inode","disk_scheduling","synchronization","process","threads","copy_on_write","memory_allocation","working_set","segmentation","file_systems"],
    "coa":  ["pipeline","cache","ieee754","interrupts","booth","number_systems"],
    "algo": ["sorting","dp","greedy","huffman","graph_traversal","dijkstra","bellman_ford","floyd_warshall","mst","np_completeness","master_theorem","avl","heaps","trees_bst","hashing","lcs","matrix_chain","string_matching","ford_fulkerson"],
    "dbms": ["normalization","transactions","locks","recovery","sql_joins","sql_aggregation","relational_algebra","er_model","closure_fd","indexing"],
    "toc":  ["dfa_nfa","dfa_minimization","regular_languages","cfl","pumping_lemma","turing_machines","closure_decidable","rice_theorem","chomsky_hierarchy","mealy_moore"],
    "cd":   ["parsing","first_follow","sdts","activation_record","liveness","register_allocation","basic_block","lexical_analysis"],
    "dm":   ["graph_theory","eulerian_hamiltonian","planar_graph","counting","catalan","inclusion_exclusion","relations","propositional_logic","recurrence_relations"],
    "cn":   ["ip_subnetting","routing","tcp_flow","sliding_window","error_detection","aloha","csma_cd","dns_http"],
    "dl":   ["kmap","sequential_circuits","counters","multiplexer_logic","registers","encoder_decoder"],
    "la":   ["eigenvalues","matrix_rank","linear_transform","systems_of_equations"],
    "calc": ["limits","maxima_minima","integration","numerical_methods"],
    "ps":   ["probability","distributions","markov_chains"],
    "ga":   ["sets_venn","number_series"],
}
CONCEPT_TO_SUBJECT = {}
for s, cl in SUBJECT_MAP.items():
    for c in cl:
        CONCEPT_TO_SUBJECT[c] = s

def detect_concepts_in_text(text):
    text_l = text.lower()
    found = []
    for cid, keywords in CONCEPTS.items():
        for kw in keywords:
            try:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_l):
                    found.append(cid)
                    break
            except re.error:
                if kw in text_l:
                    found.append(cid)
                    break
    return found

def detect_year(filename):
    m = re.search(r'(20\d\d)', filename)
    return int(m.group(1)) if m else 0

def extract_page_images(pdf_path, dpi=200):
    """Extract each page as a PIL image using PyMuPDF."""
    doc = fitz.open(str(pdf_path))
    images = []
    mat = fitz.Matrix(dpi/72, dpi/72)
    for page in doc:
        pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
        # Convert to bytes
        images.append(pix.tobytes("png"))
    return images

def ocr_image_bytes(reader, img_bytes):
    """Run EasyOCR on raw PNG bytes."""
    import io, numpy as np
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(img_bytes))
        img_array = np.array(img)
        results = reader.readtext(img_array, detail=0, paragraph=True)
        return "\n".join(results)
    except Exception as e:
        return ""

def get_cache_path(pdf_name, cache_dir):
    stem = Path(pdf_name).stem
    return Path(cache_dir) / f"{stem}.txt"

def load_or_ocr(pdf_path, cache_dir, reader):
    cache_path = get_cache_path(pdf_path.name, cache_dir)
    if cache_path.exists():
        print(f"    [cached] {pdf_path.name}")
        return cache_path.read_text(encoding="utf-8")

    print(f"    [OCR]    {pdf_path.name}...", end="", flush=True)
    t0 = time.time()

    # First try direct text extraction
    doc = fitz.open(str(pdf_path))
    full_text = " ".join(p.get_text() for p in doc)
    word_count = len(full_text.split())

    if word_count >= 300:
        print(f" direct text ({word_count} words, {time.time()-t0:.1f}s)")
    else:
        # OCR each page
        all_text_parts = []
        imgs = extract_page_images(pdf_path, dpi=180)
        for i, img_bytes in enumerate(imgs):
            page_text = ocr_image_bytes(reader, img_bytes)
            all_text_parts.append(page_text)
            print(f".", end="", flush=True)
        full_text = "\n\n".join(all_text_parts)
        print(f" OCR done ({len(full_text.split())} words, {time.time()-t0:.1f}s)")

    cache_path.write_text(full_text, encoding="utf-8")
    return full_text

def segment_questions(text, year):
    """Split document text into individual question blocks."""
    # Patterns that delimit GATE questions
    patterns = [
        r'(?m)^\s*(?:Q\.|Q)\s*(\d+)\s*[\.\):]?\s*(.+?)(?=^\s*(?:Q\.|Q)\s*\d+\s*[\.\):]?|\Z)',
        r'(?m)^\s*(\d+)\s*[\.\)]\s*(.+?)(?=^\s*\d+\s*[\.\)]|\Z)',
    ]
    for pat in patterns:
        matches = re.findall(pat, text, re.S)
        if len(matches) >= 10:  # Found enough questions
            questions = []
            for num, body in matches:
                body = body.strip()
                if len(body) < 25: continue
                # Extract options
                opts = re.findall(r'\([A-D]\)\s*([^\(\n]+)', body)
                q_text = re.split(r'\(A\)', body)[0].strip()[:400]
                concepts = detect_concepts_in_text(body)
                questions.append({
                    "id": f"q{year}_{num}",
                    "year": year,
                    "question": q_text,
                    "options": [o.strip()[:100] for o in opts[:4]],
                    "concepts": concepts[:8],
                    "subject": next((CONCEPT_TO_SUBJECT[c] for c in concepts if c in CONCEPT_TO_SUBJECT), "cs"),
                })
            if questions:
                return questions
    # Fallback: treat entire text as one document, detect concepts
    concepts = detect_concepts_in_text(text)
    return [{
        "id": f"doc_{year}",
        "year": year,
        "question": f"[Full paper {year}]",
        "options": [],
        "concepts": concepts,
        "subject": next((CONCEPT_TO_SUBJECT[c] for c in concepts if c in CONCEPT_TO_SUBJECT), "cs"),
    }]

def compute_importance(cid, freq_val, years_set):
    latest = max(years_set) if years_set else 2015
    recency = 1.0 + max(0, (latest - 2015)) * 0.08
    spread = min(len(years_set) / 4.0, 2.5)
    base = min(freq_val * 0.5, 7.0)
    return round(min(base + spread + recency, 10.0), 2)

def label(cid):
    labels = {
        "scheduling":"CPU Scheduling","deadlock":"Deadlock","page_replacement":"Page Replacement",
        "virtual_memory":"Virtual Memory","normalization":"Normalization & FDs","transactions":"Transactions & ACID",
        "dp":"Dynamic Programming","sorting":"Sorting Algorithms","pipeline":"Pipelining","cache":"Cache Memory",
        "dfa_nfa":"DFA & NFA","mst":"Minimum Spanning Tree","eigenvalues":"Eigenvalues","tcp_flow":"TCP & Congestion",
        "graph_traversal":"Graph Traversal","np_completeness":"NP-Completeness","kmap":"K-map Minimization",
        "error_detection":"Error Detection (CRC/Hamming)","parsing":"Parsing (LL, LR, LALR)","master_theorem":"Master Theorem",
        "heaps":"Heaps & Priority Queues","avl":"AVL Trees","inode":"Inodes & File Systems",
        "locks":"2PL & Concurrency Control","ip_subnetting":"IP Subnetting","huffman":"Huffman Coding",
        "sliding_window":"Sliding Window (ARQ)","probability":"Probability","lcs":"LCS & Edit Distance",
        "sequential_circuits":"Sequential Circuits","dijkstra":"Dijkstra's Algorithm",
    }
    return labels.get(cid, cid.replace('_',' ').title())

def build_intelligence(questions, freq, years, pairs_count):
    importance = {cid: compute_importance(cid, f, years[cid]) for cid, f in freq.items()}
    high_yield = sorted(importance.items(), key=lambda x: -x[1])[:35]

    pairs_list = [
        {"concept_a": a, "concept_b": b, "count": cnt}
        for (a, b), cnt in sorted(pairs_count.items(), key=lambda x: -x[1])
        if cnt >= 2
    ][:40]

    trends_dict = {cid: sorted(list(yrs)) for cid, yrs in sorted(years.items(), key=lambda x: -len(x[1]))}

    hy_ranked = [
        {"id": cid, "subject": CONCEPT_TO_SUBJECT.get(cid, "cs"),
         "score": score, "label": label(cid), "freq": freq.get(cid, 0)}
        for cid, score in high_yield
    ]

    # Concept radar (predict next exam)
    # Boost concepts with long gaps since last appearance
    current_year = 2025
    radar = []
    for cid, yrs in years.items():
        yrs_sorted = sorted(yrs)
        gap = current_year - max(yrs_sorted)
        freq_score = freq.get(cid, 0)
        spread = len(yrs)
        radar_score = round(freq_score * 0.4 + spread * 0.3 + min(gap * 0.5, 2.0), 2)
        radar.append({"id": cid, "label": label(cid), "radar_score": radar_score,
                      "last_seen": max(yrs_sorted), "gap_years": gap, "total_freq": freq_score})
    radar = sorted(radar, key=lambda x: -x['radar_score'])[:20]

    return {
        "concept_frequency": dict(sorted(freq.items(), key=lambda x: -x[1])[:70]),
        "concept_trends": {k: sorted(list(v)) for k, v in sorted(years.items(), key=lambda x: -len(x[1]))[:50]},
        "concept_pairs": pairs_list,
        "importance_scores": dict(sorted(importance.items(), key=lambda x: -x[1])[:50]),
        "high_yield_ranked": hy_ranked,
        "concept_radar": radar,
    }

CURATED_PATTERNS = {
    "scheduling":     {"pattern":"Gantt chart + avg waiting time / turnaround time computation.","trap":"SRTF: check preemption at every new arrival. TAT includes full wait.","shortcut":"TAT = Completion - Arrival. Wait = TAT - Burst. Always draw Gantt first."},
    "deadlock":       {"pattern":"Banker's safe/unsafe state OR deadlock formula: n(max-1)+1 ≤ R.","trap":"Not returning resources to Available after simulating each process in Banker's.","shortcut":"Safe = find P where Need ≤ Available. Add its allocation to Available. Repeat."},
    "page_replacement":{"pattern":"Page fault count on reference string (FIFO/LRU/OPT) with given frames.","trap":"Confusing frame count vs page count. Belady's anomaly: more frames → more faults with FIFO.","shortcut":"LRU: maintain recency stack. FIFO: circular queue. OPT: look ahead to future."},
    "normalization":  {"pattern":"Attribute closure to find candidate keys OR identify normal form of relation.","trap":"Missing transitive FDs when verifying 3NF/BCNF. Check ALL subsets.","shortcut":"Compute X+ for all subsets. Minimal X with X+=all attributes = candidate key."},
    "pipeline":       {"pattern":"CPI with stalls + speedup formula OR hazard identification (RAW/WAW/WAR).","trap":"Speedup = n stages only with infinite instructions. Real speedup always lower.","shortcut":"CPI_actual = CPI_ideal + stall_cycles_per_instruction. Draw pipeline diagram."},
    "virtual_memory": {"pattern":"Page table size = pages × entry_size. EMAT = α(t_tlb+t_m) + (1-α)(t_tlb+2t_m).","trap":"TLB access time paid on BOTH hit and miss paths (parallel lookup assumption).","shortcut":"Pages = 2^(VA_bits - offset_bits). Table size = pages × entry_size."},
    "dfa_nfa":        {"pattern":"Count states in minimal DFA or NFA→DFA subset construction.","trap":"Not removing unreachable states before minimization. Dead/trap state must be explicit.","shortcut":"Table-filling: mark distinguishable pairs bottom-up. Unmarked pairs = mergeable states."},
    "transactions":   {"pattern":"Conflict serializability via precedence graph OR 2PL verification.","trap":"Drawing precedence graph edges in wrong direction (earlier txn → later txn for each conflict).","shortcut":"Conflict: same data item, different transactions, at least one WRITE."},
    "sorting":        {"pattern":"Worst-case complexity or behavior on nearly-sorted/reverse-sorted input.","trap":"Quicksort worst O(n²) with bad pivot (sorted input + naive partition).","shortcut":"Heapsort = Θ(n log n) always. Mergesort = stable. Quicksort = fast avg only."},
    "dp":             {"pattern":"LCS table, matrix chain, subset sum, 0-1 knapsack — fill DP table.","trap":"Applying greedy when DP needed (0-1 knapsack requires DP, fractional requires greedy).","shortcut":"Overlapping subproblems + optimal substructure → DP. Build bottom-up table."},
    "eigenvalues":    {"pattern":"Find eigenvalues from characteristic polynomial OR use trace/det shortcuts.","trap":"Trace = sum of eigenvalues, Det = product. Use these to avoid full polynomial for 2×2.","shortcut":"λ² - Tr(A)λ + Det(A) = 0 for 2×2. For 3×3 use cofactor expansion."},
    "sliding_window": {"pattern":"Efficiency of ARQ protocols (GB-N, SR, Stop-and-Wait) given window size & propagation.","trap":"Confusing sender window = 2^(n-1) for SR but =2^n-1 for GB-N.","shortcut":"Efficiency = W/(1+2a) where a = T_propagation / T_frame, W = window size."},
    "mst":            {"pattern":"Find MST weight or trace Kruskal/Prim step-by-step.","trap":"Multiple MSTs when edge weights are not distinct — all have SAME total weight.","shortcut":"Kruskal: sort edges, greedily add if no cycle (use DSU). Prim: grow from vertex."},
    "cache":          {"pattern":"Average access time = hit_time + miss_rate × miss_penalty.","trap":"Multilevel cache: AMAT = L1_time + L1_miss_rate × (L2_time + L2_miss_rate × mem_time).","shortcut":"AMAT = h×t₁ + (1-h)×(t₁+t₂). Write policy affects miss rates."},
    "error_detection":{"pattern":"CRC remainder computation given data bits and generator polynomial.","trap":"Appending r zeros BEFORE dividing (where r = degree of generator).","shortcut":"XOR division, no carries. Remainder appended to data. Divisible → no error."},
    "ip_subnetting":  {"pattern":"Given IP/prefix, find: network addr, broadcast, valid host range, # subnets.","trap":"Off by one in host bits: 2^h - 2 usable hosts (subtract network + broadcast).","shortcut":"Hosts per subnet = 2^(32-prefix) - 2. Subnets = 2^(prefix-class_bits)."},
    "graph_traversal":{"pattern":"DFS/BFS traversal order OR topological sort on given graph.","trap":"Multiple valid topological orderings exist — check all-zeros in-degree condition.","shortcut":"Topological sort: repeatedly remove vertex with in-degree 0 (Kahn's algorithm)."},
    "np_completeness":{"pattern":"Identify if problem is NP, P, NP-complete, or NP-hard. Reduction proof.","trap":"NP ≠ NP-complete. All NP-complete ⊆ NP. NP-hard may not be in NP.","shortcut":"To show X is NP-complete: (1) X∈NP, (2) Y≤_p X for known NP-complete Y."},
    "kmap":           {"pattern":"Minimize Boolean function using K-map. Identify prime implicants.","trap":"Missing essential prime implicants — must be included. Don't-cares can be used in groups.","shortcut":"Group largest valid powers of 2. Essential PI = covers a minterm only it can cover."},
    "master_theorem": {"pattern":"Solve recurrence T(n) = aT(n/b) + f(n) using master theorem cases.","trap":"Master theorem requires f(n) = Θ(n^c). Check regularity condition for case 3.","shortcut":"Case 1: f=O(n^{log_b(a)-ε}) → Θ(n^{log_b a}). Case 2: f=Θ(n^{log_b a}) → Θ(n^{log_b a} log n). Case 3: opposite."},
}

def write_output(intelligence, questions, years_processed, out_path):
    freq = intelligence['concept_frequency']
    trends = intelligence['concept_trends']
    hy = intelligence['high_yield_ranked']
    pairs = intelligence['concept_pairs']
    scores = intelligence['importance_scores']
    radar = intelligence['concept_radar']

    # Build curated patterns block
    patterns_entries = []
    for cid, pat in CURATED_PATTERNS.items():
        f = freq.get(cid, 3)
        yrs = trends.get(cid, [2022])
        ly = max(yrs) if yrs else 2022
        entry = f'    "{cid}": {json.dumps({**pat, "frequency": f, "last_year": ly})}'
        patterns_entries.append(entry)
    patterns_block = ",\n".join(patterns_entries)

    # Build pyq_db by subject
    pyq_by_subj = defaultdict(list)
    for q in questions:
        if q['question'] and not q['question'].startswith('[Full'):
            pyq_by_subj[q['subject']].append({
                "id": q['id'], "year": q['year'],
                "question": q['question'][:300],
                "options": q['options'][:4],
                "concepts": q['concepts'][:5],
            })

    total_q = len([q for q in questions if not q['question'].startswith('[Full')])

    js = f"""// ═══════════════════════════════════════════════════════════════
// GATE PYQ Intelligence Engine — Built from {len(years_processed)} GATE CS papers
// Years: {', '.join(str(y) for y in sorted(years_processed))}
// Structured questions extracted: {total_q}
// Unique concepts tracked: {len(freq)}
// ═══════════════════════════════════════════════════════════════

const PYQ_META = {{
  "generated": "2026-03-08",
  "papers_processed": {len(years_processed)},
  "years_processed": {json.dumps(sorted(years_processed))},
  "total_questions": {total_q},
  "unique_concepts_tracked": {len(freq)}
}};

const PYQ_DB = {json.dumps(dict(pyq_by_subj), ensure_ascii=False, indent=2)};

const PYQ_INTELLIGENCE = {{
  concept_frequency: {json.dumps(freq, indent=2)},

  concept_trends: {json.dumps(trends, indent=2)},

  concept_pairs: {json.dumps(pairs, indent=2)},

  importance_scores: {json.dumps(scores, indent=2)},

  high_yield_ranked: {json.dumps(hy, indent=2)},

  concept_radar: {json.dumps(radar, indent=2)},

  pyq_patterns: {{
{patterns_block}
  }}
}};
"""
    Path(out_path).write_text(js, encoding="utf-8")

if __name__ == "__main__":
    pyq_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PYQ_DIR
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    cache_dir = DEFAULT_OCR_CACHE
    cache_dir.mkdir(exist_ok=True)

    # Load OCR reader
    print("Loading EasyOCR reader (first run downloads ~200MB model)...")
    try:
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        print("EasyOCR loaded.")
    except ImportError:
        print("easyocr not installed: pip install easyocr")
        print("Falling back to text-only extraction...")
        reader = None

    freq = defaultdict(int)
    years = defaultdict(set)
    pairs_count = defaultdict(int)
    all_questions = []
    years_processed = set()

    pdfs = sorted(pyq_dir.glob("*.pdf"))
    print(f"\nProcessing {len(pdfs)} PDFs...\n")

    for pdf_path in pdfs:
        year = detect_year(pdf_path.name)
        if year < 2007: continue
        print(f"  [{year}] {pdf_path.name}")

        if reader:
            full_text = load_or_ocr(pdf_path, cache_dir, reader)
        else:
            doc = fitz.open(str(pdf_path))
            full_text = " ".join(p.get_text() for p in doc)

        if len(full_text.strip()) < 100:
            print(f"    ⚠ Empty text even after OCR — skipping")
            continue

        # Segment into questions
        questions = segment_questions(full_text, year)
        all_questions.extend(questions)
        years_processed.add(year)
        print(f"    → {len(questions)} segments, concepts detected in paper:")

        # Aggregate stats from this paper
        paper_concepts = set()
        for q in questions:
            for c in q['concepts']:
                freq[c] += 1
                years[c].add(year)
                paper_concepts.add(c)

        concept_list = sorted(paper_concepts)
        print(f"    {', '.join(concept_list[:8])}{' ...' if len(concept_list)>8 else ''}")

        # Pairs from paper-level co-occurrence
        for i in range(len(concept_list)):
            for j in range(i+1, len(concept_list)):
                pair = tuple(sorted([concept_list[i], concept_list[j]]))
                pairs_count[pair] += 1

    print(f"\n📊 Stats:")
    print(f"   Papers processed: {len(years_processed)}")
    print(f"   Questions/segments: {len(all_questions)}")
    print(f"   Unique concepts: {len(freq)}")
    print(f"   Concept pairs: {len(pairs_count)}")

    intelligence = build_intelligence(all_questions, freq, years, pairs_count)
    write_output(intelligence, all_questions, years_processed, out_path)

    print(f"\n✅ Written: {out_path}")
    print(f"\n🔥 Top 10 High Yield:")
    for h in intelligence['high_yield_ranked'][:10]:
        print(f"   {h['score']:4.1f} | {h['label']}")

    print(f"\n🎯 Concept Radar (likely in next exam):")
    for r in intelligence['concept_radar'][:8]:
        print(f"   {r['radar_score']:4.1f} | {r['label']} (last: {r['last_seen']}, gap: {r['gap_years']}y)")
