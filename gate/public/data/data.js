// QUIZ SYSTEM - INDEXEDDB STORAGE ENGINE
const IDB = (function() {
  const DB_NAME = 'gate2028_quiz';
  const DB_VERSION = 3;
  let db = null;

  function init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('questions')) d.createObjectStore('questions', { keyPath: 'id' }); // legacy
        if (!d.objectStoreNames.contains('pyq_questions')) d.createObjectStore('pyq_questions', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('practice_questions')) d.createObjectStore('practice_questions', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('mistakes')) d.createObjectStore('mistakes', { keyPath: 'mistake_id' });
        if (!d.objectStoreNames.contains('exams')) d.createObjectStore('exams', { keyPath: 'exam_id' });
        if (!d.objectStoreNames.contains('flashcards')) d.createObjectStore('flashcards', { keyPath: 'card_id' });
        if (!d.objectStoreNames.contains('theory_cards')) d.createObjectStore('theory_cards', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('theory_pages')) d.createObjectStore('theory_pages', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('quiz_sessions')) d.createObjectStore('quiz_sessions', { keyPath: 'session_id' });
        if (!d.objectStoreNames.contains('exam_results')) d.createObjectStore('exam_results', { keyPath: 'id' });
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e);
    });
  }

  function interact(storeName, mode, fn) {
    if (!db) return init().then(() => interact(storeName, mode, fn));
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const req = fn(store);
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = e => reject(e);
      if (req instanceof IDBRequest) {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }
    });
  }

  return {
    init,
    put: (store, item) => interact(store, 'readwrite', s => s.put(item)),
    get: (store, key) => interact(store, 'readonly', s => s.get(key)),
    getAll: (store) => interact(store, 'readonly', s => s.getAll()),
    delete: (store, key) => interact(store, 'readwrite', s => s.delete(key))
  };
})();

IDB.init().catch(e => console.error('IDB Init Error:', e));

const S = [
  {id:'ga',name:'General Aptitude',icon:'🧠',cat:'General Aptitude',catC:'var(--teal)',w:15,marks:'15',ord:0,status:'backlog',bl:true,hy:true,start:'Dec 22, 2025',end:'Jan 6, 2026',
   topics:[
    {n:'Sentence Completion & Grammar',sub:['Parts of speech','Tense & agreement','Articles & prepositions','Fill in the blanks']},
    {n:'Critical Reasoning',sub:['Argument structure','Assumptions','Inferences','Strengthen / weaken']},
    {n:'Reading Comprehension',sub:['Main idea','Tone & purpose','Inference Qs','Elimination strategy']},
    {n:'Ratios & Percentages',sub:['Ratio & proportion','Percentages','Profit & loss','Averages']},
    {n:'Time, Speed & Work',sub:['Work rate problems','Pipes & cisterns','Time-speed-distance']},
    {n:'Permutations & Combinations',sub:['Counting principles','Permutations','Combinations','Probability basics']},
    {n:'Data Interpretation',sub:['Tables','Bar graphs','Pie charts','Line graphs']},
  ]},
  {id:'dm',name:'Discrete Mathematics',icon:'🔢',cat:'Engineering Mathematics',catC:'var(--purple)',w:8,marks:'6–9',ord:1,status:'upcoming',bl:false,hy:true,start:'Apr 27, 2026',end:'Jun 19, 2026',
   topics:[
    {n:'Propositional Logic',sub:['Logical connectives','Tautologies','Logical equivalences','Inference rules']},
    {n:'First-Order Logic',sub:['Predicates & quantifiers','Nested quantifiers','Proof strategies']},
    {n:'Sets, Relations, Functions',sub:['Set operations','Relation types','Functions & bijections','Composition']},
    {n:'Partial Orders & Lattices',sub:['Posets','Hasse diagrams','Lattice properties']},
    {n:'Groups',sub:['Group axioms','Subgroups','Cyclic groups','Cosets']},
    {n:'Graph Theory — Trees',sub:['Spanning trees','Binary trees','Tree traversals','Properties']},
    {n:'Graph Theory — Connectivity',sub:['Paths & cycles','Components','Euler & Hamiltonian','Bridges']},
    {n:'Graph Theory — Matching',sub:['Bipartite graphs','Maximum matching','Hall\'s theorem']},
  ]},
  {id:'la',name:'Linear Algebra',icon:'📐',cat:'Engineering Mathematics',catC:'var(--purple)',w:4,marks:'3–5',ord:2,status:'upcoming',bl:false,hy:false,start:'Mar 15, 2027',end:'Apr 9, 2027',
   topics:[
    {n:'Matrices & Determinants',sub:['Matrix ops','Determinant properties','Cofactor expansion']},
    {n:'Rank & Linear Independence',sub:['Row reduction','Rank-nullity theorem','Basis & dimension']},
    {n:'Eigenvalues & Eigenvectors',sub:['Characteristic polynomial','Diagonalization','Cayley-Hamilton']},
    {n:'Systems of Equations',sub:['Gaussian elimination','Consistency conditions','Homogeneous systems']},
    {n:'Vector Spaces',sub:['Subspaces','Linear transformations','Kernel & image']},
  ]},
  {id:'calc',name:'Calculus',icon:'∫',cat:'Engineering Mathematics',catC:'var(--purple)',w:3,marks:'2–4',ord:3,status:'upcoming',bl:false,hy:false,start:'Aug 27, 2025',end:'Sep 18, 2025',
   topics:[
    {n:'Limits & Continuity',sub:['L\'Hopital\'s rule','Squeeze theorem','Discontinuity types']},
    {n:'Differentiation',sub:['Chain rule','Implicit differentiation','Partial derivatives']},
    {n:'Maxima & Minima',sub:['Critical points','Second derivative test','Optimization']},
  ]},
  {id:'ps',name:'Probability & Statistics',icon:'📊',cat:'Engineering Mathematics',catC:'var(--purple)',w:4,marks:'3–5',ord:4,status:'upcoming',bl:false,hy:false,start:'Apr 12, 2027',end:'May 28, 2027',
   topics:[
    {n:'Conditional Probability',sub:['Multiplication rule','Independence','Bayes\' theorem']},
    {n:'Random Variables',sub:['Discrete vs continuous','CDF & PDF','Expected value','Variance']},
    {n:'Distributions',sub:['Binomial','Poisson','Normal / Gaussian','Uniform']},
    {n:'Statistics',sub:['Mean, median, mode','Std deviation','Correlation']},
  ]},
  {id:'pds',name:'Programming & Data Structures',icon:'🌲',cat:'Core CS',catC:'var(--blue)',w:12,marks:'9–15',ord:5,status:'backlog',bl:true,hy:true,start:'Jan 22, 2026',end:'Feb 20, 2026',
   topics:[
    {n:'C — Basics & Pointers',sub:['Data types, operators, control flow','Functions, scope & lifetime','Pointer arithmetic & dynamic allocation','Pointer to functions, arrays']},
    {n:'Recursion',sub:['Base cases & induction','Call stack mechanics','Recursive tree analysis','Tail recursion']},
    {n:'Arrays & Linked Lists',sub:['1D & 2D arrays','Singly/doubly/circular lists','Operations & complexity']},
    {n:'Stacks & Queues',sub:['Array & linked list impl.','Infix/postfix conversion','Circular & priority queues']},
    {n:'Trees & BSTs',sub:['Binary trees','BST operations','Traversals (in/pre/post)','Height & balance']},
    {n:'AVL & B-Trees',sub:['Rotations (LL, LR, RL, RR)','Balance factor','B-tree properties & operations']},
    {n:'Heaps',sub:['Min/max-heap','Heapify','Heap sort','Priority queues']},
    {n:'Graphs',sub:['Adjacency matrix vs list','BFS & DFS','Applications of traversals']},
    {n:'Hash Tables',sub:['Hash functions','Chaining vs open addressing','Load factor & complexity']},
  ]},
  {id:'algo',name:'Algorithms',icon:'🧮',cat:'Core CS',catC:'var(--blue)',w:10,marks:'7–9',ord:6,status:'upcoming',bl:false,hy:true,start:'Nov 2, 2026',end:'Jan 12, 2027',
   topics:[
    {n:'Complexity & Asymptotic Notation',sub:['Big-O, Θ, Ω definitions','Worst/average/best case','Time vs space tradeoff']},
    {n:'Recurrence Relations',sub:['Substitution method','Master theorem (all 3 cases)','Recursion tree method']},
    {n:'Searching & Sorting',sub:['Binary search','Bubble/selection/insertion','Merge sort','Quick sort','Heap sort','Counting/radix sort']},
    {n:'Graph Algorithms',sub:['BFS & DFS applications','Topological sort','SCC (Kosaraju\'s)','Dijkstra\'s (shortest path)','Bellman-Ford','Floyd-Warshall']},
    {n:'Minimum Spanning Tree',sub:['Kruskal\'s algorithm','Prim\'s algorithm','Cut property']},
    {n:'Divide & Conquer',sub:['Merge sort analysis','Strassen\'s matrix','Closest pair']},
    {n:'Greedy Algorithms',sub:['Activity selection','Fractional knapsack','Huffman coding','Correctness proof']},
    {n:'Dynamic Programming',sub:['Memoization vs tabulation','LCS & LIS','0-1 knapsack','Matrix chain','Edit distance','Coin change']},
    {n:'Backtracking & NP',sub:['N-Queens, subset sum','State space tree','P vs NP','NP-complete reductions']},
  ]},
  {id:'coa',name:'Computer Organization & Architecture',icon:'🖥️',cat:'Core CS',catC:'var(--blue)',w:8,marks:'7–8',ord:7,status:'upcoming',bl:false,hy:true,start:'Jan 13, 2027',end:'Mar 12, 2027',
   topics:[
    {n:'Instructions & Addressing Modes',sub:['Instruction format','Addressing modes (immediate, direct, indirect, register, indexed)','Instruction set design']},
    {n:'ALU & CPU Design',sub:['Adder circuits','ALU operations','Datapath design','Hardwired vs microprogrammed control']},
    {n:'Instruction Pipeline',sub:['5-stage pipeline','Data hazards (RAW, WAR, WAW)','Control hazards','Forwarding & stalls','Pipeline CPI calculations']},
    {n:'Cache Memory',sub:['Direct mapped, set-associative, fully associative','Replacement policies (LRU, FIFO, LFU)','Write-through vs write-back','Cache performance: hit rate, AMAT']},
    {n:'Virtual Memory & Memory Hierarchy',sub:['Paging & TLB','Page table structure','Page replacement (LRU, FIFO, OPT)','Thrashing','Memory hierarchy: registers → cache → RAM → disk']},
    {n:'Interrupts & I/O',sub:['Interrupt handling & ISR','DMA','I/O interfaces','Polling vs interrupt-driven vs DMA']},
    {n:'RISC vs CISC',sub:['Design philosophy','Pipeline friendliness','Register file design']},
  ]},
  {id:'os',name:'Operating Systems',icon:'⚙️',cat:'Core CS',catC:'var(--blue)',w:10,marks:'9–10',ord:8,status:'upcoming',bl:false,hy:true,start:'Mar 15, 2027',end:'May 3, 2027',
   topics:[
    {n:'Process Management',sub:['Process states & PCB','Process creation (fork)','Context switching','IPC mechanisms']},
    {n:'Threads',sub:['User vs kernel threads','Thread models (many-to-one, one-to-one, many-to-many)','Benefits & overhead']},
    {n:'CPU Scheduling',sub:['FCFS, SJF, SRTF, RR, Priority','Gantt charts & calculations','Scheduling criteria (turnaround, waiting, response time)']},
    {n:'Deadlocks',sub:['4 necessary conditions','Resource allocation graph','Banker\'s algorithm','Detection & recovery','Prevention vs avoidance']},
    {n:'Synchronization',sub:['Race conditions & critical section','Mutex & semaphores','Producer-consumer, Readers-writers, Dining philosophers','Monitors']},
    {n:'Memory Management',sub:['Contiguous allocation','Internal & external fragmentation','Paging','Segmentation']},
    {n:'Virtual Memory',sub:['Demand paging','Page fault handling','Page replacement (LRU, FIFO, OPT, LFU)','Working set model']},
    {n:'File Systems',sub:['File operations & attributes','Directory structures','Inode & indexed allocation','FAT vs indexed','Free space management']},
    {n:'Disk Scheduling',sub:['FCFS, SSTF, SCAN, C-SCAN, LOOK','Disk access time = seek + rotational + transfer']},
  ]},
  {id:'dbms',name:'DBMS',icon:'🗄️',cat:'Core CS',catC:'var(--blue)',w:8,marks:'7–8',ord:9,status:'active',bl:false,hy:true,start:'Feb 23, 2026',end:'Apr 10, 2026',
   topics:[
    {n:'ER Model',sub:['Entities & attributes','Relationships & cardinality','Participation constraints','ER to relational mapping']},
    {n:'Relational Model',sub:['Relations & tuples','Keys (super, candidate, primary, foreign)','Integrity constraints']},
    {n:'Relational Algebra',sub:['Selection, projection','Union, intersection, difference','Joins (natural, theta, outer)','Division operator']},
    {n:'SQL',sub:['DDL & DML','Joins in SQL','Aggregate functions & GROUP BY','Nested queries & views','NULL handling']},
    {n:'Normalization',sub:['Functional dependencies','Closure of FD set','1NF, 2NF, 3NF, BCNF','Lossless decomposition','Dependency preservation']},
    {n:'Transactions',sub:['ACID properties','Transaction states','Serializability (conflict & view)','Precedence graphs']},
    {n:'Concurrency Control',sub:['Lock-based protocols','Two-Phase Locking (strict 2PL)','Timestamp ordering','Deadlock in transactions']},
    {n:'Recovery',sub:['Log-based recovery','Undo & redo logs','Checkpointing','ARIES concept']},
  ]},
  {id:'cn',name:'Computer Networks',icon:'🌐',cat:'Core CS',catC:'var(--blue)',w:9,marks:'8–9',ord:10,status:'upcoming',bl:false,hy:true,start:'Jun 22, 2026',end:'Oct 2, 2026',
   topics:[
    {n:'OSI & TCP/IP Models',sub:['7 vs 5 layers','Layer responsibilities','PDUs per layer','Encapsulation']},
    {n:'Error Detection & Correction',sub:['Parity bits','CRC calculation','Hamming code','Checksum']},
    {n:'Flow Control & ARQ',sub:['Stop-and-wait','Go-back-N (window size calculations)','Selective repeat','Throughput & efficiency formulas']},
    {n:'Routing Algorithms',sub:['Distance vector (Bellman-Ford based)','Link state (Dijkstra / OSPF)','RIP vs OSPF vs BGP comparison']},
    {n:'Congestion Control',sub:['TCP congestion window','Slow start','Congestion avoidance','Fast retransmit & recovery']},
    {n:'TCP & UDP',sub:['3-way handshake','TCP segment structure','Reliable delivery mechanisms','UDP use cases & header']},
    {n:'IP & Subnetting',sub:['IPv4 address classes','Subnet masks & CIDR','Subnetting calculations','NAT','IPv6 basics']},
    {n:'Application Layer',sub:['DNS (recursive & iterative resolution)','HTTP/HTTPS methods & status codes','SMTP/POP3/IMAP','FTP modes']},
  ]},
  {id:'toc',name:'Theory of Computation',icon:'🤖',cat:'Core CS',catC:'var(--blue)',w:8,marks:'6–9',ord:11,status:'backlog',bl:true,hy:false,start:'Nov 5, 2025',end:'Dec 19, 2025',
   topics:[
    {n:'Regular Languages & Finite Automata',sub:['DFA construction & minimization','NFA to DFA (subset construction)','ε-NFA','Language accepted by FA']},
    {n:'Regular Expressions',sub:['RE to FA conversion','FA to RE (state elimination)','Closure properties of regular languages']},
    {n:'Pumping Lemma (Regular)',sub:['Pumping lemma statement','Proving non-regularity','Classic examples']},
    {n:'Context-Free Grammars',sub:['CFG derivations & parse trees','Ambiguity in CFGs','Chomsky Normal Form','Greibach Normal Form']},
    {n:'Pushdown Automata',sub:['DPDA vs NPDA','CFG to PDA conversion','Acceptance: empty stack vs final state']},
    {n:'Pumping Lemma (CFL)',sub:['CFL pumping lemma statement','Proving non-CFL','Closure properties of CFLs']},
    {n:'Turing Machines',sub:['TM definition & transitions','Multi-tape TM','TM variants','Acceptance & halting']},
    {n:'Decidability',sub:['Decidable problems','Halting problem proof','Rice\'s theorem','Reduction technique']},
    {n:'Complexity Classes',sub:['P class problems','NP definition','Cook\'s theorem (SAT is NP-complete)','NP-hard','Polynomial reductions']},
  ]},
  {id:'dl',name:'Digital Logic',icon:'⚡',cat:'Core CS',catC:'var(--blue)',w:6,marks:'5–6',ord:12,status:'upcoming',bl:false,hy:false,start:'Mar 23, 2026',end:'May 15, 2026',
   topics:[
    {n:'Number Systems',sub:['Binary, octal, hex conversions','Signed numbers (2\'s complement)','Arithmetic in binary']},
    {n:'Boolean Algebra',sub:['Axioms & theorems','De Morgan\'s laws','Duality principle','SOP & POS forms']},
    {n:'Logic Gates & Minimization',sub:['Basic & universal gates (NAND/NOR)','K-map (2,3,4 vars)','Quine-McCluskey method','Don\'t care conditions']},
    {n:'Combinational Circuits',sub:['Multiplexers & demultiplexers','Encoders & decoders','Adders (half, full, carry-lookahead)','Comparators']},
    {n:'Sequential Circuits & FSM',sub:['SR, D, JK, T flip-flops','Setup & hold time','Synchronous vs asynchronous','Mealy vs Moore machines','State minimization']},
    {n:'Counters & Registers',sub:['Ripple & synchronous counters','Shift registers','Design examples']},
  ]},
  {id:'cd',name:'Compiler Design',icon:'🔧',cat:'Core CS',catC:'var(--blue)',w:5,marks:'4–6',ord:13,status:'upcoming',bl:false,hy:false,start:'Oct 5, 2026',end:'Oct 30, 2026',
   topics:[
    {n:'Lexical Analysis',sub:['Tokens, patterns, lexemes','RE → NFA → DFA for tokens','Role of lexer','Lex tool concept']},
    {n:'Top-Down Parsing',sub:['Recursive descent','FIRST & FOLLOW computation','LL(1) parsing table','Left recursion elimination','Left factoring']},
    {n:'Bottom-Up Parsing',sub:['Shift-reduce parsing','LR(0) items','SLR(1) parsing table','LALR(1)','CLR(1) — most powerful']},
    {n:'Syntax-Directed Translation',sub:['S-attributed & L-attributed grammars','Synthesized vs inherited attributes','SDT schemes']},
    {n:'Intermediate & Runtime',sub:['Three-address code','Quadruples & triples','Activation records','Parameter passing','Stack-based runtime']},
    {n:'Optimization & Code Generation',sub:['Local & global optimization','CSE, dead code elimination','Loop optimizations','Register allocation','Instruction selection']},
  ]},
];

const COLORS=['#e8a838','#5b9bd5','#6ab04c','#c07bb0','#e07060','#4ab8a8','#a09060','#d4a060'];
const MOODS=[{e:'😤',l:'Locked in'},{e:'😊',l:'Good pace'},{e:'😐',l:'Getting by'},{e:'😴',l:'Tired'},{e:'😩',l:'Rough day'}];
const QUOTES=[
  'The rank list doesn\'t care how tired you were.',
  'Every topic you finish today is a question you\'ll own in February.',
  'Understanding one concept deeply beats memorising ten shallowly.',
  'PYQs are the syllabus in disguise. Solve them first, not last.',
  'The exam rewards those who practised thinking, not those who crammed.',
  'Small margin every day. Massive lead by exam day.',
  'The backlog won\'t clear itself. One hour today.',
  'Confusion is the feeling of learning. Stay in it.',
  'Your competition is also tired. That\'s irrelevant. Open the book.',
  'One concept fully understood is worth ten topics skimmed.',
  'MSQ and NAT have no negative marking — never leave them blank.',
  'GA is 15 marks. Don\'t sleep on it.',
  'The best time to start was yesterday. The next best time is now.',
  'You don\'t need motivation. You need discipline on the unmotivated days.',
  'Speed without accuracy is noise. Accuracy without speed is inert. Train both.',
  'Every question you skip today is a question you\'ll see in February with dread.',
  'Hard chapters are hard for everyone. That\'s your opportunity.',
  'Solve PYQs until the pattern speaks to you before you even read the options.',
  'Doubt your pace, not your ability. Adjust. Continue.',
  'The gap between where you are and where you want to be is closed one session at a time.',
  'A 1-mark mistake on the real exam hurts 10x more than a 1-mark mistake now. Lose them here.',
  'Weak subjects don\'t fix themselves with worry. Fix them with reps.',
  'Every formula you master eliminates one more thing to panic about in the exam hall.',
  'The timer on the right shows what\'s left. Run toward it, not away from it.',
  'You are building the exact brain that will carry you through a 3-hour exam. Build it carefully.',
  'GATE is solvable. It\'s designed to be. Focus on the design, not the fear.',
  'Algorithms are logic, not magic. Trace through it. It clicks.',
  'Operating Systems is 10 marks. Every deadlock question you master is points in hand.',
  'The difference between a good GATE score and a great one is often 3–4 questions. Know your weak spots.',
  'Don\'t save hard problems for later. Later never comes. Do it now.',
  'A wrong answer understood deeply is worth more than three right answers guess-and-checked.',
  'The syllabus is finite. Your ability to learn it is not.',
  'Compiler Design: 5 marks that separate prepared candidates from the rest.',
  'Context-free grammars, turing machines, NP-completeness — learn them once, know them for life.',
  'Every hour you put in now buys you calm on exam day.',
  'Discipline is doing the subject you hate, today, when nothing is forcing you to.',
  'You\'re not behind. You\'re exactly where the work you\'ve done has put you. Work more.',
  'One full PYQ paper, timed and analysed, teaches more than a week of passive reading.',
  'The candidates who crack AIR < 100 didn\'t find a secret. They did the obvious things consistently.',
  'This is the work. There is no shortcut. But the work is survivable — start.',
  'Normalisation, ACID, 2PL — DBMS gives predictable marks to prepared candidates.',
  'GATE doesn\'t test brilliance. It tests preparation depth. Prepare deep.',
  'Cache hit rate, AMAT formula — these aren\'t hard. They just need reps.',
  'Your mock score is feedback, not a verdict. Adjust, not despair.',
  'MSQs require certainty, not guessing. They reward deep understanding.',
  'The 3-hour exam is the easy part. The next 300 hours of prep is the hard part.',
  'Don\'t read theory without solving a question. Don\'t solve a question without understanding why.',
  'If a topic feels impossible, you haven\'t found the right explanation yet. Keep searching.',
  'Every study session is a vote for the version of yourself that cracks GATE.',
  'The syllabus isn\'t your enemy. Lack of a plan is. You have a plan. Use it.',
  'Engineering mathematics is 13 marks. Calculus, probability, linear algebra — each one counts.',
  'When you\'re tired, do the easy chapter. Just don\'t stop.',
  'Networking: the candidate who can calculate throughput and trace routing wins marks others leave behind.',
  'The comfort zone is the danger zone. The chapters that scare you are the ones to tackle first.',
  'NP-completeness is a concept, not a monster. Learn Cook\'s theorem once. Own it.',
  'There is a version of you in February who is calm, prepared, and sharp. Build that version now.',
  'Graphs, trees, dynamic programming — these are GATE\'s language. Become fluent.',
  'The score you want requires the effort you\'re not sure you can sustain. Sustain it anyway.',
  'You already know more than you think. Test yourself to find out.',
  'The exam is in February. There is no later version of you who is magically more ready. Only this version, prepared.'
];
const MARKSMAP=[{l:'General Aptitude',m:15,c:'var(--teal)'},{l:'Engineering Maths',m:13,c:'var(--purple)'},{l:'Programming + DS',m:12,c:'var(--blue)'},{l:'Operating Systems',m:10,c:'#5b9bd5'},{l:'Algorithms',m:9,c:'#6080d0'},{l:'Computer Networks',m:9,c:'#4a90d9'},{l:'COA',m:8,c:'#7070c8'},{l:'DBMS',m:8,c:'#5090b8'},{l:'TOC',m:8,c:'#6090a8'},{l:'Discrete Maths',m:8,c:'#9060c8'},{l:'Digital Logic',m:6,c:'#8080b8'},{l:'Compiler Design',m:5,c:'#7080a8'}];


// ═══ FLASHCARDS DATA ═══
const FLASHCARDS={
  "calc": [
    {
      "q": "[P13] What is x = 0?",
      "a": "X = 0 is a critical point of f(x) = x3 fig."
    },
    {
      "q": "[P13] What is the general expansion of taylor series?",
      "a": "Given by 𝑓(𝑥+ ℎ)= 𝑓(𝑥)+ ℎ."
    },
    {
      "q": "[P16] What does here, ilate stand for?",
      "a": "Inverse logarithmic algebraic trigonometric exponential."
    },
    {
      "q": "[P21] What is if f(x, y, z)?",
      "a": "If f(x, y, z) is a continuous and differentiable function, such that the variables x, y and z are related/constrained by the equation (x, y, z) = c then to calculate the extreme value of f(x, y, z) using lagrange’s method of unidentified multipliers."
    },
    {
      "q": "[P57] What is this graph?",
      "a": "This graph is known as minimally connected graph."
    },
    {
      "q": "[P57] What occurs in this kind of graph?",
      "a": "These will be a unique path b/w any two pair of vertices."
    },
    {
      "q": "[P57] What is this kind of graph?",
      "a": "This kind of graph is called a tree (a connected graph with no cycles) 1.2.5 range of edges for a disconnected graph:"
    },
    {
      "q": "[P58] What is such a drawing of g?",
      "a": "Such a drawing of g is called an embedding of g in the plane."
    },
    {
      "q": "[P59] What is it?",
      "a": "It is a covering set from which we can’t remove new elements(edge)."
    },
    {
      "q": "[P59] What is the degree of a vertex in a matching?",
      "a": "Called indeed degree example:"
    },
    {
      "q": "Formula: Tangent at x?",
      "a": "Tangent at x = c is parallel to the line connecting the points A and B LMVT"
    },
    {
      "q": "Formula: then f(x) is stationary at x?",
      "a": "then f(x) is stationary at x = a1, a2, ."
    },
    {
      "q": "Formula: exists) then the Taylor series expansion of f(x) about the point x?",
      "a": "exists) then the Taylor series expansion of f(x) about the point x = a is given by 𝑓(𝑥)= 𝑓(𝑎)+ 𝑓′(𝑎) 1!"
    },
    {
      "q": "What is the general expansion of Taylor series?",
      "a": "Given by 𝑓(𝑥+ ℎ)= 𝑓(𝑥)+ ℎ."
    },
    {
      "q": "What does Here, ILATE stand for?",
      "a": "INVERSE LOGARITHMIC ALGEBRAIC TRIGONOMETRIC EXPONENTIAL."
    },
    {
      "q": "If f(x) is differentiable in interval (a, b), what happens?",
      "a": "∫ 𝑓(𝑥)𝑏 𝑎 𝑑𝑥= −∫ 𝑓(𝑥)𝑎 𝑏 𝑑𝑥 2."
    },
    {
      "q": "If  a point c  (a, b) such that f(x) is not differentiable, what happens?",
      "a": "∫ 𝑓(𝑥)𝑏 𝑎 𝑑𝑥= ∫ 𝑓(𝑥)𝑐 𝑎 𝑑𝑥+ ∫ 𝑓(𝑥)𝑏 𝑐 𝑑𝑥 3."
    },
    {
      "q": "Define: Note?",
      "a": "/2 0 11 22sin cos 22 2 mn mn x xdx mn  ++         = ++  Where (x) is called the gamma function."
    },
    {
      "q": "Define: Step-1?",
      "a": "Calculate 𝑝 = 𝜕𝑓 𝜕𝑥 and 𝑞 = 𝜕𝑓 𝜕𝑦 and equate p = 0, q = 0 Let (x0, y0) be a stationary point."
    },
    {
      "q": "Define: Step-2?",
      "a": "Calculate r, s, t where 𝑟 = 𝜕2𝑓 𝜕𝑥2| (𝑥0,𝑦0)"
    },
    {
      "q": "Define: Step-1?",
      "a": "Form the function F(x, y, z) = f(x, y, z) + {(x, y, z) – C}, where 𝜆 is a multiplier."
    },
    {
      "q": "Define: Step-2?",
      "a": "Calculate 𝜕𝐹 𝜕𝑥, 𝜕𝐹 𝜕𝑦 and 𝜕𝐹 𝜕𝑧 and equate them to zero Step-3: Equate the values of  from the above 3 equations and obtain the relation between the variables x, y and z."
    },
    {
      "q": "Define: Step-4?",
      "a": "Substitute the relation between x, y and z in (x, y, z) = C and get the values of x, y, z."
    },
    {
      "q": "Define: Step-5?",
      "a": "Calculate f(x0, y0, z0) The value f(x0, y0, z0) is the extreme value of f(x, y, z)."
    },
    {
      "q": "Define: Note?",
      "a": "When limits are constants, the order of integration does not matter, ( , ) ( , ) y d y dx b x b y c x a x a y c f x y dxdy f x y dydx == == = = = = =    1.17 Jacobian of the Transformation (i) The Jacobian of the transformation, ( )12 , , ( , )x f u v y f u v== is defined as, ( , ) ( , ) uv uv xxxyJ yyuv =="
    },
    {
      "q": "Define: • This graph?",
      "a": "Minimally connected graph."
    },
    {
      "q": "Define: • This kind of graph?",
      "a": "A tree (a connected graph with no cycles) 1.2.5 Range of edges for a disconnected graph: • Edges range b/w ( )( )n k n k 1n k e 2 − − +−   Proof: Here lets say we have k components with n1, n2 …… nk components  n1 + n2 + …….."
    },
    {
      "q": "If deg u + deg v  n – 1 nonadjacent vertices u and v of G, what happens?",
      "a": "G is connected and diam(G)  2."
    },
    {
      "q": "What is If G?",
      "a": "If G is a graph of order n with (G)  (n – 1)/2, then G is connected."
    },
    {
      "q": "Formula: Let G?",
      "a": "Let G = (V, E) be a loop-free graph with n (2) vertices."
    },
    {
      "q": "If deg(v)  (n - 1)/2 for all v  V, what happens?",
      "a": "G has a Hamilton path."
    },
    {
      "q": "What is If G = (V, E)?",
      "a": "If G = (V, E) is a loop-free undirected graph with n1 V n 3, and if E 2 2, −=   +  then G has a Hamilton cycle."
    },
    {
      "q": "Define: Such a drawing of G?",
      "a": "An embedding of G in the plane."
    },
    {
      "q": "Define: One of these regions has infinite area and?",
      "a": "The infinite regi on."
    },
    {
      "q": "Define: For above graph C(G) = 3 1.5 Perfect Matching: A matching?",
      "a": "Prefect matching if every vertex in the graph is matched (or) Induced degree of all the vertices is 1."
    }
  ],
  "la": [
    {
      "q": "[P28] What is the cofactor of an element?",
      "a": "Equal to the product of the minor of the element, and -1 to the power of position values of row and column of the element."
    },
    {
      "q": "[P29] What is the rank of the matrix?",
      "a": "The dimension of the vector space obtained by its columns."
    },
    {
      "q": "[P29] What is the rank of the null matrix?",
      "a": "Zero."
    },
    {
      "q": "[P29] What is the nullity of a matrix?",
      "a": "The nullity of a matrix is defined as the number of vectors present in the null space of a given matrix."
    },
    {
      "q": "[P29] What occurs in other words?",
      "a": "It can be defined as the dimension of the null space of matrix a called the nullity of a."
    },
    {
      "q": "[P30] What is the system of ax = b?",
      "a": "Said to be a non-homogeneous system if 𝐵 ≠ 0."
    },
    {
      "q": "[P32] What does this mean?",
      "a": "This means that, if 1 0 1 1 ..."
    },
    {
      "q": "[P32] What is of (i)?",
      "a": "Of (i) is a null matrix of order n."
    },
    {
      "q": "[P33] What is the set of all ordered n-tuples?",
      "a": "The set of all ordered n-tuples is called n-space and is denoted by ℝn."
    },
    {
      "q": "[P33] What is the set of the vector?",
      "a": "Orthonormal if they are orthogonal and have unit magnitude."
    },
    {
      "q": "Define: 1 ≤ 𝑖,𝑗 ≤ 𝑛?",
      "a": "An upper triangular matrix if 𝑎𝑖𝑗 = 0 ∀ 𝑖 > 𝑗 (2) Lower Triangular Matrix: A matrix 𝐴 = [𝑎𝑖𝑗]𝑛×𝑛"
    },
    {
      "q": "Define: (5) Idempotent Matrix: A Matrix '𝐴𝑛×𝑛'?",
      "a": "An idempotent matrix if 𝐴2 = 𝐴."
    },
    {
      "q": "Define: Engineering Mathematics (6) Nilpotent Matrix: A matrix A?",
      "a": "Nilpotent of class x or index if Ax = 0 and Ax– 1  0 i.e."
    },
    {
      "q": "Define: (7) Orthogonal Matrix: A matrix A?",
      "a": "Orthogonal if A.AT = I Example: [cos𝜃 −sin𝜃 sin𝜃 cos𝜃 ] (8) Involutory Matrix: A matrix A is said to be involutory if A2 = I Example: [ 2 3 −1 −2] 2.3 Transpose of a Matrix For a given matrix = [𝑎𝑖𝑗]"
    },
    {
      "q": "What is 𝐵𝑛×𝑛 ≠ 0?",
      "a": "𝐵𝑛×𝑛 ≠ 0 is a zero Matrix ((𝐴𝐵)𝑛×𝑛 = 0), then both |𝐴| = 0 & |𝐵| = 0."
    },
    {
      "q": "Define: Example?",
      "a": "If 11 12 13 21 22 23 31 32 33 a a a a a a a a a = Minor of element 21a : 12 13 21 32 33 aaM aa= Co-factor of an element, ( )1 ij ij ijaM +=− • To design co-factor matrix, we replace each element by its co-factor."
    },
    {
      "q": "Define: Rank of a Matrix • The rank of the matrix?",
      "a": "The number of linearly independent rows or columns in the matrix."
    },
    {
      "q": "What is Ρ(A) used for?",
      "a": "Denote the rank of matrix A."
    },
    {
      "q": "Define: • A matrix?",
      "a": "Of rank zero when all of its elements become zero."
    },
    {
      "q": "What is the rank of the null matrix?",
      "a": "Zero."
    },
    {
      "q": "Define: • The nullity of a matrix?",
      "a": "The number of vectors present in the null space of a given matrix."
    },
    {
      "q": "What happens in Other words?",
      "a": "It can be defined as the dimension of the null space of matrix A called the nullity of A."
    },
    {
      "q": "What is Rank + Nullity?",
      "a": "Rank + Nullity is the number of all columns in matrix A."
    },
    {
      "q": "Define: A real Number 'r'?",
      "a": "The rank of a matrix '𝐴𝑚×𝑛' if (1) There is at least one square sub-matrix of A of order r whose determinant is not equal to zero."
    },
    {
      "q": "Define: The system of Ax = B?",
      "a": "A non-homogeneous system if 𝐵 ≠ 0."
    },
    {
      "q": "What does This mean?",
      "a": "That, if 1 0 1 1 ..."
    },
    {
      "q": "What is Of (i)?",
      "a": "Of (i) is a null matrix of order n."
    },
    {
      "q": "Define: The set of all ordered n-tuples?",
      "a": "N-space and is denoted by ℝn."
    },
    {
      "q": "What is And • 𝜉?",
      "a": "And • 𝜉 is a member of S, and k is a scalar then kξ is also a member of S."
    },
    {
      "q": "Define: • Basis of a subspace: A set of vectors?",
      "a": "A basis of a subspace, if ➢ The subspace is spanned by the set, and ➢ The set is linearly independent."
    }
  ],
  "ps": [
    {
      "q": "[P37] What is the event with zero probability?",
      "a": "The event with zero probability is called an impossible event p() = 0."
    },
    {
      "q": "[P40] What is any data with two modes?",
      "a": "Any data with two modes is called → bimodel data if 𝑥1,𝑥2,𝑥3,......,𝑥𝑛 are 'n' data points, 𝑥̄ = 𝜇= 𝑥1+𝑥2+.......+𝑥𝑛 𝑛 mean deviation of the observation (𝑥𝑖)= 𝑑𝑖 = 𝑥𝑖 − 𝑥̄"
    },
    {
      "q": "[P45] What is if 'x'?",
      "a": "If 'x' is a uniformly distrbuted random variable such that 𝑎 ≤ 𝑥 ≤ 𝑏 then the pdf is given by 𝑃(𝑥)= 1 (𝑏− 𝑎) mean = ∫ 𝑥⋅ 𝑃(𝑥)𝑑𝑥= 𝑏 𝑎 ∫ 𝑥⋅ 1 𝑏−𝑎𝑑𝑥= 1 (𝑏−𝑎) 𝑏 𝑎 ∫ 𝑥⋅ 𝑑𝑥 𝑏 𝑎 mean2 ba+ =  𝑉𝑎𝑟𝑖𝑎𝑛𝑐𝑒= 𝜎2 = (𝑏−𝑎)2 12 std."
    },
    {
      "q": "[P54] What is v1 → v2?",
      "a": "V1 → v2 is called a graph isomorphism if (a) f is one-to-one and onto, and (b) for all a, b  v1."
    },
    {
      "q": "[P55] What is ( )gg it?",
      "a": "( )gg it is a graph which is isomorphic to-its own complement."
    },
    {
      "q": "If RE is rolling a dice, what happens?",
      "a": "Getting an odd number is an Event."
    },
    {
      "q": "Define: Any Data with two Modes?",
      "a": "→ Bimodel Data If 𝑥1,𝑥2,𝑥3,......,𝑥𝑛 are 'n' data points, 𝑥̄ = 𝜇= 𝑥1+𝑥2+.......+𝑥𝑛 𝑛 Mean Deviation of the observation (𝑥𝑖)= 𝑑𝑖 = 𝑥𝑖 − 𝑥̄"
    },
    {
      "q": "Formula: (ii) Var (aX)?",
      "a": "(ii) Var (aX) = a2V(X) where X is random variable and ‘a’ constant."
    },
    {
      "q": "Formula: Mean?",
      "a": "Mean = Variance = 𝜆 ⇒ 𝜎 = √𝜆 ❑❑❑ Exponential distribution"
    }
  ],
  "dm": [
    {
      "q": "[P67] What is set with zero element?",
      "a": "Set with zero element is known as empty set or null set."
    },
    {
      "q": "[P67] What is no of elements in a set?",
      "a": "No of elements in a set is known as cardinality of set."
    },
    {
      "q": "[P71] What is {m1.a1, m2.a2 --- mnan} where m1?",
      "a": "{m1.a1, m2.a2 --- mnan} where m1 is called multiplicity of set 3.1.10 operations on multisets:"
    },
    {
      "q": "[P73] What is rn-1rn ‘n’?",
      "a": "Rn-1rn ‘n’ is a positive integer such that rn–1 = rn • when a relation is represent as a graph, if (a, b)  rn, we can say that there exists an n-length path from a to b."
    },
    {
      "q": "[P73] What is partition p2?",
      "a": "Partition p2 is called refinement of partition p1."
    },
    {
      "q": "[P73] What is each set of the partition?",
      "a": "Each set of the partition is called an equivalence class."
    },
    {
      "q": "[P75] What is a post [a;r]?",
      "a": "A post [a;r] is called toset it every pair of element of set a are comparable."
    },
    {
      "q": "[P75] What is if [a, r]?",
      "a": "If [a, r] is a poset, then [a ;"
    },
    {
      "q": "[P75] What is r–1]?",
      "a": "R–1] is called dual of the poset."
    },
    {
      "q": "[P75] What is the set of such pairs x < y?",
      "a": "Called covering relation of (s, )."
    },
    {
      "q": "[P75] What is in a poset an element?",
      "a": "In a poset an element is called maximal if it is not related to any other element."
    },
    {
      "q": "[P75] What is in a poset an element?",
      "a": "In a poset an element is called greatest if every element of the set relates to that element."
    },
    {
      "q": "[P76] What occurs in other word?",
      "a": "If ab = c then arc & brc and if ard  brd  crd 3.3.10 greatest lower bound (glb or meet or infimum) in a poset [a, r] glb of a, b is greatest element of lower bound of {a, b}."
    },
    {
      "q": "[P76] What is it?",
      "a": "It is a poset in which every pair of elements has lub."
    },
    {
      "q": "[P76] What is it?",
      "a": "It is a poset in which every pair of elements has glb."
    },
    {
      "q": "[P77] What is if a is a lattice b?",
      "a": "If a is a lattice b is called sublattice of a iff (i) b itself is a lattice."
    },
    {
      "q": "[P78] What is complemented lattice?",
      "a": "Complemented lattice is a bounded in which every element has atleast one complement."
    },
    {
      "q": "[P78] What is if l?",
      "a": "If l is a bounded distributive lattice then complement of an element if exists, is unique."
    },
    {
      "q": "[P78] What is thus when given lattice?",
      "a": "Thus when given lattice is a boolean algebra we can apply all the rules that we apply in logic."
    },
    {
      "q": "[P78] What is 1]?",
      "a": "1] is a distributive lattice for any n."
    },
    {
      "q": "[P78] What is 1]?",
      "a": "1] is a boolean lattice if n is a square free number."
    },
    {
      "q": "[P78] What is ) where s?",
      "a": ") where s is a set with n elements."
    },
    {
      "q": "[P80] What is a → a?",
      "a": "A → a is called an identity function if ia = {(x, x)/xa} 3.6.7 constant function:"
    },
    {
      "q": "[P80] What is a → c?",
      "a": "A → c is called a composition function of f & g."
    },
    {
      "q": "[P81] What is b → a?",
      "a": "B → a is a inverse of f f–1of :"
    },
    {
      "q": "[P81] What is a → b?",
      "a": "A → b is called partial function if ‘f’ is defined only for some of aa."
    },
    {
      "q": "[P81] What is the subset of a on which f?",
      "a": "Defined is called domain definition of f."
    },
    {
      "q": "[P81] What is a nonempty set a?",
      "a": "A nonempty set a is called binary structure with respect is a binary operator *, if * is binary operation on a."
    },
    {
      "q": "[P82] What is a group (g,*)?",
      "a": "A group (g,*) is called abelian if * is commutative."
    },
    {
      "q": "[P82] What is g → g’?",
      "a": "G → g’ is called a homomorphism if f(a*b) = f(a)  f(b) • if f :"
    },
    {
      "q": "[P82] What is g → g’?",
      "a": "G → g’ is a bijection, then we call the homomorphism isomorphism."
    },
    {
      "q": "[P82] What is g → g’?",
      "a": "G → g’ is a homomorphism f(a–1) = (f(a))–1"
    },
    {
      "q": "[P83] What is the order of an element?",
      "a": "Divisor of order of the group."
    },
    {
      "q": "[P83] What is if h?",
      "a": "If h is a subgroup of g then order(h) divides order(g) (lagrange’s theorem)."
    },
    {
      "q": "[P83] What is if h  g, then h?",
      "a": "If h  g, then h is called subgroup of g iff:"
    },
    {
      "q": "[P83] What is a group g?",
      "a": "A group g is called cyclic, if ag such that every element can be written as an integral power of a such an element ‘a’ is called generator."
    },
    {
      "q": "[P83] What is the order of generator?",
      "a": "Order of the group."
    },
    {
      "q": "[P83] What is if ‘a’?",
      "a": "If ‘a’ is a generator then a–1 is also a generator."
    },
    {
      "q": "Define: A function f: V1 → V2?",
      "a": "A graph isomorphism if (a) f is one-to-one and onto, and (b) for all a, b  V1."
    },
    {
      "q": "Define: In the conditional statement p → q, p?",
      "a": "The hypothesis (or antecedent or premise) and q is called the conclusion (or consequence)."
    },
    {
      "q": "Define: A compound proposition that is always false?",
      "a": "A contradiction."
    },
    {
      "q": "For Any primitive statements p, what is the rule?",
      "a": "Q, r, any tautology ‘T’ and any contradiction ‘F’."
    },
    {
      "q": "For Every a in the universe, what is the rule?",
      "a": "P(a) is false."
    },
    {
      "q": "For Every replacement a in the universe, what is the rule?",
      "a": "P(a) is true."
    },
    {
      "q": "What is xyP(x, y) For every x there?",
      "a": "xyP(x, y) For every x there is a y for which P(x, y) is true There is an x such that P(x, y) is false for every y."
    },
    {
      "q": "What is xyP(x, y) There?",
      "a": "xyP(x, y) There is a x for which P(x, y) is true for every y."
    },
    {
      "q": "What is For every x there?",
      "a": "For every x there is a y for which P(x, y) is false."
    },
    {
      "q": "Define: • Set with zero element?",
      "a": "Empty set or null set."
    },
    {
      "q": "Define: • No of elements in a set?",
      "a": "Cardinality of set."
    },
    {
      "q": "Define: A = B x (xA  xB)  A  B ^ B  A 3.1.2 Subset: • A?",
      "a": "Subset of B iff every element in A is also then in B."
    },
    {
      "q": "Define: Eg: {m1.a1, m2.a2 --- mnan} Where m1?",
      "a": "Multiplicity of set 3.1.10 Operations on multisets: • Union: Maximum of multiplicities is considered."
    },
    {
      "q": "If |A| = M and |B| = n, what happens?",
      "a": "|A × B| = mn  number of relations possible from A to B = 2mn If relation B from A to A we say it relation on A."
    },
    {
      "q": "Define: Steps?",
      "a": "Represent relation R with a directed graph such that whenever aRb draw a directed edge from a to b."
    },
    {
      "q": "What is • If R?",
      "a": "• If R is a transitive relation, • Rn  R n  1 • also Rn is transitive relation."
    },
    {
      "q": "Define: • Each set of the partition?",
      "a": "An equivalence class."
    },
    {
      "q": "What is If R?",
      "a": "If R is a equivalence relation."
    },
    {
      "q": "What is If [A, R]?",
      "a": "If [A, R] is a poset, then [A"
    },
    {
      "q": "Define: R–1]?",
      "a": "Dual of the poset."
    },
    {
      "q": "Define: It is constructed as below?",
      "a": "(i) Create vertex corresponding to every element of set A."
    },
    {
      "q": "Define: The set of such pairs x < y?",
      "a": "Covering relation of (s, )."
    },
    {
      "q": "Define: (3) Distributive Lattice: • A lattice?",
      "a": "Distributive if following distributive laws hold."
    },
    {
      "q": "What is Thus when given lattice?",
      "a": "Thus when given lattice is a Boolean algebra we can apply all the rules that we apply in logic."
    },
    {
      "q": "What is • [Dn : 1]?",
      "a": "• [Dn : 1] is a distributive lattice for any n."
    },
    {
      "q": "What is ) where s?",
      "a": ") where s is a set with n elements."
    },
    {
      "q": "What is Also this Boolean lattice?",
      "a": "Also this Boolean lattice is a hypercube Qn."
    },
    {
      "q": "Define: It is denoted as: F : A → B Here A?",
      "a": "Domain B is called codomain Function is a special type of relation."
    },
    {
      "q": "Define: • Consider f(a) = b b?",
      "a": "Image of a a is called preimage of b."
    },
    {
      "q": "What is F : A → B is invertible  f?",
      "a": "F : A → B is invertible  f is a bijection • Inverse doesn’t exist if a function is not bijection."
    },
    {
      "q": "What is If f : A → B?",
      "a": "If f : A → B is a function and S ≤ B Inverse image of S = {aA|f(a)  S} • If f is a function from A to B and let S, T be subsets of A."
    },
    {
      "q": "Define: The subset of A on which f is defined?",
      "a": "Domain definition of f."
    },
    {
      "q": "What is M-1}, m)?",
      "a": "M-1}, m) is a group • Let Sn be set of positive integers less than n and relatively prime to n."
    },
    {
      "q": "Define: • Abelian Group: A group (G,*)?",
      "a": "Abelian if * is commutative."
    },
    {
      "q": "What is • If H?",
      "a": "• If H is a subgroup of G then order(H) divides order(G) (Lagrange’s theorem)."
    },
    {
      "q": "Define: • If H  G, then H?",
      "a": "Subgroup of G iff: (i) (a*b)H a, bH (ii) a–1 H a, bH • If H  G, and if H is finite → (applies only when H is finite) and nonempty, then H is called subgroup iff: (a*b)H a, bH • If G is a subgroup of composite order, then G necessarily has non-trivial subgroup."
    },
    {
      "q": "What is • If ‘a’?",
      "a": "• If ‘a’ is a generator then a–1 is also a generator."
    },
    {
      "q": "What is the smallest subgroup of G containing a?",
      "a": "<a> where <a> = {an/nZ} Also <a> is a cyclic subgroup."
    },
    {
      "q": "What is Where each ni?",
      "a": "Where each ni is a integer with 0 ≤ ni ≤ n, for all 1 ≤ i ≤ t, and n1 + n2 + n3 + ··· + nt = n."
    },
    {
      "q": "What is the number of derangements of n ≥ 1 ordered symbol?",
      "a": "( ) n n 1 1 1 1D n!"
    },
    {
      "q": "Formula: The function f(x)?",
      "a": "The function f(x) = a0 + a1x + a2x2 + ."
    },
    {
      "q": "Define: = i i i0 ax  = ?",
      "a": "The generating function for the given sequence."
    },
    {
      "q": "For All m, what is the rule?",
      "a": "N  Z+, a  R, (1) (1 + x)n = 2nn n n n x x ..."
    },
    {
      "q": "What is When r n?",
      "a": "When r n is a solution of the associated homogeneous relation, then ( )p na = Bnrn, for B a constant."
    },
    {
      "q": "What is (b) ( )p na = Bnrn, where B?",
      "a": "(b) ( )p na = Bnrn, where B is a constant, if ( )h nn n 1 2 na c r c r=+ , where r1  r"
    },
    {
      "q": "Formula: and (c) ( )p na?",
      "a": "and (c) ( )p na = Cn2rn, for C a constant, when ( )h na = (c1 + c2n)rn."
    }
  ],
  "dl": [
    {
      "q": "[P94] What is the main purpose of a buffer?",
      "a": "To regenerate the input, usually using a strong high and a strong low."
    },
    {
      "q": "[P104] What occurs in the following circuit?",
      "a": "The find the output z?"
    },
    {
      "q": "[P105] What is it?",
      "a": "It is a way to express logic functions algebraically."
    },
    {
      "q": "[P105] What occurs in addition to these operations?",
      "a": "There are some derived operations such as nand, nor, ex-or and ex-nor that are also performed in boolean algebra."
    },
    {
      "q": "[P105] What is and operation it?",
      "a": "And operation it is a logical operation that are performed by and gate."
    },
    {
      "q": "[P109] What is min term?",
      "a": "Min term is a product term, it contains all the variables either comp lementary or un complementary form for that combination the function output must be ‘1’."
    },
    {
      "q": "[P109] What is max term?",
      "a": "Max term is a sum term , it contains all th e variables either complementary or uncomplimentary form for that combination the function output must be ‘0’."
    },
    {
      "q": "[P110] What occurs in n variable k-map?",
      "a": "There are 2n cells."
    },
    {
      "q": "[P113] What is implicants implicants?",
      "a": "Implicants implicants is a product term on the given function for that combination the function output must be 1."
    },
    {
      "q": "[P118] What is the propagation delay of full adder?",
      "a": "….."
    },
    {
      "q": "[P120] What is the carry output of each adder?",
      "a": "Connected to the carry input of the next higher order adder."
    },
    {
      "q": "[P120] What occurs in effect?",
      "a": "Carry bits must propagate or ripple through all stages before the most significant sum bit is valid."
    },
    {
      "q": "[P120] What is the method of speeding up the addition process?",
      "a": "Based on the two additional functions of the full adder called the carry generate and carry propagate functions."
    },
    {
      "q": "[P122] What is comparator the comparator?",
      "a": "Comparator the comparator is a combinational logic circuit."
    },
    {
      "q": "[P126] What is demultiplexer the demultiplexer?",
      "a": "Demultiplexer the demultiplexer is a combinational logic circuit that performs the reverse operation of a multiplexer."
    },
    {
      "q": "[P127] What is decoder a decoder?",
      "a": "Decoder a decoder is a combinational circuit that converts an n-bit binary input data into 2n output lines, such that each output line will be activated for only one of the possible combinations of inputs."
    },
    {
      "q": "[P128] What occurs in general?",
      "a": "If n and m are respectively the numbers of input and output lines, then m ≤ 2n."
    },
    {
      "q": "[P129] What is encoders an encoder?",
      "a": "Encoders an encoder is a combinational logic circuit that performs the inverse operation of a decoder."
    },
    {
      "q": "[P134] What does odd parity generation circuit consist of?",
      "a": "Odd parity generation circuit consists of combination of ex-or and ex-nor gates, whereas even priority generator consists only ex-or gates."
    },
    {
      "q": "[P135] What is the flip-flop?",
      "a": "The flip-flop is a basic element of sequential logic circuits."
    },
    {
      "q": "[P135] What occurs in synchronous circuits?",
      "a": "The change in input signals can affect memory elements upon activation of clock signal."
    },
    {
      "q": "[P135] What occurs in asynchronous circuits?",
      "a": "Change in input signals can affect memory elements at any instant of time."
    },
    {
      "q": "[P135] What occurs in synchronous circuits?",
      "a": "Memory elements are clocked ff’s."
    },
    {
      "q": "[P135] What occurs in asynchronous circuits?",
      "a": "Memory elements are either unlocked ff’s or time delay elements."
    },
    {
      "q": "[P136] What is actually, flip -slop?",
      "a": "Actually, flip -slop is a one-bit memory device and it can store either 1 or 0."
    },
    {
      "q": "[P136] What is flip -flops?",
      "a": "Flip -flops is a sequential device that changes its output only when a clocking signal is changing."
    },
    {
      "q": "[P136] What is it?",
      "a": "It refers to non-clocked flip-flops, because these flip-flops, because these flip-flops ‘latch on’ to a 1 or a 0 immediately upon receiving the input pulse."
    },
    {
      "q": "[P136] What occurs in case of a flip-flop?",
      "a": "A clock signal must be shown at input side."
    },
    {
      "q": "[P137] What is latch a latch?",
      "a": "Latch a latch is a type of bistable logic device or multivibrator that is m ost often used in applications that require data storage."
    },
    {
      "q": "[P137] What is the main characteristics of latch?",
      "a": "That the output is not dependent solely on the on the present state of the input but also on the proceeding output state."
    },
    {
      "q": "[P139] What is the application of sr latch?",
      "a": "In switch bouncing i.e."
    },
    {
      "q": "[P140] What is this triangle?",
      "a": "This triangle is called the dynamic input indicator."
    },
    {
      "q": "[P141] What is the logic circuit of the gated jk flip-flop?",
      "a": "Shown in figure below:"
    },
    {
      "q": "[P147] What occurs in serial-in?",
      "a": "Serial-out shift register, data input is in serial form and common clock pulse is applied to each of the flip-flop."
    },
    {
      "q": "[P148] What is the waveform of serial input shift register?",
      "a": "Shown below:"
    },
    {
      "q": "[P152] What occurs in a 4-stage ripple counter?",
      "a": "The propagation delay of a flip-flop is 50n sec."
    },
    {
      "q": "[P153] What is the sequence of states in a decimal counter?",
      "a": "Dictated by the binary code used to represent a decimal digit."
    },
    {
      "q": "[P154] What is the resulting circuit?",
      "a": "The resulting circuit is known as a synchronous counter."
    },
    {
      "q": "[P154] What occurs in addition to ff’s?",
      "a": "Synchronous counters require some gates also."
    },
    {
      "q": "[P154] What occurs in this?",
      "a": "Each flip-flop has two control inputs (j and k) and circuit is required to be designed for each control input."
    },
    {
      "q": "[P155] What is the number of flip-flops required?",
      "a": "3."
    },
    {
      "q": "[P156] What is the number of flip -flops required?",
      "a": "3."
    },
    {
      "q": "[P158] What is the block diagram of a moore model?",
      "a": "Given as fig."
    },
    {
      "q": "[P158] What is the systematic procedure for designing of clocked sequential circuit?",
      "a": "Based on the concept of ‘state’."
    },
    {
      "q": "[P165] What is the binary equivalent of a given decimal number?",
      "a": "Not equivalent to its bcd value."
    },
    {
      "q": "[P167] What is the 2’s complement of 100110002?",
      "a": "01101000."
    },
    {
      "q": "[P167] What is the general form of floating – point number?",
      "a": "Mre."
    },
    {
      "q": "[P167] What is the parity of a digital word?",
      "a": "Used for detecting error in digital transmission."
    },
    {
      "q": "[P167] What occurs in weighted codes?",
      "a": "Each position of the number has specific weight."
    },
    {
      "q": "[P167] What is the decimal value of a weighted code number?",
      "a": "The algebraic sum of the weights of those positions in which 1's appears."
    },
    {
      "q": "[P167] What is a code?",
      "a": "A code is called reflective or self -complimenting, if the code for 9 is the compliment for the code for 0, code for 8 is the compliment from 1 and so on."
    },
    {
      "q": "Define: NOT Operation Symbol?",
      "a": "NOT orA A A ⎯⎯⎯ → (Complementation law) and AA=  Double complementation law Truth table for NOT operation Input A Output Y = A 0 1 1 0 A NOT gate can be represented using switch whose circuit representation is shown in figure below."
    },
    {
      "q": "What is the main purpose of a buffer?",
      "a": "To regenerate the input, usually using a strong high and a strong low."
    },
    {
      "q": "Define: AND Operation Symbol?",
      "a": "A.A = A, A.0 = 0, A.1 = A, AA = 0 Truth table for AND operation: Input Output A B Y = AB 0 0 0 0 1 0 1 0 0 1 1 1 1.1.3."
    },
    {
      "q": "Define: OR Operation Symbol?",
      "a": "A + A = A, A + 0 = A, A + 1 = 1, =1A+ A Truth table for OR operation: Input Output A B Y = A+B 0 0 0 0 1 1 1 0 1 1 1 1"
    },
    {
      "q": "Define: Disable?",
      "a": "• Prevent a signal from passing when the control signal is HIGH."
    },
    {
      "q": "Define: For a two input AND gate?",
      "a": "For a two input OR gate: • Control ‘0’ disable • Control ‘1’ enable (Buffer) • Control ‘0’ enable (Buffer) • Control ‘1’ Always enable"
    },
    {
      "q": "Define: Venn Diagram?",
      "a": "NOT A A Output 0 1 1 0 AND A.B A B Output 0 0 1 1 0 1 0 1 0 0 0 1 OR A + B A B Output 0 0 1 1 0 1 0 1 0 1 1 1"
    },
    {
      "q": "Define: Types of logic gates?",
      "a": "There are three basic logic gates, namely • OR gate • AND gate • NOT gate And other logic gates that are derived from these basic gates are: • NAND gate • NOR gate • Exclusive OR gate • Exclusive NOR gate 1.2.1."
    },
    {
      "q": "Define: NAND gate?",
      "a": "The term NAND gate equivalent to AND gate followed by a NOT gate, implies NOT-AND Symbol: Truth table of 2-input NAND gate."
    },
    {
      "q": "Define: Symbol?",
      "a": "Truth Table for 2-input NOR gate Input Output A B Y = A + B 0 0 1 0 1 0 1 0 0 1 1 0"
    },
    {
      "q": "If input Vi makes an abrupt change from logic 0 to 1 at t = t0, what happens?",
      "a": "Find the output waveform V0?"
    },
    {
      "q": "Define: Axioms of Boolean Algebra?",
      "a": "Axioms of Boolean algebra are a set of logical expressions that we accept without proof and upon which we can build a set of useful theorem."
    },
    {
      "q": "What happens in Addition to these operations?",
      "a": "There are some derived operations such as NAND, NOR, EX-OR and EX-NOR that are also performed in Boolean Algebra."
    },
    {
      "q": "What is AND Operation It?",
      "a": "AND Operation It is a logical operation that are performed by AND gate."
    },
    {
      "q": "Define: NAND Operation?",
      "a": "The NAND operation in Boolean Algebra is performed by AND operation followed by NOT operation i.e., the negation of AND operation is performed by NAND gate."
    },
    {
      "q": "Define: NOR Operation?",
      "a": "The NOR operation in Boolean Algebra is performed by OR operation followed by NOT operation i.e., the negation of OR operation is performed by NOR gate."
    },
    {
      "q": "Define: Associative law?",
      "a": "This law arrows grouping of variables 1."
    },
    {
      "q": "Define: Distributive Law 1?",
      "a": "A(B + C) = AB + AC A + BC = (A + B) (A + C)"
    },
    {
      "q": "Define: Consensus theorem?",
      "a": "There are two consensus theorems AB + AC + BC = AB + AC ( )( ) ( ) ( )( )A + B A + C B + C = A + B A + C 2.3."
    },
    {
      "q": "Define: Solution?",
      "a": "Given f = ( )AB + A B Complement of f = AB + AB = AB AB ( ) ( )= A + B A + B = AA + AB + BA + BB = AB + AB Example : Show that AB + BC + AC = AC + BC Solution : LHS = AB + BC + AC ( ) ( ) ( )= AB C + C + BC A + A + A B + B C = ABC + ABC + ABC + ABC + ABC + ABC = ABC + ABC + ABC + ABC ( ) ( )= AC B + B + BC A + A = AC + BC = RHS 2.4."
    },
    {
      "q": "Define: Minimization of Boolean function?",
      "a": "Every Boolean function expression must be reduced to as simple form as possible before realization because every logic operation in the expression represents a corresponding elements of hardware."
    },
    {
      "q": "What is Karnaugh Map (K-MAP) The K-map?",
      "a": "Karnaugh Map (K-MAP) The K-map is a graphical method which provides a systematic method for simplifying the Boolean expressions."
    },
    {
      "q": "What happens in N variable K-map?",
      "a": "There are 2n cells."
    },
    {
      "q": "What is Implicants Implicants?",
      "a": "Implicants Implicants is a product term on the given function for that combination the function output must be 1."
    },
    {
      "q": "What is the carry output of each adder?",
      "a": "Connected to the carry input of the next higher order adder."
    },
    {
      "q": "Define: Propagation Delay in Parallel Adder?",
      "a": "Parallel adders suffer from propagation delay problem because higher bit additions depend on the carry generated from lower bit addition."
    },
    {
      "q": "What happens in Effect?",
      "a": "Carry bits must propagate or ripple through all stages before the most significant sum bit is valid."
    },
    {
      "q": "What is the method of speeding up the addition process?",
      "a": "Based on the two additional functions of the full adder called the carry generate and carry propagate functions."
    },
    {
      "q": "What is Comparator The comparator?",
      "a": "Comparator The comparator is a combinational logic circuit."
    },
    {
      "q": "Define: Step 2?",
      "a": "From the knowledge of the number of selection inputs of the available multiplexer and that of the desired multiplexer, connect the less significant bits of the selection inputs of the desired multiplexer to the selection inputs of the available multiplexer."
    },
    {
      "q": "Define: Step 3?",
      "a": "The most significant bits of the selection inputs of the desired multiplexer circuit are used to enable or disable the individual multiplexers so that their outputs when OR produce the final output."
    },
    {
      "q": "What does Again m = 2 n, so it require?",
      "a": "N select lines."
    },
    {
      "q": "Define: A demultiplexer with one input and m output?",
      "a": "A 1-to-m demultiplexer."
    },
    {
      "q": "Formula: Again m?",
      "a": "Again m = 2 n, so it requires n select lines."
    },
    {
      "q": "Define: A demultiplexer with one input and m outputs?",
      "a": "A 1-to-m demultiplexer."
    },
    {
      "q": "What does Since 2 = 2 × 1, it require?",
      "a": "Only one control (select) line."
    },
    {
      "q": "What happens in General?",
      "a": "If n and m are respectively the numbers of input and output lines, then m ≤ 2n."
    },
    {
      "q": "What is Encoders An encoder?",
      "a": "Encoders An encoder is a combinational logic circuit that performs the inverse operation of a decoder."
    },
    {
      "q": "What is The flip-flop?",
      "a": "The flip-flop is a basic element of sequential logic circuits."
    },
    {
      "q": "What happens in Synchronous circuits?",
      "a": "The change in input signals can affect memory elements upon activation of clock signal."
    },
    {
      "q": "What happens in Asynchronous circuits?",
      "a": "Change in input signals can affect memory elements at any instant of time."
    },
    {
      "q": "What is Latches Flip-flop?",
      "a": "Latches Flip-flop is a electronic circuit or device which is used to store a data in binary form."
    },
    {
      "q": "What is Actually, flip -slop?",
      "a": "Actually, flip -slop is a one-bit memory device and it can store either 1 or 0."
    },
    {
      "q": "What is Flip -flops?",
      "a": "Flip -flops is a sequential device that changes its output only when a clocking signal is changing."
    },
    {
      "q": "What happens in Case of a flip-flop?",
      "a": "A clock signal must be shown at input side."
    },
    {
      "q": "What is the Q output is the normal output of the latch and Q?",
      "a": "The inverted output."
    },
    {
      "q": "What is A latch?",
      "a": "A latch is a electronic sequential logic circuit used to store information in an asynchronous arrangement."
    },
    {
      "q": "What is A flip-flop?",
      "a": "A flip-flop is a electronic sequential logic circuit used to store information in a synchronous arrangement."
    },
    {
      "q": "What is Latch?",
      "a": "Latch is a asynchronous device and it has no clock input."
    },
    {
      "q": "What is Latch A latch?",
      "a": "Latch A latch is a type of bistable logic device or multivibrator that is m ost often used in applications that require data storage."
    },
    {
      "q": "What is the main characteristics of latch is that the output?",
      "a": "Not dependent solely on the on the present state of the input but also on the proceeding output state."
    },
    {
      "q": "For Example, what is the rule?",
      "a": "Data bein g input to a computer from a external source have to share the data bus with data from other sources."
    },
    {
      "q": "Define: The state table for the SR latch is?",
      "a": "S R Q Q+ +Q 0 0 0 0 1 0 0 1 1 0 0 1 0 0 1 0 1 1 0 1 1 0 0 1 0 1 0 1 1 0 1 1 0 0 1 1 1 1 0 0 The symbol for SR Latch is: Obtaining the characteristic equations of the NOR gate based latch are"
    },
    {
      "q": "Define: SR Latch?",
      "a": "An SR latch can be implemented using NAND gates, as shown in figure below Logic circuit for SR Latch The SR latch is said to be set-dominant 1, The symbol for SR latch is shown below:"
    },
    {
      "q": "Define: This triangle?",
      "a": "The dynamic input indicator."
    },
    {
      "q": "What is the logic circuit of the gated JK flip-flop?",
      "a": "Shown in figure below: Logic circuit diagram of clocked JK flip-flop."
    },
    {
      "q": "Define: Propagation Delay Time?",
      "a": "Propagation delay time is the time inte rval required after an input signal has been applied for the resulting output change to occur."
    },
    {
      "q": "Define: Master Slave Flip flop?",
      "a": "Logic Diagram for Master Slave JK Flip Flop (a) In master slave flip flop, inverted clock is given to the slave."
    },
    {
      "q": "What is (b) Master slave flip flop used for?",
      "a": "Store single bit because output is taken only from slave flip flop."
    },
    {
      "q": "Define: Step 1?",
      "a": "Write the characteristic table for the designed flip flop."
    },
    {
      "q": "Define: Step 2?",
      "a": "Write the excitation table for the available flip flop."
    },
    {
      "q": "Define: Step 3?",
      "a": "Write the logical expression."
    },
    {
      "q": "Define: Step 4?",
      "a": "Minimize the logical expression."
    },
    {
      "q": "Define: Step 5?",
      "a": "Circuit Implementation."
    },
    {
      "q": "Define: The data will be entered or retrieved in serial form?",
      "a": "Temporal code and which is in parallel form is called special code."
    },
    {
      "q": "Define: Serial Input?",
      "a": "The data in the serial form is applied at the serial input after clearing the flip-flops using CLR."
    },
    {
      "q": "What is the waveform of serial input shift register?",
      "a": "Shown below: PISO shift register"
    },
    {
      "q": "For Example, what is the rule?",
      "a": "Suppose it is necessary to transmit an n-bit quantity between two points."
    },
    {
      "q": "What is Asynchronous Counter Or Ripple Counter A circuit which used for?",
      "a": "Counting the numbers or pulses is known as counter."
    },
    {
      "q": "What is the sequence of states in a decimal counter?",
      "a": "Dictated by the binary code used to represent a decimal digit."
    },
    {
      "q": "Define: The resulting circuit?",
      "a": "A synchronous counter."
    },
    {
      "q": "What happens in Addition to FF’s?",
      "a": "Synchronous counters require some gates also."
    },
    {
      "q": "What happens in This?",
      "a": "Each FLIP-FLOP has two control inputs (J and K) and circuit is required to be designed for each control input."
    },
    {
      "q": "What is the block diagram of a Moore model?",
      "a": "Given as The systematic procedure for designing of clocked sequential circuit is based on the concept of ‘state’."
    },
    {
      "q": "What is State Diagram It?",
      "a": "State Diagram It is a directed graph, consisting of vertices (or nodes) and directed are between the nodes."
    },
    {
      "q": "Define: The state diagram is given as Example?",
      "a": "Draw the state diagram of a JK flip-flop."
    },
    {
      "q": "Define: In base conversion 2 key points are there?",
      "a": "(A) Any base to Decimal conversion (B) Decimal to any other base conversion"
    },
    {
      "q": "What is • Excess – 3 Code: This?",
      "a": "• Excess – 3 Code: This is a non weighted binary code used for decimal digits."
    },
    {
      "q": "What is the binary equivalent of a given decimal number?",
      "a": "Not equivalent to its BCD value."
    },
    {
      "q": "What is the BCO (Binary Coded Octal) value of a given Octal number?",
      "a": "Exactly equal to its straight binary value."
    },
    {
      "q": "What is the BCH (Binary Coded Hexadecimal) value of a given hexadecimal number?",
      "a": "Exactly equal to its straight binary."
    },
    {
      "q": "Define: Minuend?",
      "a": "101101 Subtracted: 100111 Difference: 000110"
    },
    {
      "q": "Define: Multiplicand?",
      "a": "1011 Multiplier: X101 1011 0000 1011 + Product: 110111 While storing the signed binary numbers in the internal registers of a digital computer} most significant bit position is always reserved for sign bit and the remaining bits are used for magnitude."
    },
    {
      "q": "Formula: Where M?",
      "a": "Where M = Mantissa, r = base, e = exponent."
    },
    {
      "q": "Define: Normalization?",
      "a": "Getting non-zero digit in the most significant digit position of the mantissa is called Normalization."
    },
    {
      "q": "What is • The parity of a digital word used for?",
      "a": "Detecting error in digital transmission."
    },
    {
      "q": "What is Hollerith code used for?",
      "a": "Punched card data."
    },
    {
      "q": "What is the decimal value of a weighted code number?",
      "a": "The algebraic sum of the weights of those positions in which 1's appears."
    },
    {
      "q": "Define: • Reflective Code: A code?",
      "a": "Reflective or self -complimenting, if the code for 9 is the compliment for the code for 0, code for 8 is the compliment from 1 and so on."
    },
    {
      "q": "Define: • Sequential Code: A code?",
      "a": "Sequential, if each successive code-is one binary number greater than its preceding code."
    }
  ],
  "coa": [
    {
      "q": "[P174] What is the length of instruction?",
      "a": "More, hence requires more than one reference."
    },
    {
      "q": "[P177] What occurs in a branch type instruction?",
      "a": "The address field specifies the actual branch address space."
    },
    {
      "q": "[P178] What occurs in this mode?",
      "a": "The address field of the instruction gives the address where the effective address is stored in memory."
    },
    {
      "q": "[P178] What is the address part?",
      "a": "The address part is a signed number (2’s complement) that can be either positive or negative."
    },
    {
      "q": "[P179] What does the instruction cycle consist of?",
      "a": "The instruction cycle consists of phases like."
    },
    {
      "q": "[P179] What occurs in general?",
      "a": "The input & output of register ri are connected to the bus via switched controlled by the signals ri in and riout ri ri out ri in b u s • when ri in is set to 1, the data on the bus are loaded into ri."
    },
    {
      "q": "[P180] What is the sequence of operations?",
      "a": "(1) r1 out, yin (2) r2 out, select y, add, zin (3) zout, r3 in • the functions performed by alu depends on the signals applied to its control lines."
    },
    {
      "q": "[P181] What is the sequence of operations?",
      "a": "(1) r1 out, mar in (2) r2out, mdrin, write (3) mdroute, wmfc 3.2.5 branch instructions • a branch instruction replaces the content of pc with the branch target address."
    },
    {
      "q": "[P187] What is the basic organization of a microprogrammed control unit?",
      "a": "Ir starting address generator upc control store cw clock • to read the control words sequentially from the control memory a “micro program counter” ( pc) is used."
    },
    {
      "q": "[P188] What is the length of control word?",
      "a": "Large, need to access more than once from control memory."
    },
    {
      "q": "[P189] What is the length of micro instruction?",
      "a": "Small."
    },
    {
      "q": "[P190] What is the purpose of memory hierarchy?",
      "a": "To bridge the speed mismatch between the fastest processor to the slowest memory component at reasonable cost."
    },
    {
      "q": "[P193] What is the operating modes of peripherals?",
      "a": "Different and must be controlled."
    },
    {
      "q": "[P194] What occurs in this configuration?",
      "a": "Only one set of read & write signals and do not distinguish b/n memory & i/o addresses."
    },
    {
      "q": "[P194] What occurs in programmed i/o?",
      "a": "The i/o device doesn’t have direct access to memory."
    },
    {
      "q": "[P195] What is it?",
      "a": "It is a system that establishes a priority over the vari ous sources to determine which condition is to be serviced first when two or more requests arrive simultaneously."
    },
    {
      "q": "[P196] What is this kind of transfer technique?",
      "a": "This kind of transfer technique is called dma transfer during dma transfer the cpu is idle and has no control of the memory buses."
    },
    {
      "q": "[P197] What occurs in this mode?",
      "a": "Dma controller transfers one word at a time, after which it must return control of the buses to the cpu, later it will ‘steal’ memory cycle when cpu is idle."
    },
    {
      "q": "[P199] What is the purpose of parallel processing?",
      "a": "To speed up the computer processing capability and increases its throughput."
    },
    {
      "q": "[P199] What is 7.2 pipelining • pipelining?",
      "a": "7.2 pipelining • pipelining is a technique of decomposing a sequential process into sub operations, with each sub process being executed in a special dedicated segment that operates concurrently with all other segments."
    },
    {
      "q": "[P201] What does each segment consist of?",
      "a": "Each segment consists of combinational circuit si that performs a sub operation."
    },
    {
      "q": "[P203] What is the objective of pipelines?",
      "a": "Cpiavg = 1."
    },
    {
      "q": "[P205] What does this mean?",
      "a": "This means that the resu lts generated by i 1 may not be available for use by i 2."
    },
    {
      "q": "[P206] What is the result of the multiply instruction?",
      "a": "Placed into register r4."
    },
    {
      "q": "[P207] What occurs in the next clock cycle?",
      "a": "The product produced by instruction i1 is available in register rslt, and because of the forwarding connection, it can be used in step e2."
    },
    {
      "q": "[P207] What occurs in this case?",
      "a": "The compiler can introduce the two -cycle delay needed between instructions i 1 and i2 by inserting nop (no - operation) instructions, as follows:"
    },
    {
      "q": "[P207] What occurs in clock cycle 3?",
      "a": "The fetch operation for instruction i 3 is in progress at the same time that the branch instruction is being decoded and the target address computed."
    },
    {
      "q": "[P207] What occurs in clock cycle 4?",
      "a": "The processor mu st discard i3, which has been incorrectly fetched, and fetch instruction i h."
    },
    {
      "q": "[P207] What occurs in the meantime?",
      "a": "The hardware unit responsible for the execute (e) step must be told to do nothing during that clock period."
    },
    {
      "q": "[P207] What occurs in figure?",
      "a": "The branch penalty is one clock cycle."
    },
    {
      "q": "[P208] What occurs in this case?",
      "a": "The branch penalty is only one clock cycle."
    },
    {
      "q": "[P210] What occurs in fact?",
      "a": "They represent about 20 percent of the dynamic instruction count of most programs."
    },
    {
      "q": "[P210] What is the location following a branch instruction?",
      "a": "The location following a branch instruction is called a branch delay slot."
    },
    {
      "q": "[P211] What is the simplest form of branch prediction?",
      "a": "To assume that the branch will not take place and to continue to fetch instructions in sequential address order."
    },
    {
      "q": "[P211] What does speculative execution mean?",
      "a": "Speculative execution means that instructions are executed before the processor is cert ain that they are in the correct execution sequence."
    },
    {
      "q": "[P212] What occurs in dynamic branch prediction schemes?",
      "a": "The processor hardware assesses the likelihood of a given branch being taken by keeping track of branch decision every time that instruction is executed."
    },
    {
      "q": "[P212] What occurs in its simplest form?",
      "a": "The execution history used in predicting the outcome of a given branch instruction is the result of the most recent execution of that instruction."
    },
    {
      "q": "[P212] What occurs in this section?",
      "a": "We examine the relationship between pipelined execution and machine instruction features."
    },
    {
      "q": "[P212] What occurs in doing so?",
      "a": "The compiler must ensure that reordering does not cause a change in the outcome of a comp utation."
    },
    {
      "q": "[P214] What does it mean?",
      "a": "It means that recently executed instruction is likely to be executed again very soon."
    },
    {
      "q": "[P214] What does it mean?",
      "a": "It means that instructions in close proximity to cl recently executed instruction, example:"
    },
    {
      "q": "[P214] What is the performance of cache?",
      "a": "Measured using hit ratio 0 hit ratio hit ratio no."
    },
    {
      "q": "[P216] What is the contention problem of the direct mapped method?",
      "a": "Eased by having a few choices for block placement."
    },
    {
      "q": "[P218] What occurs in this method?",
      "a": "Only the cache location is updated during a write operation."
    },
    {
      "q": "[P219] What does the static ram consist of?",
      "a": "The static ram consists of interval flip flops that store the binary information."
    },
    {
      "q": "[P222] What does the head consist of?",
      "a": "The head consists of a magnetic yoke and the magnetizing coil."
    },
    {
      "q": "[P224] What is the start and end of each sector?",
      "a": "Determined by the control data stored in the sector."
    },
    {
      "q": "[P231] What is the sign of the result for modulo operator?",
      "a": "Machine dependent."
    },
    {
      "q": "[P231] What is the result of assignment statement?",
      "a": "The value we are assigning i.e…… int x;"
    },
    {
      "q": "[P232] What occurs in case of logical or operation?",
      "a": "The second operand is not evaluated if the first operand is evaluated as true."
    },
    {
      "q": "[P235] What is (b) expression – 2?",
      "a": "(b) expression – 2 is a expression that determines whether to terminate the loop."
    },
    {
      "q": "[P236] What occurs in implementation?",
      "a": "When we know the m aximum number of repetition but some condition is there, where we require to terminate the repetition process, then use break statement."
    },
    {
      "q": "[P239] What occurs in general?",
      "a": "For recursion to be non-cyclic whenever a function calls itself the formal arguments must get closer to the base argument."
    },
    {
      "q": "[P239] What occurs in this scoping?",
      "a": "The binding of a variable can be determined by the program text."
    },
    {
      "q": "[P243] What occurs in such case?",
      "a": "There is no requirement to define the size."
    },
    {
      "q": "[P245] What occurs in previous 2 programs?",
      "a": "We passed an address & formal argument in both the cases is a pointer internally."
    },
    {
      "q": "[P248] What occurs in declaration?",
      "a": "We can not write int 3[a];"
    },
    {
      "q": "[P249] What is it?",
      "a": "It is a pointer which is pointing to nothing it is a specially designed pointer that stores a defined value but not a valid address of any element or object."
    },
    {
      "q": "[P249] What is void pointer?",
      "a": "Void pointer is a pointer that points to some location in memory but is does not have any specific type."
    },
    {
      "q": "[P249] What is is saying that ptr?",
      "a": "Is saying that ptr is a pointer that can hold an address cannot be dereferenced directly i.e., void *ptr int x = 10:"
    },
    {
      "q": "[P250] What is p?",
      "a": "P is a pointer to an array of 10 integers 3."
    },
    {
      "q": "[P250] What is p?",
      "a": "P is a pointer to a function that takes 2 integer arguments and returns an integer."
    },
    {
      "q": "[P250] What is p?",
      "a": "P is a pointer to a function that takes a pointer to character argument and return a pointer to integer."
    },
    {
      "q": "[P250] What is int(*p)(int, int) p?",
      "a": "Int(*p)(int, int) p is a pointer to a function that take 2 integer arguments and returns an integer value."
    },
    {
      "q": "Formula: If the stack is not full (if FULL?",
      "a": "If the stack is not full (if FULL = 0), a new item is inserted."
    },
    {
      "q": "What does • The length of instruction is more, hence require?",
      "a": "More than one reference."
    },
    {
      "q": "What is • The address part?",
      "a": "• The address part is a signed number (2’s complement) that can be either positive or negative."
    },
    {
      "q": "Define: Indexed Addressing mode?",
      "a": "In this mode the content of an index register is added to the address part of the instruction."
    },
    {
      "q": "Define: Base register Addressing mode?",
      "a": "In this mode the content of a base register is added to the address part of the instruction."
    },
    {
      "q": "What does The instruction cycle consist of?",
      "a": "Phases like."
    },
    {
      "q": "What is A counter used for?",
      "a": "Keep track of the control steps."
    },
    {
      "q": "Define: For example?",
      "a": "(1) The encoder circuit implements the following logic function to generate Yin."
    },
    {
      "q": "What is • A control word (CW)?",
      "a": "• A control word (CW) is a word whose individual bits represent the various control signals."
    },
    {
      "q": "What is the purpose of memory hierarchy?",
      "a": "To bridge the speed mismatch between the fastest processor to the slowest memory component at reasonable cost."
    },
    {
      "q": "Define: Capacity?",
      "a": "Word size, number of words i.e."
    },
    {
      "q": "Formula: capacity?",
      "a": "capacity = number of words * word size."
    },
    {
      "q": "Define: Unit of transfer?",
      "a": "Maximum number of bits that can be read or written (blocks, bytes…) Access method: Random or sequential"
    },
    {
      "q": "Define: Physical?",
      "a": "Volatile / non volatile erasable / non erasable • When processor reads Ith level memory, if it is found in that level, his will occur otherwise it will be fault."
    },
    {
      "q": "Formula: (strict hierarchy) Tavg?",
      "a": "(strict hierarchy) Tavg = H1 * T1 + (1–H1) * (T2 + T1) 5.2.2."
    },
    {
      "q": "What does A transfer from I/o device to memory require?",
      "a": "The CPU to extents several instruction."
    },
    {
      "q": "Define: This kind of transfer technique?",
      "a": "DMA transfer during DMA transfer the CPU is idle and has no control of the memory buses."
    },
    {
      "q": "What does • Each segment consist of?",
      "a": "Combinational circuit Si that performs a sub operation."
    },
    {
      "q": "What does • To complete n – tasks using a K – segment pipeline require?",
      "a": "K + (n–1) clock cycles."
    },
    {
      "q": "What does This mean?",
      "a": "That the resu lts generated by I 1 may not be available for use by I 2."
    },
    {
      "q": "Define: Fig?",
      "a": "Pipeline stalled by data dependency between D2 and W1 • This example illustrates a basic constraint that must be enforced to guarantee correct results."
    },
    {
      "q": "What is the result of the multiply instruction?",
      "a": "Placed into register R4."
    },
    {
      "q": "What happens in Clock cycle 4?",
      "a": "The processor mu st discard I3, which has been incorrectly fetched, and fetch instruction I h."
    },
    {
      "q": "What happens in The meantime?",
      "a": "The hardware unit responsible for the Execute (E) step must be told to do nothing during that clock period."
    },
    {
      "q": "What happens in Figure?",
      "a": "The branch penalty is one clock cycle."
    },
    {
      "q": "For A longer pipeline, what is the rule?",
      "a": "The branch penalty may be higher."
    },
    {
      "q": "For Example, what is the rule?",
      "a": "Figure shows the effect of a branch"
    },
    {
      "q": "What does • Reducing the branch penalty require?",
      "a": "The branch address to be computed earlier in the pipeline."
    },
    {
      "q": "What happens in This case?",
      "a": "The branch penalty is only one clock cycle."
    },
    {
      "q": "Define: Fig?",
      "a": "Use of an instruction queue in the hardware organization of fig (b)"
    },
    {
      "q": "What happens in Fact?",
      "a": "They represent about 20 percent of the dynamic instruction count of most programs."
    },
    {
      "q": "Define: The location following a branch instruction?",
      "a": "A branch delay slot."
    },
    {
      "q": "For Example, what is the rule?",
      "a": "There are two branch delay slots in Figure and one delay slot in Figure."
    },
    {
      "q": "What is the simplest form of branch prediction?",
      "a": "To assume that the branch will not take place and to continue to fetch instructions in sequential address order."
    },
    {
      "q": "What does Speculative execution mean?",
      "a": "That instructions are executed before the processor is cert ain that they are in the correct execution sequence."
    },
    {
      "q": "For Example, what is the rule?",
      "a": "Instruction side effects can lead to undesirable data dependencies."
    },
    {
      "q": "What happens in This section?",
      "a": "We examine the relationship between pipelined execution and machine instruction features."
    },
    {
      "q": "What happens in Doing so?",
      "a": "The compiler must ensure that reordering does not cause a change in the outcome of a comp utation."
    },
    {
      "q": "What does Temporal: It mean?",
      "a": "That recently executed instruction is likely to be executed again very soon."
    },
    {
      "q": "What does Spatial: It mean?",
      "a": "That instructions in close proximity to Cl recently executed instruction, Example: loops, nested loops, procedure calls."
    },
    {
      "q": "If they match, what happens?",
      "a": "The desired word is in that block of cache."
    },
    {
      "q": "If there is no match, what happens?",
      "a": "Miss will occur."
    },
    {
      "q": "What is Where n?",
      "a": "Where n is the number of cache blocks."
    },
    {
      "q": "What does The static RAM consist of?",
      "a": "Interval flip flops that store the binary information."
    },
    {
      "q": "What does The head consist of?",
      "a": "A magnetic yoke and the magnetizing coil."
    },
    {
      "q": "Define: Rotational Delay?",
      "a": "The time taken for the beginning of sector to reach."
    },
    {
      "q": "What is • Let L is the length of the tape, • N?",
      "a": "• Let L is the length of the tape, • N is the number of parallel tracks, • P is the constant recording density."
    },
    {
      "q": "Formula: Tss?",
      "a": "Tss = time to start and stop the tape."
    },
    {
      "q": "What is • Logical NOT?",
      "a": "• Logical NOT is a unary operator • Logical NOT converts a non-zero operand into 0 and a zero operand in 1."
    },
    {
      "q": "Define: Example1?",
      "a": "Void main () { printf (“Hello”) || printf (“Pankaj”)"
    },
    {
      "q": "What does :) • It require?",
      "a": "3 operands i.e., Left, Middle, Right Left ?"
    },
    {
      "q": "Define: Middle?",
      "a": "Right • If left expression evaluates as true, then the value returned is middle argument otherwise the returned value is Right expression int a"
    },
    {
      "q": "Define: followed by?",
      "a": "Not immediately but following."
    },
    {
      "q": "What is (b) expression – 2?",
      "a": "(b) expression – 2 is a expression that determines whether to terminate the loop."
    },
    {
      "q": "If the controlling expression is false (zero), what happens?",
      "a": "The while statement terminates."
    },
    {
      "q": "Define: • A set of values stored for a function?",
      "a": "As stack frame which atleast contain return address."
    },
    {
      "q": "Define: Example 1?",
      "a": "Consider the factorial code: int factorial (int n) { if (n = = 0) return 1"
    },
    {
      "q": "What happens in This scoping?",
      "a": "The binding of a variable can be determined by the program text."
    },
    {
      "q": "Define: The order of function calls is?",
      "a": "Main () calling⎯⎯⎯⎯ → f() calling⎯⎯⎯⎯ → g() g() is printing i, which is not present inside current block."
    },
    {
      "q": "Define: Declaration of C Array Syntax?",
      "a": "Example: Initialization of C array: We can initialize each element of the array by using the index."
    },
    {
      "q": "Define: C Array Example?",
      "a": "# include <stdio.h> int main () { int i = 0"
    },
    {
      "q": "What happens in Previous 2 programs?",
      "a": "We passed an address & formal argument in both the cases is a pointer internally."
    },
    {
      "q": "Define: invalid Note?",
      "a": "• while declaring an array, it is mandatory to provide the size of each dimension."
    },
    {
      "q": "Define: Dangling pointer?",
      "a": "The pointer pointing to a deallocated memory block is known as dangling pointer."
    },
    {
      "q": "What is // a?",
      "a": "// a is a local variable and goes out of scope after execution of f( ) return &a : } int main () { int * ptr = f ()"
    },
    {
      "q": "Define: NULL pointer?",
      "a": "It is a pointer which is pointing to nothing It is a specially designed pointer that stores a defined value but not a valid address of any element or object."
    },
    {
      "q": "What is Void pointer: void pointer?",
      "a": "Void pointer: void pointer is a pointer that points to some location in memory but is does not have any specific type."
    },
    {
      "q": "Define: Its declaration?",
      "a": "Void *ptr : is saying that ptr is a pointer that can hold an address cannot be dereferenced directly i.e., void *ptr int x = 10: 100 10 100 aPtr"
    },
    {
      "q": "What is Int *(P[10]) : P?",
      "a": "Int *(P[10]) : P is a array of 10 pointer to integer 2."
    },
    {
      "q": "What is Int (*P)[10] : P?",
      "a": "Int (*P)[10] : P is a pointer to an array of 10 integers 3."
    },
    {
      "q": "What is Int (*P) (int, int) : P?",
      "a": "Int (*P) (int, int) : P is a pointer to a function that takes 2 integer arguments and returns an integer."
    },
    {
      "q": "What is Int *P (char*) : P?",
      "a": "Int *P (char*) : P is a pointer to a function that takes a pointer to character argument and return a pointer to integer."
    },
    {
      "q": "What is Int(*p)(int, int) P?",
      "a": "Int(*p)(int, int) P is a pointer to a function that take 2 integer arguments and returns an integer value."
    }
  ],
  "pds": [
    {
      "q": "[P262] What occurs in simple queue?",
      "a": "Even though space is available, we are not able to insert a new element and declaring it a overflow."
    },
    {
      "q": "Define: For example?",
      "a": "If the function is int add(int, int) Declaration of a fuction pointer for add() fuction is : int (*ptr)(int, int)"
    },
    {
      "q": "What is // ptr?",
      "a": "// ptr is a pointer to add() function printf (“The sum of 10 and 20 is”, (*ptr )(10, 20))"
    },
    {
      "q": "Define: Ex 2?",
      "a": "Void main() { int (*ptr) (int, int)"
    },
    {
      "q": "Define: Syntax?",
      "a": "Char str_name[size]"
    },
    {
      "q": "Define: Structure of a Node?",
      "a": "Struct Node { struct Node * Prev"
    },
    {
      "q": "What happens in Simple queue?",
      "a": "Even though space is available, we are not able to insert a new element and declaring it a overflow."
    },
    {
      "q": "Define: Consider the following functions?",
      "a": "F (n) = ½ 1 n P P =  = q Find the value of q in terms of asymptotic notation."
    },
    {
      "q": "Define: Recursive Algorithm Analysis Example 1?",
      "a": "Void fun (in + n) T(n) { if (n > 0) 1 compare"
    },
    {
      "q": "Formula: T (n)?",
      "a": "T (n) = 2T 2 n + (n)0log n Solution."
    },
    {
      "q": "Formula: a?",
      "a": "a = 2, b = 2, k = 1, p = 0 T(n) = Θ (n ⸳log n) Question 3."
    },
    {
      "q": "Formula: T(n)?",
      "a": "T(n) = 2  + T log2 n nn Solution."
    }
  ],
  "algo": [
    {
      "q": "[P296] What occurs in quick for sorting n elements?",
      "a": "The th 16 n  smallest element is selected as pivot."
    },
    {
      "q": "[P306] What is this?",
      "a": "This is a decision problem (true/false)."
    },
    {
      "q": "[P314] What is it?",
      "a": "It is a subset of *  *l  • a language is a collection of strings that must be a subset of * where * is a universal language."
    },
    {
      "q": "[P322] What is o it?",
      "a": "O it is a kind of declarative way to represents a regular language."
    },
    {
      "q": "Define: Time Complexity?",
      "a": "T(n) = O(n2) Space complexity: Space Complexity = O(n) 2.9 Strassen’s matrix Multiplication"
    },
    {
      "q": "Define: A sub graph G(‘V, E’) of G(V, E)?",
      "a": "Spanning tree."
    },
    {
      "q": "What is • This?",
      "a": "• This is a decision problem (True/False)."
    },
    {
      "q": "Define: Any small thing that never be broken into any other?",
      "a": "As symbol."
    },
    {
      "q": "Define: Length of a string: Length of a string is denoted as |w| and?",
      "a": "The number of positions for the symbol in the string."
    },
    {
      "q": "Define: Reversal of a string?",
      "a": "It will reverse or changes the order of a given string w."
    },
    {
      "q": "Define: Type 3 Type 2 Type 1 Type 0 Language?",
      "a": "Regular Context free Context sensitive Recursively Enumerable Automata: Finite Automata Push down Automata Linear Bounded Automata Turing Machine Grammar: Regular Context free Context Sensitive Unrestricted 1.6 Language • Language is set of strings defined over alphabet ()."
    },
    {
      "q": "Define: Less power?",
      "a": "It can Represent less number of languages."
    },
    {
      "q": "Define: More power?",
      "a": "It can Represent more number of languages Compare to all these machines."
    },
    {
      "q": "If epsilon belongs to L, what happens?",
      "a": "Initial state must be final in DFA."
    },
    {
      "q": "Define: Dead state?",
      "a": "It is non-final state but it never contain a path to final."
    },
    {
      "q": "Formula: If all states are finals in DFA then L(DFA)?",
      "a": "If all states are finals in DFA then L(DFA) =  * 4."
    },
    {
      "q": "What does • Start condition, exactly, atmost length question require?",
      "a": "Dead state but end condition, contain substring, atleast length questions do not require dead state."
    },
    {
      "q": "Formula: Then Number of states in DFA?",
      "a": "Then Number of states in DFA = m×n."
    },
    {
      "q": "Define: Note?",
      "a": "For every regular language: (i) Unique minimum DFA exists."
    },
    {
      "q": "What is O It?",
      "a": "O It is a kind of declarative way to represents a regular language."
    },
    {
      "q": "Formula: L?",
      "a": "L = {anbm |n, m  0} = a*b* (Regular language) 2."
    },
    {
      "q": "Formula: L?",
      "a": "L = {aPrime} over  = {a} = Non regular language 15."
    },
    {
      "q": "Define: Closure properties for finite languages?",
      "a": "2.18 Table for FINITE sets Finite sets Closed/Not Closed (1) Union () F1  F2  Finite  (2) Intersection () F1  F2  Finite  (3) Complement ( L ) F  NOT finite  (4) L1 – L2 F1 – F2  Finite  (5) L1."
    },
    {
      "q": "What is S → Aa A → b By default S?",
      "a": "S → Aa A → b By default S is a start symbol here."
    },
    {
      "q": "Formula: Look from bottom to top L?",
      "a": "Look from bottom to top L = {aa, bb} 8."
    }
  ],
  "toc": [
    {
      "q": "[P342] What is it?",
      "a": "It is a tm that always halts for every input."
    },
    {
      "q": "[P342] What is if tm always halts, then tm?",
      "a": "If tm always halts, then tm is called as htm."
    },
    {
      "q": "Define: Linear Derivation?",
      "a": "Linear derivation is two types (a) Left Most Derivation (LMD) (b) Right Most Derivation (RMD) 2."
    },
    {
      "q": "Define: Non- linear Derivation?",
      "a": "Non- linear Derivation OR Parse Tree OR Derivation Tree 3.2 Types of Context Free Grammars There are two types of CFG: 1."
    },
    {
      "q": "Define: Ambiguous CFG?",
      "a": "At least one string has more than one derivation."
    },
    {
      "q": "Define: Unambiguous CFG?",
      "a": "Every string (w) generated by CFG has exactly one derivation."
    },
    {
      "q": "Define: LBA?",
      "a": "It is HTM but length of the tape we use linearly bounded."
    },
    {
      "q": "If TM always halts, what happens?",
      "a": "TM is called as HTM."
    },
    {
      "q": "Define: Union?",
      "a": "REL  Finite  REL REL  Regular  REL REL  CFL  REL REL  Recursive  REL REL1  REL2  REL 2."
    },
    {
      "q": "Define: Intersection?",
      "a": "REL  Finite  REL (Finite) REL  CFL  REL REL  Rec  REL REL1  REL2  REL 4.11 Closure Properties of Recursive languages I."
    },
    {
      "q": "Define: Lexical Analyzer?",
      "a": " Program of DFA, it checks for spelling mistakes of program."
    },
    {
      "q": "Define: Syntax Analyzer?",
      "a": " Checks grammatical errors of the program (Parser)."
    },
    {
      "q": "Define: Semantic Analyzer?",
      "a": "Checks for meaning of the program."
    },
    {
      "q": "Define: Intermediate Code Generation?",
      "a": " This phase makes the work of next 2 phases much easier."
    },
    {
      "q": "Define: Code optimization?",
      "a": " Loop invariant construct  Common sub expression elimination  Strength Reduction  Function in lining Deadlock elimination 6."
    },
    {
      "q": "Define: Symbol Table?",
      "a": "(1) Data about Data (Meta data) (2) Data structure used by compiler and shared by all the phrase."
    },
    {
      "q": "Formula: No of Rows?",
      "a": "No of Rows = number of unique variable in Grammar."
    },
    {
      "q": "Formula: No of columns?",
      "a": "No of columns = [Terminals + $] 3."
    },
    {
      "q": "Define: Question?",
      "a": "Construct LL (1) Parsing Table for the given Grammar: E  E + T | T"
    },
    {
      "q": "Define: Except?",
      "a": "Operator precedence, parser possible for some ambiguous grammar."
    },
    {
      "q": "If CLR (1) doesn’t have any conflict, what happens?",
      "a": "Conflict may or may not arise after merging in LALR (1)."
    },
    {
      "q": "If LALR (1) has SR – conflict, what happens?",
      "a": "We can conclude that CLR (1) also has SR – Conflict."
    }
  ],
  "cd": [
    {
      "q": "[P379] What is the secondary goal of the operating system?",
      "a": "The efficient use of the computer resources."
    },
    {
      "q": "[P380] What is multi-tasking?",
      "a": "Multi-tasking is a logical extension of multi-programming systems."
    },
    {
      "q": "[P380] What is the advantage of multi-tasking systems?",
      "a": "Good response time."
    },
    {
      "q": "[P382] What is a program under execution?",
      "a": "A program under execution is called a process."
    },
    {
      "q": "[P384] What is context switching?",
      "a": "Context switching refers to saving the context of the process which was being executed by the cpu and loading the context of the new process that is being scheduled to be executed by the cpu."
    },
    {
      "q": "[P386] What is  there?",
      "a": " there is a chance of starvation."
    },
    {
      "q": "[P388] What is aging?",
      "a": "Aging is a technique which automatically increases the priority of the processes that have been waiting in the system for a very long time.                    "
    },
    {
      "q": "[P394] What is this type of condition?",
      "a": "This type of condition is called as race condition."
    },
    {
      "q": "[P401] What is  mutex?",
      "a": " mutex is a binary semaphore used by the readers in mutual exclusive manner."
    },
    {
      "q": "[P403] What is  monitors?",
      "a": " monitors is a programming language compiler support type of solution to achieve synchronization."
    },
    {
      "q": "[P408] What is 7.3.1 loading it?",
      "a": "7.3.1 loading it is defined as bringing the program from the secondary to the main memory."
    },
    {
      "q": "[P409] What is operating systems 9.31 7.3.2 linking linking?",
      "a": "Operating systems 9.31 7.3.2 linking linking is the process of collecting and combining various pieces of code and data into a single file that can be loaded (copied) into memory and executed."
    },
    {
      "q": "[P410] What occurs in paging?",
      "a": "The frame size is equal to the page size."
    },
    {
      "q": "Define: Equivalent SSA Code?",
      "a": "X = u – t y = x * v p = y + w q = t – x r = p * q in use: x, y, p, q, r  additional  Total Variable  10."
    },
    {
      "q": "Define: Strength Reduction?",
      "a": "Replace expensive statement / instruction with cheaper one."
    },
    {
      "q": "Formula: Much Cheaper (iii) x?",
      "a": "Much Cheaper (iii) x = y / 8  x = y > > 3"
    },
    {
      "q": "Define: Dead Code Elimination?",
      "a": "• Hence, above dead code never executes during execution."
    },
    {
      "q": "What is Common Sub Expression Elimination: DAG used for?",
      "a": "Eliminate common sub expression."
    },
    {
      "q": "Define: Loop Optimization?",
      "a": "(i) Code Motion – Frequency Reduction: Move the loop invariant code outside of loop."
    },
    {
      "q": "Define: Peephole Optimization?",
      "a": "Examines a short sequence of target instructions in a window (peephole) and replaces the instructions by a faster and/or shorter sequence when possible."
    },
    {
      "q": "What does • If the job in execution require?",
      "a": "An I/O operation, another job which is ready for execution is scheduled on the CPU."
    },
    {
      "q": "What is • Multi-tasking?",
      "a": "• Multi-tasking is a logical extension of multi-programming systems."
    },
    {
      "q": "What is The mode bit used for?",
      "a": "Determine the particular mode in which an instruction is executing."
    },
    {
      "q": "Define: Mode bit?",
      "a": "0 Kernel mode Mode bit: 1 User mode • A process running in kernel mode has direct access to the hardware and full access to the machine instruction set."
    },
    {
      "q": "Define: A program under execution?",
      "a": "A process."
    },
    {
      "q": "Define: Context switching?",
      "a": "Saving the context of the process which was being executed by the CPU and loading the context of the new process that is being scheduled to be executed by the CPU."
    },
    {
      "q": "Define: For example?",
      "a": "P1 P2 P3 0 10 12 17 23  Process P1 started execution at time t = 0 and finished just before time t = 10."
    },
    {
      "q": "If two or more processes have the same arrival times, what happens?",
      "a": "The processes are assigned based on their process ids."
    },
    {
      "q": "If two or more processes have the same burst times, what happens?",
      "a": "The processes are assigned to the CPU based on their arrival times."
    },
    {
      "q": "What is  There?",
      "a": " There is a chance of starvation."
    },
    {
      "q": "If the kernel thread is single threaded, what happens?",
      "a": "Blocking the kernel thread will block the whole process."
    },
    {
      "q": "What is  Security: Since, there?",
      "a": " Security: Since, there is a extensive sharing among threads, there is a potential problem of security."
    },
    {
      "q": "What is Store m[count], Rc  IN?",
      "a": "Store m[count], Rc  IN is a variable used by the producer to identify the next empty slot in the buffer."
    },
    {
      "q": "What is  OUT?",
      "a": " OUT is a variable used by the consumer to identify from where it has to consume the item."
    },
    {
      "q": "What is Operating Systems 9.15  Count?",
      "a": "Operating Systems 9.15  Count is a variable used both producer and consumer to identify no of items present in the buffer at any point of time."
    },
    {
      "q": "Define: Analysis?",
      "a": "Itemp = ‘A’ count Itemc = ‘X’ 3 2 4 P  I Rp 3 in 3 4 out 0 1 P  II Rp 3 4 C  I C  II Rc 3 2 C  III P  III Final count value = 4."
    },
    {
      "q": "Define: This type of condition?",
      "a": "As RACE condition."
    },
    {
      "q": "Define: Software Type?",
      "a": "(a) Lock Variables (b) Strict alteration or Decker’s Algorithm (c) Petersons Algorithm II."
    },
    {
      "q": "Define: Hardware Type?",
      "a": "(a) TSL Instruction Set (b) Test and Set Lock III."
    },
    {
      "q": "Define: Software Types?",
      "a": "(a) Lock Variables: Entry Section: I."
    },
    {
      "q": "Formula: interested [process]?",
      "a": "interested [process] = TRUE"
    },
    {
      "q": "Formula: while (turn?",
      "a": "while (turn = = process && interested [other] = = TRUE)"
    },
    {
      "q": "What is Interested [1] = FALSE TURN?",
      "a": "Interested [1] = FALSE TURN is a shared variable used by both the processes P0 and P1, interested [N] is also shared by both the processes."
    },
    {
      "q": "Define: Semaphore is categorised into 2 types?",
      "a": "The two different operations will be performed on the semaphore variable."
    },
    {
      "q": "Formula: in?",
      "a": "in = (in + 1) mod N up(mutex)"
    },
    {
      "q": "What is } }  mutex?",
      "a": "} }  mutex is a binary semaphore used by the producer and consumer to access the buffer in a mutual exclusive manner."
    },
    {
      "q": "What is  mutex?",
      "a": " mutex is a binary semaphore used by the readers in mutual exclusive manner."
    },
    {
      "q": "What is  db?",
      "a": " db is a binary semaphore variable used by readers and writers in a mutual exclusive manner."
    },
    {
      "q": "Define: Signal operation?",
      "a": "Signal ()  Wait () Ex – x.wait ()"
    },
    {
      "q": "Formula: If available [j]?",
      "a": "If available [j] = k, there are k instances of resource type Rj available."
    },
    {
      "q": "If Max [i,j] = k, what happens?",
      "a": "Process Pi may request at most k instances of resource type Rj."
    },
    {
      "q": "If Need[i,j] = k, what happens?",
      "a": "Pi may need k more instances of Rj to complete its task."
    },
    {
      "q": "Formula: Allocation?",
      "a": "Allocation = Allocation + Needi"
    },
    {
      "q": "If the system is in safe state, what happens?",
      "a": "Grant the Needi"
    },
    {
      "q": "Define:  The address perceived by the memory unit?",
      "a": "Physical address."
    },
    {
      "q": "Define: It is classified into three types?",
      "a": "(i) Absolute Loading  A given program is always loaded into the same memory location whenever loaded for execution."
    },
    {
      "q": "Define: (iii) Dynamic Loading  Routine is not loaded until it?",
      "a": "Better memory-space utilization (unused routine is never loaded , postponed until execution time)."
    },
    {
      "q": "Define: It is classified into two types?",
      "a": " Static Linking Static linkers take as input a collection of relocatable object files and command -line arguments and generate as output a fully linked executable object file that can be loaded and run."
    },
    {
      "q": "What happens in Paging?",
      "a": "The frame size is equal to the page size."
    }
  ],
  "os": [
    {
      "q": "[P411] What is the advantage of inverted paging?",
      "a": "The increased lookup time and hard to implement."
    },
    {
      "q": "[P412] What is the number of entries in the segment table?",
      "a": "Equal to the number of segments of a process."
    },
    {
      "q": "[P415] What is this situation?",
      "a": "This situation is called belady's anomaly."
    },
    {
      "q": "[P416] What is this phenomenon?",
      "a": "This phenomenon is called ‘thrashing’."
    },
    {
      "q": "[P416] What is 8.3.5 working set model it?",
      "a": "8.3.5 working set model it is defined as the set of the unique pages referred during the past ‘∆’ references."
    },
    {
      "q": "What is the number of entries in the segment table?",
      "a": "Equal to the number of segments of a process."
    },
    {
      "q": "Define:  The time taken to service a ‘page fault’?",
      "a": "‘page fault service time’."
    },
    {
      "q": "Define: This situation?",
      "a": "Belady's Anomaly."
    },
    {
      "q": "What does  It cannot be implemented in real time as it require?",
      "a": "Future references."
    },
    {
      "q": "Define: This phenomenon?",
      "a": "‘thrashing’."
    },
    {
      "q": "What is  There?",
      "a": " There is a overhead of maintaining power in every disk blocks."
    },
    {
      "q": "What is  Either SSTF or LOOK?",
      "a": " Either SSTF or LOOK is a reasonable choice for the default algorithm."
    },
    {
      "q": "Define: Example?",
      "a": "Consider a relation R (ABCDE) 1."
    },
    {
      "q": "Define: Non-prime attribute?",
      "a": "{D, E} 1.4.1 Difference between Primary key and Alternative key Primary Key Alternative Key 1."
    },
    {
      "q": "Define: Example 1?",
      "a": "R (ABCD) with CK = {A}  Super key = CK ⸱ [Any subset of other attributes (BCD)] = A ⸱ [23] = 8 Super key."
    },
    {
      "q": "Define: Example 2?",
      "a": "Let R be the relational schema with n-attibutes, R (A1, A2, ......."
    },
    {
      "q": "Define: An?",
      "a": "Candidate key} 1.5 Referential Integrity Constraints 1.5.1 Foreign key Foreign key is a set of attributes that references primary key or alternative key of the same relation or other relation."
    },
    {
      "q": "Define: Insertion?",
      "a": "No violation 2."
    },
    {
      "q": "Define: Deletion?",
      "a": "[May cause violation] (a) On delete no action : Means if it cause problem on delete then deletion is not allowed on table."
    },
    {
      "q": "Define: Updation?",
      "a": "[May cause violation] (a) On update no action (b) On update cascade (c) On update set null Referencing Relation 1."
    },
    {
      "q": "Define: Example?",
      "a": "A → AB  {A → A, A→B} 1.6.3 Attribute Closure (X+) The set of all possible attributes determined by x."
    },
    {
      "q": "Define: Reflexive?",
      "a": "If x  y then x → y or x → x 2."
    },
    {
      "q": "Define: Transitivity?",
      "a": "If x → y and y → z then x → z 3."
    },
    {
      "q": "Define: Augmentation?",
      "a": "If x → y then xz → yz 4."
    },
    {
      "q": "Define: Splitting?",
      "a": "If x → yz then x → y, x → z 5."
    },
    {
      "q": "Define: Union?",
      "a": "If x → y and x → z then x → yz 6."
    },
    {
      "q": "Define: Pseudo transitivity?",
      "a": "If x → y, yw → z then xw → z"
    },
    {
      "q": "Define: Example?",
      "a": "Given FD Set F : { ….} ↓ x → y FD belongs to F or not ?"
    },
    {
      "q": "Define: Example?",
      "a": "Let R be the relational schema decomposed into R1 and R2."
    },
    {
      "q": "Define: Data Base Management System 10.8  z → y?",
      "a": "Partial dependency iff– • z is proper subset of candidate key • y should be non-prime attribute."
    },
    {
      "q": "Define: May or may not 3NF/BCNF Reason?",
      "a": "[Proper subset of candidate key] → [Non-prime attribute] From the above statement, we can conclude that “partial dependency” not possible if all CK’s are simple candidate key."
    },
    {
      "q": "Define: Represent by?",
      "a": "Example : (b) Attributes (i) Attribute : (ii) Key attribute : (iii) Derived attribute : eid Emp DOB Age A A"
    },
    {
      "q": "What is (v) Multivalued attribute: (c) Relationship set: It used for?",
      "a": "Relate two or more entity set."
    },
    {
      "q": "Define: Represented by?",
      "a": "Example: 2.3 Participation • If every entities of entity set are participated with relationship set then it is total participation (100% participation) otherwise it will be partial participation (< 100% participation) Example : Consider Emp and Dept entity set."
    },
    {
      "q": "Define: Points?",
      "a": "(a) For each weak entity set there must be owner entity set, which is strong entity set."
    },
    {
      "q": "What is  : Projection •  attribute_name (R): It used for?",
      "a": "Project required attribute from relation R."
    },
    {
      "q": "What is •  Condition(P) (R): It used for?",
      "a": "Select records from relation R, those satisfied the condition (P)."
    },
    {
      "q": "What is Result : 3.5 Division • It used for?",
      "a": "Retrieve attribute value of R which has paired with every attribute value of other relation S."
    },
    {
      "q": "Define: Result?",
      "a": "sidcid(Enroll)/ cid(Course) Step 1: Sid’s not enrolled every course of course relation."
    },
    {
      "q": "Define: Example 1?",
      "a": "Sid Sname Sid(..........) (..........) {Arity not same so, set operation not allowed} Example 2: Sid S name Sid marks(.......) (.....) {Arity same but Sname domain is different from marks so, not allowed} Example 3: Sid Sname Stud ID, Stud name(.......) (.....)  {Arity and domains are same so, allowed for set operation} • 1."
    },
    {
      "q": "Define: Set operation on relation?",
      "a": "2 22 22 43 R A S B"
    },
    {
      "q": "What is IN Function It used for?",
      "a": "Membership testing."
    },
    {
      "q": "What is EXISTS clause • It used for?",
      "a": "Test result of inner query is empty or not empty."
    }
  ],
  "dbms": [
    {
      "q": "[P455] What is the wastage of disk space?",
      "a": "Less."
    },
    {
      "q": "[P459] What does isolation mean?",
      "a": "Isolation means concurrent execution of 2 or more transaction result must be equal to result of some serial schedule."
    },
    {
      "q": "[P462] What is precedence graph?",
      "a": "Precedence graph is a cyclic and 2."
    },
    {
      "q": "[P463] What does irrecoverable mean?",
      "a": "Irrecoverable means unable to recover or rollback."
    },
    {
      "q": "[P475] What is the ip address 127.x.y.z?",
      "a": "The ip address 127.x.y.z is known as loop back address and it is used to check the connectivity."
    },
    {
      "q": "[P479] What occurs in a 2d-parity check code?",
      "a": "The information bits are organized in a matrix consisting of rows and columns."
    },
    {
      "q": "[P491] What occurs in regular interval?",
      "a": "Tokens are thrown into the bucket."
    },
    {
      "q": "[P491] What is if there?",
      "a": "If there is a ready packet a token is removed from bucket and packet is sent."
    },
    {
      "q": "Define: Advantage?",
      "a": "Possible to allocate file without any internal fragmentation."
    },
    {
      "q": "Define: Disadvantage?",
      "a": "More access cost to access spanned records."
    },
    {
      "q": "Formula: Consider record size?",
      "a": "Consider record size = R bytes 1."
    },
    {
      "q": "Define: If Dense Index Used?",
      "a": "• Number of Dense Index block = number of records Block Factor of Index   • Access cost (Number of Block access) = ( ) st 2log number of Dense index blocks at 1 level 1 + 3."
    },
    {
      "q": "Define: If sparse Index Used?",
      "a": "• Number of DB blocks = number of records BF of DB   • Number of sparse Index block (At 1st level) number of DB blocks BF of Index =  • Access cost (Number of block access) ( ) st 2log number of sparse index blocks at 1 level 1 + 4.6 Types of Index • Search key: Fields of DB file which is used for indexing"
    },
    {
      "q": "Define: Node structure?",
      "a": "P child pointer, P – 1 Key and P – 1 Record Pointer (Rp)."
    },
    {
      "q": "Define: Node Structure?",
      "a": "• Leaf node: (set of (key, RP) pairs and one block pointer)  Order of leaf node = (P –1) [ K + RP] + 1 * BP  Block size."
    },
    {
      "q": "Define: DBA User C?",
      "a": "Consistency} User (DBA or DB developer) is responsible for consistency."
    },
    {
      "q": "Define: Example?",
      "a": "9 : 00 AM DB Started : 9 : 05 AM 1st checkpoint : 9 : 10 AM 2nd checkpoint : 9 : 15 AM System Crash 5.5.4 System Crash If System crash/failure happen, required operation to recover are (I) All committed transaction until previous checkpoint will perform Redo."
    },
    {
      "q": "What does • Isolation mean?",
      "a": "Concurrent execution of 2 or more transaction result must be equal to result of some serial schedule."
    },
    {
      "q": "Define: Example S?",
      "a": "R1(A) W1(A) Commit (T1) R2(A)W2(A) commit (T2)."
    },
    {
      "q": "Formula: of concurrent Schedule?",
      "a": "of concurrent Schedule = (𝑛+ 𝑚)!"
    },
    {
      "q": "Define: ij ij ij S?",
      "a": "R (A)..........w (A) S: w (A)..........r (A) Conflict Pairs S: w (A)..........w (A)    5.13.3 Precedence Graph A graph G in which vertex (v) represent the transaction of Schedule and edges (E) represent conflict pair precedence’s."
    },
    {
      "q": "What is Precedence graph?",
      "a": "Precedence graph is a cyclic and 2."
    },
    {
      "q": "Formula: of serial schedule conflict equal to schedule s]?",
      "a": "of serial schedule conflict equal to schedule s] = [No."
    },
    {
      "q": "Define: Final write of A?",
      "a": "( ) Last write wA Final write of A : ( ) Last write wA For each data item A, the transaction that perform the final write (A) operation in schedule (S 1) must perform the final write (A) operation in schedule S2."
    },
    {
      "q": "What does • Irrecoverable mean?",
      "a": "Unable to recover or rollback."
    },
    {
      "q": "Define: Disadvantage?",
      "a": "It is not free form deadlock and starvation."
    },
    {
      "q": "Formula: of IP Addresses?",
      "a": "of IP Addresses = 231 Class B : 10 → (128 - 191), No."
    },
    {
      "q": "Define: Transmitting the data from one computer to another computer?",
      "a": "As unicast communication."
    },
    {
      "q": "Formula: Limited Broadcast Address?",
      "a": "Limited Broadcast Address = 255.255.255.255 3."
    },
    {
      "q": "If someone required 500 Address, what happens?",
      "a": "No need to purchase class B network we can combine two class C network."
    },
    {
      "q": "What happens in A 2D-parity check code?",
      "a": "The information bits are organized in a matrix consisting of rows and columns."
    },
    {
      "q": "What is Hamming code used for?",
      "a": "Error correction."
    },
    {
      "q": "Define: Rule 2?",
      "a": "Sender can send the next data packet only after receiving the ACK of the previous packet."
    },
    {
      "q": "Define: Each datagram is associated with a sequence number?",
      "a": "As datagram number or identification number."
    },
    {
      "q": "What is TTL field used for?",
      "a": "Control the maximum number of hops visited by datagram."
    },
    {
      "q": "What is  4.12.3 Record Routing A record route option used for?",
      "a": "Record the internet routers that handle the data gram."
    },
    {
      "q": "What is TCP?",
      "a": "TCP is a connection oriented."
    },
    {
      "q": "Formula: Wrap Around time (WAT)?",
      "a": "Wrap Around time (WAT) =   Totalsequence No."
    },
    {
      "q": "Formula: Ack?",
      "a": "Ack = 1 → Consume zero sequence number."
    },
    {
      "q": "Formula: FIN?",
      "a": "FIN = 1 → Consume one sequence number."
    },
    {
      "q": "Formula: If ACK Arrives Wc?",
      "a": "If ACK Arrives Wc = Wc + 1 1."
    },
    {
      "q": "Formula: After one RTT Wc?",
      "a": "After one RTT Wc = 2 * WC 2."
    },
    {
      "q": "What is • If there?",
      "a": "• If there is a ready packet a token is removed from bucket and packet is sent."
    },
    {
      "q": "What is [6] UDP used for?",
      "a": "Some route updating protocol such as RIP."
    },
    {
      "q": "For Example, what is the rule?",
      "a": "The Trivial File Transfer protocol(TFTP) process include flow and error control."
    },
    {
      "q": "Formula: Vulnerable time for CSMA?",
      "a": "Vulnerable time for CSMA = Propagation time."
    },
    {
      "q": "Define: Ethernet Frame Structure?",
      "a": "Preamble SFD DA SA Length Of Data Data CRC 7B 1B 6B 6B 2B (46B – 1500B) 4B PL DLL DLL Ethernet uses Manchester encoding technique for converting data bits into signal."
    },
    {
      "q": "Formula: (Baud rate?",
      "a": "(Baud rate = 2 * bit rate) Bit rate = 1/2 baud rate   "
    },
    {
      "q": "Formula: Packet switching is implemented at network layer Total time?",
      "a": "Packet switching is implemented at network layer Total time = Setup time + Td + Pd + Tear down time LdTT=S + +X."
    },
    {
      "q": "What does Only first packet require?",
      "a": "A global header which identifies the path from one end to another end."
    },
    {
      "q": "What is Address Resolution Protocol(ARP) used for?",
      "a": "Find the MAC(Media Access Control) address of a device from its IP address."
    },
    {
      "q": "Define: ARP request?",
      "a": "ARP request is broadcasting 3."
    },
    {
      "q": "Define: ARP response/reply?",
      "a": "ARP reply is unicasting."
    }
  ],
  "cn": [
    {
      "q": "[P502] What is the objective of smtp?",
      "a": "To transfer the email reliably and efficiently."
    },
    {
      "q": "[P503] What is mime?",
      "a": "Mime is a supplementary protocol that allows non-ascii data to send through smtp."
    },
    {
      "q": "[P503] What is mime?",
      "a": "Mime is a set of software function that transforms non-ascii data to ascii data or viceversa."
    },
    {
      "q": "[P503] What is smtp?",
      "a": "Smtp is a connection-oriented protocol."
    },
    {
      "q": "[P503] What is it?",
      "a": "It is a message access protocol."
    },
    {
      "q": "[P503] What is pop3?",
      "a": "Pop3 is a connection-oriented protocol."
    },
    {
      "q": "[P504] What is imap?",
      "a": "Imap is a connection-oriented protocol."
    },
    {
      "q": "[P504] What is file transfer protocol?",
      "a": "File transfer protocol is a standard internet protocol for transferring files b/w computers over tcp/ip connection."
    },
    {
      "q": "[P504] What is ftp?",
      "a": "Ftp is a connection-oriented protocol."
    },
    {
      "q": "[P505] What is http?",
      "a": "Http is a stateless protocol i.e."
    },
    {
      "q": "[P508] What is it?",
      "a": "It is a multinational body dedicated to worldwide agreement on international standard."
    },
    {
      "q": "[P508] What is an open system?",
      "a": "An open system is a set of protocols that allows any two different systems to communicate regardless of their underlying architecture (hardware/software)."
    },
    {
      "q": "[P515] What is percentage?",
      "a": "Percentage is a concept evolved so that there can be a uniform platform for comparison of various things."
    },
    {
      "q": "[P516] What is the following?",
      "a": "The following is a table showing the conversions of percentages and decimals into fractions:"
    },
    {
      "q": "[P520] What is the concept of average?",
      "a": "Equal distribution of the overall value among all the things or persons present there."
    },
    {
      "q": "[P520] What is the average age of a class of 30 students?",
      "a": "12."
    },
    {
      "q": "[P520] What does this mean?",
      "a": "This means that everyone got 1 extra year after distributing the extra years of the teacher."
    },
    {
      "q": "[P521] What occurs in other words?",
      "a": "Cost price is nothing but the investment in the business."
    },
    {
      "q": "[P521] What occurs in other words?",
      "a": "Selling price is nothing but the returns from a business."
    },
    {
      "q": "[P524] What does so, 4:5:6 mean?",
      "a": "So, 4:5:6 means that the total value is divided into 4+5+6 = 15 equal parts and then distributed as per the ratio."
    },
    {
      "q": "[P525] What does average speed when the travel consist of?",
      "a": "Average speed when the travel comprises of various speeds then the concept of average speed is to be applied."
    },
    {
      "q": "[P525] What occurs in the total time above?",
      "a": "The time of rest is not considered."
    },
    {
      "q": "[P529] What is the total angle of 360 degrees in a watch?",
      "a": "Divided into 1 sectors, one for each hour."
    },
    {
      "q": "What is the objective of SMTP?",
      "a": "To transfer the email reliably and efficiently."
    },
    {
      "q": "Define: In SMTP there are two components?",
      "a": "(i) User Agent (UA) (ii) Mail transfer Agent (MTA) 4."
    },
    {
      "q": "What is MIME?",
      "a": "MIME is a supplementary protocol that allows non-ASCII data to send through SMTP."
    },
    {
      "q": "What is MIME used for?",
      "a": "Convert non text data to text data and text data to non text data."
    },
    {
      "q": "If an e-mail is asked to be sent twice, what happens?",
      "a": "Server resends it without saying that e-mail has already been sent."
    },
    {
      "q": "What is SMTP?",
      "a": "SMTP is a connection-oriented protocol."
    },
    {
      "q": "What is SMTP used for?",
      "a": "Push the e-mail."
    },
    {
      "q": "What is POP3?",
      "a": "POP3 is a connection-oriented protocol."
    },
    {
      "q": "What is IMAP?",
      "a": "IMAP is a connection-oriented protocol."
    },
    {
      "q": "What is File transfer protocol?",
      "a": "File transfer protocol is a standard internet protocol for transferring files b/w computers over TCP/IP connection."
    },
    {
      "q": "What is FTP?",
      "a": "FTP is a connection-oriented protocol."
    },
    {
      "q": "What is HTTP?",
      "a": "HTTP is a stateless protocol i.e."
    },
    {
      "q": "Define: ISO?",
      "a": "International Standards Organization."
    },
    {
      "q": "Define: It defines topology configuration?",
      "a": "• Bus topology • Star topology • Mesh Topology • Tree Topology 4."
    },
    {
      "q": "Define: It defines link configuration?",
      "a": "I Point to Point Link ii Broadcast Link 6."
    },
    {
      "q": "Define: Congestion control?",
      "a": "9.6 Transport Layer Transport Layer is responsible for process to process delivery."
    },
    {
      "q": "What is A process?",
      "a": "A process is a application program running on a host."
    },
    {
      "q": "What is Percentage?",
      "a": "Percentage is a concept evolved so that there can be a uniform platform for comparison of various things."
    },
    {
      "q": "Define: Calculation of Value?",
      "a": "Percentage Value total value 100  Example: What is 20% of 200?"
    },
    {
      "q": "What is the concept of average?",
      "a": "Equal distribution of the overall value among all the things or persons present there."
    },
    {
      "q": "What does This mean?",
      "a": "That everyone got 1 extra year after distributing the extra years of the teacher."
    },
    {
      "q": "Define: The price at which the articles are bought?",
      "a": "Cost Price."
    },
    {
      "q": "Define: The money that the trader gets from the business?",
      "a": "Selling Price."
    },
    {
      "q": "Define: Understanding Profit and Loss?",
      "a": "So, by now we came to know that if CP is increased and sold it would result in profit and vice versa."
    },
    {
      "q": "For 10% profit, what is the rule?",
      "a": "CP is to be increased by 10% and it is the SP."
    },
    {
      "q": "Define: Examples?",
      "a": "A trader uses 1 kg weight for 800 gm and increases the price by 20%."
    },
    {
      "q": "What does So, 4:5:6 mean?",
      "a": "That the total value is divided into 4+5+6 = 15 equal parts and then distributed as per the ratio."
    },
    {
      "q": "Define: Example 2?",
      "a": "If A:B = 2:3 and B:C = 4:5 then find A:B:C."
    },
    {
      "q": "Define: Example 3?",
      "a": "Three numbers are in the ratio of 3: 4 : 8 and the sum of these numbers is 975."
    },
    {
      "q": "Formula: Then their sum?",
      "a": "Then their sum = 3x + 4x + 8x = 15x = 975  x = 65."
    },
    {
      "q": "Define: Example 4?",
      "a": "Two numbers are in the ratio of 4 : 5."
    },
    {
      "q": "If the difference between these numbers is 24, what happens?",
      "a": "Find the numbers."
    },
    {
      "q": "Formula: Their difference?",
      "a": "Their difference = 5x – 4x = x = 24 (given)."
    },
    {
      "q": "Define: Example 5?",
      "a": "Given two numbers are in the ratio of 3 : 4."
    },
    {
      "q": "What does Average Speed When the travel consist of?",
      "a": "Of various speeds then the concept of average speed is to be applied."
    },
    {
      "q": "Define: Example 1?",
      "a": "If a car travels along four sides of a square at 100 kmph, 200 kmph, 300 kmph and 400 kmph find its average speed."
    },
    {
      "q": "Formula: Then the total distance?",
      "a": "Then the total distance = 4x km."
    },
    {
      "q": "Formula: Using this we can write average speed?",
      "a": "Using this we can write average speed = 4 192 kmph 100 200 300 400 x x x x x    ."
    },
    {
      "q": "Define: Example 2?",
      "a": "A man if travels at 5 6 th of his actual speed takes 10 min more to travel a distance."
    },
    {
      "q": "Define: Example 3?",
      "a": "If a person walks at 30 kmph he is 10 min late to his office."
    },
    {
      "q": "Formula: Similarly second time?",
      "a": "Similarly second time = d/40."
    },
    {
      "q": "Define: Example 4?",
      "a": "Two people start moving from the same point at the same time at 30 kmph and 40 kmph in opposite directions."
    },
    {
      "q": "Define: Example 5?",
      "a": "A starts from X to Y at 6 am at 40 kmph and at the same time B starts from Y to X at 50 kmph."
    },
    {
      "q": "Define: The amount of work done be a person in 1 day?",
      "a": "His efficiency."
    },
    {
      "q": "Define: Example 1?",
      "a": "If A can do a work in 10 days, B can do it in 20 days and C in 30 days in how many days will the three together do it?"
    },
    {
      "q": "Define: Example 2?",
      "a": "If A and B can do a work in 10 days, B and C can do it in 20 days and C and A can do it in 40 days in what time all the three can do it?"
    },
    {
      "q": "Define: Example 5?",
      "a": "A pipe can fill a tank in 5 hrs but because of a leak a the bottom it takes 1 hr extra."
    },
    {
      "q": "What is the total angle of 360 degrees in a watch?",
      "a": "Divided into 1 sectors, one for each hour."
    },
    {
      "q": "Formula: So one hour sector?",
      "a": "So one hour sector = 360 30 12  degrees."
    },
    {
      "q": "For Every one hour (60 min), what is the rule?",
      "a": "• The minutes hand moves through 360 deg."
    },
    {
      "q": "Define: Examples?",
      "a": "At what time between 5 and 6 will the hands of the clock coincide?"
    },
    {
      "q": "Formula: of minutes required to coincide?",
      "a": "of minutes required to coincide = 150 300 3 27 5.5 11 11  min ."
    },
    {
      "q": "Define: Examples?",
      "a": "At what time between 6 and 7 will the hands be perpendicular?"
    },
    {
      "q": "Formula: of minutes required?",
      "a": "of minutes required = 90 180 16 4 5.5 11 11  min ."
    },
    {
      "q": "Formula: Required angle?",
      "a": "Required angle = A ~ B = 157.5 deg."
    },
    {
      "q": "Formula: The required angle?",
      "a": "The required angle = A ~ B = 100 deg."
    }
  ],
  "ga": [
    {
      "q": "[P531] What is an year that has 365 days?",
      "a": "An year that has 365 days is called ordinary year."
    },
    {
      "q": "[P532] What is the day of the week on the particular date?",
      "a": "Equal to the number of net odd days ahead of the reference day (if the reference day was before this date) but behind the reference day (if this date was behind the reference day)."
    },
    {
      "q": "[P535] What is the distance of a from b?",
      "a": "Example 2."
    },
    {
      "q": "[P536] What is starting point?",
      "a": "Starting point is a and ending point is e."
    },
    {
      "q": "[P538] What is the income by way of donation to school d?",
      "a": "What per-cent of its miscellaneous?"
    },
    {
      "q": "[P538] What occurs in this type?",
      "a": "Two or more bars are constructed adjoining each other, to represent either different components of a total or to show multiple variables."
    },
    {
      "q": "[P539] What occurs in these questions?",
      "a": "You are to classify each problem according to the five or four fixed answer choice, rather than find a solution to the problem."
    },
    {
      "q": "[P539] What does each data suffi ciency question consist of?",
      "a": "Each data suffi ciency question consists of a question, often accompanied by some initial information, and two statements, labeled (1) and (2), which contain additional information."
    },
    {
      "q": "Define: • Ordinary Year: An year that has 365 days?",
      "a": "Ordinary Year."
    },
    {
      "q": "Define: Important Points?",
      "a": "• An ordinary year has 365 days = 52 weeks and 1 odd day."
    },
    {
      "q": "Define: Explanation?",
      "a": "100 years = 76 ordinary years + 24 leap years = 76 odd days + 24 × 2 odd days = 124 odd days = 17 weeks + 5 days"
    },
    {
      "q": "Formula: of odd days in first century?",
      "a": "of odd days in first century = 5  Last day of first century is Friday."
    },
    {
      "q": "Formula: of odd days in two centuries?",
      "a": "of odd days in two centuries = 3  Wednesday is the last day."
    },
    {
      "q": "Formula: of odd days in three centuries?",
      "a": "of odd days in three centuries = 1  Monday is the last day."
    },
    {
      "q": "Formula: of odd days in four centuries?",
      "a": "of odd days in four centuries = 0  Sunday is the last day."
    },
    {
      "q": "Define: Step 2?",
      "a": "The day of the week on the particular date is equal to the number of net odd days ahead of the reference day (if the reference day was before this date) but behind the reference day (if this date was behind the reference day)."
    },
    {
      "q": "Define: Solution?",
      "a": "Total number of days between 11 th January 1997 and 10 th January 2000 = (365 – 11) in 1997 + 365 in 1998 + 365 in 1999 + 10 days in 2000"
    },
    {
      "q": "Define: Examples?",
      "a": "What day of the week was on 10 th June 2008?"
    },
    {
      "q": "Define: Solution?",
      "a": "10th June 2008 = 2007 years + First 5 months up to May 2008 + 10 days of June 2000 years have 0 odd days."
    },
    {
      "q": "Formula: Total number of odd days?",
      "a": "Total number of odd days = 8+12+3 = 23 23 odd days = 3 weeks + 2 odd days."
    },
    {
      "q": "Define: Introduction Examples?",
      "a": "Example 1: Ravi traveled 4 km straight towards south."
    },
    {
      "q": "What is the distance of A from B?",
      "a": "Example 2."
    },
    {
      "q": "What is Starting point?",
      "a": "Starting point is a and ending point is E."
    },
    {
      "q": "Define: Types of Data Interpretation?",
      "a": "The numerical data pertaining to any event can be presented by any one or more of the following methods."
    },
    {
      "q": "Define: It has six elements namely?",
      "a": "• Title: It is the heading of the table."
    },
    {
      "q": "What is If the steepest part?",
      "a": "If the steepest part is a rise slope, then it is the highest percentage growth."
    },
    {
      "q": "Define: Types of Bar Graphs?",
      "a": "• Simple Bar Graphs: A simple bar graph relates to only one variable."
    },
    {
      "q": "What is • Sub-divided Bar Graph: It used for?",
      "a": "Represent various parts of sub-classes of total magnitude of the given variable."
    },
    {
      "q": "What does Each Data suffi ciency question consist of?",
      "a": "A question, often accompanied by some initial information, and two statements, labeled (1) and (2), which contain additional information."
    }
  ]
};


// ═══ CONCEPTS DATA ═══
const CONCEPTS={
  "calc": [
    {
      "id": "limit",
      "name": "Limits",
      "topic": "Calculus",
      "definition": "Value a function approaches as input tends to a point.",
      "intuition": "Describes behavior near a point, not at it.",
      "formula": "lim(x→a) f(x) = L",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "If direct substitution gives 0/0, use L'Hôpital's rule.",
      "common_mistake": "Assuming limit equals the function value at that point.",
      "pyq_insight": "GATE asks limit of integral forms using Newton-Leibnitz rule.",
      "relations": [
        {
          "to": "continuity",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "continuity",
      "name": "Continuity",
      "topic": "Calculus",
      "definition": "Function is continuous at a if limit = f(a) = defined.",
      "intuition": "No breaks, holes, or jumps in the graph.",
      "formula": "lim(x→a⁻) = lim(x→a⁺) = f(a)",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Differentiability implies continuity; converse NOT true.",
      "common_mistake": "Thinking |x| is not continuous — it IS continuous at 0.",
      "pyq_insight": "Often asks: 'Is this function differentiable or only continuous?'",
      "relations": [
        {
          "to": "differentiability",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "differentiability",
      "name": "Differentiability",
      "topic": "Calculus",
      "definition": "Function has a well-defined derivative at a point.",
      "intuition": "Tangent line exists and is unique at that point.",
      "formula": "f'(x) = lim(h→0) [f(x+h) - f(x)] / h",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Check LHD = RHD. |x| is NOT differentiable at x=0.",
      "common_mistake": "Assuming continuity implies differentiability.",
      "pyq_insight": "Classic trap: sin|x| at x=0, |x|² at x=0.",
      "relations": [
        {
          "to": "lhopital",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "lhopital",
      "name": "L'Hôpital's Rule",
      "topic": "Calculus",
      "definition": "Resolves 0/0 or ∞/∞ limits by differentiating numerator and denominator.",
      "intuition": "If ratio is indeterminate, the ratio of derivatives gives the true limit.",
      "formula": "lim f/g = lim f'/g' when form is 0/0 or ∞/∞",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Apply ONLY when form is 0/0 or ∞/∞. Check form first!",
      "common_mistake": "Applying to 1×∞ or 0⁰ directly without converting.",
      "pyq_insight": "Very common in GATE EM section. lim(x→0) sinx/x = 1.",
      "relations": [
        {
          "to": "taylor_series",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "taylor_series",
      "name": "Taylor & Maclaurin Series",
      "topic": "Calculus",
      "definition": "Infinite polynomial representation of a smooth function around a point.",
      "intuition": "Any smooth curve can be perfectly approximated by powers of (x-a).",
      "formula": "f(x) = Σ f⁽ⁿ⁾(a)(x-a)ⁿ/n! ; Maclaurin when a=0",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Coefficient of xⁿ in expansion = f⁽ⁿ⁾(0)/n!",
      "common_mistake": "Maclaurin ≠ Taylor in general — it's Taylor at a=0.",
      "pyq_insight": "GATE asks: find coeff of x³ in expansion of f(x).",
      "relations": []
    },
    {
      "id": "maxima_minima",
      "name": "Maxima & Minima",
      "topic": "Calculus",
      "definition": "Points where derivative is zero; determined by second derivative test.",
      "intuition": "Peaks and valleys of the function where slope is flat.",
      "formula": "f'(x)=0; max if f''<0, min if f''>0",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "If f''(c)=0, test higher derivatives or check sign change.",
      "common_mistake": "Not checking boundary values for global extrema.",
      "pyq_insight": "Often appears in optimization problems in GATE EM.",
      "relations": []
    },
    {
      "id": "newton_leibnitz",
      "name": "Newton-Leibnitz Rule",
      "topic": "Calculus",
      "definition": "Differentiates a definite integral with variable limits.",
      "intuition": "Chain rule applied to each boundary of the integral.",
      "formula": "d/dx[∫φ^ψ f(t)dt] = f(ψ)ψ' - f(φ)φ'",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Use when limit question has integral in numerator/denominator.",
      "common_mistake": "Forgetting to multiply by derivative of the limit bound.",
      "pyq_insight": "Very high frequency 2-mark GATE question combined with L'Hôpital.",
      "relations": []
    },
    {
      "id": "ilate",
      "name": "Integration by Parts (ILATE)",
      "topic": "Calculus",
      "definition": "Technique for integrating a product of two functions.",
      "intuition": "Trade a harder integral for an easier one by differentiating one part.",
      "formula": "∫f·g dx = f·∫g dx - ∫[f'·∫g dx] dx",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "ILATE order: Inverse, Log, Algebraic, Trig, Exponential. First = u.",
      "common_mistake": "Applying ILATE in wrong order — always pick leftmost in ILATE as u.",
      "pyq_insight": "Standard result: ∫x·eˣ dx = (x-1)eˣ + C.",
      "relations": []
    },
    {
      "id": "partial_diff",
      "name": "Partial Derivatives",
      "topic": "Multivariable Calculus",
      "definition": "Derivative of a function of multiple variables with respect to one variable, others held constant.",
      "intuition": "Rate of change in one direction while standing still in all others.",
      "formula": "∂f/∂x: treat y as constant and differentiate w.r.t. x.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Chain rule for partial: df = (∂f/∂x)dx + (∂f/∂y)dy.",
      "common_mistake": "Mixed partials: ∂²f/∂x∂y = ∂²f/∂y∂x (if continuous). Order doesn't matter (Clairaut's theorem).",
      "pyq_insight": "GATE EM: multivariable maxima/minima using partial derivatives.",
      "relations": [
        {
          "to": "maxima_minima",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "double_integral",
      "name": "Double & Triple Integrals",
      "topic": "Multivariable Calculus",
      "definition": "Integration over 2D or 3D regions. Order of integration can be reversed (Fubini's theorem).",
      "intuition": "Volume under a surface = double integral of height function over base region.",
      "formula": "∫∫f(x,y)dA. For polar: x=rcosθ, y=rsinθ, dA = r dr dθ.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Convert to polar when integrand has x²+y². Jacobian for polar = r.",
      "common_mistake": "Limits of inner integral can depend on outer variable. Sketch the region first.",
      "pyq_insight": "GATE EM: change order of integration; compute area using double integral.",
      "relations": []
    },
    {
      "id": "fourier_series",
      "name": "Fourier Series",
      "topic": "Series",
      "definition": "Representing a periodic function as an infinite sum of sines and cosines.",
      "intuition": "Every periodic signal = sum of pure tones at harmonically related frequencies.",
      "formula": "f(x) = a₀/2 + Σ(aₙcos(nπx/L) + bₙsin(nπx/L))",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Even function: bₙ=0 (only cosines). Odd function: aₙ=0 (only sines). Check this first!",
      "common_mistake": "Fourier series converges to average of left/right limits at discontinuities (Gibbs phenomenon).",
      "pyq_insight": "GATE EM: find Fourier coefficients; determine if function is odd/even.",
      "relations": []
    },
    {
      "id": "laplace",
      "name": "Laplace Transform",
      "topic": "Transforms",
      "definition": "Transforms time-domain function f(t) to complex frequency domain F(s).",
      "intuition": "Converts differential equations into algebraic equations — solve, then invert.",
      "formula": "L{f(t)} = F(s) = ∫₀^∞ f(t)e^(-st)dt. L{eᵃᵗ} = 1/(s-a). L{sin(at)} = a/(s²+a²).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Initial value theorem: lim f(t) as t→0 = lim sF(s) as s→∞.",
      "common_mistake": "Laplace requires f(t)=0 for t<0 (causal). Not for arbitrary functions.",
      "pyq_insight": "GATE EM: find Laplace of given function; use for ODE solution.",
      "relations": []
    },
    {
      "id": "differential_equations",
      "name": "Ordinary Differential Equations",
      "topic": "Calculus",
      "definition": "Equations relating a function with its derivatives. Classified by order and linearity.",
      "intuition": "Model change — population growth, circuit response, spring motion.",
      "formula": "1st order linear: dy/dx + P(x)y = Q(x). Integrating factor: μ=e^∫P(x)dx.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Homogeneous ODE (second order): characteristic equation. Roots real/complex/repeated → different solutions.",
      "common_mistake": "Particular solution method: undetermined coefficients works only for polynomials/exp/trig RHS.",
      "pyq_insight": "GATE EM: solve 1st or 2nd order ODE; identify type; apply integrating factor.",
      "relations": []
    }
  ],
  "la": [
    {
      "id": "matrix_rank",
      "name": "Rank of a Matrix",
      "topic": "Linear Algebra",
      "definition": "Number of linearly independent rows (or columns) in a matrix.",
      "intuition": "Measures how much 'information' the matrix carries.",
      "formula": "rank(A) = pivot count in row echelon form",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Elementary row ops do NOT change rank.",
      "common_mistake": "Assuming rank(A)=rank(Aᵀ) is surprising — they are ALWAYS equal.",
      "pyq_insight": "Used to determine uniqueness/existence of solutions to Ax=b.",
      "relations": [
        {
          "to": "eigenvalues",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "eigenvalues",
      "name": "Eigenvalues & Eigenvectors",
      "topic": "Linear Algebra",
      "definition": "Scalars and vectors satisfying Av = λv.",
      "intuition": "Directions that only stretch/shrink under the transformation A.",
      "formula": "det(A - λI) = 0 to find eigenvalues",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "Sum of eigenvalues = trace(A), Product = det(A). Quick shortcut!",
      "common_mistake": "Eigenvectors of A and Aᵀ are NOT the same (eigenvalues are same).",
      "pyq_insight": "Most asked topic in LA. Expect 1-2 questions every year.",
      "relations": [
        {
          "to": "cayley_hamilton",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "cayley_hamilton",
      "name": "Cayley-Hamilton Theorem",
      "topic": "Linear Algebra",
      "definition": "Every matrix satisfies its own characteristic polynomial.",
      "intuition": "Substitute A itself in place of λ in the characteristic equation.",
      "formula": "p(λ) = det(A-λI) = 0 → p(A) = 0",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Use to find A⁻¹ = (1/det(A)) × (A term from char. equation).",
      "common_mistake": "Forgetting to set p(A)=0, not p(λ)=0.",
      "pyq_insight": "GATE uses this to find A⁻¹ or powers of A efficiently.",
      "relations": []
    },
    {
      "id": "system_equations",
      "name": "System of Linear Equations",
      "topic": "Linear Algebra",
      "definition": "Set of equations Ax=b. Solution exists based on ranks of A and [A|b].",
      "intuition": "Geometrically, each equation is a hyperplane. Solution = intersection.",
      "formula": "ρ(A)=ρ([A|b])=n → unique; <n → infinite; ρ(A)≠ρ([A|b]) → none",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Always check augmented matrix rank vs coefficient matrix rank.",
      "common_mistake": "Homogeneous system Ax=0 always has at least trivial solution x=0.",
      "pyq_insight": "GATE directly asks: unique/infinite/no solution — standard 2-marker.",
      "relations": []
    },
    {
      "id": "rank_nullity",
      "name": "Rank-Nullity Theorem",
      "topic": "Linear Algebra",
      "definition": "rank(A) + nullity(A) = number of columns of A.",
      "intuition": "The column space dimension + null space dimension = total space.",
      "formula": "rank + nullity = n (columns)",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "nullity = dimension of solution space of Ax=0.",
      "common_mistake": "nullity = n - rank (must use COLUMN count, not row count).",
      "pyq_insight": "Used in GATE to count free variables in underdetermined systems.",
      "relations": []
    },
    {
      "id": "vector_spaces",
      "name": "Vector Spaces & Subspaces",
      "topic": "Linear Algebra",
      "definition": "Set V with vector addition and scalar multiplication satisfying 8 axioms.",
      "intuition": "Vectors can be added and scaled — the result stays 'in the same world'.",
      "formula": "Subspace test: closed under addition and scalar multiplication; contains zero vector.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Column space, null space, row space of A are all vector subspaces.",
      "common_mistake": "A single vector can span R^n iff it's in R^1. Span of {v} is just the line through v.",
      "pyq_insight": "GATE: verify subspace property; find basis of null space or column space.",
      "relations": []
    },
    {
      "id": "linear_transform",
      "name": "Linear Transformations",
      "topic": "Linear Algebra",
      "definition": "Function T: V→W preserving addition and scalar multiplication. T(au+bv)=aT(u)+bT(v).",
      "intuition": "Matrix multiplication IS a linear transformation. Every matrix represents one.",
      "formula": "Kernel = null space. Image = column space. rank(T) + nullity(T) = dim(V).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "T is injective iff kernel = {0}. T is surjective iff image = W.",
      "common_mistake": "Rank-nullity: nullity = n - rank(A), where n = NUMBER OF COLUMNS, not rows.",
      "pyq_insight": "GATE: find kernel and image of T; verify rank-nullity theorem.",
      "relations": [
        {
          "to": "rank_nullity",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "qr_decomp",
      "name": "LU & QR Decomposition",
      "topic": "Linear Algebra",
      "definition": "LU: A = LU (lower × upper triangular). QR: A = QR (orthogonal × upper triangular).",
      "intuition": "Factorize matrix to make solving systems cheaper — one factorization, many solves.",
      "formula": "LU factorization: Gaussian elimination process. Solve Ax=b as Ly=b then Ux=y.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "LU: O(n³) factorization, O(n²) per solve. QR: better for least squares.",
      "common_mistake": "LU exists without pivoting only if all leading principal minors are nonzero.",
      "pyq_insight": "GATE: less common. Know Gauss elimination reduces to LU factorization.",
      "relations": []
    },
    {
      "id": "quadratic_form",
      "name": "Quadratic Forms & Definiteness",
      "topic": "Linear Algebra",
      "definition": "Quadratic form Q(x) = xᵀAx. Classified by eigenvalue signs: positive/negative/semi/indefinite.",
      "intuition": "Like x²+y² (bowl shape) vs -x²-y² (inverted bowl) vs x²-y² (saddle).",
      "formula": "Positive definite: all eigenvalues > 0. Negative definite: all < 0. Indefinite: mixed.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "For 2×2: pos def iff det(A)>0 AND a₁₁>0. Test leads directly from eigenvalues.",
      "common_mistake": "Semi-definite: some eigenvalues are ZERO. Neither not positive definite nor negative definite.",
      "pyq_insight": "GATE: classify quadratic form; relate to max/min of function with Hessian matrix.",
      "relations": [
        {
          "to": "eigenvalues",
          "type": "depends_on"
        }
      ]
    }
  ],
  "ps": [
    {
      "id": "bayes",
      "name": "Bayes' Theorem",
      "topic": "Probability",
      "definition": "Reverses conditional probability: P(A|B) using P(B|A).",
      "intuition": "Update prior belief based on new evidence.",
      "formula": "P(Eᵢ|A) = P(Eᵢ)P(A|Eᵢ) / ΣP(Eⱼ)P(A|Eⱼ)",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Build a probability tree. P(A|B) ≠ P(B|A) — Bayes bridges the gap.",
      "common_mistake": "Confusing prior and posterior probability.",
      "pyq_insight": "GATE: sensitivity/specificity → find P(disease|positive test).",
      "relations": []
    },
    {
      "id": "distributions",
      "name": "Probability Distributions",
      "topic": "Statistics",
      "definition": "Functions mapping outcomes to probabilities (PMF for discrete, PDF for continuous).",
      "intuition": "Describes how likely different values of a random variable are.",
      "formula": "Binomial: C(n,r)pʳqⁿ⁻ʳ; Poisson: e⁻λλʳ/r!; Normal: bell curve",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "For Poisson: mean = variance = λ. Very commonly tested.",
      "common_mistake": "Poisson variance = λ (not √λ, which is the std dev).",
      "pyq_insight": "GATE often picks between Binomial and Poisson — rare events → Poisson.",
      "relations": []
    },
    {
      "id": "expectation_variance",
      "name": "Expectation & Variance",
      "topic": "Statistics",
      "definition": "Expected value = weighted average of outcomes; Variance = spread measure.",
      "intuition": "E[X] is the long-run average; Var(X) measures how spread-out values are.",
      "formula": "E[aX+b]=aE[X]+b; Var(aX+b)=a²Var(X); Var(X)=E[X²]-(E[X])²",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Var(X+Y) = Var(X)+Var(Y) only if X,Y are independent.",
      "common_mistake": "Adding variances for non-independent variables without covariance term.",
      "pyq_insight": "GATE directly tests Var formula and E[g(X)] calculation from PMF.",
      "relations": []
    },
    {
      "id": "markov_chain",
      "name": "Markov Chains",
      "topic": "Stochastic Processes",
      "definition": "Sequence of states where next state depends ONLY on current state (memoryless).",
      "intuition": "Each step only looks at where you are now — history is irrelevant.",
      "formula": "P[Xₙ₊₁=j | Xₙ=i] = pᵢⱼ (transition probability). Stationary dist: πP = π.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "To find stationary distribution: solve πP = π with Σπᵢ = 1.",
      "common_mistake": "Ergodic Markov chain: irreducible + aperiodic → unique stationary distribution exists.",
      "pyq_insight": "GATE: compute k-step transition probability; find stationary distribution.",
      "relations": []
    },
    {
      "id": "joint_dist",
      "name": "Joint & Marginal Distributions",
      "topic": "Statistics",
      "definition": "Joint: P(X=x, Y=y). Marginal: sum/integrate joint over the other variable.",
      "intuition": "Joint = full picture. Marginal = collapse one dimension (like projecting a 2D scatter).",
      "formula": "Marginal: P(X=x) = ΣᵧP(X=x, Y=y). Covariance: E[XY] - E[X]E[Y].",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "X, Y independent iff joint PDF = f_X(x) × f_Y(y) — factorizes!",
      "common_mistake": "Zero covariance does NOT imply independence (only for jointly Gaussian distributions).",
      "pyq_insight": "GATE: compute marginal from joint; check independence; find P(X+Y<k).",
      "relations": [
        {
          "to": "expectation_variance",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "bernoulli_geometric",
      "name": "Bernoulli & Geometric Distribution",
      "topic": "Probability",
      "definition": "Bernoulli: single trial, P(success)=p. Geometric: number of trials until first success.",
      "intuition": "Bernoulli = single coin flip. Geometric = how many flips until first head.",
      "formula": "Bernoulli: E[X]=p, Var=p(1-p). Geometric: E[X]=1/p, Var=(1-p)/p².",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Geometric is the ONLY discrete memoryless distribution. Exponential is the continuous version.",
      "common_mistake": "Geometric P(X=k): (1-p)^(k-1) × p. First failure doesn't count — only the k-th trial is success.",
      "pyq_insight": "GATE: use geometric distribution for waiting time; compute E[X] and P(X>k).",
      "relations": [
        {
          "to": "distributions",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "clt",
      "name": "Central Limit Theorem (CLT)",
      "topic": "Statistics",
      "definition": "Sum of n IID random variables approaches Normal distribution as n→∞.",
      "intuition": "No matter what distribution you sample from, average of many samples looks normal.",
      "formula": "(X̄ - μ)/(σ/√n) → N(0,1) as n→∞. Works for n≥30 in practice.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "CLT applies to SUMS and MEANS. Individual samples may still be non-normal.",
      "common_mistake": "CLT doesn't say the distribution BECOMES normal — only that the SAMPLE MEAN approaches normal.",
      "pyq_insight": "GATE: approximate binomial with normal using CLT for large n.",
      "relations": [
        {
          "to": "distributions",
          "type": "depends_on"
        }
      ]
    }
  ],
  "dm": [
    {
      "id": "propositional_logic",
      "name": "Propositional Logic",
      "topic": "Logic",
      "definition": "Study of logical statements (propositions) and their truth values.",
      "intuition": "Building blocks of reasoning: AND, OR, NOT, IMPLIES, IFF.",
      "formula": "p→q ≡ ¬p∨q; p↔q ≡ (p→q)∧(q→p); De Morgan: ¬(p∧q)≡¬p∨¬q",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Contrapositive of p→q is ¬q→¬p — always equivalent!",
      "common_mistake": "Converse (q→p) and inverse (¬p→¬q) are NOT equivalent to p→q.",
      "pyq_insight": "GATE tests: identify tautologies, simplify expressions, implication.",
      "relations": [
        {
          "to": "first_order_logic",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "first_order_logic",
      "name": "First Order Logic (FOL)",
      "topic": "Logic",
      "definition": "Extends propositional logic with predicates, variables, and quantifiers.",
      "intuition": "Universal (∀) says 'for all'; Existential (∃) says 'there exists at least one'.",
      "formula": "∀x P(x) → ¬∃x ¬P(x); ∃x P(x) → ¬∀x ¬P(x)",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Negate quantifiers by flipping ∀↔∃ and negating inner predicate.",
      "common_mistake": "'∀x P(x) → Q(x)' is NOT same as '(∀x P(x)) → (∀x Q(x))'.",
      "pyq_insight": "GATE gives a statement and asks for its logical equivalent.",
      "relations": []
    },
    {
      "id": "graph_theory",
      "name": "Graph Theory Basics",
      "topic": "Graph Theory",
      "definition": "Study of vertices (nodes) and edges (connections) between them.",
      "intuition": "Models networks, relationships, and paths between entities.",
      "formula": "Handshaking: Σdeg(v) = 2|E|; Euler: V-E+F=2 (planar connected)",
      "difficulty": "medium",
      "importance": 10,
      "exam_trick": "Number of odd-degree vertices is ALWAYS even (handshaking lemma).",
      "common_mistake": "V-E+F=2 applies ONLY to connected planar graphs.",
      "pyq_insight": "Most asked DM topic. Planar, chromatic number, Eulerian paths every year.",
      "relations": [
        {
          "to": "trees",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "trees",
      "name": "Trees & Spanning Trees",
      "topic": "Graph Theory",
      "definition": "Connected acyclic graph; spanning tree covers all vertices with minimum edges.",
      "intuition": "Tree is the most efficient way to connect all nodes without creating cycles.",
      "formula": "Tree: n vertices, n-1 edges. Spanning trees of Kₙ = n^(n-2) (Cayley).",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Tree = connected + acyclic = connected + n-1 edges (any two imply third).",
      "common_mistake": "Assuming unique path in tree — it IS unique, but that's the property.",
      "pyq_insight": "GATE asks: number of spanning trees, height of complete binary tree.",
      "relations": []
    },
    {
      "id": "relations",
      "name": "Relations & Closure",
      "topic": "Set Theory",
      "definition": "A relation R on set A is a subset of A×A. Properties: reflexive, symmetric, transitive.",
      "intuition": "A relation is a rule that pairs elements. Equivalence = RST. Partial order = RAT.",
      "formula": "Transitive closure by Warshall's algorithm: O(n³)",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Equivalence relation partitions the set into disjoint equivalence classes.",
      "common_mistake": "Anti-symmetric ≠ not symmetric. A relation can be both!",
      "pyq_insight": "GATE: classify relation, find closure, count equivalence classes.",
      "relations": []
    },
    {
      "id": "recurrence",
      "name": "Recurrence Relations",
      "topic": "Combinatorics",
      "definition": "Defines sequence where each term is expressed in terms of preceding terms.",
      "intuition": "Like a program loop — solve by unrolling or using Master Theorem.",
      "formula": "a(n) = a(n-1) + a(n-2); solve by characteristic equation method",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "For T(n)=aT(n/b)+f(n): use Master Theorem directly.",
      "common_mistake": "Applying Master Theorem when regularity condition fails in Case 3.",
      "pyq_insight": "Appears in GATE algo section; also in DM for counting structures.",
      "relations": []
    },
    {
      "id": "counting",
      "name": "Counting & Combinatorics",
      "topic": "Combinatorics",
      "definition": "Counting arrangements and selections with/without repetition and order.",
      "intuition": "Permutation = order matters; Combination = order doesn't matter.",
      "formula": "P(n,r)=n!/(n-r)!; C(n,r)=n!/[r!(n-r)!]; Derangements: D(n)=n![1-1/1!+...+(-1)ⁿ/n!]",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Circular permutation = (n-1)! If clockwise=anti-clockwise: divide by 2.",
      "common_mistake": "Combination with repetition: C(n+r-1,r), NOT C(n,r).",
      "pyq_insight": "GATE: count BSTs with n keys = Catalan(n) = C(2n,n)/(n+1).",
      "relations": []
    },
    {
      "id": "pigeonhole",
      "name": "Pigeonhole Principle",
      "topic": "Combinatorics",
      "definition": "If n+1 objects placed in n holes, at least one hole has ≥2 objects.",
      "intuition": "5 socks in 4 drawers — at least one drawer has 2 socks. Simple but powerful.",
      "formula": "Generalized: if kn+1 objects in n holes → at least one hole has ≥k+1 objects.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Many GATE DM proofs use pigeonhole — know when to apply it.",
      "common_mistake": "Pigeonhole proves EXISTENCE not CONSTRUCTION — doesn't tell you WHICH hole is full.",
      "pyq_insight": "GATE: prove existence of some property using pigeonhole (birthday problem type).",
      "relations": []
    },
    {
      "id": "generating_functions",
      "name": "Generating Functions",
      "topic": "Combinatorics",
      "definition": "Power series where coefficient of xⁿ encodes the nth term of a sequence.",
      "intuition": "Package a whole sequence of numbers into one polynomial for algebraic manipulation.",
      "formula": "Ordinary GF: G(x) = Σ aₙxⁿ. Solve recurrences by algebraic manipulation.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Convolution of GFs = multiplication. Used for counting collections of objects.",
      "common_mistake": "Generating function is a formal power series — convergence doesn't matter for counting.",
      "pyq_insight": "GATE: solve recurrence or count arrangements using generating function approach.",
      "relations": []
    },
    {
      "id": "boolean_lattice",
      "name": "Lattices & Boolean Algebras",
      "topic": "Algebraic Structures",
      "definition": "Lattice: POSET where every pair has LUB (join) and GLB (meet). Boolean algebra: complemented distributive lattice.",
      "intuition": "Lattice is a structured hierarchy. Boolean algebra is the mathematical foundation of digital logic.",
      "formula": "Boolean algebra identifies: complement, join (+), meet (·). De Morgan's laws hold.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Power set of any set with ⊆ forms a Boolean algebra. Divisibility with LCM/GCD forms lattice.",
      "common_mistake": "Not every POSET is a lattice (some pairs may lack LUB or GLB).",
      "pyq_insight": "GATE: identify if given POSET is a lattice; find supremum/infimum of elements.",
      "relations": [
        {
          "to": "relations",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "group_theory",
      "name": "Groups, Rings & Fields",
      "topic": "Algebraic Structures",
      "definition": "Group: set with binary operation satisfying closure, associativity, identity, inverse.",
      "intuition": "Group = most minimal structure with an invertible operation. Fields have two operations (like ℝ).",
      "formula": "Abelian group: commutative. Ring: group + second op with distributivity. Field: ring with division.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Integers mod p (prime): (Zₚ, +, ×) forms a field — every nonzero element has multiplicative inverse.",
      "common_mistake": "Every field is a ring, every ring is a group under addition — but not vice versa.",
      "pyq_insight": "GATE: identify algebraic structure; verify group axioms; find order of element.",
      "relations": []
    },
    {
      "id": "eulerian_hamiltonian",
      "name": "Eulerian & Hamiltonian Paths",
      "topic": "Graph Theory",
      "definition": "Eulerian: visits every edge exactly once. Hamiltonian: visits every vertex exactly once.",
      "intuition": "Eulerian = drawing without lifting pen. Hamiltonian = visiting every city once.",
      "formula": "Eulerian circuit: connected + all even degrees. Path: exactly 2 odd-degree vertices.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Eulerian is polynomial to decide. Hamiltonian is NP-complete. HUGE complexity difference.",
      "common_mistake": "Eulerian circuit: ALL vertices must have even degree. Eulerian path: exactly 2 odd-degree vertices.",
      "pyq_insight": "GATE: determine Eulerian/Hamiltonian property; count Eulerian circuits; design graph with property.",
      "relations": [
        {
          "to": "graph_theory",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "chromatic",
      "name": "Graph Coloring & Chromatic Number",
      "topic": "Graph Theory",
      "definition": "Chromatic number χ(G): minimum colors needed so no adjacent vertices share a color.",
      "intuition": "Color a map so no bordering regions share a color — classic graph coloring.",
      "formula": "Bipartite: χ=2. Kₙ: χ=n. Cₙ: χ=2 (even), 3 (odd). Planar: χ≤4 (four-color theorem).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Graph is bipartite iff it has no odd cycles iff it is 2-colorable.",
      "common_mistake": "Chromatic polynomial ≠ chromatic number. Polynomial counts valid colorings with k colors.",
      "pyq_insight": "GATE: find chromatic number; check bipartiteness; apply 4-color theorem for planar graphs.",
      "relations": [
        {
          "to": "graph_theory",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "inclusion_exclusion",
      "name": "Inclusion-Exclusion Principle",
      "topic": "Combinatorics",
      "definition": "|A∪B∪C| = |A|+|B|+|C|-|A∩B|-|B∩C|-|A∩C|+|A∩B∩C|.",
      "intuition": "Add all sets, subtract double-counts, add back triple-counts that were over-subtracted.",
      "formula": "For n sets: |A₁∪...∪Aₙ| = Σ|Aᵢ| - Σ|Aᵢ∩Aⱼ| + Σ|Aᵢ∩Aⱼ∩Aₖ| - ... ",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Perfect for 'at least one' probability via P(A∪B) = P(A)+P(B)-P(A∩B).",
      "common_mistake": "For 3 sets forget to ADD BACK the triple intersection after subtracting pairs.",
      "pyq_insight": "GATE: count strings with at least one digit or upper/lowercase — use inclusion-exclusion.",
      "relations": []
    },
    {
      "id": "catalan",
      "name": "Catalan Numbers",
      "topic": "Combinatorics",
      "definition": "Cₙ = C(2n,n)/(n+1). Counts many structures: BSTs, parenthesizations, triangulations.",
      "intuition": "Cₙ counts the number of valid structures of n pairs/elements.",
      "formula": "C₀=1, Cₙ=Σ(k=0 to n-1) Cₖ·Cₙ₋₁₋ₖ. Cₙ = C(2n,n)/(n+1).",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "n-key BSTs = Cₙ. Full parenthesizations of n+1 factors = Cₙ. Triangulations = Cₙ₋₂.",
      "common_mistake": "Catalan number for BSTs uses n keys (not n-1). C₅ = 42 BSTs for 5 keys.",
      "pyq_insight": "GATE: count BSTs/paths/matched parentheses using Catalan — very common.",
      "relations": []
    },
    {
      "id": "stirling",
      "name": "Stirling Numbers",
      "topic": "Combinatorics",
      "definition": "S(n,k): ways to partition n elements into k non-empty unlabeled subsets.",
      "intuition": "How many ways to split a class into k study groups (groups are interchangeable).",
      "formula": "S(n,k) = k·S(n-1,k) + S(n-1,k-1). S(n,1)=1, S(n,n)=1.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Onto functions from n to k elements: k! × S(n,k).",
      "common_mistake": "S(n,k) ≠ C(n,k). Stirling counts PARTITIONS; C(n,k) counts SELECTIONS.",
      "pyq_insight": "GATE: not common but appears as counting onto functions problem.",
      "relations": []
    },
    {
      "id": "partial_order",
      "name": "Partial Orders & Hasse Diagrams",
      "topic": "Set Theory",
      "definition": "Reflexive, antisymmetric, transitive relation (POSET). Hasse diagram omits reflexive/transitive edges.",
      "intuition": "Like 'divisibility': 2|4|8 forms a chain. Hasse diagram shows it as a directed tower.",
      "formula": "Hasse diagram: remove self-loops and edges implied by transitivity.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Total order: every pair is comparable. Partial order: some pairs may be incomparable.",
      "common_mistake": "Hasse diagram does NOT show self-loops or implied edges — must identify what falls in between.",
      "pyq_insight": "GATE: draw Hasse diagram; find maximal/minimal elements; check total vs partial order.",
      "relations": [
        {
          "to": "relations",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "equivalence_class",
      "name": "Equivalence Classes & Partitions",
      "topic": "Set Theory",
      "definition": "Equivalence relation partitions set into disjoint, exhaustive equivalence classes [a].",
      "intuition": "'Same mod 3' groups all integers into {0,3,6,...}, {1,4,7,...}, {2,5,8,...} — 3 perfect groups.",
      "formula": "[a] = {x ∈ A | x R a}. Quotient set A/R = collection of all equivalence classes.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Number of equivalence classes = number of distinct partitions. Bell number Bₙ counts these.",
      "common_mistake": "Every element belongs to EXACTLY ONE equivalence class — classes are disjoint.",
      "pyq_insight": "GATE: find equivalence classes for given relation; determine if relation is equivalence.",
      "relations": [
        {
          "to": "relations",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "planar_graph",
      "name": "Planar Graphs & Euler's Formula",
      "topic": "Graph Theory",
      "definition": "Graph drawable in plane with no edge crossings. Euler: V - E + F = 2 (connected planar).",
      "intuition": "Can you draw the graph without lines crossing? K₄ yes. K₅ no.",
      "formula": "Planar: E ≤ 3V-6. Bipartite planar: E ≤ 2V-4. K₅ and K₃,₃ are minimal non-planar.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Quick non-planarity check: E > 3V-6 → definitely non-planar. Kuratowski: subdivision of K₅ or K₃,₃.",
      "common_mistake": "Euler's formula V-E+F=2 only for CONNECTED planar graphs. F includes outer/unbounded face.",
      "pyq_insight": "GATE: verify planarity; count faces; apply Euler's formula given V and E.",
      "relations": [
        {
          "to": "graph_theory",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "graph_isomorphism",
      "name": "Graph Isomorphism",
      "topic": "Graph Theory",
      "definition": "Two graphs are isomorphic if there's a bijection preserving adjacency. NI (neither P nor NP-complete known).",
      "intuition": "Two different 'drawings' of the same graph — relabel vertices and check if graphs are identical.",
      "formula": "Necessary conditions: same V, E, degree sequence, cycle count — but NOT sufficient.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Same degree sequence is NECESSARY not SUFFICIENT. Many non-isomorphic graphs share degree sequences.",
      "common_mistake": "Checking degree sequence alone: C₆ and two disjoint C₃ have same degree sequence but different structure.",
      "pyq_insight": "GATE: check if two graphs are isomorphic using invariants.",
      "relations": []
    },
    {
      "id": "ramsey",
      "name": "Ramsey Theory Basics",
      "topic": "Graph Theory",
      "definition": "R(m,n): minimum complete graph size guaranteeing clique of size m or independent set of size n.",
      "intuition": "In any large enough party: either m people all know each other, or n people who are all strangers.",
      "formula": "R(3,3) = 6. Among 6 people, there are always 3 mutual friends or 3 mutual strangers.",
      "difficulty": "hard",
      "importance": 5,
      "exam_trick": "R(3,3)=6 is the only value usually memorized. Bounds: R(m,n) ≤ C(m+n-2, m-1).",
      "common_mistake": "Ramsey guarantees existence — doesn't provide a construction.",
      "pyq_insight": "GATE: conceptual knowledge of R(3,3); rarely asked computationally.",
      "relations": []
    },
    {
      "id": "functions",
      "name": "Functions & Types",
      "topic": "Set Theory",
      "definition": "Function f: A→B assigns each element of A exactly one element of B.",
      "intuition": "One-to-one mapping from inputs to outputs — no input skipped, no input maps to two outputs.",
      "formula": "Injective: one-to-one. Surjective/Onto: every B element has preimage. Bijective: both.",
      "difficulty": "easy",
      "importance": 8,
      "exam_trick": "Number of functions A→B: |B|^|A|. Injective: P(|B|,|A|). Bijective: |A|! if |A|=|B|.",
      "common_mistake": "Injection requires |A| ≤ |B|. Surjection requires |B| ≤ |A|. Both → |A|=|B| (bijection).",
      "pyq_insight": "GATE: count functions satisfying given property; identify function type.",
      "relations": []
    }
  ],
  "dl": [
    {
      "id": "boolean_algebra",
      "name": "Boolean Algebra",
      "topic": "Boolean Logic",
      "definition": "Algebraic system where variables are true/false (1/0) and operations are AND, OR, NOT.",
      "intuition": "All digital circuits are ultimately combinations of AND, OR, NOT.",
      "formula": "De Morgan: (A·B)' = A'+B'; (A+B)' = A'·B'; Absorption: A+AB = A",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "NAND and NOR are universal gates — can implement any function.",
      "common_mistake": "Duality: swap AND↔OR, 0↔1. This is different from complement.",
      "pyq_insight": "GATE asks for minimal SOP/POS using K-map with don't cares.",
      "relations": [
        {
          "to": "kmap",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "kmap",
      "name": "Karnaugh Map (K-map)",
      "topic": "Boolean Logic",
      "definition": "Visual method to minimize Boolean expressions by grouping minterms.",
      "intuition": "Bigger groups → fewer literals → simpler circuit.",
      "formula": "Groups must be powers of 2 (1,2,4,8). Wrap around edges.",
      "difficulty": "medium",
      "importance": 10,
      "exam_trick": "Always create LARGEST possible groups. Don't cares can be 0 or 1.",
      "common_mistake": "Forgetting to find ALL prime implicants, then select Essential PIs.",
      "pyq_insight": "Appears every GATE year. 2-4 marks. Never skip this topic.",
      "relations": [
        {
          "to": "combinational_circuits",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "combinational_circuits",
      "name": "Combinational Circuits",
      "topic": "Circuit Design",
      "definition": "Output depends only on current inputs — no memory elements.",
      "intuition": "Pure logic function: MUX, decoder, adder, comparator.",
      "formula": "Full adder: Sum=A⊕B⊕Cin; Cout=AB+BCin+ACin",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "2ⁿ:1 MUX with n select lines implements ANY n-variable function.",
      "common_mistake": "MUX is select-driven — data comes from inputs, not select lines.",
      "pyq_insight": "GATE: implement function using 4:1 MUX with one input as variable.",
      "relations": [
        {
          "to": "sequential_circuits",
          "type": "contrasts_with"
        }
      ]
    },
    {
      "id": "sequential_circuits",
      "name": "Sequential Circuits & Flip-Flops",
      "topic": "Circuit Design",
      "definition": "Output depends on current inputs AND past state (memory element present).",
      "intuition": "Circuit with a 'memory' — flip-flops store the current state.",
      "formula": "JK FF: Q(t+1)=JQ'+K'Q; D FF: Q(t+1)=D; T FF: Q(t+1)=T⊕Q",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "SR FF has forbidden state S=R=1. JK resolves this by toggling.",
      "common_mistake": "Mealy output depends on state+input; Moore output depends only on state.",
      "pyq_insight": "GATE asks flip-flop conversion using excitation tables + K-map.",
      "relations": []
    },
    {
      "id": "number_systems",
      "name": "Number Systems & Arithmetic",
      "topic": "Number Theory",
      "definition": "Different bases for representing numbers: binary, octal, hex, BCD.",
      "intuition": "All computer data is ultimately binary. Conversions are reversible.",
      "formula": "2's comp range: -2^(n-1) to 2^(n-1)-1. Overflow = Cin(MSB) ⊕ Cout(MSB).",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Hex↔Binary: group 4 bits. Octal↔Binary: group 3 bits.",
      "common_mistake": "BCD: only 0000-1001 valid. If sum>9, add 0110 (6) to correct.",
      "pyq_insight": "GATE tests 2's complement arithmetic and overflow detection.",
      "relations": []
    },
    {
      "id": "fsm",
      "name": "Finite State Machines",
      "topic": "Automata",
      "definition": "Model of computation with states, transitions, inputs, and outputs.",
      "intuition": "Like a vending machine — current state + input determines next state + output.",
      "formula": "Mealy: output on transitions. Moore: output on states.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Minimize FSM: find equivalent states using table-filling method.",
      "common_mistake": "Mealy → Moore conversion increases state count.",
      "pyq_insight": "GATE: design sequence detector, find minimal DFA equivalent.",
      "relations": []
    },
    {
      "id": "hazards_dl",
      "name": "Hazards in Combinational Circuits",
      "topic": "Circuit Design",
      "definition": "Unwanted transient output glitches caused by unequal propagation delays.",
      "intuition": "Two paths to same output with different speeds — one arrives before the other causing a glitch.",
      "formula": "Static-1 hazard: output should stay 1 but glitches 0. Fix: add consensus terms in K-map.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Add redundant prime implicant covering transition between two groups in K-map to eliminate hazard.",
      "common_mistake": "Hazards exist only in COMBINATIONAL circuits. Sequential circuits handle this with clocking.",
      "pyq_insight": "GATE: identify hazard in circuit; apply K-map fix.",
      "relations": [
        {
          "to": "kmap",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "encoder_decoder",
      "name": "Encoders & Decoders",
      "topic": "Combinational Circuits",
      "definition": "Encoder: 2^n inputs → n outputs. Decoder: n inputs → 2^n outputs (one hot).",
      "intuition": "Encoder compresses, decoder expands. Like zip/unzip for digital signals.",
      "formula": "Priority encoder: highest priority input determines output. Enable pin for cascading.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Decoder + OR gates implements any combinational function. MUX is universal function generator.",
      "common_mistake": "Decoder output is ONE-HOT (exactly one output is 1). Encoder does the opposite.",
      "pyq_insight": "GATE: implement Boolean function using decoder and OR gates.",
      "relations": [
        {
          "to": "combinational_circuits",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "registers",
      "name": "Shift Registers",
      "topic": "Sequential Circuits",
      "definition": "Chain of flip-flops sharing a clock. Data shifts left or right each clock cycle.",
      "intuition": "Bucket brigade — data passes from one flip-flop to the next each tick.",
      "formula": "SISO: serial in/out. SIPO: serial in, parallel out. PISO: parallel in, serial out. PIPO: register.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "n-bit shift register delays data by n clock cycles. Used in serial transmission.",
      "common_mistake": "PIPO is just n D flip-flops in parallel — no shifting. It's a simple register.",
      "pyq_insight": "GATE: trace shift register output for given input sequence and initial state.",
      "relations": [
        {
          "to": "sequential_circuits",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "counters",
      "name": "Counters",
      "topic": "Sequential Circuits",
      "definition": "Sequential circuit that cycles through a fixed sequence of states.",
      "intuition": "Like a digital odometer — counts up (or down) and wraps around.",
      "formula": "Ripple counter: n FFs → mod-2^n. Synchronous: all FFs clocked together. Mod-N: reset at N.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Ripple counter: delay = n × t_FF (cascaded). Synchronous counter: delay = 1 × t_FF.",
      "common_mistake": "Ripple counter is ASYNCHRONOUS — FFs don't all clock simultaneously. Glitches possible.",
      "pyq_insight": "GATE: design mod-N counter; trace state sequence; compute propagation delay.",
      "relations": [
        {
          "to": "sequential_circuits",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "pla_pal",
      "name": "PLA & PAL",
      "topic": "Programmable Logic",
      "definition": "PLA: programmable AND + programmable OR. PAL: programmable AND + fixed OR.",
      "intuition": "PLA is fully flexible; PAL is faster (fixed OR plane reduces delay).",
      "formula": "PLA size: n inputs, k product terms, m outputs. PAL: n inputs, fixed OR fanin.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "FPGA supersedes both PLA/PAL in modern design. GATE still occasionally asks PLA basics.",
      "common_mistake": "ROM implements any function (2^n minterms). PLA implements functions with fewer terms.",
      "pyq_insight": "GATE: compute PLA size; compare with ROM implementation for given function.",
      "relations": []
    },
    {
      "id": "multiplexer_logic",
      "name": "MUX as Universal Logic",
      "topic": "Combinational Circuits",
      "definition": "A 2^n:1 MUX with n select lines can implement ANY n-variable Boolean function.",
      "intuition": "Connect function truth table column directly to MUX data inputs — inputs select the output.",
      "formula": "4:1 MUX (2 select lines) implements any 2-variable function. 8:1 MUX: any 3-variable.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "With 1 variable on data inputs: (n-1)-variable select lines → n-variable function possible.",
      "common_mistake": "For 'reduced MUX' method: put one variable on data lines; others on select — be systematic.",
      "pyq_insight": "GATE: implement F(A,B,C) using 4:1 MUX — extremely common question type.",
      "relations": [
        {
          "to": "combinational_circuits",
          "type": "part_of"
        }
      ]
    }
  ],
  "coa": [
    {
      "id": "pipeline",
      "name": "Instruction Pipelining",
      "topic": "CPU Design",
      "definition": "Overlaps execution of multiple instructions in stages.",
      "intuition": "Like an assembly line: while one instruction executes, the next is decoded.",
      "formula": "Speedup = k·n/(k+n-1); k=stages, n=instructions",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "With infinite instructions, speedup → k (number of stages).",
      "common_mistake": "Stalls reduce throughput. CPI_actual = CPI_ideal + stall_cycles/instruction.",
      "pyq_insight": "Most tested COA topic. Stall cycles, forwarding, CPI calculation.",
      "relations": [
        {
          "to": "hazards",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "hazards",
      "name": "Pipeline Hazards",
      "topic": "CPU Design",
      "definition": "Conditions that prevent next instruction from executing in the next cycle.",
      "intuition": "Data dependency, resource conflicts, and branch decisions cause delays.",
      "formula": "RAW: instruction n needs result of n-1 before it's ready.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "RAW is the only TRUE data hazard. WAW and WAR can be eliminated by renaming.",
      "common_mistake": "All three hazard types exist (structural, data, control) — not just data.",
      "pyq_insight": "GATE: given dependency graph, find number of stall cycles.",
      "relations": []
    },
    {
      "id": "cache",
      "name": "Cache Memory",
      "topic": "Memory Hierarchy",
      "definition": "Fast, small memory between CPU and RAM to reduce average access time.",
      "intuition": "Most frequently accessed data is kept in faster, smaller cache.",
      "formula": "AMAT = Hit time + Miss rate × Miss penalty; EAT = h·Tc + (1-h)·Tm",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "Simultaneous lookup: EAT = h·Tc+(1-h)·Tm. Sequential: Tc+(1-h)·Tm.",
      "common_mistake": "Cache EAT model type (simultaneous vs sequential) must match problem statement.",
      "pyq_insight": "Appears every GATE year. Multi-level cache AMAT, direct-mapped conflict misses.",
      "relations": [
        {
          "to": "virtual_memory",
          "type": "similar_to"
        }
      ]
    },
    {
      "id": "virtual_memory",
      "name": "Virtual Memory & Paging",
      "topic": "Memory Hierarchy",
      "definition": "Technique allowing processes to use more memory than physically available.",
      "intuition": "Each process gets its own virtual address space; OS maps pages to frames.",
      "formula": "TLB EAT: α(TLB+Tm)+(1-α)(TLB+2Tm) [α=TLB hit ratio]",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "TLB hit still requires 1 memory access (for data). Miss requires 2+.",
      "common_mistake": "Page fault brings data from disk. TLB miss is just a page table walk (RAM).",
      "pyq_insight": "GATE: compute EAT with TLB hit ratio and page fault rate combined.",
      "relations": []
    },
    {
      "id": "addressing_modes",
      "name": "Addressing Modes",
      "topic": "Instruction Set",
      "definition": "Methods of specifying the operand location in an instruction.",
      "intuition": "Different modes trade-off speed vs flexibility for accessing data.",
      "formula": "Immediate: value in instruction. Direct: address in instruction. Indexed: base+offset.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Register indirect is fast — no memory access for address calculation.",
      "common_mistake": "Indirect addressing requires an extra memory access (fetch address, then fetch data).",
      "pyq_insight": "GATE: identify addressing mode from instruction format given.",
      "relations": []
    },
    {
      "id": "risc_cisc",
      "name": "RISC vs CISC",
      "topic": "Instruction Set",
      "definition": "RISC: simple uniform instructions, load/store architecture. CISC: complex variable-length instructions.",
      "intuition": "RISC = many simple fast moves. CISC = fewer but more powerful moves.",
      "formula": "RISC: more instructions per program, fewer clock cycles per instruction. Net effect similar.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "RISC: fixed format, simple addressing, large register file. CISC: variable format, memory-to-memory ops.",
      "common_mistake": "RISC programs are NOT always smaller — more instructions needed for same computation.",
      "pyq_insight": "GATE: classify instruction features as RISC or CISC. Pipelining easier with RISC.",
      "relations": []
    },
    {
      "id": "interrupts",
      "name": "Interrupts & DMA",
      "topic": "I/O Systems",
      "definition": "Interrupt: hardware signals CPU to stop and handle an event. DMA: device transfers data directly to memory without CPU.",
      "intuition": "Interrupt = phone ringing while working. DMA = courier delivers package without bothering you.",
      "formula": "DMA cycle stealing: DMA takes bus cycles from CPU. Bus bandwidth shared.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "DMA reduces CPU overhead for large transfers. Interrupt-driven I/O better for small transfers.",
      "common_mistake": "DMA doesn't eliminate interrupts — DMA controller interrupts CPU when transfer is DONE.",
      "pyq_insight": "GATE: compare polling vs interrupt-driven vs DMA efficiency for given scenarios.",
      "relations": []
    },
    {
      "id": "instruction_format",
      "name": "Instruction Format & Encoding",
      "topic": "Instruction Set",
      "definition": "Binary encoding of operation, addressing mode, and operand information.",
      "intuition": "Every CPU instruction is a binary recipe: what to do, where operands are, where to store.",
      "formula": "Fixed-length (RISC): 32 bits. Variable-length (CISC): 1-15 bytes.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Operand encoding affects instruction count. Fewer operand bits = fewer addressable registers.",
      "common_mistake": "Zero-address: stack-based. One-address: accumulator. Two-address: destination modified. Three: separate dest.",
      "pyq_insight": "GATE: decode instruction bits; compute number of instructions given encoding constraints.",
      "relations": []
    },
    {
      "id": "cache_mapping",
      "name": "Cache Mapping & Miss Types",
      "topic": "Memory Hierarchy",
      "definition": "Direct mapped, fully associative, set-associative are the three cache placement policies.",
      "intuition": "Direct = one bucket per address. Fully assoc = any bucket. Set assoc = fixed group of buckets.",
      "formula": "Block offset = log2(block_size). Set index = log2(n_sets). Tag = remaining bits.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "3 C's of misses: Cold (compulsory), Capacity, Conflict. Only Cold exists in fully associative.",
      "common_mistake": "Higher associativity reduces conflict misses but increases hit time (more comparisons).",
      "pyq_insight": "GATE: compute tag/index/offset bits. Determine miss type. Compute miss rate.",
      "relations": [
        {
          "to": "cache",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "memory_interleaving",
      "name": "Memory Interleaving",
      "topic": "Memory Hierarchy",
      "definition": "Spreading consecutive memory addresses across multiple memory banks to allow parallel access.",
      "intuition": "Instead of one checkout lane, use multiple — customers (memory requests) served in parallel.",
      "formula": "With k banks: effective bandwidth ≈ k × single bank bandwidth for sequential access.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "High-order interleaving: consecutive banks hold consecutive large blocks. Low-order: consecutive words.",
      "common_mistake": "Interleaving helps sequential (stride-1) access. Stride-k access may serialize if k = bank count.",
      "pyq_insight": "GATE: compute effective memory bandwidth with n-way interleaving.",
      "relations": []
    },
    {
      "id": "branch_prediction",
      "name": "Branch Prediction",
      "topic": "CPU Design",
      "definition": "Predict branch outcome before evaluation to keep pipeline full.",
      "intuition": "Guess the likely branch direction in advance; if wrong, flush pipeline and restart.",
      "formula": "Misprediction penalty = k cycles flushed (k = stages between fetch and execute).",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "2-bit saturating counter prediction achieves ~90% accuracy on loops.",
      "common_mistake": "Branch prediction doesn't eliminate the penalty — just makes mispredictions rare.",
      "pyq_insight": "GATE: compute effective CPI with branch prediction given misprediction rate and penalty.",
      "relations": [
        {
          "to": "hazards",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "out_of_order",
      "name": "Out-of-Order Execution",
      "topic": "CPU Design",
      "definition": "CPU executes instructions in a different order than program order to avoid stalls.",
      "intuition": "If instruction 3 is waiting for data, execute instructions 4 and 5 first if they're ready.",
      "formula": "Tomasulo's algorithm: register renaming eliminates WAW and WAR hazards.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Tomasulo + ROB (Reorder Buffer) maintains precise exceptions despite out-of-order execution.",
      "common_mistake": "Out-of-order execution still COMMITS in order (via ROB). Only execution is out-of-order.",
      "pyq_insight": "GATE: conceptual — identify which hazards OOO execution eliminates.",
      "relations": [
        {
          "to": "hazards",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "ieee754",
      "name": "IEEE 754 Floating Point",
      "topic": "Number Systems",
      "definition": "Standard for float representation: sign bit, biased exponent, mantissa (significand).",
      "intuition": "Scientific notation in binary: ±1.mantissa × 2^(exponent-bias).",
      "formula": "Single: 1+8+23 bits, bias=127. Double: 1+11+52 bits, bias=1023. Stored: 1.f × 2^(E-bias).",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Implicit leading 1 in mantissa for normalized numbers. Denormalized: exp=0, no leading 1.",
      "common_mistake": "Bias=127 for single, NOT 128. Stored exponent = actual exponent + 127.",
      "pyq_insight": "GATE: convert decimal to IEEE 754; compute represented value; identify precision limits.",
      "relations": [
        {
          "to": "number_systems",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "booth",
      "name": "Booth's Algorithm",
      "topic": "Arithmetic Units",
      "definition": "Efficient multiplication algorithm for 2's complement numbers. Handles negative multipliers.",
      "intuition": "Look at pairs of bits: 01→add, 10→subtract, 00/11→no operation. Reduces operations.",
      "formula": "Examine bit and previous bit (Q₋₁). 01: A=A+M. 10: A=A-M. 00/11: no change. Right shift.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Modified Booth: examine 3 bits at a time → halves number of partial products.",
      "common_mistake": "Initialize Q₋₁=0. Final result is in (A,Q) after n iterations.",
      "pyq_insight": "GATE: trace Booth's algorithm for given operands; compute partial products.",
      "relations": []
    },
    {
      "id": "cache_coherence",
      "name": "Cache Coherence",
      "topic": "Memory Hierarchy",
      "definition": "In multi-processor systems, ensure all caches have consistent view of shared memory.",
      "intuition": "If CPU1 modifies a value, CPU2's cached copy becomes stale — coherence protocol fixes this.",
      "formula": "MESI protocol: Modified, Exclusive, Shared, Invalid states per cache line.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Write-invalidate: on write, invalidate other copies. Write-update: broadcast new value.",
      "common_mistake": "Cache coherence ≠ memory consistency. Coherence for one location; consistency for ordering.",
      "pyq_insight": "GATE: identify cache state transitions in MESI protocol given access sequence.",
      "relations": [
        {
          "to": "cache",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "memory_hierarchy",
      "name": "Memory Hierarchy Design",
      "topic": "Memory Hierarchy",
      "definition": "Levels: registers, L1/L2/L3 cache, DRAM, disk. Each level: larger, slower, cheaper.",
      "intuition": "Hot data travels up toward registers. Cold data stays on disk. Locality drives efficiency.",
      "formula": "Capacity: registers<L1<L2<L3<RAM<disk. Speed inverse. Cost/bit: registers>>disk.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Temporal locality: reuse recent data. Spatial locality: use nearby data. Both exploited by caches.",
      "common_mistake": "L1 cache is SEPARATE for instructions and data (split cache). L2 usually unified.",
      "pyq_insight": "GATE: compute average access time using weighted sum across memory hierarchy levels.",
      "relations": [
        {
          "to": "cache",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "restoring_division",
      "name": "Restoring & Non-Restoring Division",
      "topic": "Arithmetic Units",
      "definition": "Hardware algorithms for integer division producing quotient and remainder.",
      "intuition": "Trial subtraction: subtract divisor; if result negative, restore (add back) and shift.",
      "formula": "Restoring: subtract, check sign; if negative restore and set quotient bit=0. Non-restoring avoids restore step.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Non-restoring division: if negative shift and ADD divisor. If positive shift and SUBTRACT.",
      "common_mistake": "Initialize accumulator A=0, dividend Q, n iterations where n = dividend bits.",
      "pyq_insight": "GATE: trace restoring division for small numbers; identify quotient and remainder.",
      "relations": []
    },
    {
      "id": "microprogramming",
      "name": "Microprogramming",
      "topic": "CPU Design",
      "definition": "Control unit implemented as ROM storing microinstructions that implement each machine instruction.",
      "intuition": "Each assembly instruction is really a tiny program in the control unit's ROM.",
      "formula": "Horizontal microcode: wide words, one bit per control signal. Vertical: encoded, fewer bits.",
      "difficulty": "hard",
      "importance": 5,
      "exam_trick": "Vertical microprogramming: requires decoder but shorter control words.",
      "common_mistake": "Hardwired control is FASTER than microprogrammed. Microprogrammed is MORE FLEXIBLE.",
      "pyq_insight": "GATE: compare hardwired vs microprogrammed control; identify tradeoffs.",
      "relations": []
    },
    {
      "id": "superscalar",
      "name": "Superscalar & VLIW",
      "topic": "CPU Design",
      "definition": "Superscalar: CPU fetches and executes multiple instructions per cycle dynamically. VLIW: compiler schedules multiple instructions per cycle statically.",
      "intuition": "Superscalar: smart CPU decides what to run in parallel. VLIW: smart compiler decides at compile time.",
      "formula": "Superscalar: IPC > 1. VLIW: bundle = fixed-width packet with multiple independent instructions.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "VLIW requires smart compiler — no runtime dependency checking needed.",
      "common_mistake": "IPC > 1 needs TRUE instruction-level parallelism — data dependencies limit this.",
      "pyq_insight": "GATE: compare ILP techniques; identify which is hardware vs software speculation.",
      "relations": [
        {
          "to": "pipeline",
          "type": "depends_on"
        }
      ]
    }
  ],
  "pds": [
    {
      "id": "trees_bst",
      "name": "Binary Search Trees (BST)",
      "topic": "Trees",
      "definition": "Binary tree where left subtree < node < right subtree for all nodes.",
      "intuition": "Sorted binary tree. Inorder traversal always gives sorted sequence.",
      "formula": "Search/Insert/Delete: O(h). Balanced (AVL): h=O(log n). Worst case: h=n (sorted input).",
      "difficulty": "medium",
      "importance": 10,
      "exam_trick": "Inorder of BST = sorted order. Number of BSTs with n keys = Catalan(n).",
      "common_mistake": "Plain BST can degenerate to O(n) — always ask if 'balanced' is specified.",
      "pyq_insight": "GATE: insert sequence, find height. Or: minimum keys for AVL of height h.",
      "relations": [
        {
          "to": "avl",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "avl",
      "name": "AVL Trees (Balanced BST)",
      "topic": "Trees",
      "definition": "Self-balancing BST where height difference between subtrees ≤ 1.",
      "intuition": "After every insert/delete, rotations restore balance factor ∈ {-1,0,1}.",
      "formula": "BF = height(left) - height(right) ∈ {-1,0,1}; Min nodes: N(h)=N(h-1)+N(h-2)+1",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "4 rotation types: LL, RR, LR, RL. LR = left rotate child, then right rotate root.",
      "common_mistake": "LL imbalance needs RIGHT rotation (not left). Think of the heavy subtree side.",
      "pyq_insight": "GATE: trace AVL insertions, identify rotation type and resulting tree.",
      "relations": []
    },
    {
      "id": "heaps",
      "name": "Heaps & Priority Queue",
      "topic": "Trees",
      "definition": "Complete binary tree satisfying heap property (max or min at root).",
      "intuition": "Parent always dominates children. Root is always the extreme value.",
      "formula": "Build heap: O(n). Insert/extract: O(log n). Height: ⌊log₂n⌋.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Build heap is O(n), NOT O(n log n). This is a very common trap.",
      "common_mistake": "Heap does NOT support O(log n) arbitrary delete without knowing the index.",
      "pyq_insight": "GATE: heapify trace, heap sort comparisons, or priority queue simulation.",
      "relations": []
    },
    {
      "id": "hashing",
      "name": "Hashing & Collision",
      "topic": "Hashing",
      "definition": "Maps keys to array indices via a hash function. Collisions handled by chaining or open addressing.",
      "intuition": "Direct access by computing array index from key — ideally O(1).",
      "formula": "Load factor α = n/m. Chaining: O(1+α). Open addressing fails when α≥1.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Linear probing: primary clustering. Quadratic: secondary. Double hashing: best.",
      "common_mistake": "Open addressing max load factor < 1. Chaining can go above 1.",
      "pyq_insight": "GATE: trace hash table with specific function and collision resolution.",
      "relations": []
    },
    {
      "id": "graph_traversal",
      "name": "Graph Traversal (BFS & DFS)",
      "topic": "Graph Algorithms",
      "definition": "Systematic exploration of graph vertices. BFS uses queue; DFS uses stack/recursion.",
      "intuition": "BFS = level-by-level exploration (shortest path). DFS = go deep before backtracking.",
      "formula": "Both: O(V+E) time, O(V) space. BFS gives shortest path in unweighted graphs.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "BFS tree = shortest-path tree. DFS finds cycles, topological sort, SCCs.",
      "common_mistake": "DFS does NOT find shortest paths. Use BFS for unweighted shortest path.",
      "pyq_insight": "GATE: DFS/BFS traversal order, back edges (cycles), cross edges.",
      "relations": []
    },
    {
      "id": "sorting",
      "name": "Sorting Algorithms",
      "topic": "Algorithms",
      "definition": "Rearranging elements in a specified order using comparison or distribution-based methods.",
      "intuition": "Trade-offs between stability, in-place, worst-case, and average-case complexity.",
      "formula": "Merge: O(n log n) worst, stable. Quick: O(n²) worst, O(n log n) avg, in-place, unstable.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Heap sort: O(n log n) ALL cases, in-place, unstable. Only algo with guaranteed O(n log n).",
      "common_mistake": "Quick sort is NOT O(n log n) guaranteed — sorted input → O(n²) with naive pivot.",
      "pyq_insight": "GATE: worst case comparisons, sorted input behavior, stability requirements.",
      "relations": []
    },
    {
      "id": "linked_list",
      "name": "Linked Lists",
      "topic": "Linear Data Structures",
      "definition": "Collection of nodes where each has data and pointer to next node.",
      "intuition": "Train of cars — each car links to the next; easy to add/remove cars anywhere.",
      "formula": "Insert/delete: O(1) if position known. Search: O(n). No random access.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Singly linked: O(n) to find previous. Doubly linked: O(1) to access previous.",
      "common_mistake": "Linked list insert at known position is O(1) but FINDING that position is O(n).",
      "pyq_insight": "GATE: reverse linked list in-place, detect loop (Floyd's cycle detection), merge sorted lists.",
      "relations": []
    },
    {
      "id": "stack_apps",
      "name": "Stack Applications",
      "topic": "Linear Data Structures",
      "definition": "LIFO structure for expression evaluation, function calls, backtracking.",
      "intuition": "Stack of plates — last placed, first removed. Natural for nested/recursive structure.",
      "formula": "Infix→Postfix: O(n). Postfix eval: O(n). Recursion simulation: O(depth).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Balanced parentheses: push opens, pop for closes and match. Stack is standard approach.",
      "common_mistake": "Infix operator precedence must be properly encoded in algorithm.",
      "pyq_insight": "GATE: trace postfix evaluation; convert infix to postfix; check balanced brackets.",
      "relations": []
    },
    {
      "id": "trie",
      "name": "Trie (Prefix Tree)",
      "topic": "Trees",
      "definition": "Tree for storing strings where each node represents a character. Prefix sharing saves space.",
      "intuition": "Like a dictionary organized by letter — all words starting with 'ca' share same branch.",
      "formula": "Insert/search: O(L) where L = string length. Space: O(|alphabet| × |total chars|).",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "Trie is optimal for prefix-based queries. NOT efficient for arbitrary substring search.",
      "common_mistake": "Each node has up to |alphabet| children pointers. Can be memory intensive.",
      "pyq_insight": "GATE: count distinct prefixes, find all strings with given prefix, or autocomplete.",
      "relations": []
    },
    {
      "id": "disjoint_set",
      "name": "Union-Find (Disjoint Set Union)",
      "topic": "Data Structures",
      "definition": "Data structure tracking elements partitioned into non-overlapping sets.",
      "intuition": "Friend groups — find who's in same group; merge two groups together.",
      "formula": "With path compression + union by rank: O(α(n)) per operation (nearly O(1)).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Used in Kruskal's MST to detect cycles. Union by rank prevents skewed trees.",
      "common_mistake": "Without optimizations: O(n) per operation. With both path compression + rank: O(α(n)).",
      "pyq_insight": "GATE: trace union-find operations; apply to Kruskal's algorithm cycle detection.",
      "relations": []
    },
    {
      "id": "btree",
      "name": "B-Trees",
      "topic": "Trees",
      "definition": "Self-balancing multi-way tree for disk-based storage. Order m: each node has up to m children.",
      "intuition": "Like a fat balanced tree — wider nodes reduce height, minimize disk I/O.",
      "formula": "B-tree of order m: each internal node has ⌈m/2⌉ to m children. Height: O(log_m n).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "B-tree vs B+ tree: B-tree stores data everywhere; B+ tree only in leaves (better for scan).",
      "common_mistake": "'Order' definition varies in literature. GATE uses the standard: max children = order m.",
      "pyq_insight": "GATE: insert into B-tree, identify split point, compute height for n keys.",
      "relations": [
        {
          "to": "indexing",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "graph_structures",
      "name": "Graph Data Structures",
      "topic": "Graph Algorithms",
      "definition": "Adjacency matrix: O(V²) space. Adjacency list: O(V+E) space. Best choice depends on density.",
      "intuition": "Matrix: fast edge lookup. List: fast neighbor traversal. Dense graph → matrix. Sparse → list.",
      "formula": "Adj matrix: O(V²). Adj list: O(V+E). Edge query: O(1) vs O(degree).",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Adjacency list is ALWAYS preferred for sparse graphs. Matrix wastes memory.",
      "common_mistake": "For weighted graph, adjacency list stores (neighbor, weight) pairs.",
      "pyq_insight": "GATE: choose representation given graph density; compute storage for given V and E.",
      "relations": []
    },
    {
      "id": "heap_impl",
      "name": "Heap Implementation Details",
      "topic": "Trees",
      "definition": "Max-heap: parent ≥ children. Stored as array: parent at i, children at 2i+1 and 2i+2.",
      "intuition": "Conceptually a tree, stored as array — parent-child relationships via index formulas.",
      "formula": "Parent: ⌊(i-1)/2⌋. Left child: 2i+1. Right child: 2i+2. Heapify: O(log n).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Heapify is O(log n). Building heap bottom-up using n/2 heapify calls: O(n) total.",
      "common_mistake": "Inserting n elements one-by-one into heap → O(n log n). Build-heap → O(n). HUGE difference.",
      "pyq_insight": "GATE: trace heap insertion/deletion; prove build-heap is O(n); k-th smallest using heap.",
      "relations": [
        {
          "to": "heaps",
          "type": "part_of"
        }
      ]
    }
  ],
  "algo": [
    {
      "id": "master_theorem",
      "name": "Master Theorem",
      "topic": "Analysis",
      "definition": "Closed-form solution for divide-and-conquer recurrences of form T(n)=aT(n/b)+f(n).",
      "intuition": "Compare f(n) to n^(log_b a). Whichever dominates, determines complexity.",
      "formula": "c=log_b(a); Case1: f=O(n^(c-ε))→T=O(nᶜ); Case2: f=Θ(nᶜ)→T=O(nᶜlogn); Case3: f=Ω(n^(c+ε))→T=O(f(n))",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "Case 2 is most common: T(n)=2T(n/2)+n → O(n log n).",
      "common_mistake": "Case 3 also needs 'regularity condition' — check if af(n/b) ≤ cf(n).",
      "pyq_insight": "GATE: every year. 1-2 recurrences to solve using Master Theorem.",
      "relations": []
    },
    {
      "id": "dijkstra",
      "name": "Dijkstra's Algorithm",
      "topic": "Graph Algorithms",
      "definition": "Single-source shortest path for graphs with non-negative weights.",
      "intuition": "Greedily expand the nearest unvisited node. Like ripples expanding in water.",
      "formula": "O((V+E)log V) with binary heap; O(V²) without heap",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Dijkstra FAILS with negative weights. Use Bellman-Ford instead.",
      "common_mistake": "Dijkstra does NOT work on graphs with negative edges — even one breaks it.",
      "pyq_insight": "GATE: trace algorithm, find shortest path distance, identify visited order.",
      "relations": [
        {
          "to": "bellman_ford",
          "type": "contrasts_with"
        }
      ]
    },
    {
      "id": "bellman_ford",
      "name": "Bellman-Ford Algorithm",
      "topic": "Graph Algorithms",
      "definition": "Single-source shortest path supporting negative weights; detects negative cycles.",
      "intuition": "Relax all edges V-1 times. If still improving after V-1 iterations → negative cycle.",
      "formula": "O(VE) time. V-1 relaxation passes required.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "V-1 passes are necessary and sufficient for a graph with no negative cycles.",
      "common_mistake": "Bellman-Ford works with negative WEIGHTS but NOT negative CYCLES.",
      "pyq_insight": "GATE: given graph with negative edge, use Bellman-Ford trace.",
      "relations": []
    },
    {
      "id": "mst",
      "name": "Minimum Spanning Tree",
      "topic": "Graph Algorithms",
      "definition": "Spanning tree of weighted graph with minimum total edge weight.",
      "intuition": "Connect all nodes with minimum total wire length.",
      "formula": "Kruskal: O(E log E) — sort edges, greedy union-find. Prim: O(E log V) — grow from one vertex.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "For dense graphs: Prim better. For sparse: Kruskal better.",
      "common_mistake": "MST is NOT unique if edge weights are distinct — actually it IS unique then.",
      "pyq_insight": "GATE: trace Kruskal/Prim step by step. Number of MSTs where weights repeat.",
      "relations": []
    },
    {
      "id": "dp",
      "name": "Dynamic Programming",
      "topic": "Optimization",
      "definition": "Solves complex problems by breaking into subproblems and memoizing results.",
      "intuition": "Store and reuse subproblem solutions instead of recomputing them.",
      "formula": "LCS: dp[i][j]=dp[i-1][j-1]+1 if match, else max. Knapsack: dp[i][w]=max(exclude, include).",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "Check: overlapping subproblems + optimal substructure → DP applies.",
      "common_mistake": "0/1 Knapsack CANNOT be solved greedily. Fractional knapsack CAN.",
      "pyq_insight": "GATE: LCS, edit distance, matrix chain, coin change — all standard DP questions.",
      "relations": []
    },
    {
      "id": "np_completeness",
      "name": "NP-Completeness",
      "topic": "Complexity",
      "definition": "Class of decision problems where solution is verifiable in polynomial time but not necessarily solvable.",
      "intuition": "If any NP-complete problem had a poly-time solution, ALL NP problems would be solvable.",
      "formula": "P ⊆ NP. NP-hard: at least as hard as NP-complete. P=NP is open.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Show NP-completeness: reduce a KNOWN NP-complete problem to your problem.",
      "common_mistake": "NP-hard problems are NOT necessarily in NP (they may not be decision problems).",
      "pyq_insight": "GATE: classify problem as P, NP, NP-complete, NP-hard, or undecidable.",
      "relations": []
    },
    {
      "id": "amortized",
      "name": "Amortized Analysis",
      "topic": "Analysis",
      "definition": "Average cost per operation over a sequence — accounts for occasional expensive operations.",
      "intuition": "Like car maintenance — daily cost is low but amortizing the annual service spreads the expense.",
      "formula": "Aggregate, accounting, or potential method. Stack push/pop: O(1) amortized.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Amortized ≠ average. It's worst-case per operation over a SEQUENCE.",
      "common_mistake": "An occasional O(n) operation can still give O(1) amortized if n is rare enough.",
      "pyq_insight": "GATE: amortized cost of dynamic array insertion = O(1). Multi-pop stack = O(n).",
      "relations": []
    },
    {
      "id": "greedy_proof",
      "name": "Greedy Algorithm Design",
      "topic": "Optimization",
      "definition": "Making locally optimal choices hoping for global optimum. Works when greedy choice property + optimal substructure holds.",
      "intuition": "Always pick the best-looking move now — works for activity selection, Huffman, MST.",
      "formula": "Greedy exchange argument: show any other choice ≤ greedy choice.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "For 0/1 knapsack, greedy FAILS. For fractional, greedy WORKS. Big GATE trap.",
      "common_mistake": "Greedy doesn't always find global optimum — must PROVE greedy choice property.",
      "pyq_insight": "GATE: Huffman coding, activity selection, coin change (specific denominations).",
      "relations": []
    },
    {
      "id": "huffman",
      "name": "Huffman Coding",
      "topic": "Compression",
      "definition": "Optimal prefix-free variable-length encoding where frequent symbols get shorter codes.",
      "intuition": "Common letters (e, t, a) get 1-2 bits. Rare letters get 6-8 bits.",
      "formula": "Build min-heap of frequencies. Combine two smallest until one tree. Greedy.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Huffman tree: 0=left, 1=right by convention. Always prefix-free.",
      "common_mistake": "Huffman gives optimal prefix-free code. Fixed-length codes are never optimal for skewed frequencies.",
      "pyq_insight": "GATE: build Huffman tree from given frequencies. Find code lengths. Compute avg bits.",
      "relations": [
        {
          "to": "greedy_proof",
          "type": "derived_from"
        }
      ]
    },
    {
      "id": "topological_sort",
      "name": "Topological Sort",
      "topic": "Graph Algorithms",
      "definition": "Linear ordering of vertices in a DAG where every edge u→v has u before v.",
      "intuition": "Like a prerequisite order for courses — must take CS101 before CS201.",
      "formula": "DFS-based: post-order reverse. Kahn's BFS: use in-degree queue. Both O(V+E).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Topological sort ONLY works on DAGs. Cycle → no topological order.",
      "common_mistake": "Multiple valid topological orders may exist for same DAG.",
      "pyq_insight": "GATE: find all valid topological orders; or check if given order is valid.",
      "relations": [
        {
          "to": "graph_traversal",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "scc",
      "name": "Strongly Connected Components (SCC)",
      "topic": "Graph Algorithms",
      "definition": "Maximal set of vertices where every vertex is reachable from every other vertex.",
      "intuition": "Islands in a directed graph where you can get anywhere from anywhere within the island.",
      "formula": "Kosaraju's: 2 DFS passes. Tarjan's: 1 DFS with low-link values. Both O(V+E).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Condensation DAG of SCCs is always a DAG. SCC = single vertex if no back edges.",
      "common_mistake": "SCCs are for DIRECTED graphs only. Connected components are for undirected.",
      "pyq_insight": "GATE: count SCCs in a directed graph, or identify SCC structure given DFS tree.",
      "relations": []
    },
    {
      "id": "ford_fulkerson",
      "name": "Max-Flow Min-Cut",
      "topic": "Network Flow",
      "definition": "Maximum flow = minimum cut capacity. Ford-Fulkerson finds max flow via augmenting paths.",
      "intuition": "Water through pipes — maximum flow equals the bottleneck of the tightest cross-section.",
      "formula": "Augment along s-t paths; update residual graph. Max-flow = min-cut (theorem).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "BFS for augmenting paths (Edmonds-Karp) guarantees O(VE²) — no negative cycles issue.",
      "common_mistake": "Ford-Fulkerson may not terminate with irrational capacities. Use Edmonds-Karp instead.",
      "pyq_insight": "GATE: identify min-cut edges, compute max-flow from given network.",
      "relations": []
    },
    {
      "id": "string_matching",
      "name": "String Matching Algorithms",
      "topic": "Strings",
      "definition": "Finding pattern P within text T. Naive is O(nm); smarter algorithms preprocess P.",
      "intuition": "KMP never re-scans matched characters. Rabin-Karp uses rolling hashes.",
      "formula": "KMP: build failure function in O(m). Match in O(n). Total O(n+m).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "KMP failure function: length of longest proper prefix = suffix. Build carefully.",
      "common_mistake": "Naive string matching is O(nm) worst case — KMP is O(n+m) worst case.",
      "pyq_insight": "GATE: trace KMP failure function computation, or find pattern occurrences.",
      "relations": []
    },
    {
      "id": "lcs",
      "name": "Longest Common Subsequence (LCS)",
      "topic": "Dynamic Programming",
      "definition": "Length of longest sequence appearing in both strings in order (not necessarily contiguous).",
      "intuition": "Find the most common 'story' between two sequences without reordering.",
      "formula": "dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1])",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "LCS ≠ LCS substring. Substring = contiguous. Subsequence = non-contiguous.",
      "common_mistake": "LCS can have multiple valid answers — GATE picks the LENGTH, not the sequence.",
      "pyq_insight": "GATE: compute LCS length for given strings using DP table.",
      "relations": [
        {
          "to": "dp",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "matrix_chain",
      "name": "Matrix Chain Multiplication",
      "topic": "Dynamic Programming",
      "definition": "Find optimal parenthesization of matrix product to minimize scalar multiplications.",
      "intuition": "Order of multiplication matters — (A×B)×C vs A×(B×C) can differ drastically.",
      "formula": "m[i][j] = min over k of m[i][k]+m[k+1][j]+p[i-1]×p[k]×p[j]. O(n³).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Number of parenthesizations = Catalan(n-1). DP is the only practical approach.",
      "common_mistake": "Matrix dimensions: A is p×q, B is q×r → A×B costs p×q×r multiplications.",
      "pyq_insight": "GATE: compute minimum cost for 3-4 matrices — standard but tricky DP.",
      "relations": [
        {
          "to": "dp",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "segment_tree",
      "name": "Segment Trees",
      "topic": "Data Structures",
      "definition": "Tree for range queries (sum, min, max) and point updates in O(log n).",
      "intuition": "Each node stores aggregate of its range — quickly answer range questions.",
      "formula": "Build: O(n). Query/update: O(log n). Space: O(n).",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Lazy propagation for range updates. Without lazy: O(n) range update.",
      "common_mistake": "BIT (Fenwick tree) is simpler for prefix sums but CANNOT do range min/max.",
      "pyq_insight": "GATE: rarely asked directly but appears in complexity analysis problems.",
      "relations": []
    },
    {
      "id": "kadane",
      "name": "Kadane's Algorithm",
      "topic": "Dynamic Programming",
      "definition": "Finds maximum subarray sum in O(n) using a single scan.",
      "intuition": "Track current subarray sum; reset to 0 if it goes negative (no point carrying a loss).",
      "formula": "maxEnd=max(arr[i], maxEnd+arr[i]); maxSoFar=max(maxSoFar,maxEnd). O(n).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Handles all-negative arrays: answer = maximum single element (don't reset to 0, reset to arr[i]).",
      "common_mistake": "Initializing maxSoFar=0 fails when all elements are negative.",
      "pyq_insight": "GATE: trace Kadane on given array; identify the maximum subarray.",
      "relations": [
        {
          "to": "dp",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "edit_distance",
      "name": "Edit Distance (Levenshtein)",
      "topic": "Dynamic Programming",
      "definition": "Minimum insert/delete/replace operations to convert string A to string B.",
      "intuition": "Like correcting a typo: how many single-character fixes to reach the target string.",
      "formula": "dp[i][j]=dp[i-1][j-1] if match, else 1+min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Edit distance is symmetric: dist(A,B) = dist(B,A). O(mn) time and space.",
      "common_mistake": "Insertion in A = deletion in B. Only 3 operations needed regardless of naming.",
      "pyq_insight": "GATE: fill DP table for given strings; identify minimum operations.",
      "relations": [
        {
          "to": "lcs",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "coin_change",
      "name": "Coin Change Problem",
      "topic": "Dynamic Programming",
      "definition": "Find minimum coins to make amount n, or count all ways to make amount n.",
      "intuition": "DP over all amounts: for each coin, check if using it gives better result.",
      "formula": "Min coins: dp[i]=min(dp[i], dp[i-coin]+1). Ways: dp[i]+=dp[i-coin]. O(n×coins).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Greedy FAILS for arbitrary denominations. DP is always correct.",
      "common_mistake": "Greedy works ONLY for canonical systems (like {1,5,10,25}). General case needs DP.",
      "pyq_insight": "GATE: compute minimum coins or count ways for given denomination set.",
      "relations": [
        {
          "to": "dp",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "tsp",
      "name": "Travelling Salesman Problem",
      "topic": "Complexity",
      "definition": "Find shortest Hamiltonian cycle visiting all n cities exactly once. NP-hard.",
      "intuition": "Salesman visits every city once and returns home — find the cheapest route.",
      "formula": "Exact DP: Held-Karp O(n²2^n). Approx: nearest neighbor, MST-based 2-approx.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "TSP is NP-hard (optimization) and NP-complete (decision version). No known poly-time solution.",
      "common_mistake": "MST-based approximation gives 2× optimal bound. This is a GUARANTEE, not average.",
      "pyq_insight": "GATE: classify TSP as NP; compare brute-force vs Held-Karp complexity.",
      "relations": [
        {
          "to": "np_completeness",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "bipartite_matching",
      "name": "Bipartite Matching",
      "topic": "Graph Algorithms",
      "definition": "Maximum matching in bipartite graph where every vertex is matched to at most one on the other side.",
      "intuition": "Assign workers to jobs — maximize number of assignments respecting qualifications.",
      "formula": "Hungarian algorithm: O(n³). Hopcroft-Karp: O(E√V). Max matching = n - max independent set (König).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "König's theorem: in bipartite graphs, max matching = min vertex cover.",
      "common_mistake": "König's theorem is ONLY for bipartite graphs. General graphs use Gallai's theorem.",
      "pyq_insight": "GATE: find maximum matching; apply König's theorem to find minimum vertex cover.",
      "relations": []
    },
    {
      "id": "articulation",
      "name": "Articulation Points & Bridges",
      "topic": "Graph Algorithms",
      "definition": "Articulation point: removal disconnects graph. Bridge: edge whose removal disconnects graph.",
      "intuition": "Critical junctions and roads in a city — remove them and the network splits.",
      "formula": "Tarjan's DFS with discovery time and low-link values. O(V+E).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Articulation point in DFS tree: root (if ≥2 subtrees) or non-root (if child's low ≥ disc time).",
      "common_mistake": "Every bridge has both endpoints as articulation points — but not every articulation point is endpoint of a bridge.",
      "pyq_insight": "GATE: find articulation points in given graph; determine graph bi-connectivity.",
      "relations": []
    },
    {
      "id": "prim_kruskal_compare",
      "name": "Prim vs Kruskal Comparison",
      "topic": "Graph Algorithms",
      "definition": "Both find MST. Prim grows from one vertex; Kruskal sorts edges globally.",
      "intuition": "Prim = expand a snowball. Kruskal = connect cheapest wires regardless of location.",
      "formula": "Prim (binary heap): O(E log V). Prim (Fibonacci heap): O(E + V log V). Kruskal: O(E log E).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Dense graph (E≈V²): Prim wins. Sparse graph (E≈V): Kruskal wins.",
      "common_mistake": "Both produce MSTs that may look different but have SAME total weight.",
      "pyq_insight": "GATE: choose algorithm for given density; trace step-by-step; count MST options.",
      "relations": [
        {
          "to": "mst",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "avl_rotation",
      "name": "AVL Rotations — Detailed",
      "topic": "Trees",
      "definition": "LL: right rotate. RR: left rotate. LR: left rotate left child, then right rotate root. RL: reverse.",
      "intuition": "Balance a leaning tower by rotating it back to vertical — direction of rotation = direction of lean.",
      "formula": "LL (BF=+2, left child BF≥0): single right rotation. LR (BF=+2, left child BF<0): double rotation.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Mnemonic: HEAVY SIDE needs rotation TOWARD it. LL heavy on left → rotate RIGHT.",
      "common_mistake": "RL imbalance: right child is left-heavy → right-rotate child first, then left-rotate root.",
      "pyq_insight": "GATE: trace AVL insertion; identify rotation type and draw resulting tree.",
      "relations": [
        {
          "to": "avl",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "red_black",
      "name": "Red-Black Trees",
      "topic": "Trees",
      "definition": "Self-balancing BST where nodes are colored red/black with specific coloring invariants.",
      "intuition": "Colors enforce balance: no path from root to leaf can be twice as long as shortest path.",
      "formula": "Properties: root=black, red node's children=black, all root-to-null paths have same black count.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "RB tree height ≤ 2log(n+1). Insertion: O(log n), at most 3 rotations. Deletion: O(log n).",
      "common_mistake": "RB tree is NOT as strictly balanced as AVL — height can be 2× AVL. But rotations are fewer.",
      "pyq_insight": "GATE: verify RB tree properties; occasional rotation question.",
      "relations": [
        {
          "to": "avl",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "divide_conquer",
      "name": "Divide & Conquer",
      "topic": "Algorithm Design",
      "definition": "Split problem into subproblems, solve recursively, combine. Complexity from Master Theorem.",
      "intuition": "Break problem in half repeatedly. Solve small pieces. Stitch results back together.",
      "formula": "T(n)=2T(n/2)+O(n)→O(n log n). T(n)=T(n/2)+O(1)→O(log n).",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Binary search, merge sort, quick sort, Strassen, closest pair — all divide & conquer.",
      "common_mistake": "QuickSort divide is NOT balanced — worst case O(n²) with bad pivot.",
      "pyq_insight": "GATE: write recurrence for given algorithm; solve using Master Theorem.",
      "relations": []
    },
    {
      "id": "randomized",
      "name": "Randomized Algorithms",
      "topic": "Algorithm Design",
      "definition": "Use random choices to simplify or speed up solutions. Las Vegas: always correct. Monte Carlo: probabilistic.",
      "intuition": "Flip a coin to make decisions — eliminates worst-case adversarial inputs.",
      "formula": "QuickSort with random pivot: O(n log n) expected regardless of input.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Las Vegas: correct with probability 1, runtime is random. Monte Carlo: may be wrong.",
      "common_mistake": "Expected O(n log n) for random QuickSort is NOT the same as O(n log n) worst case.",
      "pyq_insight": "GATE: classify algorithm type; compute expected comparisons for random quicksort.",
      "relations": []
    },
    {
      "id": "approx_algo",
      "name": "Approximation Algorithms",
      "topic": "Complexity",
      "definition": "Polynomial algorithms that guarantee solution within a factor of optimal for NP-hard problems.",
      "intuition": "Can't find perfect solution efficiently — settle for 'good enough' with a quality guarantee.",
      "formula": "ρ-approximation: cost ≤ ρ × OPT. Vertex cover: 2-approx (greedy edge matching).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Greedy vertex cover: pick edge, add BOTH endpoints — always 2-approximation.",
      "common_mistake": "Approximation ratio ρ≥1 for minimization (cost UP to ρ×OPT). ρ≤1 for maximization.",
      "pyq_insight": "GATE: verify approximation ratio; identify algorithm type for given NP-hard problem.",
      "relations": [
        {
          "to": "np_completeness",
          "type": "depends_on"
        }
      ]
    }
  ],
  "toc": [
    {
      "id": "dfa_nfa",
      "name": "DFA & NFA",
      "topic": "Finite Automata",
      "definition": "DFA: deterministic (one transition per symbol). NFA: can have multiple/epsilon transitions.",
      "intuition": "Both accept exactly the class of Regular languages. NFA is more compact.",
      "formula": "NFA→DFA via subset construction. DFA states ≤ 2^(NFA states).",
      "difficulty": "medium",
      "importance": 10,
      "exam_trick": "NFA to DFA conversion: worst case = 2ⁿ states but usually much fewer.",
      "common_mistake": "NFA and DFA have SAME power — both recognize regular languages only.",
      "pyq_insight": "Most asked TOC topic. Minimize DFA using table-filling (Myhill-Nerode).",
      "relations": [
        {
          "to": "regular_languages",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "regular_languages",
      "name": "Regular Languages",
      "topic": "Formal Languages",
      "definition": "Languages recognized by DFA/NFA, equivalently described by regular expressions.",
      "intuition": "Can be described with finite memory — no counting needed.",
      "formula": "Closed under: union, intersection, complement, concatenation, Kleene star.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Any language requiring counting (e.g., aⁿbⁿ) is NOT regular.",
      "common_mistake": "Pumping lemma can only DISPROVE regularity — passing it doesn't prove regularity.",
      "pyq_insight": "GATE: prove non-regularity using pumping lemma. Closure property questions.",
      "relations": [
        {
          "to": "cfl",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "cfl",
      "name": "Context-Free Languages (CFL)",
      "topic": "Formal Languages",
      "definition": "Languages recognized by Pushdown Automata; described by Context-Free Grammars.",
      "intuition": "Can count ONE thing — like matching parentheses or aⁿbⁿ.",
      "formula": "CFL NOT closed under intersection or complement. CFL ∩ Regular = CFL.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "CFL ∩ CFL is NOT necessarily CFL. This is a classic closure trap.",
      "common_mistake": "Assuming aⁿbⁿcⁿ is CFL — it is NOT (it's Context-Sensitive).",
      "pyq_insight": "GATE: write CFG for given language, identify closure properties.",
      "relations": [
        {
          "to": "turing_machines",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "turing_machines",
      "name": "Turing Machines & Decidability",
      "topic": "Computability",
      "definition": "Most powerful computational model. Accepts Recursively Enumerable (RE) languages.",
      "intuition": "TM = infinite tape + read/write head. Can simulate any algorithm.",
      "formula": "Decidable: TM always halts. RE: TM halts on accept, may loop on reject.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Rice's theorem: any non-trivial property of TM-recognized languages is UNDECIDABLE.",
      "common_mistake": "Complement of RE may not be RE. Complement of Recursive = Recursive.",
      "pyq_insight": "GATE: classify halting problem, membership problem — decidable or not.",
      "relations": []
    },
    {
      "id": "pumping_lemma",
      "name": "Pumping Lemma",
      "topic": "Formal Languages",
      "definition": "Necessary condition for regularity/CFL-ness. Used to DISPROVE membership in a language class.",
      "intuition": "If a language is regular, any long-enough string can be 'pumped' and stay in the language.",
      "formula": "Regular: w=xyz, |xy|≤p, |y|≥1, ∀i≥0: xyⁿz∈L. CFL: two segments pumped: uvⁿxyⁿz∈L.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "To disprove: assume L is regular, find a string that fails pumping for ALL decompositions.",
      "common_mistake": "Pumping works → language IS regular? NO. It's a necessary, not sufficient condition.",
      "pyq_insight": "GATE: apply pumping lemma to show aⁿbⁿ, ww, primes are not regular.",
      "relations": []
    },
    {
      "id": "mealy_moore",
      "name": "Mealy vs Moore Machine",
      "topic": "Finite Automata",
      "definition": "Mealy: output on transitions. Moore: output on states.",
      "intuition": "Mealy reacts to input+state. Moore only looks at current state.",
      "formula": "Moore→Mealy: easy. Mealy→Moore: can increase states (up to |Q|×|Σ|).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Moore generally needs more states than equivalent Mealy machine.",
      "common_mistake": "Both Mealy and Moore accept the same class of languages (regular). Output behavior differs.",
      "pyq_insight": "GATE: convert Mealy to Moore or identify output sequence.",
      "relations": [
        {
          "to": "dfa_nfa",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "pda",
      "name": "Pushdown Automata (PDA)",
      "topic": "Formal Languages",
      "definition": "NFA augmented with a stack. Accepts CFLs.",
      "intuition": "A DFA with a notebook — can write to/read from unlimited memory (stack).",
      "formula": "Configuration: (state, remaining input, stack). Accepts by empty stack or final state.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Deterministic PDA (DPDA) accepts DCFLs — strictly ⊂ CFLs.",
      "common_mistake": "Non-deterministic PDA is more powerful than DPDA (unlike DFA vs NFA being equal).",
      "pyq_insight": "GATE: design PDA for aⁿbⁿ, ww^R (palindromes), or balanced parentheses.",
      "relations": [
        {
          "to": "cfl",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "chomsky_normal",
      "name": "Chomsky Normal Form (CNF)",
      "topic": "Formal Languages",
      "definition": "Every CFG production is A→BC (two non-terminals) or A→a (one terminal).",
      "intuition": "Standardized grammar format where every rule is exactly 2 or 1 symbol long.",
      "formula": "Step 1: eliminate ε-productions. Step 2: eliminate unit rules. Step 3: replace >2 RHS.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "CYK algorithm requires grammar in CNF. Convert FIRST.",
      "common_mistake": "Start symbol CAN derive ε if original grammar allowed it — handle specially.",
      "pyq_insight": "GATE: convert given CFG to CNF — step-by-step transformation.",
      "relations": [
        {
          "to": "cfl",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "cyk",
      "name": "CYK Algorithm",
      "topic": "Parsing",
      "definition": "O(n³|G|) algorithm to test if string of length n is in CFL using CNF grammar.",
      "intuition": "Dynamic programming over all substrings — fill triangular table bottom-up.",
      "formula": "dp[i][j] = set of non-terminals that derive substring s[i..j]. O(n³).",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Requires CNF grammar. If S∈dp[1][n], then string is in language.",
      "common_mistake": "CYK is polynomial for CFLs — general membership for CSG is PSPACE-complete.",
      "pyq_insight": "GATE: apply CYK to small string — fill table and determine membership.",
      "relations": [
        {
          "to": "chomsky_normal",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "rice_theorem",
      "name": "Rice's Theorem",
      "topic": "Computability",
      "definition": "Any non-trivial semantic property of Turing Machine languages is undecidable.",
      "intuition": "You cannot write a general program to test if any TM computes a specific function — ever.",
      "formula": "Non-trivial: not all TMs have it AND not none have it. If so → UNDECIDABLE.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Use Rice's: property about LANGUAGE of TM (not TM itself) + non-trivial → UNDECIDABLE.",
      "common_mistake": "Rice's applies to language/semantic properties. Structural properties (e.g., 'has 42 states') are decidable.",
      "pyq_insight": "GATE: 'Is this property decidable?' If it's about TM behavior → likely Rice's theorem applies.",
      "relations": [
        {
          "to": "turing_machines",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "post_correspondence",
      "name": "Post Correspondence Problem (PCP)",
      "topic": "Computability",
      "definition": "Given pairs of strings, find a sequence where concatenation of first strings = concatenation of second.",
      "intuition": "Like matching dominoes — can you arrange arbitrary dominos to make top = bottom?",
      "formula": "PCP is undecidable. Used to prove other problems undecidable by reduction.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "PCP over alphabet {0,1} with ≥2 pairs is undecidable. Use to prove grammar ambiguity undecidable.",
      "common_mistake": "PCP is a SPECIFIC problem used for reductions — not a general technique.",
      "pyq_insight": "GATE: know PCP is undecidable and how it proves CFG intersection/ambiguity problems.",
      "relations": [
        {
          "to": "turing_machines",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "closure_decidable",
      "name": "Decidability of Language Problems",
      "topic": "Computability",
      "definition": "Which problems about DFAs/CFGs/TMs are decidable vs undecidable.",
      "intuition": "DFA problems are easy (decidable). TM problems about behavior are hard (undecidable).",
      "formula": "DFA: membership, emptiness, finiteness, equivalence → ALL decidable. TM equivalence → undecidable.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "CFG: membership (CYK), emptiness (decidable). Equivalence of two CFGs → UNDECIDABLE.",
      "common_mistake": "Assuming all DFA-class problems extend to CFG or TM class — they don't.",
      "pyq_insight": "GATE: classify problems as decidable/semi-decidable/undecidable — 3-5 marks every year.",
      "relations": []
    },
    {
      "id": "cfg_ambiguity",
      "name": "Ambiguous CFGs",
      "topic": "Formal Languages",
      "definition": "CFG is ambiguous if some string has ≥2 distinct parse trees (different derivations).",
      "intuition": "Grammar has a bend in grammar rules letting the same string be parsed multiple ways.",
      "formula": "No algorithm to check if a CFG is ambiguous — undecidable in general.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Inherently ambiguous CFL: no unambiguous grammar exists for it (e.g., aⁿbⁿcˢ ∪ aˢbⁿcⁿ).",
      "common_mistake": "Ambiguous grammar ≠ ambiguous language. An ambiguous grammar may describe an unambiguous language.",
      "pyq_insight": "GATE: show given string has two parse trees → grammar is ambiguous.",
      "relations": [
        {
          "to": "cfl",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "dfa_minimization",
      "name": "DFA Minimization",
      "topic": "Finite Automata",
      "definition": "Find smallest equivalent DFA using table-filling (Myhill-Nerode) algorithm.",
      "intuition": "Merge states you cannot distinguish — equivalent states process all strings identically.",
      "formula": "Mark pairs (q,r) where one is final and one not. Propagate marks. Unmark pairs → equivalent.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Minimized DFA is unique up to state labeling. Dead/trap state must be explicit in complete DFA.",
      "common_mistake": "States reachable from start state only. First remove unreachable states, then minimize.",
      "pyq_insight": "GATE: minimize given DFA; count states in minimum DFA; verify equivalence of two DFAs.",
      "relations": [
        {
          "to": "dfa_nfa",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "myhill_nerode",
      "name": "Myhill-Nerode Theorem",
      "topic": "Formal Languages",
      "definition": "L is regular iff the number of equivalence classes of ≡_L is finite.",
      "intuition": "Group strings by how they affect future acceptance — if finitely many groups, L is regular.",
      "formula": "x ≡_L y iff ∀z: xz∈L ↔ yz∈L. #classes = #states in minimal DFA.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Myhill-Nerode classes directly correspond to DFA states in minimal DFA.",
      "common_mistake": "Myhill-Nerode is both a test for regularity AND a construction of minimal DFA.",
      "pyq_insight": "GATE: find Myhill-Nerode classes for given language; determine if regular.",
      "relations": [
        {
          "to": "dfa_minimization",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "csl",
      "name": "Context-Sensitive Languages",
      "topic": "Formal Languages",
      "definition": "Languages recognized by Linear Bounded Automata (LBA). aⁿbⁿcⁿ is a classic CSL.",
      "intuition": "More powerful than CFL — can count two things simultaneously.",
      "formula": "LBA = TM restricted to input tape length. CSL ⊂ recursive ⊂ RE.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "CSL: closed under union, intersection, complement, concatenation. Unlike CFL, CSL at complement.",
      "common_mistake": "CFL is NOT closed under complement or intersection of two CFLs — CSL IS.",
      "pyq_insight": "GATE: identify language class; know closure properties of Chomsky hierarchy.",
      "relations": [
        {
          "to": "turing_machines",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "chomsky_hierarchy",
      "name": "Chomsky Hierarchy",
      "topic": "Formal Languages",
      "definition": "Four language classes: Regular (Type 3) ⊂ CFL (Type 2) ⊂ CSL (Type 1) ⊂ RE (Type 0).",
      "intuition": "Like nesting dolls — each inner class has strictly less power than the outer one.",
      "formula": "Type 3: DFA/NFA. Type 2: PDA. Type 1: LBA. Type 0: TM.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Grammar type = weakest grammar that generates it. Check restrictions systematically.",
      "common_mistake": "A regular language IS also a CFL (accepted by PDA with unused stack).",
      "pyq_insight": "GATE: classify given language in Chomsky hierarchy — very high frequency.",
      "relations": []
    }
  ],
  "cd": [
    {
      "id": "lexical_analysis",
      "name": "Lexical Analysis",
      "topic": "Compiler Phases",
      "definition": "First phase: converts character stream to token stream using regular expressions.",
      "intuition": "Breaking source code into meaningful units (keywords, identifiers, numbers).",
      "formula": "Token pattern = regular expression → NFA → DFA (for implementation)",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Lexer removes comments and whitespace. Reports lexical errors (invalid tokens).",
      "common_mistake": "Lexer checks syntax? NO — only token structure. Parser checks syntax.",
      "pyq_insight": "GATE: recognize strings/tokens using given regex or automaton.",
      "relations": [
        {
          "to": "parsing",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "parsing",
      "name": "Parsing (Syntax Analysis)",
      "topic": "Compiler Phases",
      "definition": "Verifies grammatical structure of token stream; builds parse tree or AST.",
      "intuition": "Parser ensures tokens form valid sentences according to the grammar.",
      "formula": "LL(1) table: M[A,a]=production. LR power: LR(0)⊂SLR(1)⊂LALR(1)⊂LR(1).",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "LL(1) ← weakest. LR(1) ← most powerful. LALR(1) = practical choice (yacc/bison).",
      "common_mistake": "Ambiguous grammar→ grammar is ambiguous; NOT language is ambiguous.",
      "pyq_insight": "GATE every year: FIRST, FOLLOW computation; LL(1) table; LR conflict detection.",
      "relations": [
        {
          "to": "first_follow",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "first_follow",
      "name": "FIRST & FOLLOW Sets",
      "topic": "Parsing",
      "definition": "FIRST(α): terminals that can start a string derived from α. FOLLOW(A): terminals that can follow A.",
      "intuition": "FIRST tells what can come FROM a non-terminal. FOLLOW tells what comes AFTER it.",
      "formula": "$ always in FOLLOW(start symbol). If ε∈FIRST(α): add FOLLOW(A) to table entry M[A,b].",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "For FOLLOW: always check all productions where A appears on RHS.",
      "common_mistake": "Forgetting to propagate ε through FIRST computation when production can derive ε.",
      "pyq_insight": "GATE: compute FIRST/FOLLOW and build LL(1) parsing table from grammar.",
      "relations": []
    },
    {
      "id": "optimization",
      "name": "Code Optimization",
      "topic": "Compiler Backend",
      "definition": "Transformations that improve code efficiency without changing behavior.",
      "intuition": "Eliminate redundancy, move invariants out of loops, propagate constants.",
      "formula": "Peephole: local. CSE, dead code, constant prop/fold: global. Loop-invariant: loop opt.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Loop-invariant code motion: computation same every iteration → move before loop.",
      "common_mistake": "Dead code ≠ unreachable code. Dead = computed but never used. Both should be removed.",
      "pyq_insight": "GATE: identify optimization technique applicable to given code fragment.",
      "relations": []
    },
    {
      "id": "sdts",
      "name": "Syntax-Directed Translations (SDT)",
      "topic": "Semantic Analysis",
      "definition": "Grammar with semantic actions attached to productions. Computes attributes during parsing.",
      "intuition": "Annotate parse tree with computed values — type checking, expression evaluation, code generation.",
      "formula": "S-attributed SDD: only synthesized attributes (bottom-up). L-attributed: inherited too (LL friendly).",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "S-attributed SDDs are evaluated during LR parsing naturally. L-attributed needs care in LL.",
      "common_mistake": "Inherited attributes depend on PARENT and SIBLINGS. Synthesized depend on CHILDREN.",
      "pyq_insight": "GATE: evaluate attribute grammar on given parse tree; compute attribute values.",
      "relations": [
        {
          "to": "parsing",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "ir_code",
      "name": "Three-Address Code (TAC)",
      "topic": "Code Generation",
      "definition": "Intermediate representation where each instruction has at most 3 operands.",
      "intuition": "Like assembly but with unlimited virtual registers — simple, linear form.",
      "formula": "Forms: x=y op z, x=op y, x=y, goto L, if x goto L, call f,n.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "TAC is used implicitly in all modern compilers (LLVM IR is essentially refined TAC).",
      "common_mistake": "TAC uses temporary variables (t1, t2...). Each TAC instruction = at most ONE operation.",
      "pyq_insight": "GATE: generate TAC for given expression; count temporaries.",
      "relations": []
    },
    {
      "id": "dag_ir",
      "name": "DAG Representation",
      "topic": "Code Generation",
      "definition": "Directed Acyclic Graph for expression/basic block code — shares common subexpressions.",
      "intuition": "Instead of computing x+y twice, compute once and reuse — DAG detects this automatically.",
      "formula": "Build DAG: each new unique expression gets a node. Same expression → point to existing node.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "DAG node count < expression tree nodes iff common subexpressions exist.",
      "common_mistake": "DAG is for a SINGLE basic block. Across blocks, need global CSE with data flow analysis.",
      "pyq_insight": "GATE: build DAG for expression; identify eliminated computations; count nodes.",
      "relations": [
        {
          "to": "optimization",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "activation_record",
      "name": "Activation Records & Runtime Stack",
      "topic": "Runtime Environment",
      "definition": "Stack frame for each function call containing locals, parameters, return address, and saved registers.",
      "intuition": "Function call = push a new booklet onto a stack. Return = rip it off and restore.",
      "formula": "Frame: dynamic link (caller frame pointer), return address, parameters, locals, saved registers.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Static scoping uses static link (access link) to find non-local variables.",
      "common_mistake": "Static vs dynamic scope: static = at definition. Dynamic = at call time. Most languages use static.",
      "pyq_insight": "GATE: trace activation record stack for recursive function; identify frame contents.",
      "relations": []
    },
    {
      "id": "ll1_parsing",
      "name": "LL(1) Parsing",
      "topic": "Parsing",
      "definition": "Top-down predictive parser using 1 lookahead token and FIRST/FOLLOW sets.",
      "intuition": "Read one token ahead to decide which production to apply — no backtracking needed.",
      "formula": "For grammar to be LL(1): no left recursion, left-factored, no FIRST-FOLLOW conflicts.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Left recursion: A→Aα | β. Eliminate: A→βA', A'→αA' | ε.",
      "common_mistake": "LL(1) requires the grammar to be modified. LR(1) handles a wider class without modification.",
      "pyq_insight": "GATE: check LL(1) condition; eliminate left recursion; build LL(1) table.",
      "relations": [
        {
          "to": "first_follow",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "lalr1",
      "name": "LALR(1) Parsing",
      "topic": "Parsing",
      "definition": "Look-Ahead LR parser — merges LR(1) states with identical LR(0) cores.",
      "intuition": "LR(1) reduced to practical size by merging similar states — almost as powerful, much smaller.",
      "formula": "LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ LR(1). LALR(1) is yacc/bison's algorithm.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "LALR(1) may have reduce-reduce conflicts that LR(1) would not. SLR uses FOLLOW (weaker).",
      "common_mistake": "Merging LR(1) states to get LALR(1) can introduce conflicts — verify no R-R conflicts arise.",
      "pyq_insight": "GATE: count LR(0)/LALR items; identify conflict type in parsing table.",
      "relations": [
        {
          "to": "parsing",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "liveness",
      "name": "Liveness & Reaching Definitions",
      "topic": "Data Flow Analysis",
      "definition": "Liveness: variable is live if its current value may be used in future. Reaching: which definitions reach each program point.",
      "intuition": "Liveness = 'will this variable be read again?' Reaching = 'which assignment got this variable here?'",
      "formula": "Liveness: backward analysis (use before redefined). Reaching defs: forward analysis.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Dead code: variable defined but never live after that point → eliminate the assignment.",
      "common_mistake": "Liveness is BACKWARD analysis; Reaching definitions is FORWARD analysis.",
      "pyq_insight": "GATE: compute live variables or reaching definitions at given program point.",
      "relations": [
        {
          "to": "optimization",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "register_allocation",
      "name": "Register Allocation & Graph Coloring",
      "topic": "Code Generation",
      "definition": "Map variables to finite physical registers. Model as graph coloring — each variable is a node, interference = edge.",
      "intuition": "Variables that are 'live' simultaneously conflict — must be in different registers.",
      "formula": "Build interference graph. k-coloring with k=registers. If not k-colorable → spill to memory.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Register allocation is NP-complete in general. Chaitin's algorithm uses graph coloring.",
      "common_mistake": "Spilling adds load/store instructions — should minimize spills for performance.",
      "pyq_insight": "GATE: compute number of registers needed; build interference graph for given program.",
      "relations": []
    },
    {
      "id": "basic_block",
      "name": "Basic Blocks & Control Flow Graph",
      "topic": "Code Generation",
      "definition": "Basic block: maximal straight-line code with no branches in/out. CFG: nodes = blocks, edges = jumps.",
      "intuition": "Slice program into chunks with no jumps inside. Connect them by jump targets.",
      "formula": "Block starts at: function entry, branch target, after branch. Ends at: branch, return.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Optimizations within a basic block: CSE, constant folding, dead code. Cross-block: data flow analysis.",
      "common_mistake": "Basic block starts at jump TARGET and after jump — both conditions must be checked.",
      "pyq_insight": "GATE: partition code into basic blocks; draw CFG; apply local optimization.",
      "relations": []
    },
    {
      "id": "peephole_opt",
      "name": "Peephole Optimization",
      "topic": "Code Optimization",
      "definition": "Replace short code sequences with faster equivalents using pattern-matching on small window.",
      "intuition": "Scan a sliding window of 2-4 instructions; replace inefficient patterns with better ones.",
      "formula": "Patterns: eliminate redundant loads/stores, strength reduction (x*2 → x<<1), jump-to-jump.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "Jump-to-jump: jmp L1; L1: jmp L2 → jmp L2. Common peephole pattern.",
      "common_mistake": "Peephole is LOCAL — it doesn't use data flow info. Only pattern-based.",
      "pyq_insight": "GATE: identify applicable peephole optimization for given instruction sequence.",
      "relations": [
        {
          "to": "optimization",
          "type": "part_of"
        }
      ]
    }
  ],
  "os": [
    {
      "id": "process",
      "name": "Process & Process States",
      "topic": "Process Management",
      "definition": "Instance of a program in execution. Has its own memory space, PCB, and execution context.",
      "intuition": "Thread of execution with private memory — isolated from other processes.",
      "formula": "States: New → Ready → Running → (Waiting or Terminated). Transition on I/O, interrupt, preemption.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Fork() creates exact copy. Parent and child both run after fork.",
      "common_mistake": "Zombie: child exits, parent not called wait(). Orphan: parent dies first.",
      "pyq_insight": "GATE: count processes created by nested fork() calls.",
      "relations": [
        {
          "to": "scheduling",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "scheduling",
      "name": "CPU Scheduling",
      "topic": "Process Management",
      "definition": "Algorithm to decide which process gets CPU from the ready queue.",
      "intuition": "Balance fairness, throughput, and response time across competing processes.",
      "formula": "TAT = Completion - Arrival; Waiting = TAT - Burst; Response = First_run - Arrival",
      "difficulty": "medium",
      "importance": 10,
      "exam_trick": "SJF minimizes avg wait (non-preemptive). SRTF minimizes overall avg TAT.",
      "common_mistake": "RR quantum too small → context switch overhead; too large → degenerates to FCFS.",
      "pyq_insight": "GATE: draw Gantt chart, compute avg waiting time for mixed arrival processes.",
      "relations": [
        {
          "to": "deadlock",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "deadlock",
      "name": "Deadlock",
      "topic": "Synchronization",
      "definition": "Circular wait among processes where each holds resources the other needs.",
      "intuition": "Four horsemen: Mutual Exclusion, Hold-and-Wait, No Preemption, Circular Wait.",
      "formula": "Banker's Algorithm: Need = Max - Allocation. Check safe state before granting.",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "Prevention: negate any ONE Coffman condition. Detection: build wait-for graph.",
      "common_mistake": "Avoiding deadlock requires advance knowledge of max needs. Detection allows occurrence.",
      "pyq_insight": "GATE: Banker's algorithm safe sequence, resource allocation graph, deadlock detection.",
      "relations": [
        {
          "to": "synchronization",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "synchronization",
      "name": "Synchronization & Semaphores",
      "topic": "Synchronization",
      "definition": "Mechanisms to coordinate concurrent access to shared resources.",
      "intuition": "Semaphore is an integer counter with atomic wait/signal operations.",
      "formula": "wait(S): S--; if S<0: block. signal(S): S++; if S≤0: unblock one.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Binary semaphore = mutex (S∈{0,1}). Counting semaphore for resource count.",
      "common_mistake": "Semaphore value can be NEGATIVE — |S| = number of blocked processes.",
      "pyq_insight": "GATE: producer-consumer, readers-writers with given semaphore operations.",
      "relations": []
    },
    {
      "id": "page_replacement",
      "name": "Page Replacement Algorithms",
      "topic": "Memory Management",
      "definition": "Policy to choose which page to evict when a page fault occurs and memory is full.",
      "intuition": "Best policy minimizes future page faults — impractical but baseline.",
      "formula": "FIFO, LRU (stack algorithm), Optimal (theoretical). Belady's anomaly: only FIFO exhibits it.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "LRU, Optimal are 'stack algorithms' — more frames → never more faults.",
      "common_mistake": "Belady's anomaly: MORE frames → MORE page faults. ONLY happens with FIFO!",
      "pyq_insight": "GATE: trace LRU/FIFO/Optimal on reference string, count page faults.",
      "relations": []
    },
    {
      "id": "file_systems",
      "name": "File Systems & Allocation",
      "topic": "Storage",
      "definition": "Structure for organizing and storing data on disk; maps files to disk blocks.",
      "intuition": "FAT linkage through table; Indexed allocation via inode. UNIX uses inodes.",
      "formula": "Inode: 12 direct + 1 single indirect + 1 double + 1 triple indirect blocks",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Contiguous: fast sequential, suffers external fragmentation. Linked: no fragm, slow random.",
      "common_mistake": "Indexed allocation is NOT contiguous — blocks can be scattered.",
      "pyq_insight": "GATE: compute max file size given filesystem parameters (block size, pointer size).",
      "relations": []
    },
    {
      "id": "pcb",
      "name": "Process Control Block (PCB)",
      "topic": "Process Management",
      "definition": "Kernel data structure storing all state of a process.",
      "intuition": "The OS's 'resume card' for every process — saves everything needed to restart it.",
      "formula": "PCB fields: PID, PC, registers, memory maps, files, scheduling info",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "When context switch occurs, PCB of old process is saved, PCB of new is loaded.",
      "common_mistake": "PCB is in kernel memory, NOT user memory. User cannot access it directly.",
      "pyq_insight": "GATE: 'What does PCB contain?' — straightforward conceptual question.",
      "relations": []
    },
    {
      "id": "context_switch",
      "name": "Context Switch",
      "topic": "Process Management",
      "definition": "Saving current process state and loading another process's state on a CPU.",
      "intuition": "Pausing mid-task, bookmarking exactly where you are, starting someone else's task.",
      "formula": "Overhead = 2 × context switch time (save + restore). Pure overhead — no useful work.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Context switch overhead is WASTED time — reduces CPU efficiency.",
      "common_mistake": "Context switch ≠ process switch. Threads share address space — faster context switch.",
      "pyq_insight": "GATE: compute CPU utilization given context switch time and burst time.",
      "relations": [
        {
          "to": "process",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "threads",
      "name": "Threads & Multithreading",
      "topic": "Process Management",
      "definition": "Lightweight unit of CPU execution sharing process address space.",
      "intuition": "Multiple workers in the same office — share resources, work in parallel.",
      "formula": "User threads: mapped to kernel threads (1:1, M:1, M:N models).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Threads share: code, data, heap. Own: stack, registers, PC, thread ID.",
      "common_mistake": "User-level threads: if one blocks on system call, ALL threads in process block (M:1).",
      "pyq_insight": "GATE: threading model question — which shared, which private.",
      "relations": [
        {
          "to": "process",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "cpu_bound_io_bound",
      "name": "CPU-bound vs I/O-bound",
      "topic": "Scheduling",
      "definition": "CPU-bound: long bursts, few I/O. I/O-bound: short bursts, frequent I/O.",
      "intuition": "CPU-bound = compute heavy (video encoding). I/O-bound = wait heavy (file server).",
      "formula": "CPU util = 1 - p^n where p = I/O wait fraction, n = degree of multiprogramming.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "I/O-bound processes benefit MORE from multiprogramming than CPU-bound.",
      "common_mistake": "CPU utilization is NOT 100% with multiprogramming — I/O wait still exists.",
      "pyq_insight": "GATE: given p and n, compute CPU utilization.",
      "relations": []
    },
    {
      "id": "multilevel_queue",
      "name": "Multilevel Queue Scheduling",
      "topic": "Scheduling",
      "definition": "Processes in separate queues by type; each queue has its own scheduling algorithm.",
      "intuition": "VIP lanes at airport — first-class always processed first, economy waits.",
      "formula": "Fixed priority between queues. Within queue: RR or FCFS typically.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "No movement between queues in basic MLQ. MLFQ allows movement.",
      "common_mistake": "MLQ ≠ MLFQ. MLFQ is adaptive — processes move queues based on behavior.",
      "pyq_insight": "GATE: distinguish MLQ vs MLFQ properties — common conceptual question.",
      "relations": [
        {
          "to": "scheduling",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "monitor",
      "name": "Monitors",
      "topic": "Synchronization",
      "definition": "High-level synchronization primitive with implicit mutual exclusion.",
      "intuition": "Only one person can be inside the monitor room at a time — built-in locking.",
      "formula": "Condition variables: wait() releases monitor. signal() wakes one waiter.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "signal() in Mesa semantics doesn't immediately give monitor to waiter.",
      "common_mistake": "Wait() releases the monitor lock. The thread re-acquires it before continuing.",
      "pyq_insight": "GATE: producer-consumer using monitor vs semaphore.",
      "relations": [
        {
          "to": "synchronization",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "peterson",
      "name": "Peterson's Solution",
      "topic": "Synchronization",
      "definition": "Software-only mutual exclusion for two processes using flag and turn variables.",
      "intuition": "'After you' protocol — set your flag but yield turn to the other process.",
      "formula": "flag[i]=true; turn=j; while(flag[j] && turn==j); CS; flag[i]=false;",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Satisfies all 3: ME, Progress, Bounded Waiting. Requires atomic load/store.",
      "common_mistake": "Does NOT work on modern CPUs without memory barriers (hardware reordering).",
      "pyq_insight": "GATE: trace Peterson's execution — verify mutual exclusion property holds.",
      "relations": [
        {
          "to": "synchronization",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "aging",
      "name": "Priority Aging",
      "topic": "Scheduling",
      "definition": "Gradually increasing priority of waiting processes to prevent starvation.",
      "intuition": "The longer you wait, the more important you become — eventually you get served.",
      "formula": "priority += Δ per time unit waited. Cap at max_priority.",
      "difficulty": "easy",
      "importance": 6,
      "exam_trick": "Aging solves starvation in priority scheduling. SJF can have starvation too — fix with aging.",
      "common_mistake": "Aging adds overhead. Not all implementations include it by default.",
      "pyq_insight": "GATE: identify which scheduling algo suffers starvation and how aging fixes it.",
      "relations": []
    },
    {
      "id": "segmentation",
      "name": "Segmentation",
      "topic": "Memory Management",
      "definition": "Memory divided into variable-size segments based on logical units (code, stack, heap).",
      "intuition": "Like chapters in a book — each has a different length, all are logically separate.",
      "formula": "Physical addr = base[segment] + offset. Check offset < limit.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Segmentation can cause external fragmentation. Paging causes internal fragmentation.",
      "common_mistake": "Segmentation is NOT the same as paging. Segments are variable-size; pages are fixed.",
      "pyq_insight": "GATE: compare paging vs segmentation in fragmentation, protection, sharing.",
      "relations": [
        {
          "to": "virtual_memory",
          "type": "contrasts_with"
        }
      ]
    },
    {
      "id": "thrashing",
      "name": "Thrashing",
      "topic": "Memory Management",
      "definition": "CPU spends more time swapping pages than executing processes — near-zero throughput.",
      "intuition": "Too many processes competing for too few frames — constant page faults.",
      "formula": "If page fault rate > threshold → reduce degree of multiprogramming.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Working set model or PFF (Page Fault Frequency) algorithm detects/prevents thrashing.",
      "common_mistake": "Adding more RAM doesn't always fix thrashing — must reduce degree of multiprogramming.",
      "pyq_insight": "GATE: identify condition for thrashing, solution using working set model.",
      "relations": [
        {
          "to": "page_replacement",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "disk_scheduling",
      "name": "Disk Scheduling Algorithms",
      "topic": "Storage",
      "definition": "Algorithms to optimize disk head movement for I/O requests.",
      "intuition": "Elevator in a building — serve floors in order, minimize back-and-forth movement.",
      "formula": "SSTF: nearest seek first. SCAN: sweep one direction. C-SCAN: only one direction.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "SSTF minimizes seek time but can cause starvation. SCAN avoids starvation.",
      "common_mistake": "FCFS gives worst seek time. C-SCAN gives MORE uniform wait time than SCAN.",
      "pyq_insight": "GATE: compute total head movement for given request sequence with specific algorithm.",
      "relations": []
    },
    {
      "id": "inode",
      "name": "Inodes & File Allocation",
      "topic": "File Systems",
      "definition": "Index node storing file metadata + direct/indirect block pointers.",
      "intuition": "inode is the file's identity — address book pointing to where data lives on disk.",
      "formula": "Max file size = 12·B + (B/4)·B + (B/4)²·B + (B/4)³·B (B=block size, pointer=4B)",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Double indirect: (B/pointer_size)² blocks. Triple: (B/pointer_size)³.",
      "common_mistake": "inode doesn't store filename — directory maps name→inode number.",
      "pyq_insight": "GATE: compute max file size given block size and pointer size (standard 2-4 marks).",
      "relations": [
        {
          "to": "file_systems",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "raid",
      "name": "RAID Levels",
      "topic": "Storage",
      "definition": "Redundant Array of Independent Disks — combines disks for performance or reliability.",
      "intuition": "RAID 0: speed (stripe). RAID 1: mirror (copy). RAID 5: parity (balance).",
      "formula": "RAID 0: n disks, n× throughput, 0 fault tolerance. RAID 1: n/2 usable. RAID 5: n-1 usable.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "RAID 5 can tolerate 1 disk failure. RAID 6 can tolerate 2. RAID 0 has NO redundancy.",
      "common_mistake": "RAID is NOT a backup strategy. It protects against hardware failure, not data corruption.",
      "pyq_insight": "GATE: identify RAID level from given description; compute effective capacity.",
      "relations": []
    },
    {
      "id": "fork_exec",
      "name": "fork() & exec()",
      "topic": "Process Management",
      "definition": "fork(): duplicates calling process. exec(): replaces process image with new program.",
      "intuition": "fork = photocopy the process; exec = tear out the copy's pages and paste a new book.",
      "formula": "After fork: parent gets child PID, child gets 0. Both see same code after fork().",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "fork() followed by exec() is how shells launch programs.",
      "common_mistake": "After fork(), BOTH parent and child continue executing from the SAME point.",
      "pyq_insight": "GATE: n nested fork() calls creates 2^n - 1 new processes total.",
      "relations": []
    },
    {
      "id": "ipc",
      "name": "Inter-Process Communication (IPC)",
      "topic": "Process Management",
      "definition": "Mechanisms for processes to communicate: pipes, shared memory, message queues, sockets.",
      "intuition": "Processes are isolated — IPC breaks that isolation for collaboration.",
      "formula": "Pipe: unidirectional. Named pipe: bidirectional. Shared memory: fastest IPC (no kernel).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Shared memory is fastest IPC — no kernel copy. Message passing safer but slower.",
      "common_mistake": "Anonymous pipe works only between related (parent-child) processes.",
      "pyq_insight": "GATE: identify IPC mechanism; compare throughput of shared memory vs pipes.",
      "relations": []
    },
    {
      "id": "critical_section",
      "name": "Critical Section Problem",
      "topic": "Synchronization",
      "definition": "Code section accessing shared data that must not be executed simultaneously by multiple processes.",
      "intuition": "Only one process in the 'room' at a time — the room is the critical section.",
      "formula": "Requirements: Mutual Exclusion, Progress, Bounded Waiting. TSL instruction implements HW lock.",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Software solutions (Peterson's) are for educational purposes; hardware TSL is real-world.",
      "common_mistake": "Disabling interrupts for CS: works for single CPU, DANGEROUS for multiprocessor.",
      "pyq_insight": "GATE: verify if given solution satisfies ME, Progress, Bounded Waiting.",
      "relations": []
    },
    {
      "id": "priority_inversion",
      "name": "Priority Inversion",
      "topic": "Scheduling",
      "definition": "High-priority task waits for resource held by low-priority task — lower task preempted by medium.",
      "intuition": "VIP waits while a regular user holds needed resource, and regular user keeps getting preempted.",
      "formula": "Solution: Priority Inheritance — temporarily boost low-priority task to highest waiter's priority.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Mars Pathfinder failure was caused by priority inversion. Classic real-world example.",
      "common_mistake": "Priority Inheritance Protocol (PIP) doesn't fully prevent all priority inversion chains.",
      "pyq_insight": "GATE: identify priority inversion scenario; propose priority inheritance solution.",
      "relations": [
        {
          "to": "scheduling",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "rw_problem",
      "name": "Readers-Writers Problem",
      "topic": "Synchronization",
      "definition": "Multiple readers concurrent; writer needs exclusive access.",
      "intuition": "Library: many can read the same book simultaneously; only one person can rewrite it.",
      "formula": "Reader-priority: readers never wait for readers. Writer-priority: writers never wait behind new readers.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Reader-priority can starve writers. Writer-priority can starve readers.",
      "common_mistake": "Using a simple mutex prevents all concurrency — defeats the purpose.",
      "pyq_insight": "GATE: trace semaphore solution; identify starvation condition in given implementation.",
      "relations": []
    },
    {
      "id": "dining_philosophers",
      "name": "Dining Philosophers",
      "topic": "Synchronization",
      "definition": "5 philosophers share 5 forks; must hold both adjacent forks to eat — classic deadlock scenario.",
      "intuition": "If all pick up left fork simultaneously and wait for right → deadlock!",
      "formula": "Solutions: allow only 4 at table, pick up both atomically, odd-left/even-right, chandy-misra.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Solution must prevent deadlock AND starvation. Some simple fixes have starvation.",
      "common_mistake": "Picking both forks atomically (critical section) eliminates deadlock but reduces concurrency.",
      "pyq_insight": "GATE: identify deadlock scenario; evaluate which solution property is violated.",
      "relations": []
    },
    {
      "id": "copy_on_write",
      "name": "Copy-On-Write (COW)",
      "topic": "Memory Management",
      "definition": "Parent and child share same pages after fork(); copy is made only when either modifies a page.",
      "intuition": "Don't photocopy the entire book — use the same copy until someone writes in it.",
      "formula": "On write to shared page: OS creates private copy for writing process, updates page table.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "COW makes fork() very cheap. Pages are shared until written — most exec() calls never copy.",
      "common_mistake": "COW copies the PAGE not the entire address space. Only the modified page gets copied.",
      "pyq_insight": "GATE: compute actual page copies in fork()+exec() scenario with COW.",
      "relations": []
    },
    {
      "id": "memory_allocation",
      "name": "Memory Allocation Strategies",
      "topic": "Memory Management",
      "definition": "First-fit, best-fit, worst-fit for allocating variable-size memory blocks.",
      "intuition": "First-fit: use first big enough hole. Best-fit: tightest hole. Worst-fit: biggest hole.",
      "formula": "First-fit fastest. Best-fit: minimizes wasted space per allocation but causes tiny fragments.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Worst-fit leaves largest 'leftover' hole — keeps big holes available for future requests.",
      "common_mistake": "Best-fit doesn't minimize total fragmentation — it creates many tiny unusable holes.",
      "pyq_insight": "GATE: apply given strategy to hole list; determine if request can be satisfied.",
      "relations": []
    },
    {
      "id": "buddy_system",
      "name": "Buddy Allocation",
      "topic": "Memory Management",
      "definition": "Memory divided in powers of 2. Blocks split/merged in pairs (buddies) to minimize fragmentation.",
      "intuition": "Like splitting a chocolate bar along marked lines — always split in half, merge when both halves free.",
      "formula": "Size always power of 2. Buddy of block at address X of size S: X XOR S.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Buddy merges are fast — just check if buddy is free. Great for kernel memory.",
      "common_mistake": "Buddy causes internal fragmentation — must allocate next power of 2 even if smaller size needed.",
      "pyq_insight": "GATE: trace buddy allocation/deallocation; compute internal fragmentation.",
      "relations": []
    },
    {
      "id": "working_set",
      "name": "Working Set Model",
      "topic": "Memory Management",
      "definition": "Set of pages a process is actively using in a recent time window Δ.",
      "intuition": "Each process needs its 'working set' in RAM — if not enough frames, thrashing occurs.",
      "formula": "WS_i(t,Δ) = pages referenced in (t-Δ, t]. Total demand = Σ|WS_i|.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "If total demand > physical frames → suspend some processes to prevent thrashing.",
      "common_mistake": "Working set changes over time. Page replacement should also adapt dynamically.",
      "pyq_insight": "GATE: compute working set size for given reference string and window size.",
      "relations": [
        {
          "to": "thrashing",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "tlb_shootdown",
      "name": "TLB Shootdown",
      "topic": "Memory Management",
      "definition": "When a page table entry is modified, all CPU TLBs caching that entry must be invalidated.",
      "intuition": "All cashiers (CPUs) must discard their cached price (TLB entry) when the real price changes.",
      "formula": "IPI (inter-processor interrupt) sent to all CPUs to flush TLB entry. Expensive on multicore.",
      "difficulty": "hard",
      "importance": 5,
      "exam_trick": "TLB shootdown is a key scalability bottleneck for shared virtual memory multiprocessors.",
      "common_mistake": "Single CPU systems don't need TLB shootdown — only relevant for SMP/NUMA.",
      "pyq_insight": "GATE: rarely asked directly; context for multiprocessor cache coherence questions.",
      "relations": []
    },
    {
      "id": "page_fault_handling",
      "name": "Page Fault Handling",
      "topic": "Memory Management",
      "definition": "Hardware trap to OS when process accesses page not in RAM. OS loads page from disk.",
      "intuition": "Book not on your desk: ask librarian (OS) to fetch it from storage (disk).",
      "formula": "Steps: trap→save state→find victim page→disk I/O→update page table→restart instruction.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Page fault is expensive: disk I/O takes ~10ms. TLB miss is only ~100ns.",
      "common_mistake": "Page fault does NOT crash the program — it's a normal OS mechanism.",
      "pyq_insight": "GATE: compute effective access time with given page fault rate.",
      "relations": []
    },
    {
      "id": "ext_int_fragmentation",
      "name": "Internal vs External Fragmentation",
      "topic": "Memory Management",
      "definition": "Internal: wasted space inside allocated block. External: free space exists but not contiguous.",
      "intuition": "Internal = too-big box with padding. External = enough free space total, but scattered.",
      "formula": "Paging eliminates external fragmentation. Segmentation and contiguous allocation have external.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "Fixed-size allocation (paging) → internal fragmentation. Variable-size → external.",
      "common_mistake": "Compaction can fix external fragmentation but is expensive (move all allocated blocks).",
      "pyq_insight": "GATE: identify fragmentation type for given memory scheme.",
      "relations": []
    }
  ],
  "dbms": [
    {
      "id": "normalization",
      "name": "Normalization & FDs",
      "topic": "Relational Model",
      "definition": "Process of eliminating data redundancy by organizing tables according to functional dependencies.",
      "intuition": "Each table should store facts about exactly ONE thing — no duplication.",
      "formula": "1NF: atomic. 2NF: -partial FDs. 3NF: -transitive FDs. BCNF: every determant=superkey.",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF. BCNF may LOSE dependency preservation (but not 3NF).",
      "common_mistake": "BCNF always gives lossless decomposition but may not preserve all FDs.",
      "pyq_insight": "GATE: find candidate key, identify highest NF, decompose to BCNF/3NF.",
      "relations": [
        {
          "to": "transactions",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "transactions",
      "name": "Transactions & ACID",
      "topic": "Transaction Management",
      "definition": "Sequence of operations forming a logical unit of work with ACID properties.",
      "intuition": "Either ALL operations succeed (commit) or ALL fail and are undone (rollback).",
      "formula": "ACID: Atomicity, Consistency, Isolation, Durability. 2PL guarantees serializability.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Strict 2PL = 2PL + hold all locks until commit. Prevents cascading rollback.",
      "common_mistake": "2-phase locking has Growing and Shrinking phases — once you release, cannot acquire.",
      "pyq_insight": "GATE: build precedence graph, check if schedule is conflict-serializable.",
      "relations": [
        {
          "to": "indexing",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "indexing",
      "name": "Indexing & B+ Trees",
      "topic": "Storage",
      "definition": "Data structure to speed up search queries. B+ Tree is the dominant index structure.",
      "intuition": "Like a sorted dictionary index — narrow down location without scanning everything.",
      "formula": "B+ tree height: O(log_p n), where p=order. Internal nodes hold only keys; leaves hold data.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "B+ tree: data ONLY in leaves. B-tree: data in ALL nodes. B+ better for range scans.",
      "common_mistake": "Dense index: entry per record. Sparse index: entry per block (requires sorted file).",
      "pyq_insight": "GATE: compute B+ tree height for given parameters, trace insertion/deletion.",
      "relations": []
    },
    {
      "id": "relational_algebra",
      "name": "Relational Algebra",
      "topic": "Query Processing",
      "definition": "Formal query language for relational databases using set operations and derived operators.",
      "intuition": "σ selects rows, π selects columns, ⋈ joins tables, - finds differences.",
      "formula": "σ: selection. π: projection. ×: Cartesian. ∪: union. -: difference. ⋈: natural join.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Division (÷) finds rows matching ALL values in target — like universal quantifier.",
      "common_mistake": "Natural join removes duplicate columns; equi-join keeps both copies.",
      "pyq_insight": "GATE: convert SQL to relational algebra or evaluate RA expression on given tables.",
      "relations": []
    },
    {
      "id": "er_model",
      "name": "ER Model",
      "topic": "Data Modeling",
      "definition": "Entity-Relationship model diagrams entities, attributes, and relationships in a database.",
      "intuition": "Blueprint of a database — boxes (entities), ovals (attributes), diamonds (relations).",
      "formula": "Cardinality: 1:1, 1:N, M:N. Participation: total (double line) or partial (single).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Weak entity: no primary key; depends on identifying relationship with strong entity.",
      "common_mistake": "Multivalued attribute is ellipse with double oval. Derived attribute is dashed ellipse.",
      "pyq_insight": "GATE: convert ER diagram to relational schema — cardinality and participation rules.",
      "relations": []
    },
    {
      "id": "closure_fd",
      "name": "Attribute Closure & Keys",
      "topic": "Normalization",
      "definition": "X⁺ = all attributes functionally determined by X. X is superkey iff X⁺ = all attributes.",
      "intuition": "Starting from X, what else can you determine? If everything → X is a superkey.",
      "formula": "X⁺ = start with X, add all Y where X→Y (via Armstrong's axioms repeatedly).",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "Find ALL candidate keys first before normalizing. Use closure to verify.",
      "common_mistake": "Failing to check ALL attributes in closure. Missing transitive dependencies.",
      "pyq_insight": "GATE: given FDs, find X⁺ and identify all candidate keys — extremely common.",
      "relations": [
        {
          "to": "normalization",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "mvd",
      "name": "Multi-Valued Dependencies & 4NF",
      "topic": "Normalization",
      "definition": "X↠Y: for each X value, the set of Y values is independent of other attributes.",
      "intuition": "Two independent multi-valued facts about the same thing — should be in separate tables.",
      "formula": "4NF: no non-trivial MVD where LHS is not a superkey. 4NF ⊂ BCNF.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "MVD only matters when table has ≥3 attributes and two are independently multi-valued.",
      "common_mistake": "FD implies MVD (every FD X→Y is also X↠Y). Converse is false.",
      "pyq_insight": "GATE: identify 4NF violation; decompose to remove MVD.",
      "relations": [
        {
          "to": "normalization",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "views",
      "name": "Views & Materialized Views",
      "topic": "Query Processing",
      "definition": "Virtual tables defined by queries. Materialized views store results physically.",
      "intuition": "View = saved query (re-executed each time). Materialized = cached result (stale risk).",
      "formula": "View update: updatable if 1-table, no GROUP BY, no DISTINCT, no aggregates.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "Views don't store data (usually). Materialized views do — need refresh strategy.",
      "common_mistake": "View modifications propagate to base table (if updatable). Not all views are updatable.",
      "pyq_insight": "GATE: determine if view is updatable given its definition.",
      "relations": []
    },
    {
      "id": "locks",
      "name": "Locking Protocols",
      "topic": "Transaction Management",
      "definition": "Shared (S) locks for reads, Exclusive (X) locks for writes. Lock compatibility matrix.",
      "intuition": "Multiple readers OK; one writer blocks all. Lock matrix governs compatibility.",
      "formula": "S-S compatible. S-X incompatible. X-X incompatible. 2PL: grow then shrink phase.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Strict 2PL: release ALL locks at commit. Prevents cascading rollback.",
      "common_mistake": "2PL prevents some non-serializable schedules but NOT all anomalies (deadlock still possible).",
      "pyq_insight": "GATE: determine if locking protocol prevents conflict; check for deadlock in lock graph.",
      "relations": [
        {
          "to": "transactions",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "recovery",
      "name": "Database Recovery",
      "topic": "Transaction Management",
      "definition": "Restoring DB to consistent state after failure using undo/redo log records.",
      "intuition": "Log is the audit trail — redo committed, undo uncommitted after crash.",
      "formula": "UNDO: uncommitted at crash → undo changes. REDO: committed → redo changes.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "UNDO list: active transactions at crash. REDO list: committed after last checkpoint.",
      "common_mistake": "Force-write policy: each commit forces log to disk. No-steal: dirty pages not evicted.",
      "pyq_insight": "GATE: given log, identify which transactions to undo/redo after crash.",
      "relations": [
        {
          "to": "transactions",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "query_optimization",
      "name": "Query Optimization",
      "topic": "Query Processing",
      "definition": "Finding the most efficient execution plan for a SQL query.",
      "intuition": "Different join orders, index usage, or early filtering can change cost by 100×.",
      "formula": "Cost model: disk I/O dominated. Selectivity of predicate = fraction of rows passing.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Push σ (selection) below ⋈ (join) — reduces join input size dramatically.",
      "common_mistake": "Query optimizer may not always choose BEST plan — it uses cost estimates which can be wrong.",
      "pyq_insight": "GATE: identify which relational algebra expression is most efficient for given query.",
      "relations": []
    },
    {
      "id": "sql_joins",
      "name": "SQL Join Types",
      "topic": "SQL",
      "definition": "INNER: matching rows. LEFT OUTER: all left + matches. FULL OUTER: all from both.",
      "intuition": "INNER = intersection. OUTER = at least one side with NULLs for non-matches.",
      "formula": "INNER JOIN = equi-join where both rows match. CROSS JOIN = Cartesian product.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Natural join automates equi-join on same-name columns. May drop columns.",
      "common_mistake": "LEFT JOIN and RIGHT JOIN are NOT symmetric. LEFT keeps all LEFT rows regardless.",
      "pyq_insight": "GATE: compute output table for given join type and instance; count rows.",
      "relations": [
        {
          "to": "relational_algebra",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "sql_aggregation",
      "name": "SQL Aggregation & GROUP BY",
      "topic": "SQL",
      "definition": "GROUP BY partitions rows into groups; aggregate functions compute per-group statistics.",
      "intuition": "GROUP BY is 'organize by'; aggregate is 'summarize each pile'.",
      "formula": "COUNT(*), SUM, AVG, MIN, MAX. HAVING filters AFTER grouping (WHERE filters before).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "HAVING vs WHERE: WHERE filters rows before grouping; HAVING filters groups after.",
      "common_mistake": "Cannot use non-grouped, non-aggregated columns in SELECT with GROUP BY.",
      "pyq_insight": "GATE: trace GROUP BY output; identify HAVING conditions; correct SQL query.",
      "relations": []
    },
    {
      "id": "subquery",
      "name": "Subqueries & Nested SQL",
      "topic": "SQL",
      "definition": "Query embedded inside another SQL statement. Correlated subquery: references outer query.",
      "intuition": "Subquery = inner query runs first, provides input to outer query.",
      "formula": "EXISTS: returns true if subquery has any row. NOT EXISTS: for 'division' queries.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "NOT EXISTS implements relational division — 'find X such that for ALL Y, condition holds'.",
      "common_mistake": "Correlated subquery is re-evaluated for EACH row of outer query — potentially slow.",
      "pyq_insight": "GATE: write SQL for 'students who took ALL courses' using NOT EXISTS.",
      "relations": []
    },
    {
      "id": "acid_isolation",
      "name": "ACID Isolation Levels",
      "topic": "Transaction Management",
      "definition": "Isolation levels: Read Uncommitted < Read Committed < Repeatable Read < Serializable.",
      "intuition": "Trade-off: higher isolation = fewer anomalies but lower concurrency.",
      "formula": "Anomalies: Dirty Read, Non-repeatable Read, Phantom Read. Serializable prevents all.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Read Committed prevents dirty reads. Repeatable Read prevents non-repeatable reads too.",
      "common_mistake": "SERIALIZABLE is the strongest isolation — NOT the default in most DBs (Read Committed is usual default).",
      "pyq_insight": "GATE: identify which anomaly is possible at given isolation level.",
      "relations": [
        {
          "to": "transactions",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "checkpoint",
      "name": "Checkpointing in Recovery",
      "topic": "Transaction Management",
      "definition": "OS-level snapshot of DB state forcing all dirty pages to disk and logging checkpoint record.",
      "intuition": "Periodic save point — after crash, only need to redo/undo transactions AFTER last checkpoint.",
      "formula": "At crash: UNDO uncommitted transactions. REDO committed-after-checkpoint transactions.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "Active transaction at checkpoint AND committed after checkpoint → REDO it.",
      "common_mistake": "Checkpoint doesn't mean 'all transactions committed'. Active transactions continue past the checkpoint.",
      "pyq_insight": "GATE: given log with checkpoint, identify which transactions to undo and redo.",
      "relations": [
        {
          "to": "recovery",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "histogram",
      "name": "Query Cost Estimation",
      "topic": "Query Processing",
      "definition": "Optimizer uses statistics (histograms, row counts) to estimate cost of different plans.",
      "intuition": "Optimizer plays chess — evaluates multiple plans and picks cheapest based on estimated cost.",
      "formula": "Selectivity = fraction of rows satisfying predicate. Estimated output = selectivity × table size.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "Without statistics, optimizer picks WRONG plan. Stale statistics → poor performance.",
      "common_mistake": "Query optimizer doesn't always find OPTIMAL plan — heuristics and limited lookahead.",
      "pyq_insight": "GATE: identify which query plan is cheaper based on given statistics.",
      "relations": []
    }
  ],
  "cn": [
    {
      "id": "osi_model",
      "name": "OSI & TCP/IP Model",
      "topic": "Network Models",
      "definition": "Layered reference models for network communication. OSI has 7 layers; TCP/IP has 4-5.",
      "intuition": "Each layer adds a 'header' (encapsulation) and hands to the layer below for sending.",
      "formula": "OSI: Physical, DataLink, Network, Transport, Session, Presentation, Application.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "TCP/IP merges Session+Presentation+Application into one Application layer.",
      "common_mistake": "HTTP is Application layer. IP is Network. TCP is Transport. Ethernet is DataLink.",
      "pyq_insight": "GATE: identify which layer a protocol belongs to (DNS, ARP, ICMP are tricky ones).",
      "relations": [
        {
          "to": "sliding_window",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "sliding_window",
      "name": "Sliding Window Protocols",
      "topic": "Data Link Layer",
      "definition": "Flow control protocols allowing multiple outstanding unacknowledged frames.",
      "intuition": "Sender has a 'window' of frames it can send without waiting for ACKs.",
      "formula": "GBN: Sender window ≤ 2ᵏ-1, Receiver=1. SR: Both windows ≤ 2^(k-1).",
      "difficulty": "hard",
      "importance": 10,
      "exam_trick": "GBN window size = 2ᵏ-1 (not 2ᵏ) to avoid ambiguity. SR = half the sequence space each.",
      "common_mistake": "GBN: receiver throws away all out-of-order frames. SR: receiver buffers them.",
      "pyq_insight": "GATE: compute window size, efficiency, throughput for given Tp and Tt.",
      "relations": [
        {
          "to": "ip_subnetting",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "ip_subnetting",
      "name": "IP Addressing & Subnetting",
      "topic": "Network Layer",
      "definition": "IPv4 addresses divided into network and host portions. Subnetting borrows host bits.",
      "intuition": "Like splitting a building into apartments — same building (network), different units (hosts).",
      "formula": "Subnets = 2^n; Hosts/subnet = 2^h - 2; Block size = 2^(32-prefix)",
      "difficulty": "medium",
      "importance": 9,
      "exam_trick": "Network address: all host bits = 0. Broadcast: all host bits = 1. Both unusable.",
      "common_mistake": "CIDR /n: first n bits are NETWORK. Last (32-n) bits are HOST.",
      "pyq_insight": "GATE: given IP and mask, find network address, broadcast, usable host count.",
      "relations": [
        {
          "to": "tcp_flow",
          "type": "depends_on"
        }
      ]
    },
    {
      "id": "tcp_flow",
      "name": "TCP & Congestion Control",
      "topic": "Transport Layer",
      "definition": "Reliable, connection-oriented protocol with flow control and congestion avoidance.",
      "intuition": "TCP is like a courteous driver — slows down when traffic is heavy.",
      "formula": "Slow start: cwnd doubles/RTT. Cong. avoidance: +1 MSS/RTT. On loss: ssthresh=cwnd/2.",
      "difficulty": "hard",
      "importance": 9,
      "exam_trick": "On triple dup ACK: fast recovery (cwnd=ssthresh). On timeout: restart slow start (cwnd=1).",
      "common_mistake": "'Slow start' isn't slow — cwnd doubles each RTT (exponential growth).",
      "pyq_insight": "GATE: trace cwnd over multiple RTTs with given loss events.",
      "relations": []
    },
    {
      "id": "routing",
      "name": "Routing Algorithms",
      "topic": "Network Layer",
      "definition": "Algorithms to determine optimal path for data packets through a network.",
      "intuition": "Each router acts locally (DV) or with full topology knowledge (LS).",
      "formula": "Distance Vector (Bellman-Ford based): Dv(y) = minₓ{c(v,x)+Dₓ(y)}. Link State: Dijkstra.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "DV has count-to-infinity problem. LS has full topology — no count-to-infinity.",
      "common_mistake": "RIP uses DV. OSPF uses LS. BGP is path-vector (exterior gateway protocol).",
      "pyq_insight": "GATE: apply routing algorithm to given network, compute routing table.",
      "relations": []
    },
    {
      "id": "aloha",
      "name": "ALOHA Protocols",
      "topic": "MAC Protocols",
      "definition": "Random access protocol where stations transmit and detect collisions after the fact.",
      "intuition": "Everyone shouts at once — if collision, wait random time and retry.",
      "formula": "Pure ALOHA: efficiency = 1/(2e) ≈ 18.4%. Slotted ALOHA: 1/e ≈ 36.8%.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Slotted ALOHA doubles efficiency by synchronizing transmission starts.",
      "common_mistake": "G = offered load. Throughput S = G·e^(-2G) for Pure, G·e^(-G) for Slotted.",
      "pyq_insight": "GATE: compute throughput for given offered load G using ALOHA formula.",
      "relations": [
        {
          "to": "osi_model",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "csma_cd",
      "name": "CSMA/CD",
      "topic": "MAC Protocols",
      "definition": "Carrier Sense Multiple Access with Collision Detection — Ethernet's MAC protocol.",
      "intuition": "Listen before transmitting; if collision detected mid-frame, stop and retry.",
      "formula": "Min frame size: 2×Tp×Bandwidth (must still be transmitting when collision detected).",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Minimum frame size ensures sender detects collision before finishing transmission.",
      "common_mistake": "CSMA/CD for wired Ethernet. CSMA/CA for WiFi (detect impossible in wireless).",
      "pyq_insight": "GATE: compute minimum frame size given bandwidth and propagation delay.",
      "relations": [
        {
          "to": "sliding_window",
          "type": "contrasts_with"
        }
      ]
    },
    {
      "id": "ethernet_frame",
      "name": "Ethernet Frame Format",
      "topic": "Data Link Layer",
      "definition": "Layer 2 frame with preamble, destination MAC, source MAC, type/length, data, FCS.",
      "intuition": "The envelope for data in a local network — identifies sender, receiver, content type.",
      "formula": "Min frame data=46B (pad if needed), Max=1500B. Total min=64B, max=1518B.",
      "difficulty": "easy",
      "importance": 6,
      "exam_trick": "FCS uses CRC-32. Type field >1500 → EtherType. ≤1500 → length (802.3).",
      "common_mistake": "MAC address is 6 bytes (48 bits) not 4 bytes. IP is 4 bytes.",
      "pyq_insight": "GATE: calculate number of hosts in Ethernet; frame overhead calculation.",
      "relations": []
    },
    {
      "id": "arp",
      "name": "ARP & RARP",
      "topic": "Network Layer",
      "definition": "Address Resolution Protocol maps IP addresses to MAC addresses.",
      "intuition": "You know where someone lives (IP) but need their name (MAC) to actually knock on the door.",
      "formula": "ARP request: broadcast. ARP reply: unicast. ARP cache stored locally.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "ARP operates at Layer 2-3 boundary. RARP is reverse: MAC→IP (obsolete, replaced by DHCP).",
      "common_mistake": "Gratuitous ARP: device broadcasts own IP→MAC mapping. Used to detect IP conflicts.",
      "pyq_insight": "GATE: identify when ARP is needed — same subnet vs different subnet (router uses ARP).",
      "relations": []
    },
    {
      "id": "nat",
      "name": "Network Address Translation (NAT)",
      "topic": "Network Layer",
      "definition": "Router translates private IP addresses to a single public IP for internet communication.",
      "intuition": "Office building: 100 employees all appear to have the same external phone number.",
      "formula": "NAT table: (private IP, private port) ↔ (public IP, public port).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "NAT breaks end-to-end connectivity. P2P and VoIP have NAT traversal problems.",
      "common_mistake": "NAT provides security through obscurity — NOT true security. Firewall provides security.",
      "pyq_insight": "GATE: compute number of simultaneous connections supported with port-based NAT.",
      "relations": []
    },
    {
      "id": "ipv6",
      "name": "IPv6",
      "topic": "Network Layer",
      "definition": "128-bit addressing scheme replacing IPv4. Eliminates NAT need; built-in IPsec.",
      "intuition": "IPv4 ran out of addresses (4 billion). IPv6 provides 2^128 — essentially unlimited.",
      "formula": "IPv6: 128 bits = 8 groups of 4 hex digits. Header: fixed 40 bytes (simpler than IPv4).",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "IPv6 header is SIMPLER than IPv4 — no checksum in IPv6 header (handled by transport).",
      "common_mistake": "IPv6 doesn't support broadcast — uses multicast and anycast instead.",
      "pyq_insight": "GATE: IPv6 address compression (:: for longest zero run) — notation question.",
      "relations": [
        {
          "to": "ip_subnetting",
          "type": "variant_of"
        }
      ]
    },
    {
      "id": "dns",
      "name": "DNS — Domain Name System",
      "topic": "Application Layer",
      "definition": "Hierarchical distributed database mapping domain names to IP addresses.",
      "intuition": "Phone book of the internet — translates human-readable names to numeric addresses.",
      "formula": "DNS uses UDP port 53. TCP for zone transfers. TTL controls cache lifetime.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Recursive resolution: client asks resolver, resolver asks root → TLD → authoritative.",
      "common_mistake": "DNS uses UDP (not TCP) for normal queries. Zone transfers use TCP.",
      "pyq_insight": "GATE: trace DNS resolution steps; identify resolver type (recursive vs iterative).",
      "relations": []
    },
    {
      "id": "http",
      "name": "HTTP & Web Protocols",
      "topic": "Application Layer",
      "definition": "Stateless application protocol for web. HTTP/1.1 persistent; HTTP/2 multiplexed.",
      "intuition": "HTTP is the language of the web — request-response over TCP.",
      "formula": "HTTP/1.0: 2 RTT per object (connection + request). HTTP/1.1: 1 RTT (persistent).",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Cookies add state to stateless HTTP. HTTPS = HTTP over TLS (port 443).",
      "common_mistake": "HTTP is stateless — each request is independent. Sessions maintained via cookies/tokens.",
      "pyq_insight": "GATE: compute download time for web page with embedded objects (RTT calculation).",
      "relations": []
    },
    {
      "id": "tcp_handshake",
      "name": "TCP 3-Way Handshake",
      "topic": "Transport Layer",
      "definition": "Connection setup: SYN → SYN-ACK → ACK. Teardown: FIN → FIN-ACK → FIN → ACK (4-way).",
      "intuition": "Establishing trust before data transfer: 'I want to talk' → 'Ok, I'm ready' → 'Let's go'.",
      "formula": "Setup: 1.5 RTT delay. Teardown: 2 RTT (FIN can be delayed). TIME_WAIT = 2×MSL.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "SYN flood attack: half-open connections exhaust server resources. SYN cookies mitigate this.",
      "common_mistake": "4-way teardown: server's FIN is separate from server's ACK of client's FIN (FIN-WAIT-2 state).",
      "pyq_insight": "GATE: compute connection setup time; identify TCP state diagram transitions.",
      "relations": [
        {
          "to": "tcp_flow",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "udp",
      "name": "UDP — User Datagram Protocol",
      "topic": "Transport Layer",
      "definition": "Connectionless, unreliable, unordered transport protocol. Low overhead.",
      "intuition": "Just throw the packet — no delivery guarantee, no order. Fast and simple.",
      "formula": "UDP header: 8 bytes (src port, dst port, length, checksum). No SYN, no ACK.",
      "difficulty": "easy",
      "importance": 7,
      "exam_trick": "DNS, DHCP, SNMP, TFTP use UDP. Streaming video/games also prefer UDP for low latency.",
      "common_mistake": "UDP DOES have a checksum field (optional in IPv4, mandatory in IPv6).",
      "pyq_insight": "GATE: compare TCP vs UDP; identify appropriate protocol for given application.",
      "relations": [
        {
          "to": "osi_model",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "error_detection",
      "name": "Error Detection & Correction",
      "topic": "Data Link Layer",
      "definition": "CRC for error detection. Hamming codes for error correction. Parity for simple detection.",
      "intuition": "Add redundant bits — receiver checks them to detect or even fix bit errors.",
      "formula": "CRC: treat bits as polynomial, divide by generator. Remainder = CRC bits. Detect burst errors.",
      "difficulty": "hard",
      "importance": 8,
      "exam_trick": "Hamming distance d: detect d-1 errors, correct ⌊(d-1)/2⌋ errors.",
      "common_mistake": "CRC DETECTS but doesn't correct errors. Hamming codes can CORRECT single-bit errors.",
      "pyq_insight": "GATE: compute CRC remainder for given data and generator; find Hamming code for data word.",
      "relations": []
    },
    {
      "id": "cdma",
      "name": "CDMA — Code Division Multiple Access",
      "topic": "MAC Protocols",
      "definition": "All stations transmit simultaneously using unique orthogonal codes. Spread spectrum.",
      "intuition": "Everyone speaks simultaneously in different languages — each receiver understands only their language.",
      "formula": "Chip code orthogonality: cᵢ · cⱼ = 0 if i≠j. Inner product of transmitted signal with chip code extracts data.",
      "difficulty": "hard",
      "importance": 6,
      "exam_trick": "CDMA: chip sequences must be orthogonal. Extraction by dot product with known chip code.",
      "common_mistake": "CDMA doesn't prevent interference — orthogonal codes mathematically cancel others out.",
      "pyq_insight": "GATE: compute received signal; decode using chip sequence dot product.",
      "relations": [
        {
          "to": "aloha",
          "type": "contrasts_with"
        }
      ]
    },
    {
      "id": "network_layer_routing",
      "name": "OSPF & BGP",
      "topic": "Network Layer",
      "definition": "OSPF: intra-AS link-state routing. BGP: inter-AS path-vector routing.",
      "intuition": "OSPF: within a company's network. BGP: between companies on the internet.",
      "formula": "OSPF uses Dijkstra. BGP selects routes based on policy, not just shortest path.",
      "difficulty": "hard",
      "importance": 7,
      "exam_trick": "OSPF: fast convergence, hierarchical (areas). BGP: policy-based, slow convergence.",
      "common_mistake": "BGP IS NOT shortest-path routing — ISPs choose routes based on business agreements.",
      "pyq_insight": "GATE: identify routing protocol by characteristics; compare convergence properties.",
      "relations": [
        {
          "to": "routing",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "congestion_control",
      "name": "Congestion Control vs Flow Control",
      "topic": "Transport Layer",
      "definition": "Flow control: protects receiver (receiver buffer). Congestion control: protects network (router buffer).",
      "intuition": "Flow: 'don't overwhelm ME'. Congestion: 'don't overwhelm the NETWORK between us'.",
      "formula": "TCP window = min(cwnd, rwnd). rwnd: receiver's window (flow). cwnd: congestion window.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Receiver advertises rwnd. Sender maintains cwnd via slow-start/AIMD. Effective = min(both).",
      "common_mistake": "Flow control ≠ congestion control. Both limit sender rate but for different reasons.",
      "pyq_insight": "GATE: compute effective sending rate given rwnd and cwnd; trace cwnd evolution.",
      "relations": [
        {
          "to": "tcp_flow",
          "type": "part_of"
        }
      ]
    },
    {
      "id": "spanning_tree_protocol",
      "name": "Spanning Tree Protocol (STP)",
      "topic": "Data Link Layer",
      "definition": "Prevents bridge loops in Ethernet by disabling redundant links to form a spanning tree.",
      "intuition": "Multiple physical paths between switches cause broadcast storms — STP disables extras.",
      "formula": "Root bridge elected (lowest bridge ID). All ports: root port, designated port, or blocked.",
      "difficulty": "medium",
      "importance": 6,
      "exam_trick": "STP convergence is slow (~50s). RSTP (802.1w) converges in ~1s.",
      "common_mistake": "STP operates at Layer 2 (frames). IP routing handles loops at Layer 3 (TTL).",
      "pyq_insight": "GATE: identify STP port states; determine which links are blocked in given topology.",
      "relations": []
    }
  ],
  "ga": [
    {
      "id": "work_time",
      "name": "Time, Work & Pipes",
      "topic": "Arithmetic",
      "definition": "Rate-based problems where combined work = sum of individual rates.",
      "intuition": "Convert everything to RATES (work per unit time) and then add/subtract.",
      "formula": "Rate of A = 1/a per day. Combined = 1/a + 1/b. Time = 1/combined.",
      "difficulty": "easy",
      "importance": 8,
      "exam_trick": "Emptying pipe subtracts from filling rate. Always work with rates.",
      "common_mistake": "Adding days directly: wrong! Always add rates (1/a + 1/b), then invert.",
      "pyq_insight": "Appears in GA section. 1-2 questions per year.",
      "relations": []
    },
    {
      "id": "speed_distance",
      "name": "Speed, Distance & Time",
      "topic": "Arithmetic",
      "definition": "Fundamental kinematic relationships. Relative speed for trains crossing/chasing.",
      "intuition": "Everything reduces to: Distance = Speed × Time.",
      "formula": "Avg speed (equal dist): 2ab/(a+b). Relative speed: same dir = |v₁-v₂|; opp = v₁+v₂",
      "difficulty": "easy",
      "importance": 8,
      "exam_trick": "For equal distances, NEVER average speeds — use HM formula 2ab/(a+b).",
      "common_mistake": "Simply averaging speeds gives wrong answer for equal-distance trips.",
      "pyq_insight": "GATE GA: train problems (crossing poles, platforms, each other).",
      "relations": []
    },
    {
      "id": "critical_reasoning",
      "name": "Critical Reasoning",
      "topic": "Verbal",
      "definition": "Analyzing arguments to identify assumptions, strengths, and weaknesses.",
      "intuition": "Find the logical gap in the argument. Strengthener fills it; Weakener attacks it.",
      "formula": "Assumption bridges premise to conclusion. Conclusion + Assumption → follows logically.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Weaken: attack the unstated assumption. Strengthen: provide new supporting evidence.",
      "common_mistake": "Confusing conclusion with a premise — conclusion is the CLAIM, premises are EVIDENCE.",
      "pyq_insight": "GATE GA: 2-4 marks of reading comprehension and critical reasoning every year.",
      "relations": []
    },
    {
      "id": "syllogism",
      "name": "Syllogisms",
      "topic": "Logical Reasoning",
      "definition": "Deductive argument with two premises and a conclusion. Validity tested with Venn diagrams.",
      "intuition": "Draw all valid Venn diagram arrangements for premises — conclusion valid if it holds in ALL.",
      "formula": "Universal: 'All A are B'. Particular: 'Some A are B'. Negative: 'No A are B'.",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "'Some A are B' does NOT imply 'Some A are not B'. Only draw what's forced by premises.",
      "common_mistake": "Complementary syllogism: if 'All A are B', then 'Some A are B' is also true (particular follows from universal).",
      "pyq_insight": "GATE GA: 2-3 syllogism questions. Use Venn diagram method consistently.",
      "relations": []
    },
    {
      "id": "number_series",
      "name": "Number Series & Patterns",
      "topic": "Quantitative Aptitude",
      "definition": "Identify rule governing a sequence; find the next term or missing term.",
      "intuition": "Differences, ratios, squares, cubes, alternating patterns — look for the generation rule.",
      "formula": "Common patterns: arithmetic (diff constant), geometric (ratio constant), squares, cubes, Fibonacci.",
      "difficulty": "medium",
      "importance": 7,
      "exam_trick": "Check second differences if first differences aren't constant. May be quadratic sequence.",
      "common_mistake": "Assuming only one pattern applies — sometimes two interleaved patterns exist.",
      "pyq_insight": "GATE GA: always appears. 1-2 questions on sequence completion.",
      "relations": []
    },
    {
      "id": "percentage_profit",
      "name": "Percentages, Profit & Loss",
      "topic": "Arithmetic",
      "definition": "Percent = per hundred. Profit = SP - CP. Profit% = (Profit/CP) × 100.",
      "intuition": "Everything relates back to the base (Cost Price for profit, original for percentage change).",
      "formula": "Successive discounts a% then b%: Net discount = a + b - ab/100.",
      "difficulty": "easy",
      "importance": 8,
      "exam_trick": "Successive discounts: NEVER add — use formula. Same discount twice ≠ double the discount.",
      "common_mistake": "Profit% is on CP. Discount% is on Marked Price (MP). Base is different!",
      "pyq_insight": "GATE GA: 1-2 questions on profit/loss or percentage every year.",
      "relations": []
    },
    {
      "id": "sets_venn",
      "name": "Set Theory & Venn Diagrams",
      "topic": "Logic",
      "definition": "A∪B, A∩B, A-B, A' are basic operations. Inclusion-exclusion: |A∪B| = |A|+|B|-|A∩B|.",
      "intuition": "Venn diagrams are the visual calculator of set operations.",
      "formula": "|A∪B∪C| = |A|+|B|+|C|-|A∩B|-|B∩C|-|A∩C|+|A∩B∩C|",
      "difficulty": "medium",
      "importance": 8,
      "exam_trick": "Draw Venn diagram and fill from innermost (triple intersection) outward.",
      "common_mistake": "Forgetting to SUBTRACT elements counted twice and ADD BACK those subtracted too many times.",
      "pyq_insight": "GATE GA: 'In a class of 100, 60 like math, 50 like physics...' — classic inclusion-exclusion.",
      "relations": []
    }
  ]
};

// ═══ REVISION CONTENT DATA ═══
const RC={"ga":{"formulas":[{"name":"Average Speed (equal distances)","formula":"2ab/(a+b)","note":"Harmonic mean. NOT arithmetic mean. Always less than (a+b)/2."},{"name":"Profit %","formula":"(SP−CP)/CP × 100","note":"Loss% = (CP−SP)/CP × 100. SP>CP → profit."},{"name":"Successive Discounts","formula":"Net = a+b − ab/100","note":"Two discounts a% and b% sequentially."},{"name":"Simple Interest","formula":"SI = PRT/100","note":"P=principal, R=rate per annum, T=time in years."},{"name":"Compound Interest","formula":"CI = P(1+R/100)ⁿ − P","note":"CI−SI for 2 years = P(R/100)²."},{"name":"CI−SI Difference","formula":"P(R/100)²","note":"Valid for exactly 2 years only."},{"name":"Pipes & Work","formula":"Combined rate = 1/a + 1/b","note":"Time together = ab/(a+b). Emptying pipes subtract."},{"name":"Relative Speed","formula":"Same dir: |v₁−v₂|; Opposite: v₁+v₂","note":"Time to cross = distance / relative speed."},{"name":"Clock Angle","formula":"|30h − 5.5m| degrees","note":"h=hours, m=minutes. Hour hand: 0.5°/min. Minute: 6°/min."},{"name":"Circular Permutation","formula":"(n−1)!","note":"If clockwise=anti-clockwise: (n−1)!/2."},{"name":"Combination","formula":"C(n,r) = n!/[r!(n−r)!]","note":"C(n,r) = C(n,n−r). Sum of all = 2ⁿ."},{"name":"Alligation","formula":"Ratio = (d₂−m):(m−d₁)","note":"m = mean value, d₁ and d₂ are component values."}],"concepts":[{"title":"Time & Work principle","body":"Rate of work adds linearly. If A takes 'a' days → rate = 1/a per day. Combined rate = sum of individual rates. Always convert to rates, never days directly."},{"title":"Ratio and Proportion","body":"a:b = c:d ↔ ad=bc (cross-multiplication). Componendo-dividendo: (a+b)/(a−b) = (c+d)/(c−d). Useful for solving proportion chains."},{"title":"Odd days and calendar","body":"Ordinary year: 1 odd day. Leap year: 2 odd days. 100 years: 5 odd days. 400 years: 0 odd days. Leap if divisible by 4 (not centuries unless divisible by 400)."},{"title":"Syllogism Venn approach","body":"Draw all valid Venn diagrams for given premises. Conclusion is valid only if it holds in EVERY valid diagram. 'Some' = at least one; 'All' = complete subset; 'No' = disjoint sets."},{"title":"Number system divisibility","body":"3: digit sum. 4: last 2 digits. 8: last 3 digits. 9: digit sum. 11: alternating sum. 7: double last digit, subtract from rest, repeat."}],"traps":[{"title":"Average speed trap","text":"Never average speeds directly. Use 2ab/(a+b) for equal distances. For unequal, use total distance / total time only."},{"title":"'Some A are B' does NOT mean 'Some A are not B'","text":"'Some' only guarantees at least one overlap. Whether some are outside depends on the diagram. Don't infer the negative unless forced."},{"title":"Profit % is on CP, Discount % is on MP","text":"Classic confusion. Profit/Loss percentages are always on Cost Price. Discount percentage is always on Marked Price."},{"title":"CI compounding period","text":"If compounded half-yearly: R→R/2, n→2n. Quarterly: R→R/4, n→4n. Formula stays CI = P(1+R/100)ⁿ with adjusted values."}],"pyqPatterns":[{"pattern":"Distance-Speed-Time with trains","detail":"One or two trains, crossing poles/platforms/each other. Set up equation using length/relative speed.","years":"Appears every year"},{"pattern":"Critical reasoning: weaken/strengthen","detail":"Find the gap in reasoning (unstated assumption). Weakener attacks that assumption. Strengthener provides more evidence for it.","years":"2019, 2020, 2021, 2022"},{"pattern":"Data Interpretation tables/graphs","detail":"Calculate % change, ratios, averages from given data. Unit cancellations are common traps.","years":"Every year"}],"mnemonics":[{"label":"Harmonic mean mnemonic","text":"'When distances are Equal, use Double-Product-over-Sum' → 2ab/(a+b)","for":"Average speed formula"},{"label":"BODMAS","text":"Brackets, Orders (powers/roots), Division, Multiplication, Addition, Subtraction","for":"Operator precedence in arithmetic"}]},"calc":{"formulas":[{"name":"Limit exists condition","formula":"LHL = RHL = l","note":"For continuity additionally need l = f(a)."},{"name":"L'Hôpital's Rule","formula":"lim f/g = lim f'/g' (if 0/0 or ∞/∞)","note":"Apply repeatedly until form resolves. Check condition each time."},{"name":"Standard limit sinx/x","formula":"lim(x→0) sinx/x = 1","note":"Also: tanx/x=1, (1−cosax)/x²=a²/2, (aˣ−1)/x=logₑa."},{"name":"Standard limit exponential","formula":"lim(x→0)(1+ax)^(b/x) = e^(ab)","note":"Variant: lim(x→∞)(1+a/x)^(bx) = e^(ab)."},{"name":"LMVT","formula":"f'(c) = [f(b)−f(a)]/(b−a), c∈(a,b)","note":"Requires: continuous on [a,b], differentiable on (a,b)."},{"name":"Taylor Series","formula":"f(x) = Σ f⁽ⁿ⁾(a)(x−a)ⁿ/n!","note":"Maclaurin = Taylor at a=0. eˣ=Σxⁿ/n!."},{"name":"Integration by Parts","formula":"∫f·g dx = f·∫g dx − ∫[f'·∫g dx]dx","note":"ILATE priority: Inverse, Log, Algebraic, Trig, Exponential."},{"name":"Newton-Leibnitz Rule","formula":"d/dx[∫ᵩ^ψ f(t)dt] = f(ψ)ψ'−f(ϕ)ϕ'","note":"Differentiate under integral sign with variable limits."},{"name":"Gamma Function","formula":"Γ(n) = ∫₀^∞ e^(−x)xⁿ⁻¹dx = (n−1)!","note":"Γ(1/2)=√π. Γ(n+1)=nΓ(n)."},{"name":"Euler's Theorem","formula":"x·∂f/∂x + y·∂f/∂y = n·f","note":"For homogeneous function of degree n. Second order: x²f_xx+2xy·f_xy+y²f_yy=n(n−1)f."},{"name":"2-variable Maxima test","formula":"D=rt−s², r=f_xx, s=f_xy, t=f_yy","note":"D>0,r>0→min; D>0,r<0→max; D<0→saddle."},{"name":"Jacobian (Cartesian to polar)","formula":"J=r, dx dy = r dr dθ","note":"x=rcosθ, y=rsinθ. Cylindrical: dxdydz=r dr dθ dz."}],"concepts":[{"title":"Continuity vs Differentiability","body":"Differentiability ⟹ Continuity (but not vice versa). |x| is continuous at 0 but not differentiable. A function can have a limit at a without being defined there."},{"title":"Greatest Integer Function [x]","body":"[x]=n for n≤x<n+1. LHL at integer a = a−1, RHL = a. Limit does NOT exist at integers. Not differentiable anywhere — useful for GATE trap questions."},{"title":"Maxima/Minima method","body":"(1) Find f'(x)=0. (2) At critical points check f''(x): negative→max, positive→min, zero→use higher derivatives or sign change of f'. (3) Compare with boundary for global extrema."},{"title":"Definite integral even/odd shortcut","body":"∫₋ₐᵃ f(x)dx = 2∫₀ᵃ f(x)dx if f is even, = 0 if f is odd. Also: ∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b−x)dx."},{"title":"Indeterminate forms","body":"0/0 or ∞/∞: use L'Hôpital. 0×∞: convert to 0/0 or ∞/∞. 0⁰, 1^∞, ∞⁰: take log, convert to 0×∞ form."}],"traps":[{"title":"L'Hôpital only for 0/0 or ∞/∞","text":"Applying it to other forms gives wrong answers. Verify the form before applying. 1×∞ is NOT an indeterminate form for L'Hôpital."},{"title":"f''(c)=0 does NOT mean inflection point","text":"f''(c)=0 means no conclusion from second derivative test. Must check sign change of f'' or use higher derivatives."},{"title":"Maclaurin ≠ Taylor in general","text":"Maclaurin is a special case (expansion at a=0). Taylor is the general form. Both are the SAME formula — just different expansion points."},{"title":"Partial derivative ≠ total derivative","text":"∂f/∂x treats y as constant. Total derivative du/dx accounts for y's dependence on x via chain rule."}],"pyqPatterns":[{"pattern":"Limit evaluation","detail":"L'Hôpital application, standard limits, squeeze theorem. Usually 1/0 vs 0·∞ form.","years":"Every year in EM"},{"pattern":"Taylor/Maclaurin coefficient extraction","detail":"'Coefficient of xⁿ in expansion of f(x)' = f⁽ⁿ⁾(0)/n!","years":"2017, 2019, 2022"},{"pattern":"Multivariable maxima/minima","detail":"Find stationary points using partial derivatives, classify using D=rt−s².","years":"2015, 2018, 2021"}],"mnemonics":[{"label":"ILATE","text":"I – Inverse trig, L – Log, A – Algebraic, T – Trig, E – Exponential. First in list = choose as u (to differentiate).","for":"Integration by Parts order"},{"label":"MVT trio","text":"Rolle's = LMVT with f(a)=f(b) extra condition. Cauchy's = LMVT generalized to two functions.","for":"Mean Value Theorems"}]},"la":{"formulas":[{"name":"Determinant: det(kA)","formula":"kⁿ·det(A) for n×n matrix","note":"Scalar multiplication scales determinant by kⁿ."},{"name":"det(adj(A))","formula":"|A|^(n−1)","note":"adj(adj(A)): |A|^((n−1)²)."},{"name":"Inverse of A","formula":"A⁻¹ = adj(A)/|A|","note":"Exists only when |A|≠0. (AB)⁻¹=B⁻¹A⁻¹."},{"name":"2×2 Inverse","formula":"[a b;c d]⁻¹ = 1/(ad−bc)[d −b;−c a]","note":"Swap diagonal, negate off-diagonal, divide by determinant."},{"name":"Eigenvalue condition","formula":"det(A−λI) = 0","note":"Characteristic polynomial. Roots are eigenvalues."},{"name":"Sum and Product of eigenvalues","formula":"Σλᵢ = trace(A); Πλᵢ = det(A)","note":"Critical GATE fact. Always check for quick eigenvalue problems."},{"name":"Cayley-Hamilton","formula":"Every matrix satisfies its characteristic equation","note":"p(A)=0 where p(λ)=det(A−λI). Use to find A⁻¹ or powers of A."},{"name":"Rank-Nullity","formula":"rank(A) + nullity(A) = n (columns)","note":"nullity = dim of null space = n − rank."},{"name":"System solutions","formula":"ρ(A)=ρ([A|B])=n→unique; <n→infinite; ≠→none","note":"Augmented matrix determines consistency."},{"name":"Eigenvectors: adjoint eigenvalues","formula":"Eigenvalues of adj(A) = |A|/λᵢ","note":"Eigenvalues of A^m = λᵢᵐ. Of kA+mI: kλᵢ+m."}],"concepts":[{"title":"Matrix types and eigenvalue rules","body":"Idempotent (A²=A): eigenvalues 0 or 1. Nilpotent (Aᵏ=0): all eigenvalues 0. Orthogonal (AAᵀ=I): eigenvalues have unit modulus. Symmetric: eigenvalues always real. Skew-symmetric: eigenvalues zero or purely imaginary."},{"title":"Row Echelon Form and Rank","body":"Rank = number of non-zero rows in REF. Elementary row operations DO NOT change rank. Rank(AB) ≤ min(rank(A), rank(B)). Rank(A)+Rank(B)−n ≤ Rank(AB) (Sylvester's inequality)."},{"title":"Linear Independence","body":"Vectors x₁,...,xₖ are LI if k₁x₁+...+kₖxₖ=0 implies all kᵢ=0. For vectors as rows of matrix: rank=number of vectors → LI. Rank < number of vectors → LD."},{"title":"Diagonalization","body":"A is diagonalizable iff it has n LI eigenvectors. Sufficient: n distinct eigenvalues. A = PDP⁻¹ where D is diagonal of eigenvalues, P columns are eigenvectors. Used to compute Aⁿ efficiently."},{"title":"Similar matrices","body":"A and B are similar if B=P⁻¹AP for some invertible P. Similar matrices have SAME eigenvalues, SAME characteristic polynomial, SAME rank, SAME trace, SAME determinant. But different eigenvectors."}],"traps":[{"title":"Eigenvectors of A and Aᵀ are NOT the same","text":"Eigenvalues of A and Aᵀ are identical, but eigenvectors are generally different. Don't confuse this."},{"title":"A+B rank is not rank(A)+rank(B)","text":"Only inequality: rank(A+B) ≤ rank(A)+rank(B). Equality not guaranteed."},{"title":"AB≠0 doesn't mean A≠0 and B≠0","text":"Product of two non-zero matrices can be zero. This means |A|=0 AND |B|=0. Both are singular."},{"title":"If sum of row = k, then k is eigenvalue","text":"The eigenvector is [1,1,...,1]ᵀ. This shortcuts finding eigenvalues when row sums are all equal."}],"pyqPatterns":[{"pattern":"Find eigenvalues using trace/determinant","detail":"Sum=trace, product=det. For 2×2 especially, this is faster than characteristic polynomial.","years":"Every year"},{"pattern":"Rank and solution set of Ax=b","detail":"Augmented matrix approach. Count pivots in REF. GATE often asks: unique/infinite/no solution.","years":"2016, 2018, 2019, 2021, 2023"},{"pattern":"Cayley-Hamilton application","detail":"Given characteristic equation, substitute A to find A⁻¹ or reduce A^n.","years":"2014, 2017, 2020"}],"mnemonics":[{"label":"SARDINE for matrix types","text":"Symmetric → real eigenvalues. Anti-symmetric (skew) → imaginary. Real Orthogonal → unit modulus. Diagonal/triangular → diagonal elements are eigenvalues.","for":"Eigenvalue type mnemonics"},{"label":"Row sums = k trick","text":"'If all row sums equal k, then k is an eigenvalue' — quick 5-second shortcut for GATE MCQs.","for":"Eigenvalue computation shortcut"}]},"ps":{"formulas":[{"name":"Addition theorem","formula":"P(A∪B) = P(A)+P(B)−P(A∩B)","note":"For 3 events: +P(A∩B∩C) at end."},{"name":"Conditional probability","formula":"P(A|B) = P(A∩B)/P(B)","note":"Multiplication: P(A∩B)=P(A|B)P(B)."},{"name":"Bayes' theorem","formula":"P(Eᵢ|A) = P(Eᵢ)P(A|Eᵢ) / ΣP(Eⱼ)P(A|Eⱼ)","note":"Reverses conditional probability."},{"name":"E[aX+b]","formula":"aE[X]+b","note":"Var(aX+b)=a²Var(X). Var(X)=E[X²]−(E[X])²."},{"name":"Binomial distribution","formula":"P(X=r)=C(n,r)pʳqⁿ⁻ʳ","note":"Mean=np, Var=npq, SD=√(npq)."},{"name":"Poisson distribution","formula":"P(X=r)=e^(−λ)λʳ/r!","note":"Mean=Variance=λ. For rare events."},{"name":"Normal distribution PDF","formula":"f(x)=(1/σ√2π)exp(−(x−μ)²/2σ²)","note":"68-95-99.7 rule for μ±1σ, ±2σ, ±3σ."},{"name":"Uniform distribution","formula":"f(x)=1/(b−a), Mean=(a+b)/2, Var=(b−a)²/12","note":"All values equally likely in [a,b]."},{"name":"Exponential distribution","formula":"f(x)=λe^(−λx), Mean=1/λ, Var=1/λ²","note":"Memoryless property: P(X>s+t|X>s)=P(X>t)."},{"name":"Covariance","formula":"Cov(X,Y)=E(XY)−E(X)E(Y)","note":"If X,Y independent: Cov=0 (converse not always true)."}],"concepts":[{"title":"Independence vs mutual exclusion","body":"Independent: P(A∩B)=P(A)P(B). ME: P(A∩B)=0. If A,B both have nonzero probability: they CANNOT be both independent AND mutually exclusive simultaneously (except trivial cases)."},{"title":"Discrete vs Continuous RV","body":"Discrete RV: countable values, described by PMF. Continuous RV: uncountable values, described by PDF. P(X=x)=0 for continuous RV — only intervals have nonzero probability."},{"title":"Normal distribution properties","body":"Symmetric bell curve. Mean=Median=Mode. Inflection points at μ±σ. Standard normal: Z=(X−μ)/σ. P(−1<Z<1)≈0.683, P(−2<Z<2)≈0.954, P(−3<Z<3)≈0.997."},{"title":"Skewness","body":"Positive skew (right tail): Mean>Median>Mode. Negative skew (left tail): Mean<Median<Mode. Symmetric: all three equal."},{"title":"Variance properties","body":"Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). If independent: last term=0. Var is always non-negative."}],"traps":[{"title":"P(A|B) ≠ P(B|A)","text":"Bayes' theorem exists exactly to convert between them. Classic error in Bayesian problems."},{"title":"Poisson: mean = variance (not SD)","text":"Variance=λ, Standard deviation=√λ. They are NOT equal (unless λ=1)."},{"title":"Independent → Cov=0, but NOT vice versa","text":"Zero covariance does not imply independence (unless joint distribution is normal). Covariance measures LINEAR relationship only."},{"title":"Combination with repetition formula","text":"C(n+r−1, r), NOT C(n,r). For selecting r objects from n types with repetition allowed."}],"pyqPatterns":[{"pattern":"Bayes' theorem application","detail":"Usually: given sensitivity/specificity of test, find P(disease|positive test). Build conditional probability tree.","years":"2016, 2018, 2020, 2022"},{"pattern":"Random variable expectation/variance","detail":"Find E[X], Var(X), or E[g(X)] from given PMF/PDF.","years":"Every year in GA/EM"},{"pattern":"Counting with combinations","detail":"Permutation with repetition, derangement, multinomial counting.","years":"2015, 2017, 2019"}],"mnemonics":[{"label":"PVEN for distributions","text":"Poisson: rare events. Uniform: equal probability. Exponential: time between Poisson events. Normal: central limit theorem.","for":"Which distribution to use when"},{"label":"Mean-Median-Mode inequality","text":"For positive skew: Mean > Median > Mode. Alphabetical order reversed: M-M-M going right to left.","for":"Skewness direction"}]},"dm":{"formulas":[{"name":"Handshaking Lemma","formula":"Σdeg(v) = 2|E|","note":"Number of odd-degree vertices is ALWAYS even."},{"name":"Complete graph Kₙ","formula":"Edges = n(n−1)/2, Degree = n−1","note":"Number of distinct graphs on n vertices = 2^(n(n−1)/2)."},{"name":"Planar graph Euler formula","formula":"V − E + F = 2","note":"For connected planar graph. E ≤ 3V−6 (simple planar). Bipartite planar: E ≤ 2V−4."},{"name":"Spanning trees of Kₙ","formula":"n^(n−2) (Cayley's formula)","note":"K₃: 3 trees. K₄: 16 trees."},{"name":"Max edges in bipartite graph","formula":"⌊n²/4⌋ for n vertices","note":"Achieved by K_{⌊n/2⌋,⌈n/2⌉}."},{"name":"Wheel graph Wₙ edges","formula":"2(n−1)","note":"Wₙ = hub + Cₙ₋₁."},{"name":"Derangement D(n)","formula":"n![1−1/1!+1/2!−...+(−1)ⁿ/n!]","note":"Probability of complete derangement ≈ 1/e for large n."},{"name":"Catalan number","formula":"Cₙ = C(2n,n)/(n+1)","note":"BSTs with n keys. Valid brackets. 1,1,2,5,14,42,..."},{"name":"Combination with repetition","formula":"C(n+r−1, r)","note":"Choosing r items from n types with repetition."},{"name":"Chromatic polynomial Kₙ","formula":"χ(Kₙ) = n","note":"Bipartite: χ=2. Cₙ: 2 if even, 3 if odd."}],"concepts":[{"title":"Graph types summary","body":"Simple: no parallel edges or loops. Multigraph: parallel edges allowed. Pseudograph: loops allowed. Bipartite: 2-colorable, no odd cycles. Complete bipartite Kₘ,ₙ: mn edges, every vertex in V₁ adjacent to all V₂."},{"title":"Eulerian vs Hamiltonian","body":"Eulerian circuit: all edges visited once. Condition: connected + all even degrees. Eulerian path (non-circuit): exactly 2 odd-degree vertices. Hamiltonian cycle: all vertices visited once — NP-complete to decide."},{"title":"Graph isomorphism invariants","body":"For isomorphic graphs: same |V|, |E|, degree sequence, girth (smallest cycle), chromatic number, planarity. If any differ → NOT isomorphic. If all match → may or may not be isomorphic."},{"title":"Logic equivalences","body":"p→q ≡ ¬p∨q ≡ ¬q→¬p (contrapositive). De Morgan: ¬(p∧q)≡¬p∨¬q, ¬(p∨q)≡¬p∧¬q. Absorption: p∨(p∧q)≡p. Precedence: ¬ > ∧ > ∨ > → > ↔."},{"title":"Equivalence vs Partial Order relations","body":"Equivalence: reflexive + symmetric + transitive (partitions the set into equivalence classes). Partial order (POSET): reflexive + antisymmetric + transitive. Total order: every pair comparable."}],"traps":[{"title":"Cycle graph with all degrees=2 — but is it a cycle?","text":"Not necessarily. G:[2,2,2,2,2,2] could be two disjoint triangles, not a 6-cycle. Degree sequence alone doesn't determine graph structure."},{"title":"Planar graph: V−E+F=2 only for connected","text":"For disconnected planar graph: V−E+F = C+1 where C = number of connected components. Always check connectivity."},{"title":"Complement degree formula","text":"If vertex has degree x in G, it has degree (n−1−x) in G̅. Apply to EACH vertex — easy marks in GATE."},{"title":"p→q is NOT p iff q","text":"Biconditional (p↔q) means both p→q AND q→p. Implication p→q only says 'if p then q' — q can be true without p."},{"title":"Catalan counts BSTs, not general binary trees","text":"Number of BSTs with n keys = Catalan(n). Number of structurally distinct binary trees with n nodes = also Catalan(n). But labeled binary trees = n!·Catalan(n)."}],"pyqPatterns":[{"pattern":"Graph properties — edges, degrees, planarity","detail":"Given n vertices, find max edges. Verify planarity using Euler's formula. Identify graph type.","years":"Every year"},{"pattern":"Logic: simplify/prove tautology","detail":"Use equivalence laws. Check if given expression is tautology by truth table or algebraic manipulation.","years":"2015, 2017, 2018, 2020, 2022"},{"pattern":"Counting: arrangements with constraints","detail":"Derangements, circular permutations, inclusion-exclusion, Catalan numbers for bracket/BST problems.","years":"2016, 2018, 2019, 2021"},{"pattern":"Relations: classify and find closures","detail":"Given relation matrix, determine type (reflexive/symmetric/transitive). Find transitive closure using Warshall's algorithm.","years":"2014, 2017, 2020, 2023"}],"mnemonics":[{"label":"PASTE for relation types","text":"Partial order: Antisymmetric + Transitive + reflexive. Equivalence: Symmetric + Transitive + reflexive. Both share reflexive and transitive.","for":"Relation type properties"},{"label":"Eulerian vs Hamiltonian","text":"Euler = Edges (E for Edges). Hamilton = sHare vertices (Hamiltonian visits each Vertex). Euler is polynomial; Hamilton is NP.","for":"Remembering which problem is which"}]},"dl":{"formulas":[{"name":"K-map SOP group size","formula":"Only powers of 2: 1,2,4,8,16","note":"Larger group = fewer literals in term. Cover all 1s; don't care can be 0 or 1."},{"name":"2's complement range","formula":"−2^(n−1) to 2^(n−1)−1","note":"8-bit: −128 to 127. One extra negative than positive."},{"name":"Minterm/Maxterm","formula":"f = Σm(minterms) = ΠM(maxterms)","note":"Minterm: AND product where 0→complemented. Maxterm: OR sum where 1→complemented."},{"name":"Full Adder","formula":"Sum=A⊕B⊕Cin, Cout=AB+Cin(A⊕B)","note":"Built from 2 half adders + 1 OR gate."},{"name":"JK FF equation","formula":"Q(t+1) = JQ' + K'Q","note":"J=K=1: toggle. J=0,K=1: reset. J=1,K=0: set."},{"name":"D FF equation","formula":"Q(t+1) = D","note":"Simplest — no forbidden state. Used in registers."},{"name":"Ripple counter modulus","formula":"Mod = 2ⁿ for n flip-flops","note":"Max count = 2ⁿ−1. Divide frequency by 2ⁿ at MSB output."},{"name":"Overflow detection (2's complement)","formula":"Overflow = Cᵢₙ(MSB) ⊕ Cₒᵤₜ(MSB)","note":"XOR of carries into and out of sign bit. Also: two positives→negative, or two negatives→positive."},{"name":"XOR properties","formula":"A⊕0=A, A⊕A=0, A⊕1=A'","note":"Commutativity and associativity hold. A⊕B=B⊕A."}],"concepts":[{"title":"Universal gates: NAND and NOR","body":"Any logic function can be built using ONLY NAND gates or ONLY NOR gates. NOT from NAND: A NAND A. AND from NAND: (A NAND B) NAND (A NAND B). OR from NAND: (A NAND A) NAND (B NAND B)."},{"title":"K-map minimization rules","body":"Group size must be power of 2. Groups must be rectangular. Can wrap around edges (toroidal). Don't care (×) can be included in any group. Aim for fewest, largest groups. Each Essential PI must be included."},{"title":"Combinational vs Sequential circuits","body":"Combinational: output depends only on current inputs. No memory. Sequential: output depends on current inputs AND past state. Has memory elements (flip-flops/latches). Mealy: output depends on state+input. Moore: output depends only on state."},{"title":"SR vs JK vs D vs T flip-flops","body":"SR: forbidden state S=R=1. JK: eliminates forbidden by toggling on J=K=1. D: simplest, Q=D on clock edge. T: toggles on T=1. T built from JK with J=K=T. D built from JK with K=J'."},{"title":"Number system conversions","body":"Binary↔Hex: group 4 bits. Binary↔Octal: group 3 bits. Any base to decimal: positional weights. Decimal to any base: repeated division by target base, read remainders upward."}],"traps":[{"title":"SOP ≠ Minimal form always","text":"SOP from minterms is canonical (standard) form but NOT necessarily minimal. K-map gives minimal SOP. Sum of ALL minterms = canonical SOP."},{"title":"BCD 1010–1111 are invalid","text":"BCD uses only 0000–1001 (0–9). If sum > 9, add 0110 (6) to correct. Watch for BCD addition in GATE numerical questions."},{"title":"Ripple counter propagation delay","text":"Total delay = n × flip-flop delay (cascaded). Synchronous counter: all FFs triggered simultaneously — delay = 1 FF delay regardless of n. This is the key trade-off."},{"title":"MUX as universal logic","text":"A 2ⁿ:1 MUX with n select lines can implement ANY n-variable function directly. A 2ⁿ:1 MUX with (n−1) select lines + data inputs as variables can implement any n-variable function."},{"title":"Prime implicant vs essential","text":"Not all prime implicants appear in the minimal cover. ONLY essential PIs (covering minterms covered by exactly one PI) are mandatory. Others chosen to cover remaining minterms with fewest groups."}],"pyqPatterns":[{"pattern":"K-map minimization","detail":"Find minimal SOP/POS with don't cares. Identify EPIs and cover all minterms.","years":"Every year"},{"pattern":"Flip-flop conversion","detail":"Given one type of FF, design using another type. Write excitation table, use K-map to find input equations.","years":"2015, 2017, 2018, 2020"},{"pattern":"Counter design","detail":"Design modulo-N counter using flip-flops. BCD counter, Gray code counter.","years":"2016, 2018, 2021"},{"pattern":"2's complement arithmetic","detail":"Addition/subtraction in 2's complement, detect overflow.","years":"Every year in some form"}],"mnemonics":[{"label":"JK toggle: Jack=King, both high = toggle","text":"J=K=1: Queen takes King (toggle). J=1, K=0: Jack wins (Set=1). J=0, K=1: King wins (Reset=0).","for":"JK flip-flop states"},{"label":"ILATE for K-map groups","text":"In Largest All Touching Ends — groups must be valid (power-of-2, rectangular, can wrap). Largest valid group = most simplification.","for":"K-map grouping reminder"}]},"coa":{"formulas":[{"name":"Pipeline speedup","formula":"Speedup = k·n/(k+n−1)","note":"k=stages, n=instructions. As n→∞, speedup→k."},{"name":"CPI with stalls","formula":"CPI_actual = CPI_ideal + stall_cycles/instruction","note":"Throughput = 1/CPI."},{"name":"Cache EAT","formula":"h·Tc + (1−h)·Tm","note":"h=hit ratio. Simultaneous lookup model. AMAT = Hit time + Miss rate × Miss penalty."},{"name":"AMAT","formula":"L1 hit time + L1 miss rate × (L2 hit time + L2 miss rate × L3 time)","note":"Hierarchical AMAT for multi-level cache."},{"name":"TLB EAT","formula":"α(TLB+Tm) + (1−α)(TLB+2Tm)","note":"α=TLB hit ratio. With page table in memory adding 1 extra access."},{"name":"Cache address division","formula":"Address = [Tag | Set index | Block offset]","note":"Block offset = log₂(block size). Set index = log₂(number of sets)."},{"name":"Cache size","formula":"Cache size = (sets) × (ways) × (block size)","note":"Number of sets = cache_size / (ways × block_size)."},{"name":"Matrix multiply operations","formula":"C[m×p] = A[m×n] × B[n×p]: m·n·p multiplications","note":"And m(n−1)p additions."}],"concepts":[{"title":"Addressing modes summary","body":"Immediate: value in instruction. Direct: EA=address. Indirect: EA=M[address] (extra memory access). Register: EA=register (fastest). Register indirect: EA=M[register]. Indexed: EA=base+index. Auto-increment/decrement for arrays."},{"title":"Pipeline hazards and solutions","body":"Structural: resource conflict → stall or add hardware. Data (RAW): produce before consume → forwarding/stall. Data (WAW/WAR): eliminated by register renaming. Control: branch → prediction, delay slots, flush on misprediction."},{"title":"Cache organization comparison","body":"Direct mapped: fast, high conflict misses. Fully associative: no conflict misses, complex/expensive. Set-associative: balance. Higher associativity → fewer conflict misses but larger tags and slower."},{"title":"Write policies","body":"Write-through: write cache AND memory simultaneously. Always consistent but slow (every write goes to memory). Write-back: write only cache, write to memory on eviction (dirty bit). Faster but risk of inconsistency. Write-allocate: on write miss, bring block to cache then write."},{"title":"Virtual memory paging","body":"Process address space divided into pages. Physical memory divided into frames. Page table maps page → frame. TLB = page table cache. On TLB miss: page table walk. On page fault: OS loads page from disk into free frame."}],"traps":[{"title":"Pipeline speedup: n must be large","text":"Ideal speedup = k (stages) is only for n→∞. For finite n: k·n/(k+n−1). With stall cycles: effective CPI increases, speedup decreases."},{"title":"Cache EAT: simultaneous vs sequential","text":"Simultaneous (parallel) lookup: EAT = h·Tc + (1−h)·Tm. Sequential: EAT = Tc + (1−h)·Tm. Many GATE problems specify which model — read carefully."},{"title":"TLB hit saves page table walk, NOT memory access","text":"TLB hit: 1 memory access (the actual data). TLB miss: 2+ accesses (page table in memory + data). The memory access for data ALWAYS happens."},{"title":"Belady's anomaly: only FIFO","text":"Adding more frames can INCREASE page faults for FIFO. LRU and Optimal are STACK algorithms — more frames → fewer or equal page faults."},{"title":"RISC: load-store architecture","text":"RISC only operates on registers — all memory access via explicit LOAD/STORE instructions. Cannot add memory operand directly. This forces more instructions but enables effective pipelining."}],"pyqPatterns":[{"pattern":"Cache hit rate and EAT calculation","detail":"Given cache time, memory time, hit ratio: compute EAT. Multi-level cache AMAT computation.","years":"Every year"},{"pattern":"Pipeline throughput and hazard analysis","detail":"Given pipeline stages and dependencies, identify stalls, compute CPI and total cycles.","years":"Every year"},{"pattern":"Virtual memory: page fault rate and EAT","detail":"TLB hit ratio, page fault rate, compute effective access time.","years":"2016, 2018, 2020, 2022"},{"pattern":"Cache address calculation","detail":"Given address, compute tag, set index, block offset for direct/set-associative cache.","years":"2015, 2017, 2019, 2021"}],"mnemonics":[{"label":"3C's of cache misses","text":"Cold (Compulsory) – first time. Capacity – working set too big. Conflict – two addresses map same line. Only Cold exists in fully associative.","for":"Cache miss types"},{"label":"RAW is the real problem","text":"Read After Write (True dependency) is the only data hazard that CANNOT be eliminated by reordering. WAW and WAR can be handled by renaming.","for":"Data hazard priority"}]},"pds":{"formulas":[{"name":"Array address (row-major)","formula":"A[i][j] = Base + (i·n + j)·size","note":"C uses row-major. FORTRAN uses column-major: Base+(j·m+i)·size."},{"name":"Full binary tree","formula":"Leaf nodes = internal nodes + 1","note":"If every internal node has exactly 2 children."},{"name":"Height of complete binary tree","formula":"⌊log₂n⌋","note":"Equivalently: ⌈log₂(n+1)⌉."},{"name":"Number of BSTs with n nodes","formula":"Catalan(n) = C(2n,n)/(n+1)","note":"1,1,2,5,14,42 for n=0,1,2,3,4,5."},{"name":"Minimum AVL nodes at height h","formula":"N(h) = N(h−1)+N(h−2)+1","note":"N(0)=1, N(1)=2. Max height for n nodes: 1.44·log₂n."},{"name":"Hash chaining average","formula":"O(1+α) where α=n/m","note":"α = load factor = keys/slots."},{"name":"Open addressing max load factor","formula":"α < 1 required","note":"Performance collapses as α→1."},{"name":"Heap height","formula":"⌊log₂n⌋ for n elements","note":"Build heap: O(n). Insert/delete: O(log n)."}],"concepts":[{"title":"C memory layout","body":"Code (text, read-only), Initialized data (global/static initialized, stored in binary), BSS (uninitialized global/static, zeroed at runtime), Heap (dynamic: malloc/free, grows up), Stack (local vars, function calls, grows down)."},{"title":"Pointer and array relationship","body":"a[i] = *(a+i) = *(i+a) = i[a] — all equivalent. Array name = pointer to first element. When passed to function: array decays to pointer, sizeof gives pointer size (not array size)."},{"title":"BST operations and properties","body":"Search/Insert/Delete: O(h) where h=height. Worst case (sorted input): h=n, O(n). Best case (balanced): h=log n. Inorder traversal of BST = sorted order. This is the key BST property."},{"title":"AVL tree rotations","body":"Balance factor = height(left)−height(right) ∈ {−1,0,+1}. LL imbalance: right rotation. RR: left rotation. LR: left then right rotation. RL: right then left rotation. All rotations are O(1)."},{"title":"Hashing collision resolution","body":"Chaining: linked list at each slot, O(1+α) average. Open addressing: probe sequence (linear/quadratic/double hashing). Linear probing: primary clustering. Quadratic: secondary clustering. Double hashing: best distribution, most complex."}],"traps":[{"title":"sizeof(arr) vs sizeof(ptr) in function","text":"Inside function where array is passed: parameter is a pointer. sizeof gives pointer size (4 or 8 bytes), NOT array size. Declare as sizeof in calling scope to get actual array size."},{"title":"BST worst case is O(n)","text":"Sorted input causes O(n) height BST (a right-leaning linked list). AVL guarantees O(log n). GATE often asks about WORST case — don't assume O(log n) for plain BST."},{"title":"Inorder+Preorder → unique tree, but Preorder+Postorder does NOT","text":"To reconstruct a binary tree uniquely, need inorder + (preorder OR postorder). Preorder+postorder is ambiguous for non-full binary trees."},{"title":"Build heap is O(n), NOT O(n log n)","text":"Most students assume O(n log n) since inserting n elements is O(n log n). Build heap (Floyd's algorithm, bottom-up heapify) is O(n). Used in heapsort's O(n log n)."},{"title":"Heap does NOT support O(log n) arbitrary element delete without knowing index","text":"Binary heap supports O(log n) extract-max (root). To delete arbitrary element: first need to find it O(n) unless index is known. With index: O(log n)."}],"pyqPatterns":[{"pattern":"BST insertion/deletion and height","detail":"Insert sequence of keys, find height, or count comparisons. Also: minimum/maximum nodes in AVL at given height.","years":"Every year"},{"pattern":"Pointer and C traps","detail":"sizeof, array decay, function pointer, pointer arithmetic, dangling pointers.","years":"2015, 2017, 2018, 2019, 2021"},{"pattern":"Hashing: collisions and load factor","detail":"Given hash function and keys, trace collision resolution. Compute average search time.","years":"2016, 2019, 2020, 2022"},{"pattern":"Stack/Queue applications","detail":"Infix to postfix, expression evaluation, BFS vs DFS data structure.","years":"Every year"}],"mnemonics":[{"label":"FBIHS for C storage","text":"Function calls → Stack. Big dynamic data → Heap. Initialized globals → Data. Uninitialized globals → BSS. Instructions → Text (code).","for":"C memory layout"},{"label":"AVL rotations: which side is heavy?","text":"LL: left child's left subtree heavy → rotate right. RR: right child's right → rotate left. LR: left child's right → left rotate child, then right rotate root. RL: mirror of LR.","for":"AVL rotation selection"}]},"algo":{"formulas":[{"name":"Master theorem case 1","formula":"T=O(nᶜ) if f(n)=O(n^(c−ε)), c=log_b(a)","note":"The recursive work dominates."},{"name":"Master theorem case 2","formula":"T=O(nᶜ log n) if f(n)=Θ(nᶜ)","note":"Equal work at each level. Most common in GATE."},{"name":"Master theorem case 3","formula":"T=O(f(n)) if f(n)=Ω(n^(c+ε)) + regularity","note":"Non-recursive work dominates."},{"name":"Dijkstra complexity","formula":"O((V+E)log V) with binary heap","note":"O(E+V log V) with Fibonacci heap. Does NOT work for negative weights."},{"name":"Bellman-Ford","formula":"O(VE)","note":"Works with negative weights. Detects negative cycles. V−1 iterations."},{"name":"Floyd-Warshall","formula":"O(V³) for all-pairs shortest paths","note":"Works with negative weights but NOT negative cycles."},{"name":"Prim's MST","formula":"O(E log V) with binary heap","note":"Vertex-based, good for dense. Kruskal: O(E log E), edge-based with union-find."},{"name":"0/1 Knapsack","formula":"dp[i][w]=max(dp[i−1][w], vᵢ+dp[i−1][w−wᵢ])","note":"O(nW) time and space. Pseudo-polynomial."},{"name":"LCS","formula":"dp[i][j]=dp[i−1][j−1]+1 if match, else max(dp[i−1][j],dp[i][j−1])","note":"O(mn) time. Length is dp[m][n]."},{"name":"Edit distance","formula":"dp[i][j]=min(dp[i−1][j]+1, dp[i][j−1]+1, dp[i−1][j−1]+[X[i]≠Y[j]])","note":"Operations: insert, delete, substitute."}],"concepts":[{"title":"Sorting algorithm comparison","body":"Merge sort: O(n log n) worst, stable, O(n) space. Quick sort: O(n log n) avg, O(n²) worst, unstable, in-place. Heap sort: O(n log n) worst, unstable, in-place. Counting/Radix: linear but requires integer keys. Lower bound for comparison sort: Ω(n log n)."},{"title":"Greedy vs DP","body":"Greedy: make locally optimal choice at each step, never reconsider. Works when greedy choice property holds. DP: solve subproblems, store results, combine. Both require optimal substructure. Greedy is O(fast), DP uses more space."},{"title":"Graph traversal: BFS vs DFS","body":"BFS: queue, O(V+E), finds shortest path in unweighted graphs, level-order. DFS: stack/recursion, O(V+E), finds cycles, topological sort, SCCs. BFS tree = shortest-path tree for unweighted."},{"title":"Dynamic programming: when to use","body":"Problems with: overlapping subproblems + optimal substructure. Top-down (memoization): recursion + cache. Bottom-up (tabulation): fill table iteratively. Always check if greedy works first (simpler)."},{"title":"NP-completeness","body":"P: decision problems solvable in polynomial time. NP: verifiable in polynomial time. NP-complete: hardest in NP (all NP reducible to it). NP-hard: at least as hard as NP-complete, not necessarily in NP. P=NP? — open question."}],"traps":[{"title":"Dijkstra: MUST have non-negative weights","text":"Single negative edge breaks Dijkstra. Use Bellman-Ford for negative weights. In GATE: if graph has negative weights → Bellman-Ford or Floyd-Warshall."},{"title":"Greedy doesn't work for 0/1 Knapsack","text":"Greedy by value/weight ratio works for FRACTIONAL knapsack only. 0/1 Knapsack requires DP. GATE tests this distinction frequently."},{"title":"Quick sort is NOT always O(n log n)","text":"Average O(n log n), Worst O(n²) for sorted/reverse-sorted input with first/last pivot. Randomized quicksort makes worst case extremely unlikely. Heap sort is O(n log n) in ALL cases."},{"title":"Kruskal needs edges sorted: O(E log E)","text":"Sorting edges is the bottleneck. With union-find (path compression + union by rank): union/find ≈ O(1) amortized. For dense graphs, Prim is better."},{"title":"Topological sort only for DAGs","text":"Topological sort requires NO cycles. If cycle exists, topological sort fails (Kahn's algorithm detects this: if remaining nodes exist, a cycle was detected)."}],"pyqPatterns":[{"pattern":"Recurrence solving with Master theorem","detail":"Identify a, b, f(n), compute c=log_b(a), determine case, state answer.","years":"Every year"},{"pattern":"Graph algorithm trace: Dijkstra/Prim/Kruskal","detail":"Apply algorithm step by step on given graph. Track visited nodes, distances, MST edges.","years":"Every year"},{"pattern":"DP: LCS, Knapsack, Edit distance","detail":"Fill DP table, find optimal value. Also: count of optimal solutions.","years":"Every year"},{"pattern":"Sorting: stability, worst case, comparisons","detail":"Which algorithm for given constraints? How many comparisons for given input?","years":"Every year"}],"mnemonics":[{"label":"Master theorem shortcut","text":"If f(n) = Θ(nᶜ log^k n) where c=log_b(a): Case 2 gives O(nᶜ log^(k+1) n). The common case in GATE.","for":"Master theorem case 2 with log factor"},{"label":"SSSP algorithm selection","text":"Non-negative weights → Dijkstra. Negative weights, no negative cycle → Bellman-Ford. All-pairs → Floyd-Warshall. DAG → relaxation in topological order O(V+E).","for":"Which shortest path algorithm to pick"}]},"toc":{"formulas":[{"name":"NFA to DFA state count","formula":"DFA states ≤ 2ⁿ (for NFA with n states)","note":"Subset construction. Can be exponential but often much less in practice."},{"name":"Pumping length for Regular","formula":"∀w∈L, |w|≥p → w=xyz, |xy|≤p, |y|≥1, ∀n≥0: xyⁿz∈L","note":"Used only to DISPROVE regularity by finding w that fails pumping."},{"name":"Pumping lemma for CFL","formula":"w=uvxyz, |vxy|≤p, |vy|≥1, ∀n≥0: uvⁿxyⁿz∈L","note":"Two segments pumped simultaneously."},{"name":"Chomsky hierarchy","formula":"Regular ⊂ DCFL ⊂ CFL ⊂ CSL ⊂ RE ⊂ All languages","note":"Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0."},{"name":"CYK complexity","formula":"O(n³|G|) for string of length n","note":"Requires grammar in Chomsky Normal Form. Dynamic programming."},{"name":"DFA minimization complexity","formula":"O(n² log n) table-filling algorithm","note":"Also called Myhill-Nerode / Hopcroft's algorithm."}],"concepts":[{"title":"Regular language closure properties","body":"Closed under: union, intersection, complement, concatenation, Kleene star, reversal, homomorphism, inverse homomorphism. Intersection of two regular languages is regular. Complement of regular language is regular."},{"title":"CFL closure properties","body":"Closed under: union, concatenation, Kleene star, reversal. NOT closed under: intersection, complement. However: CFL ∩ Regular = CFL (intersection with a regular language preserves CFL). Complement of CFL may not be CFL."},{"title":"Decidability summary","body":"Decidable (DFA/NFA/Regex): membership, emptiness, finiteness, equivalence. Decidable (CFG/PDA): membership (CYK), emptiness, finiteness. Undecidable: equivalence of two CFGs, ambiguity of CFG, intersection of two CFLs empty."},{"title":"Recursive vs RE languages","body":"Recursive (decidable): TM always halts (accept OR reject). Recursively enumerable: TM halts on accept, MAY LOOP on reject. Recursive ⊂ RE. Complement of recursive = recursive. Complement of RE may not be RE."},{"title":"Undecidability proofs","body":"Halting problem: undecidable (diagonalization). Rice's theorem: any non-trivial language property of TMs is undecidable. Post Correspondence Problem: undecidable. Reductions: if A reduces to B and A is undecidable → B is undecidable."}],"traps":[{"title":"Pumping lemma: can only DISPROVE regularity","text":"Passing the pumping lemma does NOT prove a language is regular. It is a necessary condition, not sufficient. To prove regular: construct DFA/NFA/regex directly."},{"title":"DFA and NFA: same power but different sizes","text":"Same computational power (both recognize exactly regular languages). NFA can have exponentially more compact representation. Conversion adds states (subset construction)."},{"title":"CFL ∩ CFL is NOT necessarily CFL","text":"CFL is NOT closed under intersection. Example: {aⁿbⁿcᵐ} ∩ {aᵐbⁿcⁿ} = {aⁿbⁿcⁿ} which is not CFL. BUT: CFL ∩ Regular = CFL."},{"title":"DCFL ≠ CFL (proper subset)","text":"Deterministic PDAs accept DCFLs — a proper subset of CFLs. aⁿbⁿcⁿ is not even CFL. {ww | w∈Σ*} is CFL but not DCFL. DCFLs are closed under complement."},{"title":"Turing Machine variants: same power","text":"Multi-tape TM, non-deterministic TM, 2-way infinite tape TM — all equivalent in power to standard single-tape TM. Non-determinism doesn't add power for TMs (unlike FAs where NFA=DFA)."}],"pyqPatterns":[{"pattern":"Identify language class (regular/CFL/decidable)","detail":"Given language description or grammar, determine highest class it belongs to. Apply pumping lemma to eliminate possibilities.","years":"Every year — 3–5 marks"},{"pattern":"NFA/DFA construction and minimization","detail":"Build NFA from regex, convert to DFA, minimize. Or trace DFA execution on string.","years":"Every year"},{"pattern":"CFG and PDA questions","detail":"Write CFG for given language. Convert CFG to CNF. Design PDA. Apply CYK for membership.","years":"2015, 2017, 2018, 2020, 2022"},{"pattern":"Decidability classification","detail":"Is given problem decidable/undecidable? Apply Rice's theorem for TM language properties.","years":"2016, 2018, 2019, 2021"}],"mnemonics":[{"label":"4-class automata","text":"Regular → DFA. Context-Free → PDA. Context-Sensitive → LBA (Linear Bounded Automaton). Recursively Enumerable → TM. Each class adds power.","for":"Chomsky hierarchy automata mapping"},{"label":"CFL NOT closed under ICCC","text":"CFL is NOT closed under Intersection, Complement, and Complemented Complement (but is closed under Concatenation, Closure, and Union). Remember: NOT closed under I and C.","for":"CFL closure property negatives"}]},"cd":{"formulas":[{"name":"FIRST set computation","formula":"FIRST(α) = terminals starting strings derived from α","note":"If α→ε, include ε in FIRST. Used for LL(1) table construction."},{"name":"FOLLOW set computation","formula":"FOLLOW(A) = terminals that can follow A in sentential form","note":"$ always in FOLLOW(start symbol). Used when FIRST contains ε."},{"name":"LL(1) table entry","formula":"Add A→α to M[A,a] for each a∈FIRST(α)","note":"If ε∈FIRST(α): add to M[A,b] for each b∈FOLLOW(A)."},{"name":"LL(1) conflict: when ambiguous","formula":"M[A,a] has >1 entry → not LL(1)","note":"Fix: eliminate left recursion, left-factor."},{"name":"Left recursion elimination","formula":"A→Aα|β becomes A→βA', A'→αA'|ε","note":"Required for top-down parsing."},{"name":"Left factoring","formula":"A→αβ|αγ becomes A→αA', A'→β|γ","note":"Required for predictive parsing."}],"concepts":[{"title":"Compiler phases and their outputs","body":"Lexical → tokens. Syntax (parsing) → parse tree/AST. Semantic → annotated AST with type info. Intermediate code gen → 3-address code/TAC. Code optimization → optimized IR. Code generation → target assembly/machine code. Symbol table maintained throughout."},{"title":"Bottom-up parsing: LR family","body":"LR(0) ⊂ SLR(1) ⊂ LALR(1) ⊂ LR(1) — each set strictly contains the previous. LR(k) uses k lookahead symbols. LALR(1) is most commonly implemented (yacc/bison). Conflicts: shift-reduce or reduce-reduce in parsing table."},{"title":"Syntax-Directed Translation","body":"S-attributed SDD: only synthesized attributes (computed bottom-up in LR parsing). L-attributed: inherited attributes too, evaluated left-to-right (for LL parsing). Attribute grammar annotates each production with semantic rules."},{"title":"Intermediate representations","body":"3-address code (TAC): x=y op z, assignments, jumps. DAG: detects common subexpressions. SSA: single static assignment for data flow analysis. Quadruples: (op, arg1, arg2, result). Triples: (op, arg1, arg2) with implicit result position."},{"title":"Optimization techniques","body":"Local (peephole): redundant instructions, algebraic simplifications. Global: common subexpression elimination, dead code elimination, constant propagation/folding. Loop: code motion (loop invariant), induction variable elimination, unrolling. These don't change semantics."}],"traps":[{"title":"Parser power ordering","text":"LR(1) is strictly more powerful than LALR(1) > SLR(1) > LR(0) > LL(1). LL(1) is LEAST powerful — fewer grammars. GATE often asks which parser can handle a given grammar."},{"title":"Ambiguous grammar ≠ ambiguous language","text":"A grammar can be ambiguous even if the language has an unambiguous grammar. Inherently ambiguous = every grammar for the language is ambiguous."},{"title":"Constant folding vs propagation","text":"Folding: evaluate at compile time (2+3=5). Propagation: replace variable known to be constant with its value. Both separate optimizations, often applied together."},{"title":"Dead code ≠ unreachable code","text":"Unreachable code: code that can never execute (after unconditional goto). Dead code: code that executes but result is never used. Both should be eliminated but are detected differently."},{"title":"Shift-reduce conflict resolution","text":"By default, yacc/bison resolves shift-reduce conflict by choosing SHIFT. Reduce-reduce: choose the FIRST (topmost) production. These are defaults — not always correct."}],"pyqPatterns":[{"pattern":"FIRST and FOLLOW computation","detail":"Given grammar, compute FIRST and FOLLOW sets. Then build LL(1) table or check if grammar is LL(1).","years":"Every year"},{"pattern":"LR parsing: items, states, table","detail":"Construct LR(0) or SLR(1) items, build automaton, identify conflicts.","years":"2015, 2017, 2018, 2020"},{"pattern":"Syntax-directed definitions","detail":"Given grammar with SDD, compute attribute values for a given parse tree.","years":"2016, 2018, 2019, 2021"},{"pattern":"Optimization identification","detail":"Identify which optimization applies to given code fragment (dead code, common subexpression, loop invariant).","years":"2014, 2016, 2019, 2022"}],"mnemonics":[{"label":"SLL acronym for parser power","text":"LL < LR (in power). Within LR: SLR < LALR < LR(1). All LR variants are bottom-up; LL is top-down.","for":"Parser hierarchy"},{"label":"FIRST and FOLLOW mnemonic","text":"FIRST: what CAN COME from this non-terminal. FOLLOW: what CAN COME AFTER this non-terminal in any derivation.","for":"FIRST/FOLLOW distinction"}]},"os":{"formulas":[{"name":"Turnaround time","formula":"TAT = Completion time − Arrival time","note":"Waiting time = TAT − Burst time. Response time = First scheduled − Arrival."},{"name":"CPU utilization with I/O","formula":"CPU util = 1 − pⁿ","note":"p = fraction of time process waits for I/O. n = degree of multiprogramming."},{"name":"Effective access time with page faults","formula":"EAT = (1−p)·Tm + p·(page fault time)","note":"p = page fault rate (very small, e.g., 10⁻⁶)."},{"name":"Banker's algorithm: need matrix","formula":"Need[i][j] = Max[i][j] − Allocation[i][j]","note":"Request granted only if need ≤ available AND resulting state is safe."},{"name":"Semaphore wait/signal","formula":"wait(S): S--; if S<0: block. signal(S): S++; if S≤0: wake one","note":"Binary semaphore = mutex (S∈{0,1})."},{"name":"Monitor: implicit mutual exclusion","formula":"Only one process active in monitor at a time","note":"Condition variables: wait() releases monitor, signal() wakes one waiter."},{"name":"Disk seek time","formula":"Total = Seek + Rotational latency + Transfer time","note":"SSTF minimizes seek. SCAN/C-SCAN: arm sweeps like elevator."}],"concepts":[{"title":"Scheduling algorithm comparison","body":"FCFS: no preemption, convoy effect, fair. SJF: optimal avg wait (non-preemptive), SRTF optimal overall. RR: fair, good response time, quantum matters. Priority: starvation risk (fix with aging). MLFQ: adaptive, processes move queues based on behavior."},{"title":"Critical section problem","body":"3 requirements: Mutual exclusion (only one in CS), Progress (no deadlock — decision made in finite time), Bounded waiting (no starvation — limit on wait). Peterson's algorithm satisfies all 3 for 2 processes. Hardware TSL satisfies mutual exclusion (spin-lock)."},{"title":"Deadlock conditions and handling","body":"4 Coffman conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Prevention: eliminate one condition. Avoidance: Banker's algorithm (check safe state). Detection: resource allocation graph / wait-for graph. Recovery: abort or preempt a process."},{"title":"Memory allocation strategies","body":"First-fit: allocate first hole that's big enough. Best-fit: smallest hole that fits (more external fragmentation over time). Worst-fit: largest hole (leaves large fragments). First-fit and best-fit better than worst-fit in practice."},{"title":"Page replacement policies","body":"Optimal (Belady's): replace furthest future use — best but theoretical. LRU: replace least recently used — stack algorithm, no Belady's anomaly. FIFO: replace oldest — Belady's anomaly possible. Clock: approximates LRU using reference bits. LFU: replace least frequently used."}],"traps":[{"title":"SJF requires knowing burst time in advance","text":"SJF is optimal but impractical without perfect knowledge. In reality: estimate using exponential averaging of past bursts. SRTF is preemptive SJF — preempts current process if new process has shorter remaining time."},{"title":"Semaphore value can be negative","text":"When S < 0, |S| = number of blocked processes. Binary semaphore (mutex): S ∈ {0, 1}. Counting semaphore: S ∈ any integer. Wait decrements, Signal increments."},{"title":"Deadlock detection ≠ prevention","text":"Detection allows deadlock to occur, then recovers. Prevention/avoidance prevents it from occurring. Avoidance (Banker's) requires advance knowledge of max resource needs."},{"title":"Zombie vs orphan process confusion","text":"Zombie: child finished, parent hasn't called wait() — PCB entry persists. Orphan: parent died, child adopted by init. Both are distinct situations with different resolutions."},{"title":"Belady's anomaly: ONLY in FIFO","text":"Only FIFO replacement can suffer Belady's anomaly (more frames → more faults). LRU, Optimal, and clock algorithms are 'stack algorithms' — immune to Belady's anomaly."}],"pyqPatterns":[{"pattern":"CPU scheduling: compute TAT, waiting time, average","detail":"Apply given algorithm (FCFS/SJF/RR/Priority) to process list, compute times. Gantt chart helps.","years":"Every year — usually 2 marks"},{"pattern":"Deadlock: Banker's algorithm","detail":"Given allocation, max, available: find safe sequence. Or determine if request can be granted.","years":"Every year"},{"pattern":"Page replacement trace","detail":"Given reference string and number of frames, trace LRU/FIFO/Optimal, count page faults.","years":"Every year"},{"pattern":"Synchronization: producer-consumer, readers-writers","detail":"Fill in semaphore operations. Identify race condition or deadlock potential.","years":"2015, 2017, 2018, 2020, 2022"}],"mnemonics":[{"label":"4 Coffman conditions: MHNC","text":"Mutual exclusion, Hold-and-wait, No preemption, Circular wait. ALL 4 must hold for deadlock. Prevent by negating any one.","for":"Deadlock conditions"},{"label":"SRTF = preemptive SJF","text":"Shortest Remaining Time First is SJF but preemptive. Optimal for average waiting time. Requires continuous monitoring of remaining time.","for":"SJF variant distinction"}]},"dbms":{"formulas":[{"name":"Armstrong's axioms","formula":"Reflexivity: Y⊆X→X→Y. Augmentation: X→Y→XZ→YZ. Transitivity: X→Y,Y→Z→X→Z","note":"Sound and complete for functional dependency derivation."},{"name":"Lossless join condition","formula":"(R₁∩R₂)→R₁ OR (R₁∩R₂)→R₂","note":"Common attributes must be a superkey in at least one relation."},{"name":"Candidate key finding","formula":"X is superkey iff X⁺ = all attributes","note":"Minimal superkey = candidate key."},{"name":"Relational algebra cardinality","formula":"|R⋈S| ≤ |R|×|S|, |σ(R)| ≤ |R|","note":"Natural join reduces or equals Cartesian product cardinality."},{"name":"Serializability: conflict equivalence","formula":"Schedule S is conflict serializable iff its precedence graph has no cycle","note":"Build directed graph: add edge Tᵢ→Tⱼ if Tᵢ's operation conflicts with Tⱼ's later operation."},{"name":"B+ tree order p","formula":"Internal node: at most p pointers, p−1 keys","note":"Search: O(log_p n). Used for range queries unlike B-tree."},{"name":"Normalization forms","formula":"1NF: atomic. 2NF: +no partial FD. 3NF: +no transitive FD. BCNF: every FD, LHS is superkey","note":"BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF (stricter as number increases)."}],"concepts":[{"title":"Relational algebra operators","body":"Basic: σ (select rows), π (project columns), × (Cartesian product), ∪ (union), − (set difference), ρ (rename). Derived: ⋈ (natural join = × then σ then π), ∩ (intersection = − twice), ÷ (division). Extended: left/right/full outer join."},{"title":"Normalization step-by-step","body":"1NF: remove repeating groups, atomic values. 2NF: remove partial FDs (non-key attribute depends on part of composite key). 3NF: remove transitive FDs (A→B→C where B is not a key). BCNF: every determinant is a superkey — may lose dependency preservation."},{"title":"ACID properties and 2PL","body":"Atomicity: all or nothing (undo log). Consistency: DB invariants maintained. Isolation: concurrent = serial (via locking). Durability: committed = persistent (redo log). 2PL guarantees conflict serializability. Strict 2PL prevents cascading rollback."},{"title":"Indexing strategies","body":"Clustered index: physical order of records matches index order (one per table). Non-clustered: separate index structure. Dense: entry per record. Sparse: entry per block (sorted data only). B+ tree: best for range queries. Hashing: best for exact match."},{"title":"SQL joins and NULLs","body":"INNER JOIN: only matching rows. LEFT OUTER: all left rows (NULL for unmatched right). FULL OUTER: all rows from both. NULL != NULL in SQL — use IS NULL. Aggregates ignore NULLs. GROUP BY then HAVING for group-level filtering."}],"traps":[{"title":"BCNF may not preserve all dependencies","text":"BCNF guarantees no redundancy but may lose some FDs (can't enforce them in single relation). 3NF always has a lossless, dependency-preserving decomposition. This is the BCNF vs 3NF trade-off."},{"title":"Lossless join ≠ dependency preserving","text":"Two separate properties. BCNF decomposition is always lossless but may not preserve dependencies. Always check both properties separately."},{"title":"Natural join vs equi-join","text":"Natural join removes duplicate columns (joins on ALL common attributes). Equi-join keeps both copies of join columns. GATE questions often test this distinction."},{"title":"Conflict serializability is stricter than view serializability","text":"Every conflict serializable schedule is view serializable, but not vice versa. GATE mostly asks about conflict serializability using precedence graphs."},{"title":"B-tree vs B+ tree: where data lives","text":"B-tree: data in ALL nodes (internal + leaf). B+ tree: data ONLY in leaves, internal nodes store only keys. B+ tree leaves are linked for range scans — more efficient for queries."}],"pyqPatterns":[{"pattern":"Normalization: identify NF and decompose","detail":"Given relation and FDs, find candidate keys, determine highest NF, decompose to BCNF/3NF.","years":"Every year — 3–5 marks"},{"pattern":"Conflict serializability: precedence graph","detail":"Given schedule, build precedence graph, check for cycle, state if serializable and equivalent serial order.","years":"Every year"},{"pattern":"SQL query writing/tracing","detail":"Write SQL for given description, or trace output of given query (especially with NULLs, GROUP BY, subqueries).","years":"Every year"},{"pattern":"Relational algebra expression","detail":"Convert SQL to relational algebra or evaluate RA expression on given tables.","years":"2015, 2017, 2018, 2020, 2022"}],"mnemonics":[{"label":"1234 NF chain","text":"1NF=Atomic. 2NF=No Partial. 3NF=No Transitive. BCNF=Every Determinant is Superkey. Each removes a specific type of redundancy.","for":"Normalization form progression"},{"label":"2PL phases","text":"Growing phase: acquire locks. Shrinking phase: release locks. Once you release ONE lock, you can NEVER acquire another. Strict 2PL: hold ALL locks until commit.","for":"2-Phase Locking phases"}]},"cn":{"formulas":[{"name":"Hamming distance for error correction","formula":"Detect d errors: min dist = d+1. Correct d errors: min dist = 2d+1","note":"Hamming code: min dist = 3, corrects 1 bit, detects 2."},{"name":"Stop-and-Wait efficiency","formula":"η = 1/(1+2a), a = Tp/Tt","note":"Tp=propagation delay, Tt=transmission time. a>>1 means very inefficient."},{"name":"GBN window","formula":"Sender window = 2ᵏ−1 (max), Receiver window = 1","note":"k = number of sequence number bits."},{"name":"SR window","formula":"Sender = Receiver window = 2^(k−1)","note":"Both windows must not exceed half the sequence space."},{"name":"ALOHA efficiency","formula":"Pure: 1/(2e) ≈ 18.4%. Slotted: 1/e ≈ 36.8%","note":"Slotted doubles throughput by synchronizing transmissions."},{"name":"CSMA/CD minimum frame size","formula":"Lmin = 2·Tp·Bandwidth","note":"Ensures sender still transmitting when collision detected."},{"name":"Subnetting","formula":"Subnets = 2ⁿ, Hosts/subnet = 2^h−2","note":"n = borrowed bits. h = remaining host bits. −2 for network and broadcast."},{"name":"TCP throughput (simplified)","formula":"Throughput ≈ W·MSS / RTT","note":"W = window size in segments."},{"name":"DNS TTL","formula":"Cached for TTL seconds","note":"After TTL expires, resolver must requery. Reduces DNS traffic."}],"concepts":[{"title":"OSI vs TCP/IP layers","body":"OSI: Physical, Data Link, Network, Transport, Session, Presentation, Application (7 layers). TCP/IP: Network Access (1+2), Internet (3), Transport (4), Application (5+6+7). GATE uses both — TCP/IP mostly for protocol questions."},{"title":"Data Link protocols: GBN vs SR","body":"Go-Back-N: sender window up to 2ᵏ−1, receiver window=1. On error: retransmit all from error. Selective Repeat: both windows 2^(k−1). On error: retransmit only the errored frame. SR more efficient, more complex (receiver buffering required)."},{"title":"IP addressing and subnetting","body":"IPv4: 32 bits, dotted decimal. Classes A/B/C: first octet 1−126, 128−191, 192−223. CIDR: /n means n network bits. Block size = 2^(32−n). Subnet: divide one class by borrowing host bits. VLSM: variable-length subnets."},{"title":"TCP congestion control","body":"Slow start: cwnd doubles per RTT (exponential). Congestion avoidance: cwnd increases by 1 MSS per RTT (linear). On triple dup ACK: ssthresh=cwnd/2, cwnd=ssthresh (fast recovery). On timeout: ssthresh=cwnd/2, cwnd=1 MSS (slow start restart)."},{"title":"Application layer protocols summary","body":"HTTP: 80 (stateless, persistent in 1.1). HTTPS: 443. FTP: 21/20 (control/data). SMTP: 25 (push mail). POP3: 110 (pull, delete). IMAP: 143 (pull, keep on server). DNS: 53 UDP (TCP for zone transfer). DHCP: 67/68. SSH: 22. Telnet: 23."}],"traps":[{"title":"GBN sender window: 2ᵏ−1, NOT 2ᵏ","text":"Sequence numbers for GBN: 2ᵏ−1 max window. If window = 2ᵏ, receiver cannot distinguish new frames from retransmissions. SR window is half: 2^(k−1)."},{"title":"SMTP is push, POP3/IMAP is pull","text":"SMTP pushes mail from sender to recipient's mail server. POP3/IMAP is how recipient retrieves mail FROM their server. They are complementary — SMTP doesn't do retrieval."},{"title":"TCP 3-way handshake sequence numbers","text":"SYN consumes one sequence number. SYN-ACK consumes one. ACK doesn't consume a sequence number. Data transmission starts after handshake."},{"title":"NAT breaks end-to-end principle","text":"NAT remaps ports/addresses. Peer-to-peer, voice/video, and applications expecting incoming connections have problems with NAT. IPv6 aims to make NAT unnecessary."},{"title":"Distance vector: count-to-infinity problem","text":"In distance vector routing (RIP), bad news propagates slowly. Split horizon and poison reverse are partial fixes. Link-state (OSPF) doesn't have this problem because it has full topology info."}],"pyqPatterns":[{"pattern":"Sliding window: frames in flight, efficiency","detail":"Compute window size, efficiency, throughput for GBN or SR given bandwidth, propagation delay.","years":"Every year"},{"pattern":"IP addressing and subnetting","detail":"Given IP and mask or CIDR: find network address, broadcast, host range. Or design subnets for given requirements.","years":"Every year"},{"pattern":"TCP connection and congestion control","detail":"Trace cwnd evolution over RTTs with loss events. Compute throughput.","years":"2016, 2018, 2019, 2021"},{"pattern":"Error detection/correction","detail":"CRC computation, Hamming code: detect/correct bits given min Hamming distance.","years":"2015, 2017, 2019, 2022"}],"mnemonics":[{"label":"GBN vs SR window rule","text":"GBN: Sender window = 2ᵏ−1 (Greedy, But Needs to leave one). SR: each side gets exactly half = 2^(k−1).","for":"Window size formulas"},{"label":"TCP slow start is fast","text":"'Slow start' refers to the conservative initial cwnd=1 MSS, but cwnd DOUBLES each RTT — exponential growth. It's 'slow' only at the start compared to later steady-state.","for":"TCP slow start naming paradox"}]}};
