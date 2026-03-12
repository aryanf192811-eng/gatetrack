#!/usr/bin/env python3
"""
GATE PYQ Intelligence — Robust Pipeline (no external model downloads needed)
Works on all 23 GATE PDFs. Uses:
  - PyMuPDF direct text extraction (fast, for text-based PDFs)
  - Image → Tesseract OCR if tesseract is installed
  - Comprehensive 75-concept keyword detector
  - Full curated intelligence for all GATE topics

Run: python tools/pyq_build.py
"""
import json, re, sys, os, shutil
from pathlib import Path
from collections import defaultdict
import fitz

DEV_TOOLS_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = DEV_TOOLS_DIR.parent
DEFAULT_PYQ_DIR = DEV_TOOLS_DIR / "gate pyq"
DEFAULT_OUTPUT = PROJECT_ROOT / "public" / "data" / "pyq_intelligence.js"
DEFAULT_OCR_CACHE = DEV_TOOLS_DIR / "ocr_cache"

# ─── 75 Concept keyword detectors ────────────────────────────────────────────
CONCEPTS = {
    # OS
    "scheduling":         r'scheduling|sjf|fcfs|round.robin|srtf|priority\s+scheduling|turnaround\s+time|waiting\s+time|gantt|preemptive\s+sj',
    "deadlock":           r'deadlock|banker.s|safe\s+state|resource.allocation\s+graph|wait.for\s+graph|circular\s+wait|hold\s+and\s+wait',
    "page_replacement":   r'page\s+replacement|lru|fifo.*page|optimal.*page|belady|page\s+fault|reference\s+string|page.*frame|thrashing',
    "virtual_memory":     r'virtual\s+memory|paging|page\s+table|tlb|effective\s+(memory\s+)?access\s+time|demand\s+paging|address\s+translation|multi.level\s+page',
    "inode":              r'inode|direct\s+block|indirect\s+block|file\s+size.*block|triple\s+indirect|double\s+indirect|block\s+pointer',
    "disk_scheduling":    r'disk\s+scheduling|sstf|scan\s+algorithm|c.scan|c.look|head\s+movement|seek\s+time|seek\s+distance|cylinder',
    "synchronization":    r'semaphore|mutex|critical\s+section|producer.consumer|monitor\s+synchronization|wait\s*\(\s*\)|binary\s+semaphore|counting\s+semaphore',
    "process":            r'process.creation|pcb|fork\s*\(\s*\)|exec\s*\(\s*\)|context\s+switch|zombie\s+process|orphan\s+process',
    "threads":            r'user.level\s+thread|kernel.level\s+thread|m:n\s+model|many.to.one|thread\s+library|multithreading|thread\s+blocking',
    "memory_allocation":  r'first.fit|best.fit|worst.fit|buddy\s+system|external\s+fragment|internal\s+fragment|compaction|memory\s+partition',
    "file_systems":       r'file\s+system|directory|inode\s+number|hard\s+link|symbolic\s+link|fat\s+file|ext2|ext3|file\s+allocation',
    "segmentation":       r'segment\s+table|base.limit|pure\s+segmentation|logical\s+address.*segment',
    # COA
    "pipeline":           r'pipeline|data\s+hazard|control\s+hazard|structural\s+hazard|forwarding|stall\s+cycle|pipeline\s+bubble|cpi\s*=|pipeline\s+speedup|pipeline\s+stage',
    "cache":              r'cache\s+hit|cache\s+miss|hit\s+ratio|miss\s+penalty|write.back|write.through|cache\s+line|set.associative|direct.mapped|fully\s+associative|average\s+access\s+time',
    "ieee754":            r'ieee\s*754|floating.point\s+representation|mantissa|biased\s+exponent|single\s+precision|double\s+precision|normalized\s+form|denormalized',
    "number_systems":     r"2's\s+complement|1's\s+complement|sign.magnitude|binary.to|hexadecimal|octal\s+conversion|radix",
    "interrupts":         r'dma|polling.*i.o|interrupt\s+handler|vectored\s+interrupt|maskable\s+interrupt|non.maskable|isr\s+routine',
    "booth":              r"booth.s\s+algorithm|booth\s+multiplication|modified\s+booth|partial\s+product.*2's",
    # Algorithms
    "sorting":            r'quick\s*sort|merge\s*sort|heap\s*sort|insertion\s*sort|bubble\s*sort|selection\s*sort|counting\s*sort|radix\s*sort|comparison.based\s+sort|stable\s+sort',
    "dp":                 r'dynamic\s+programming|optimal\s+substructure|overlapping\s+subproblem|memoization|bottom.up\s+dp|knapsack|coin\s+change\s+dp',
    "greedy":             r'greedy\s+algorithm|activity\s+selection|fractional\s+knapsack|greedy\s+choice\s+property|exchange\s+argument',
    "huffman":            r'huffman|prefix.free\s+code|variable\s+length\s+code|optimal\s+prefix|entropy\s+coding',
    "graph_traversal":    r'breadth.first|depth.first|bfs\s+tree|dfs\s+tree|topological\s+(sort|order)|strongly\s+connected\s+component|scc|kosaraju|tarjan',
    "dijkstra":           r"dijkstra|single.source\s+shortest|shortest\s+path\s+tree|relaxation\s+step|non.negative\s+weight",
    "bellman_ford":       r'bellman.ford|negative\s+weight\s+edge|negative\s+cycle\s+detection|shortest\s+path.*negative',
    "floyd_warshall":     r'floyd.warshall|all.pairs\s+shortest|transitive\s+closure\s+matrix|apsp',
    "mst":                r'minimum\s+spanning\s+tree|kruskal.s|prim.s\s+algorithm|mst\s+weight|cut\s+property|cycle\s+property|safe\s+edge',
    "np_completeness":    r'np.complete|np.hard|polynomial.time\s+reduction|satisfiability|3.sat|vertex\s+cover|independent\s+set|clique.*np|np\s+class',
    "master_theorem":     r'master\s+theorem|recurrence.*t\s*\(n\/|asymptotic.*recurrence|case\s+[123]\s+master|log[_b]\s*a\s+vs',
    "avl":                r'avl\s+tree|ll\s+rotation|rr\s+rotation|lr\s+rotation|rl\s+rotation|balance\s+factor|height.balanced\s+bst',
    "heaps":              r'max.heap\s+property|min.heap\s+property|heapify|build.heap|extract.max|extract.min|heap\s+sort',
    "trees_bst":          r'binary\s+search\s+tree|bst\s+insert|bst\s+delete|inorder\s+successor|height.*bst|red.black\s+tree',
    "hashing":            r'hash\s+function|collision\s+resolution|open\s+addressing|chaining.*hash|load\s+factor.*hash|linear\s+probing|quadratic\s+probing|double\s+hashing',
    "lcs":                r'longest\s+common\s+subsequence|lcs\s+length|edit\s+distance|levenshtein|sequence\s+alignment|string\s+similarity',
    "matrix_chain":       r'matrix\s+chain|optimal\s+parenthesization|matrix\s+multiplication\s+cost|scalar\s+multiplication',
    "string_matching":    r'kmp\s+algorithm|knuth.morris|rabin.karp|failure\s+function|pattern\s+matching.*string|z\s+algorithm',
    "ford_fulkerson":     r'max\s+flow|min\s+cut|ford.fulkerson|edmonds.karp|augmenting\s+path|max.flow\s+min.cut',
    # DBMS
    "normalization":      r'normalization|functional\s+dependency|bcnf|3nf|2nf|1nf|canonical\s+cover|attribute\s+closure|candidate\s+key|lossless\s+join|dependency\s+preserving|prime\s+attribute',
    "transactions":       r'transaction\s+schedule|acid\s+property|conflict\s+serializable|view\s+serializable|precedence\s+graph|serializability|commit.*rollback|two.phase\s+locking',
    "locks":              r'2pl|two.phase\s+locking|shared\s+lock|exclusive\s+lock|lock\s+compatibility|wait.die|wound.wait|timestamp\s+ordering',
    "recovery":           r'undo\s+log|redo\s+log|checkpoint.*recovery|crash\s+recovery|write.ahead\s+log|wal\s+protocol|force.*steal|no.force|no.steal',
    "sql_joins":          r'inner\s+join|outer\s+join|left\s+join|right\s+join|natural\s+join|cross\s+join|equi.join|sql\s+join\s+query',
    "sql_aggregation":    r'group\s+by\s+clause|having\s+clause|count\s*\(\s*\*?\s*\)|sum\s*\(|avg\s*\(|aggregate\s+function',
    "relational_algebra": r'relational\s+algebra|project\s+operator|select\s+operator|relation\s+rename|join.*relation|set\s+difference.*relation|division.*relation',
    "er_model":           r'er\s+diagram|entity.relationship|cardinality.*er|weak\s+entity|participation\s+constraint|isa\s+hierarchy',
    "closure_fd":         r'attribute\s+closure|fd\s+closure|armstrong.s\s+axiom|reflexivity.*fd|augmentation.*fd|canonical\s+form.*fd|minimal\s+cover',
    "indexing":           r'b\+?\s*tree.*index|dense\s+index|sparse\s+index|clustering\s+index|non.clustering|primary\s+index|secondary\s+index|multilevel\s+index',
    # TOC
    "dfa_nfa":            r'deterministic\s+finite|non.deterministic\s+finite|finite\s+automaton|regular\s+language\s+accepted|epsilon\s+closure|nfa.to.dfa|subset\s+construction',
    "dfa_minimization":   r'dfa\s+minimization|table.filling|myhill.nerode|equivalent\s+states|minimized\s+dfa|distinguishable\s+states',
    "regular_languages":  r'regular\s+expression.*language|kleene\s+star|pumping\s+lemma.*regular|closure.*regular\s+language|regular.*concatenation',
    "cfl":                r'context.free\s+(language|grammar)|pushdown\s+automaton|pda\s+acceptance|parse\s+tree|ambiguous\s+grammar|cnf\s+grammar|gnf',
    "pumping_lemma":      r'pumping\s+lemma|uvwxy|uv\^i|non.regular\s+proof|non.context.free\s+proof',
    "turing_machines":    r'turing\s+machine\s+|tm\s+accepts|halting\s+problem|decidable\s+language|undecidable\s+language|semi.decidable|recursively\s+enumerable',
    "closure_decidable":  r'decidable.*problem|undecidable.*problem|membership\s+problem.*dfa|emptiness\s+(problem|test)|equivalence\s+problem.*dfa',
    "chomsky_hierarchy":  r'chomsky\s+hierarchy|type\s+[0123]\s+grammar|context.sensitive\s+language|linear\s+bounded|recursively\s+enumerable',
    "mealy_moore":        r'mealy\s+machine|moore\s+machine|output\s+function.*state|state\s+output.*machine|fsm\s+with\s+output',
    # Compiler Design
    "parsing":            r'll\s*\(1\)|lr\s*\(1\)|slr\s*\(1\)|lalr\s*\(1\)|lr\s*\(0\)|parse\s+table|shift.reduce\s+conflict|reduce.reduce\s+conflict|grammar.*conflict',
    "first_follow":       r'first\s+set\s+of|follow\s+set\s+of|nullable\s+symbol|epsilon.production.*first|predict\s+set\s+of|ll\s*\(1\)\s+condition',
    "sdts":               r'syntax.directed|attribute\s+grammar|synthesized\s+attribute|inherited\s+attribute|l.attributed|s.attributed|semantic\s+action',
    "liveness":           r'liveness\s+analysis|live\s+variable|reaching\s+definition|def.use\s+chain|use.def|data.flow\s+equation',
    "register_allocation":r'register\s+allocation|graph\s+coloring.*register|interference\s+graph|spilling.*register|k.colorable',
    "basic_block":        r'basic\s+block|control\s+flow\s+graph|cfg.*basic|leader\s+instruction|entry\s+point.*block',
    "lexical_analysis":   r'lexer|tokenizer|scanner.*lexical|lexical\s+analysis|token.*regex|lex\s+tool',
    # DM
    "graph_theory":       r'handshaking\s+lemma|graph\s+coloring|chromatic\s+number|bipartite\s+graph|graph\s+component|vertex\s+degree\s+sequence|complete\s+graph',
    "eulerian_hamiltonian":r'eulerian\s+circuit|eulerian\s+path|hamiltonian\s+cycle|hamiltonian\s+path|euler.s\s+theorem.*graph|all\s+vertices.*exactly\s+once',
    "planar_graph":       r'planar\s+graph|euler.s\s+formula.*graph|v\s*.\s*e\s*\+\s*f|faces.*planar|kuratowski|non.planar\s+graph|k5|k3,3',
    "counting":           r'permutation.*n|combination.*n|binomial\s+coefficient|multinomial|pigeonhole\s+principle|derangement\s+problem|stars\s+and\s+bars|counting\s+principle',
    "catalan":            r'catalan\s+number|number\s+of\s+bst|parenthesization.*count|triangulation.*count|monotonic\s+path\s+count',
    "inclusion_exclusion":r'inclusion.exclusion|at\s+least\s+one.*condition|exactly\s+k.*set|derangement\s+formula',
    "relations":          r'reflexive\s+relation|symmetric\s+relation|transitive\s+relation|antisymmetric|equivalence\s+relation|partial\s+order|poset|hasse\s+diagram',
    "propositional_logic":r'tautology|contradiction|satisfiable\s+formula|cnf.*logic|dnf.*logic|predicate\s+logic|first.order\s+logic|quantifier|∀|∃',
    "recurrence_relations":r'linear\s+recurrence|homogeneous\s+recurrence|characteristic\s+equation.*recurrence|fibonacci\s+recurrence|recurrence.*closed\s+form',
    # LA
    "eigenvalues":        r'eigenvalue|eigenvector|characteristic\s+polynomial|trace.*matrix.*eigen|determinant.*eigen|diagonalization|cayley.hamilton|spectral\s+theorem',
    "matrix_rank":        r'rank\s+of\s+(a\s+)?matrix|null\s+space|column\s+space|row\s+space|linear\s+independence.*column|rank.nullity\s+theorem|row\s+reduction|echelon\s+form',
    "systems_of_equations":r'system\s+of\s+linear|gaussian\s+elimination|augmented\s+matrix|consistent.*inconsistent|infinite\s+solutions.*matrix|homogeneous\s+system',
    # CN
    "ip_subnetting":      r'subnet\s+mask|subnetting|cidr\s+notation|ip\s+address.*network|broadcast\s+address|network\s+address|vlsm|classless\s+inter.domain',
    "routing":            r'ospf\s+routing|bgp\s+protocol|rip\s+protocol|distance\s+vector\s+routing|link\s+state\s+routing|routing\s+table\s+update|dijkstra.*routing',
    "tcp_flow":           r'tcp\s+congestion|flow\s+control.*tcp|congestion\s+window|slow\s+start|aimd|three.way\s+handshake|tcp\s+window\s+size|rtt.*tcp',
    "sliding_window":     r'sliding\s+window\s+protocol|go.back.n|selective\s+repeat|stop.and.wait\s+arq|window\s+efficiency|throughput.*window',
    "error_detection":    r'cyclic\s+redundancy\s+check|crc\s+remainder|hamming\s+code|hamming\s+distance|parity\s+bit|error\s+detection\s+code|generator\s+polynomial',
    "aloha":              r'pure\s+aloha|slotted\s+aloha|aloha\s+throughput|maximum\s+throughput.*aloha|channel\s+efficiency.*aloha',
    "csma_cd":            r'csma.*cd|collision\s+detection.*csma|ethernet\s+minimum\s+frame|propagation\s+delay.*collision|jam\s+signal|exponential\s+backoff',
    # DL
    "kmap":               r'k.map|karnaugh\s+map|prime\s+implicant|essential\s+prime\s+implicant|sop\s+minimization|pos\s+minimization|don.t\s+care\s+condition',
    "sequential_circuits":r'flip.flop|d\s+flip.flop|jk\s+flip.flop|sr\s+latch|t\s+flip.flop|state\s+transition\s+table|excitation\s+table|clocked\s+circuit',
    "counters":           r'ripple\s+counter|synchronous\s+counter|modulo.n\s+counter|ring\s+counter|johnson\s+counter|binary\s+up.counter',
    "multiplexer_logic":  r'multiplexer|mux.*selector|2:1\s+mux|4:1\s+mux|demultiplexer|boolean.*mux|nand.*universal|nor.*universal',
    # LA & Calc
    "probability":        r'bayes.?\s+theorem|conditional\s+probability\s+p|prior\s+probability|posterior|random\s+variable\s+expected|variance\s+of',
    "distributions":      r'normal\s+distribution|binomial\s+distribution|poisson\s+distribution|exponential\s+distribution|geometric\s+distribution',
    "maxima_minima":      r'maxima.*function|minima.*function|critical\s+point|saddle\s+point|hessian\s+matrix|second\s+derivative\s+test|local\s+maximum|global\s+minimum',
    "limits":             r"l.hopital.s\s+rule|limit.*continuous|differentiable.*function|chain\s+rule\s+derivative|implicit\s+differentiation",
    "integration":        r'definite\s+integral|indefinite\s+integral|fundamental\s+theorem|double\s+integral|area\s+under\s+curve',
    "eigenvalues":        r'eigenvalue|characteristic\s+polynomial.*matrix|trace.*eigenvalue|det.*eigenvalue|diagonalization.*matrix',
}

SUBJECT_MAP = {
    "os":   ["scheduling","deadlock","page_replacement","virtual_memory","inode","disk_scheduling","synchronization","process","threads","memory_allocation","file_systems","segmentation"],
    "coa":  ["pipeline","cache","ieee754","number_systems","interrupts","booth"],
    "algo": ["sorting","dp","greedy","huffman","graph_traversal","dijkstra","bellman_ford","floyd_warshall","mst","np_completeness","master_theorem","avl","heaps","trees_bst","hashing","lcs","matrix_chain","string_matching","ford_fulkerson"],
    "dbms": ["normalization","transactions","locks","recovery","sql_joins","sql_aggregation","relational_algebra","er_model","closure_fd","indexing"],
    "toc":  ["dfa_nfa","dfa_minimization","regular_languages","cfl","pumping_lemma","turing_machines","closure_decidable","chomsky_hierarchy","mealy_moore"],
    "cd":   ["parsing","first_follow","sdts","liveness","register_allocation","basic_block","lexical_analysis"],
    "dm":   ["graph_theory","eulerian_hamiltonian","planar_graph","counting","catalan","inclusion_exclusion","relations","propositional_logic","recurrence_relations"],
    "cn":   ["ip_subnetting","routing","tcp_flow","sliding_window","error_detection","aloha","csma_cd"],
    "dl":   ["kmap","sequential_circuits","counters","multiplexer_logic"],
    "la":   ["eigenvalues","matrix_rank","systems_of_equations"],
    "calc": ["limits","maxima_minima","integration"],
    "ps":   ["probability","distributions"],
}
CONCEPT_TO_SUBJECT = {c: s for s, cl in SUBJECT_MAP.items() for c in cl}

def detect_concepts(text):
    text_l = text.lower()
    return [cid for cid, pat in CONCEPTS.items() if re.search(pat, text_l)]

def try_tesseract_ocr(pdf_path):
    """Try to use tesseract if installed."""
    tesseract = shutil.which("tesseract")
    if not tesseract:
        return None
    import subprocess, tempfile
    doc = fitz.open(str(pdf_path))
    texts = []
    with tempfile.TemporaryDirectory() as tmpdir:
        for i, page in enumerate(doc):
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY)
            img_path = os.path.join(tmpdir, f"page_{i}.png")
            pix.save(img_path)
            out_path = os.path.join(tmpdir, f"page_{i}")
            r = subprocess.run([tesseract, img_path, out_path, "-l", "eng", "--psm", "6"],
                             capture_output=True, timeout=30)
            txt_file = out_path + ".txt"
            if os.path.exists(txt_file):
                texts.append(open(txt_file).read())
    return "\n\n".join(texts) if texts else None

def read_pdf(pdf_path, cache_dir):
    stem = Path(pdf_path).stem
    cache = Path(cache_dir) / f"{stem}.txt"
    if cache.exists():
        return cache.read_text(encoding="utf-8")

    # Try direct text extraction
    doc = fitz.open(str(pdf_path))
    text = " ".join(p.get_text() for p in doc)
    if len(text.split()) >= 200:
        cache.write_text(text, encoding="utf-8")
        return text

    # Try tesseract
    ocr_text = try_tesseract_ocr(pdf_path)
    if ocr_text and len(ocr_text.split()) >= 50:
        cache.write_text(ocr_text, encoding="utf-8")
        return ocr_text

    # No text available — try to detect from filename
    return f"[image-pdf: {Path(pdf_path).stem}]"

def detect_year(name):
    m = re.search(r'(20\d\d)', name)
    return int(m.group(1)) if m else -1

def compute_importance(cid, freq_val, years_set):
    if not years_set: return 5.0
    latest = max(years_set)
    recency = 1.0 + max(0, (latest - 2015)) * 0.1
    spread = min(len(years_set) / 5.0, 2.0)
    base = min(freq_val * 0.55, 6.5)
    return round(min(base + spread + recency, 10.0), 2)

def label(cid):
    nice = {
        "scheduling":"CPU Scheduling","deadlock":"Deadlock","page_replacement":"Page Replacement",
        "virtual_memory":"Virtual Memory","normalization":"Normalization & FDs",
        "transactions":"Transactions & ACID","dp":"Dynamic Programming","sorting":"Sorting Algorithms",
        "pipeline":"Pipelining","cache":"Cache Memory","dfa_nfa":"DFA & NFA","mst":"MST (Kruskal/Prim)",
        "eigenvalues":"Eigenvalues / Linear Algebra","tcp_flow":"TCP & Congestion Control",
        "graph_traversal":"Graph Traversal (BFS/DFS)","np_completeness":"NP-Completeness",
        "kmap":"K-map Minimization","error_detection":"Error Detection (CRC/Hamming)",
        "parsing":"Parsing (LL/LR/LALR)","master_theorem":"Master Theorem","heaps":"Heaps",
        "avl":"AVL Trees","inode":"Inodes & File Systems","locks":"2PL & Concurrency",
        "ip_subnetting":"IP Subnetting","huffman":"Huffman Coding","sliding_window":"Sliding Window ARQ",
        "probability":"Probability Theory","lcs":"LCS & Edit Distance",
        "sequential_circuits":"Sequential Circuits","dijkstra":"Dijkstra's Algorithm",
        "matrix_rank":"Matrix Rank & Linear Independence","counting":"Counting & Combinatorics",
        "relations":"Relations & Orders","graph_theory":"Graph Theory","cfl":"CFLs & PDA",
        "turing_machines":"Turing Machines","indexing":"B-Tree Indexing","closure_fd":"FD Closure & Keys",
        "greedy":"Greedy Algorithms","trees_bst":"BSTs & Tree Operations",
        "regular_languages":"Regular Languages","propositional_logic":"Propositional Logic",
        "planar_graph":"Planar Graphs","ip_subnetting":"IP Subnetting & CIDR",
        "routing":"Routing Protocols (OSPF/BGP)","recovery":"DB Recovery (Undo/Redo)",
    }
    return nice.get(cid, cid.replace('_',' ').title())

PATTERNS = {
    "scheduling":       ("Gantt chart + avg wait time / turnaround time computation.",
                         "SRTF: check preemption at EVERY new arrival. Don't forget arrival time in TAT.",
                         "TAT = Completion - Arrival. Wait = TAT - Burst. Draw Gantt first."),
    "deadlock":         ("Banker's algorithm safe sequence OR formula: n×(max-1)+1 ≤ R.",
                         "Not returning released resources to Available after simulating each process.",
                         "Safe = find P where Need ≤ Available. Add its Allocation to Available. Repeat."),
    "page_replacement": ("Page fault count on reference string with FIFO/LRU/OPT and fixed frames.",
                         "Belady's anomaly: more frames → more faults (FIFO only). LRU ≠ FIFO.",
                         "LRU: recency stack. FIFO: circular queue. OPT: look-ahead to future refs."),
    "virtual_memory":   ("Page table size = pages × entry_size. EMAT = α(t_tlb+t_m)+(1-α)(t_tlb+2t_m).",
                         "TLB lookup time added on BOTH hit and miss paths (parallel lookup assumption).",
                         "Pages = 2^(VA_bits - offset_bits). Table = pages × entry_size."),
    "normalization":    ("Attribute closure to find candidate keys OR identify NF from given FDs.",
                         "Missing transitive FDs when verifying BCNF. Check all non-trivial FDs.",
                         "Compute X+ for all subsets. Minimal X with X+=all attrs = candidate key."),
    "pipeline":         ("CPI with stalls + speedup formula OR hazard type identification (RAW/WAW/WAR).",
                         "Real speedup < n stages due to fill/drain time and hazards.",
                         "CPI_actual = CPI_ideal + stall_cycles/inst. Draw pipeline diagram for stalls."),
    "cache":            ("AMAT = h×t₁ + (1-h)×(t₁+t₂). Multilevel = L1 + L1_miss × (L2 + L2_miss × Mem).",
                         "Fully associative has no conflict misses. Mapping determines which set/line.",
                         "For direct-mapped: set = (block address) mod (number of sets)."),
    "dfa_nfa":          ("Count states in minimal DFA OR NFA→DFA construction.",
                         "NFA→DFA: ε-closure of states. Don't forget dead/trap state in DFA.",
                         "Table-filling: mark (final, non-final) pairs. Propagate marks. Unmark = merge."),
    "transactions":     ("Build precedence graph for conflict serializability check.",
                         "Edge direction: if Op1 appears before Op2 and they conflict → Op1's txn → Op2's.",
                         "Conflict: same variable, different transactions, at least one WRITE."),
    "sorting":          ("Worst-case time / space complexity OR stable/in-place property identification.",
                         "Quicksort worst O(n²) with bad pivot (sorted input + first-element pivot).",
                         "Heapsort = Θ(n log n) always. Mergesort = stable. Quick = fast average."),
    "dp":               ("Fill DP table for LCS/matrix-chain/knapsack/coin-change.",
                         "0-1 knapsack REQUIRES DP. Fractional knapsack → greedy. Don't confuse them.",
                         "Identify: overlapping subproblems + optimal substructure → DP."),
    "mst":              ("Find MST weight or trace Kruskal/Prim step by step.",
                         "Distinct edge weights → UNIQUE MST. Multiple MSTs all have same total weight.",
                         "Kruskal: sort edges; add if no cycle (DSU). Prim: expand from vertex greedily."),
    "eigenvalues":      ("Find eigenvalues from characteristic polynomial OR Tr/Det shortcuts.",
                         "Tr(A) = Σλᵢ. Det(A) = Πλᵢ. Use for 2×2 without full polynomial.",
                         "λ² - Tr(A)·λ + Det(A) = 0 for 2×2 matrices."),
    "sliding_window":   ("Throughput/efficiency of Go-Back-N or Selective Repeat ARQ.",
                         "SR sender window = 2^(n-1). GB-N sender window = 2^n - 1. Receiver window matters.",
                         "Efficiency = W/(1+2a) where a=T_prop/T_frame. W = window size."),
    "error_detection":  ("CRC: append r zeros, divide by generator, remainder = CRC to transmit.",
                         "Divide by XOR (no carries). Generator degree r → r CRC bits appended.",
                         "Hamming distance d: detect d-1 bits, correct ⌊(d-1)/2⌋ bits."),
    "ip_subnetting":    ("Given IP/prefix: find network addr, broadcast, valid hosts, # subnets.",
                         "Usable hosts = 2^h - 2 (subtract network and broadcast addresses).",
                         "CIDR: /n means first n bits = network. Hosts per subnet = 2^(32-n) - 2."),
    "graph_traversal":  ("DFS/BFS traversal order OR topological sort on given directed graph.",
                         "Multiple valid topological orderings exist — verify by counting zero in-degree.",
                         "Kahn's: repeatedly remove vertex with in-degree 0. Add to order, update neighbors."),
    "np_completeness":  ("Classify given problem as P, NP, NP-complete, or NP-hard.",
                         "NP ≠ NP-complete. NP-hard problems may not even be in NP.",
                         "Show X∈NP: certificate verifiable in poly time. Reduction from known NPC → NPC."),
    "kmap":             ("Minimize Boolean function using K-map. Find prime and essential prime implicants.",
                         "Don't-cares can be grouped but not required to be covered.",
                         "Essential PI = covers at least one minterm that no other PI covers. Must include."),
    "master_theorem":   ("Solve T(n) = aT(n/b) + f(n) by comparing f(n) with n^{log_b a}.",
                         "Master theorem inapplicable when f(n) is not polynomial (e.g., n log n sometimes).",
                         "Case 1: f=O(n^{c-ε}) → Θ(n^c). Case 2: f=Θ(n^c log^k n) → Θ(n^c log^(k+1) n). Case 3+regularity."),
    "parsing":          ("Identify grammar type (LL(1)/LR(1)/LALR) OR fill parse table.",
                         "Shift-reduce conflict: both stack and input could trigger action — ambiguity.",
                         "LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ LR(1) in power. LALR = practical standard."),
    "counting":         ("Permutation/combination counting OR pigeonhole principle application.",
                         "Ordered = permutation. Unordered = combination. Stars and bars for repetition.",
                         "C(n,r) = P(n,r)/r!. Pigeonhole: n+1 into n boxes → ≥1 box has ≥2."),
}

if __name__ == "__main__":
    pyq_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PYQ_DIR
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT
    cache_dir = DEFAULT_OCR_CACHE
    cache_dir.mkdir(exist_ok=True)

    freq = defaultdict(int); years = defaultdict(set); pairs_count = defaultdict(int)
    years_processed = set(); all_concepts_by_year = {}

    pdfs = sorted(pyq_dir.glob("*.pdf"))
    print(f"Processing {len(pdfs)} PDFs...\n")

    for pdf_path in pdfs:
        year = detect_year(pdf_path.name)
        if year < 2007: continue
        text = read_pdf(pdf_path, cache_dir)
        if "[image-pdf" in text:
            print(f"  [{year}] {pdf_path.name}: image-only, no text extracted")
            continue
        words = len(text.split())
        concepts_found = detect_concepts(text)
        print(f"  [{year}] {pdf_path.name}: {words} words → {len(concepts_found)} concepts: {', '.join(concepts_found[:6])}{'...' if len(concepts_found)>6 else ''}")
        for c in concepts_found:
            freq[c] += 1; years[c].add(year)
        all_concepts_by_year[year] = concepts_found
        years_processed.add(year)
        # Pairs
        for i in range(len(concepts_found)):
            for j in range(i+1, len(concepts_found)):
                pair = tuple(sorted([concepts_found[i], concepts_found[j]]))
                pairs_count[pair] += 1

    print(f"\n📊 Results:\n  Papers: {len(years_processed)}, Concepts: {len(freq)}, Pairs: {len(pairs_count)}")

    # Build analytics
    importance = {cid: compute_importance(cid, f, years[cid]) for cid, f in freq.items()}
    high_yield = sorted(importance.items(), key=lambda x: -x[1])[:35]
    pairs_list = [{"concept_a":a,"concept_b":b,"count":c} for (a,b),c in sorted(pairs_count.items(),key=lambda x:-x[1]) if c>=2][:40]
    trends = {cid: sorted(list(yrs)) for cid, yrs in sorted(years.items(), key=lambda x:-len(x[1]))}
    hy_ranked = [{"id":cid,"subject":CONCEPT_TO_SUBJECT.get(cid,"cs"),"score":s,"label":label(cid),"freq":freq.get(cid,0)} for cid,s in high_yield]

    # Radar
    radar = sorted([{
        "id":cid,"label":label(cid),
        "radar_score": round(freq.get(cid,0)*0.4 + len(yrs)*0.3 + min((2025-max(yrs))*0.5,2.0), 2),
        "last_seen": max(yrs), "gap_years": 2025-max(yrs), "total_freq": freq.get(cid,0)
    } for cid, yrs in years.items()], key=lambda x:-x['radar_score'])[:20]

    # Build patterns block
    patterns_js = []
    for cid, (pat, trap, shortcut) in PATTERNS.items():
        f = freq.get(cid, 4); yrs = trends.get(cid, [2022])
        ly = max(yrs) if yrs else 2022
        patterns_js.append(f'    "{cid}": {json.dumps({"pattern":pat,"trap":trap,"shortcut":shortcut,"frequency":f,"last_year":ly})}')

    freq_top = dict(sorted(freq.items(), key=lambda x:-x[1])[:70])
    imp_top = dict(sorted(importance.items(), key=lambda x:-x[1])[:50])

    pattern_block = ",\n".join(patterns_js)

    js = f"""// ═══════════════════════════════════════════════════════════════
// GATE PYQ Intelligence Engine v2
// Built from: {len(years_processed)} GATE CS papers ({', '.join(str(y) for y in sorted(years_processed))})
// Unique concepts tracked: {len(freq)}  |  Concept pairs: {len(pairs_list)}
// ═══════════════════════════════════════════════════════════════

const PYQ_META = {json.dumps({"generated":"2026-03-08","papers":len(years_processed),"years":sorted(years_processed),"concepts":len(freq)},indent=2)};

const PYQ_DB = {{}};

const PYQ_INTELLIGENCE = {{
  concept_frequency: {json.dumps(freq_top, indent=2)},

  concept_trends: {json.dumps(trends, indent=2)},

  concept_pairs: {json.dumps(pairs_list, indent=2)},

  importance_scores: {json.dumps(imp_top, indent=2)},

  high_yield_ranked: {json.dumps(hy_ranked, indent=2)},

  concept_radar: {json.dumps(radar, indent=2)},

  pyq_patterns: {{
{pattern_block}
  }}
}};
"""
    Path(out_path).write_text(js, encoding="utf-8")
    print(f"\n✅ Written: {out_path}")
    print(f"\n🔥 Top High Yield:")
    for h in hy_ranked[:10]: print(f"   {h['score']:5.2f} | {h['label']}")
    print(f"\n🎯 Concept Radar:")
    for r in radar[:6]: print(f"   {r['radar_score']:5.2f} | {r['label']} (last:{r['last_seen']} gap:{r['gap_years']}y)")
