// ═══════════════════════════════════════════════════════════════
// GATE PYQ Intelligence Engine v2
// Built from: 12 GATE CS papers (2012, 2013, 2014, 2015, 2016, 2017, 2018, 2020, 2022, 2023, 2024, 2025)
// Unique concepts tracked: 70  |  Concept pairs: 40
// ═══════════════════════════════════════════════════════════════

const PYQ_META = {
  "generated": "2026-03-08",
  "papers": 12,
  "years": [
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2020,
    2022,
    2023,
    2024,
    2025
  ],
  "concepts": 70
};

const PYQ_DB = {};

const PYQ_INTELLIGENCE = {
  concept_frequency: {
  "virtual_memory": 11,
  "pipeline": 11,
  "page_replacement": 10,
  "normalization": 10,
  "cfl": 10,
  "scheduling": 10,
  "cache": 9,
  "synchronization": 8,
  "process": 8,
  "trees_bst": 8,
  "parsing": 7,
  "graph_theory": 7,
  "eigenvalues": 7,
  "propositional_logic": 7,
  "deadlock": 7,
  "turing_machines": 7,
  "disk_scheduling": 6,
  "graph_traversal": 6,
  "np_completeness": 6,
  "transactions": 6,
  "lexical_analysis": 6,
  "mst": 6,
  "ieee754": 6,
  "number_systems": 6,
  "sql_aggregation": 5,
  "sdts": 5,
  "multiplexer_logic": 5,
  "tcp_flow": 5,
  "chomsky_hierarchy": 5,
  "interrupts": 4,
  "basic_block": 4,
  "counting": 4,
  "ip_subnetting": 4,
  "hashing": 4,
  "dfa_nfa": 4,
  "sequential_circuits": 4,
  "dijkstra": 4,
  "relational_algebra": 4,
  "planar_graph": 4,
  "routing": 4,
  "regular_languages": 4,
  "er_model": 3,
  "systems_of_equations": 3,
  "liveness": 3,
  "file_systems": 3,
  "register_allocation": 3,
  "kmap": 3,
  "maxima_minima": 3,
  "sorting": 3,
  "bellman_ford": 3,
  "counters": 3,
  "relations": 3,
  "heaps": 2,
  "threads": 2,
  "sliding_window": 2,
  "matrix_chain": 2,
  "locks": 2,
  "sql_joins": 2,
  "memory_allocation": 1,
  "inode": 1,
  "distributions": 1,
  "lcs": 1,
  "closure_fd": 1,
  "dp": 1,
  "floyd_warshall": 1,
  "csma_cd": 1,
  "greedy": 1,
  "eulerian_hamiltonian": 1,
  "indexing": 1,
  "booth": 1
},

  concept_trends: {
  "virtual_memory": [
    2012,
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "pipeline": [
    2012,
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "cache": [
    2012,
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "scheduling": [
    2012,
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "page_replacement": [
    2012,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "normalization": [
    2012,
    2013,
    2014,
    2016,
    2018,
    2022,
    2024,
    2025
  ],
  "cfl": [
    2012,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024,
    2025
  ],
  "synchronization": [
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2024
  ],
  "eigenvalues": [
    2012,
    2014,
    2016,
    2018,
    2023,
    2024,
    2025
  ],
  "trees_bst": [
    2012,
    2013,
    2014,
    2016,
    2022,
    2024,
    2025
  ],
  "deadlock": [
    2013,
    2014,
    2016,
    2018,
    2022,
    2024,
    2025
  ],
  "turing_machines": [
    2013,
    2014,
    2016,
    2018,
    2022,
    2023,
    2025
  ],
  "process": [
    2012,
    2014,
    2022,
    2023,
    2024,
    2025
  ],
  "graph_traversal": [
    2014,
    2016,
    2018,
    2023,
    2024,
    2025
  ],
  "np_completeness": [
    2012,
    2013,
    2014,
    2022,
    2024,
    2025
  ],
  "parsing": [
    2012,
    2013,
    2014,
    2022,
    2024,
    2025
  ],
  "lexical_analysis": [
    2013,
    2016,
    2022,
    2023,
    2024,
    2025
  ],
  "graph_theory": [
    2013,
    2014,
    2018,
    2022,
    2023,
    2024
  ],
  "propositional_logic": [
    2013,
    2014,
    2016,
    2018,
    2023,
    2025
  ],
  "ieee754": [
    2012,
    2014,
    2022,
    2023,
    2024,
    2025
  ],
  "number_systems": [
    2014,
    2016,
    2022,
    2023,
    2024,
    2025
  ],
  "disk_scheduling": [
    2013,
    2014,
    2016,
    2018,
    2024
  ],
  "transactions": [
    2012,
    2014,
    2016,
    2024,
    2025
  ],
  "sql_aggregation": [
    2012,
    2014,
    2016,
    2024,
    2025
  ],
  "multiplexer_logic": [
    2013,
    2016,
    2022,
    2023,
    2024
  ],
  "mst": [
    2012,
    2014,
    2016,
    2022,
    2025
  ],
  "tcp_flow": [
    2012,
    2014,
    2018,
    2023,
    2024
  ],
  "chomsky_hierarchy": [
    2014,
    2016,
    2018,
    2022,
    2023
  ],
  "sdts": [
    2016,
    2023,
    2024,
    2025
  ],
  "basic_block": [
    2014,
    2023,
    2024,
    2025
  ],
  "counting": [
    2014,
    2018,
    2023,
    2024
  ],
  "ip_subnetting": [
    2014,
    2022,
    2023,
    2024
  ],
  "hashing": [
    2014,
    2022,
    2023,
    2025
  ],
  "dfa_nfa": [
    2014,
    2022,
    2023,
    2025
  ],
  "dijkstra": [
    2012,
    2013,
    2023,
    2025
  ],
  "relational_algebra": [
    2012,
    2014,
    2022,
    2024
  ],
  "planar_graph": [
    2012,
    2013,
    2014,
    2016
  ],
  "routing": [
    2014,
    2022,
    2023,
    2025
  ],
  "regular_languages": [
    2016,
    2022,
    2023,
    2024
  ],
  "interrupts": [
    2016,
    2022,
    2024
  ],
  "liveness": [
    2014,
    2023,
    2025
  ],
  "sequential_circuits": [
    2014,
    2018,
    2025
  ],
  "file_systems": [
    2012,
    2014,
    2024
  ],
  "register_allocation": [
    2012,
    2013,
    2014
  ],
  "kmap": [
    2012,
    2018,
    2025
  ],
  "maxima_minima": [
    2012,
    2014,
    2023
  ],
  "sorting": [
    2013,
    2014,
    2016
  ],
  "bellman_ford": [
    2013,
    2023,
    2025
  ],
  "counters": [
    2014,
    2016,
    2025
  ],
  "relations": [
    2023,
    2024,
    2025
  ],
  "er_model": [
    2018,
    2024
  ],
  "systems_of_equations": [
    2024,
    2025
  ],
  "heaps": [
    2013,
    2023
  ],
  "threads": [
    2014,
    2018
  ],
  "sliding_window": [
    2014,
    2016
  ],
  "matrix_chain": [
    2016,
    2018
  ],
  "locks": [
    2016,
    2024
  ],
  "sql_joins": [
    2018,
    2025
  ],
  "memory_allocation": [
    2025
  ],
  "inode": [
    2012
  ],
  "distributions": [
    2013
  ],
  "lcs": [
    2014
  ],
  "closure_fd": [
    2014
  ],
  "dp": [
    2016
  ],
  "floyd_warshall": [
    2016
  ],
  "csma_cd": [
    2016
  ],
  "greedy": [
    2018
  ],
  "eulerian_hamiltonian": [
    2022
  ],
  "indexing": [
    2023
  ],
  "booth": [
    2025
  ]
},

  concept_pairs: [
  {
    "concept_a": "pipeline",
    "concept_b": "virtual_memory",
    "count": 11
  },
  {
    "concept_a": "page_replacement",
    "concept_b": "virtual_memory",
    "count": 10
  },
  {
    "concept_a": "page_replacement",
    "concept_b": "pipeline",
    "count": 10
  },
  {
    "concept_a": "cfl",
    "concept_b": "page_replacement",
    "count": 10
  },
  {
    "concept_a": "normalization",
    "concept_b": "virtual_memory",
    "count": 10
  },
  {
    "concept_a": "cfl",
    "concept_b": "virtual_memory",
    "count": 10
  },
  {
    "concept_a": "normalization",
    "concept_b": "pipeline",
    "count": 10
  },
  {
    "concept_a": "cfl",
    "concept_b": "pipeline",
    "count": 10
  },
  {
    "concept_a": "scheduling",
    "concept_b": "virtual_memory",
    "count": 10
  },
  {
    "concept_a": "pipeline",
    "concept_b": "scheduling",
    "count": 10
  },
  {
    "concept_a": "normalization",
    "concept_b": "page_replacement",
    "count": 9
  },
  {
    "concept_a": "cache",
    "concept_b": "virtual_memory",
    "count": 9
  },
  {
    "concept_a": "cache",
    "concept_b": "pipeline",
    "count": 9
  },
  {
    "concept_a": "cfl",
    "concept_b": "normalization",
    "count": 9
  },
  {
    "concept_a": "page_replacement",
    "concept_b": "scheduling",
    "count": 9
  },
  {
    "concept_a": "normalization",
    "concept_b": "scheduling",
    "count": 9
  },
  {
    "concept_a": "cfl",
    "concept_b": "scheduling",
    "count": 9
  },
  {
    "concept_a": "page_replacement",
    "concept_b": "process",
    "count": 8
  },
  {
    "concept_a": "cache",
    "concept_b": "page_replacement",
    "count": 8
  },
  {
    "concept_a": "synchronization",
    "concept_b": "virtual_memory",
    "count": 8
  },
  {
    "concept_a": "process",
    "concept_b": "virtual_memory",
    "count": 8
  },
  {
    "concept_a": "pipeline",
    "concept_b": "synchronization",
    "count": 8
  },
  {
    "concept_a": "pipeline",
    "concept_b": "process",
    "count": 8
  },
  {
    "concept_a": "cfl",
    "concept_b": "process",
    "count": 8
  },
  {
    "concept_a": "cache",
    "concept_b": "normalization",
    "count": 8
  },
  {
    "concept_a": "cache",
    "concept_b": "cfl",
    "count": 8
  },
  {
    "concept_a": "scheduling",
    "concept_b": "trees_bst",
    "count": 8
  },
  {
    "concept_a": "trees_bst",
    "concept_b": "virtual_memory",
    "count": 8
  },
  {
    "concept_a": "pipeline",
    "concept_b": "trees_bst",
    "count": 8
  },
  {
    "concept_a": "normalization",
    "concept_b": "trees_bst",
    "count": 8
  },
  {
    "concept_a": "cache",
    "concept_b": "scheduling",
    "count": 8
  },
  {
    "concept_a": "page_replacement",
    "concept_b": "synchronization",
    "count": 7
  },
  {
    "concept_a": "eigenvalues",
    "concept_b": "page_replacement",
    "count": 7
  },
  {
    "concept_a": "parsing",
    "concept_b": "virtual_memory",
    "count": 7
  },
  {
    "concept_a": "graph_theory",
    "concept_b": "virtual_memory",
    "count": 7
  },
  {
    "concept_a": "eigenvalues",
    "concept_b": "virtual_memory",
    "count": 7
  },
  {
    "concept_a": "cache",
    "concept_b": "synchronization",
    "count": 7
  },
  {
    "concept_a": "normalization",
    "concept_b": "synchronization",
    "count": 7
  },
  {
    "concept_a": "cfl",
    "concept_b": "synchronization",
    "count": 7
  },
  {
    "concept_a": "graph_theory",
    "concept_b": "synchronization",
    "count": 7
  }
],

  importance_scores: {
  "virtual_memory": 9.85,
  "pipeline": 9.85,
  "scheduling": 9.3,
  "page_replacement": 9.1,
  "normalization": 9.1,
  "cfl": 9.1,
  "cache": 8.75,
  "trees_bst": 7.8,
  "synchronization": 7.7,
  "process": 7.6,
  "eigenvalues": 7.25,
  "deadlock": 7.25,
  "turing_machines": 7.25,
  "parsing": 7.05,
  "propositional_logic": 7.05,
  "graph_theory": 6.95,
  "graph_traversal": 6.5,
  "np_completeness": 6.5,
  "lexical_analysis": 6.5,
  "ieee754": 6.5,
  "number_systems": 6.5,
  "transactions": 6.3,
  "mst": 6.3,
  "disk_scheduling": 6.2,
  "sql_aggregation": 5.75,
  "multiplexer_logic": 5.65,
  "tcp_flow": 5.65,
  "sdts": 5.55,
  "chomsky_hierarchy": 5.55,
  "basic_block": 5.0,
  "hashing": 5.0,
  "dfa_nfa": 5.0,
  "dijkstra": 5.0,
  "routing": 5.0,
  "counting": 4.9,
  "ip_subnetting": 4.9,
  "relational_algebra": 4.9,
  "regular_languages": 4.9,
  "sequential_circuits": 4.8,
  "interrupts": 4.7,
  "liveness": 4.25,
  "kmap": 4.25,
  "bellman_ford": 4.25,
  "counters": 4.25,
  "relations": 4.25,
  "file_systems": 4.15,
  "planar_graph": 4.1,
  "systems_of_equations": 4.05,
  "maxima_minima": 4.05,
  "er_model": 3.95
},

  high_yield_ranked: [
  {
    "id": "virtual_memory",
    "subject": "os",
    "score": 9.85,
    "label": "Virtual Memory",
    "freq": 11
  },
  {
    "id": "pipeline",
    "subject": "coa",
    "score": 9.85,
    "label": "Pipelining",
    "freq": 11
  },
  {
    "id": "scheduling",
    "subject": "os",
    "score": 9.3,
    "label": "CPU Scheduling",
    "freq": 10
  },
  {
    "id": "page_replacement",
    "subject": "os",
    "score": 9.1,
    "label": "Page Replacement",
    "freq": 10
  },
  {
    "id": "normalization",
    "subject": "dbms",
    "score": 9.1,
    "label": "Normalization & FDs",
    "freq": 10
  },
  {
    "id": "cfl",
    "subject": "toc",
    "score": 9.1,
    "label": "CFLs & PDA",
    "freq": 10
  },
  {
    "id": "cache",
    "subject": "coa",
    "score": 8.75,
    "label": "Cache Memory",
    "freq": 9
  },
  {
    "id": "trees_bst",
    "subject": "algo",
    "score": 7.8,
    "label": "BSTs & Tree Operations",
    "freq": 8
  },
  {
    "id": "synchronization",
    "subject": "os",
    "score": 7.7,
    "label": "Synchronization",
    "freq": 8
  },
  {
    "id": "process",
    "subject": "os",
    "score": 7.6,
    "label": "Process",
    "freq": 8
  },
  {
    "id": "eigenvalues",
    "subject": "la",
    "score": 7.25,
    "label": "Eigenvalues / Linear Algebra",
    "freq": 7
  },
  {
    "id": "deadlock",
    "subject": "os",
    "score": 7.25,
    "label": "Deadlock",
    "freq": 7
  },
  {
    "id": "turing_machines",
    "subject": "toc",
    "score": 7.25,
    "label": "Turing Machines",
    "freq": 7
  },
  {
    "id": "parsing",
    "subject": "cd",
    "score": 7.05,
    "label": "Parsing (LL/LR/LALR)",
    "freq": 7
  },
  {
    "id": "propositional_logic",
    "subject": "dm",
    "score": 7.05,
    "label": "Propositional Logic",
    "freq": 7
  },
  {
    "id": "graph_theory",
    "subject": "dm",
    "score": 6.95,
    "label": "Graph Theory",
    "freq": 7
  },
  {
    "id": "graph_traversal",
    "subject": "algo",
    "score": 6.5,
    "label": "Graph Traversal (BFS/DFS)",
    "freq": 6
  },
  {
    "id": "np_completeness",
    "subject": "algo",
    "score": 6.5,
    "label": "NP-Completeness",
    "freq": 6
  },
  {
    "id": "lexical_analysis",
    "subject": "cd",
    "score": 6.5,
    "label": "Lexical Analysis",
    "freq": 6
  },
  {
    "id": "ieee754",
    "subject": "coa",
    "score": 6.5,
    "label": "Ieee754",
    "freq": 6
  },
  {
    "id": "number_systems",
    "subject": "coa",
    "score": 6.5,
    "label": "Number Systems",
    "freq": 6
  },
  {
    "id": "transactions",
    "subject": "dbms",
    "score": 6.3,
    "label": "Transactions & ACID",
    "freq": 6
  },
  {
    "id": "mst",
    "subject": "algo",
    "score": 6.3,
    "label": "MST (Kruskal/Prim)",
    "freq": 6
  },
  {
    "id": "disk_scheduling",
    "subject": "os",
    "score": 6.2,
    "label": "Disk Scheduling",
    "freq": 6
  },
  {
    "id": "sql_aggregation",
    "subject": "dbms",
    "score": 5.75,
    "label": "Sql Aggregation",
    "freq": 5
  },
  {
    "id": "multiplexer_logic",
    "subject": "dl",
    "score": 5.65,
    "label": "Multiplexer Logic",
    "freq": 5
  },
  {
    "id": "tcp_flow",
    "subject": "cn",
    "score": 5.65,
    "label": "TCP & Congestion Control",
    "freq": 5
  },
  {
    "id": "sdts",
    "subject": "cd",
    "score": 5.55,
    "label": "Sdts",
    "freq": 5
  },
  {
    "id": "chomsky_hierarchy",
    "subject": "toc",
    "score": 5.55,
    "label": "Chomsky Hierarchy",
    "freq": 5
  },
  {
    "id": "basic_block",
    "subject": "cd",
    "score": 5.0,
    "label": "Basic Block",
    "freq": 4
  },
  {
    "id": "hashing",
    "subject": "algo",
    "score": 5.0,
    "label": "Hashing",
    "freq": 4
  },
  {
    "id": "dfa_nfa",
    "subject": "toc",
    "score": 5.0,
    "label": "DFA & NFA",
    "freq": 4
  },
  {
    "id": "dijkstra",
    "subject": "algo",
    "score": 5.0,
    "label": "Dijkstra's Algorithm",
    "freq": 4
  },
  {
    "id": "routing",
    "subject": "cn",
    "score": 5.0,
    "label": "Routing Protocols (OSPF/BGP)",
    "freq": 4
  },
  {
    "id": "counting",
    "subject": "dm",
    "score": 4.9,
    "label": "Counting & Combinatorics",
    "freq": 4
  }
],

  concept_radar: [
  {
    "id": "virtual_memory",
    "label": "Virtual Memory",
    "radar_score": 7.1,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 11
  },
  {
    "id": "pipeline",
    "label": "Pipelining",
    "radar_score": 7.1,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 11
  },
  {
    "id": "scheduling",
    "label": "CPU Scheduling",
    "radar_score": 6.7,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 10
  },
  {
    "id": "page_replacement",
    "label": "Page Replacement",
    "radar_score": 6.4,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 10
  },
  {
    "id": "normalization",
    "label": "Normalization & FDs",
    "radar_score": 6.4,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 10
  },
  {
    "id": "cfl",
    "label": "CFLs & PDA",
    "radar_score": 6.4,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 10
  },
  {
    "id": "cache",
    "label": "Cache Memory",
    "radar_score": 6.3,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 9
  },
  {
    "id": "synchronization",
    "label": "Synchronization",
    "radar_score": 5.8,
    "last_seen": 2024,
    "gap_years": 1,
    "total_freq": 8
  },
  {
    "id": "trees_bst",
    "label": "BSTs & Tree Operations",
    "radar_score": 5.3,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 8
  },
  {
    "id": "graph_theory",
    "label": "Graph Theory",
    "radar_score": 5.1,
    "last_seen": 2024,
    "gap_years": 1,
    "total_freq": 7
  },
  {
    "id": "process",
    "label": "Process",
    "radar_score": 5.0,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 8
  },
  {
    "id": "eigenvalues",
    "label": "Eigenvalues / Linear Algebra",
    "radar_score": 4.9,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 7
  },
  {
    "id": "deadlock",
    "label": "Deadlock",
    "radar_score": 4.9,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 7
  },
  {
    "id": "turing_machines",
    "label": "Turing Machines",
    "radar_score": 4.9,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 7
  },
  {
    "id": "planar_graph",
    "label": "Planar Graphs",
    "radar_score": 4.8,
    "last_seen": 2016,
    "gap_years": 9,
    "total_freq": 4
  },
  {
    "id": "parsing",
    "label": "Parsing (LL/LR/LALR)",
    "radar_score": 4.6,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 7
  },
  {
    "id": "propositional_logic",
    "label": "Propositional Logic",
    "radar_score": 4.6,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 7
  },
  {
    "id": "chomsky_hierarchy",
    "label": "Chomsky Hierarchy",
    "radar_score": 4.5,
    "last_seen": 2023,
    "gap_years": 2,
    "total_freq": 5
  },
  {
    "id": "disk_scheduling",
    "label": "Disk Scheduling",
    "radar_score": 4.4,
    "last_seen": 2024,
    "gap_years": 1,
    "total_freq": 6
  },
  {
    "id": "graph_traversal",
    "label": "Graph Traversal (BFS/DFS)",
    "radar_score": 4.2,
    "last_seen": 2025,
    "gap_years": 0,
    "total_freq": 6
  }
],

  pyq_patterns: {
    "scheduling": {"pattern": "Gantt chart + avg wait time / turnaround time computation.", "trap": "SRTF: check preemption at EVERY new arrival. Don't forget arrival time in TAT.", "shortcut": "TAT = Completion - Arrival. Wait = TAT - Burst. Draw Gantt first.", "frequency": 10, "last_year": 2025},
    "deadlock": {"pattern": "Banker's algorithm safe sequence OR formula: n\u00d7(max-1)+1 \u2264 R.", "trap": "Not returning released resources to Available after simulating each process.", "shortcut": "Safe = find P where Need \u2264 Available. Add its Allocation to Available. Repeat.", "frequency": 7, "last_year": 2025},
    "page_replacement": {"pattern": "Page fault count on reference string with FIFO/LRU/OPT and fixed frames.", "trap": "Belady's anomaly: more frames \u2192 more faults (FIFO only). LRU \u2260 FIFO.", "shortcut": "LRU: recency stack. FIFO: circular queue. OPT: look-ahead to future refs.", "frequency": 10, "last_year": 2025},
    "virtual_memory": {"pattern": "Page table size = pages \u00d7 entry_size. EMAT = \u03b1(t_tlb+t_m)+(1-\u03b1)(t_tlb+2t_m).", "trap": "TLB lookup time added on BOTH hit and miss paths (parallel lookup assumption).", "shortcut": "Pages = 2^(VA_bits - offset_bits). Table = pages \u00d7 entry_size.", "frequency": 11, "last_year": 2025},
    "normalization": {"pattern": "Attribute closure to find candidate keys OR identify NF from given FDs.", "trap": "Missing transitive FDs when verifying BCNF. Check all non-trivial FDs.", "shortcut": "Compute X+ for all subsets. Minimal X with X+=all attrs = candidate key.", "frequency": 10, "last_year": 2025},
    "pipeline": {"pattern": "CPI with stalls + speedup formula OR hazard type identification (RAW/WAW/WAR).", "trap": "Real speedup < n stages due to fill/drain time and hazards.", "shortcut": "CPI_actual = CPI_ideal + stall_cycles/inst. Draw pipeline diagram for stalls.", "frequency": 11, "last_year": 2025},
    "cache": {"pattern": "AMAT = h\u00d7t\u2081 + (1-h)\u00d7(t\u2081+t\u2082). Multilevel = L1 + L1_miss \u00d7 (L2 + L2_miss \u00d7 Mem).", "trap": "Fully associative has no conflict misses. Mapping determines which set/line.", "shortcut": "For direct-mapped: set = (block address) mod (number of sets).", "frequency": 9, "last_year": 2025},
    "dfa_nfa": {"pattern": "Count states in minimal DFA OR NFA\u2192DFA construction.", "trap": "NFA\u2192DFA: \u03b5-closure of states. Don't forget dead/trap state in DFA.", "shortcut": "Table-filling: mark (final, non-final) pairs. Propagate marks. Unmark = merge.", "frequency": 4, "last_year": 2025},
    "transactions": {"pattern": "Build precedence graph for conflict serializability check.", "trap": "Edge direction: if Op1 appears before Op2 and they conflict \u2192 Op1's txn \u2192 Op2's.", "shortcut": "Conflict: same variable, different transactions, at least one WRITE.", "frequency": 6, "last_year": 2025},
    "sorting": {"pattern": "Worst-case time / space complexity OR stable/in-place property identification.", "trap": "Quicksort worst O(n\u00b2) with bad pivot (sorted input + first-element pivot).", "shortcut": "Heapsort = \u0398(n log n) always. Mergesort = stable. Quick = fast average.", "frequency": 3, "last_year": 2016},
    "dp": {"pattern": "Fill DP table for LCS/matrix-chain/knapsack/coin-change.", "trap": "0-1 knapsack REQUIRES DP. Fractional knapsack \u2192 greedy. Don't confuse them.", "shortcut": "Identify: overlapping subproblems + optimal substructure \u2192 DP.", "frequency": 1, "last_year": 2016},
    "mst": {"pattern": "Find MST weight or trace Kruskal/Prim step by step.", "trap": "Distinct edge weights \u2192 UNIQUE MST. Multiple MSTs all have same total weight.", "shortcut": "Kruskal: sort edges; add if no cycle (DSU). Prim: expand from vertex greedily.", "frequency": 6, "last_year": 2025},
    "eigenvalues": {"pattern": "Find eigenvalues from characteristic polynomial OR Tr/Det shortcuts.", "trap": "Tr(A) = \u03a3\u03bb\u1d62. Det(A) = \u03a0\u03bb\u1d62. Use for 2\u00d72 without full polynomial.", "shortcut": "\u03bb\u00b2 - Tr(A)\u00b7\u03bb + Det(A) = 0 for 2\u00d72 matrices.", "frequency": 7, "last_year": 2025},
    "sliding_window": {"pattern": "Throughput/efficiency of Go-Back-N or Selective Repeat ARQ.", "trap": "SR sender window = 2^(n-1). GB-N sender window = 2^n - 1. Receiver window matters.", "shortcut": "Efficiency = W/(1+2a) where a=T_prop/T_frame. W = window size.", "frequency": 2, "last_year": 2016},
    "error_detection": {"pattern": "CRC: append r zeros, divide by generator, remainder = CRC to transmit.", "trap": "Divide by XOR (no carries). Generator degree r \u2192 r CRC bits appended.", "shortcut": "Hamming distance d: detect d-1 bits, correct \u230a(d-1)/2\u230b bits.", "frequency": 4, "last_year": 2022},
    "ip_subnetting": {"pattern": "Given IP/prefix: find network addr, broadcast, valid hosts, # subnets.", "trap": "Usable hosts = 2^h - 2 (subtract network and broadcast addresses).", "shortcut": "CIDR: /n means first n bits = network. Hosts per subnet = 2^(32-n) - 2.", "frequency": 4, "last_year": 2024},
    "graph_traversal": {"pattern": "DFS/BFS traversal order OR topological sort on given directed graph.", "trap": "Multiple valid topological orderings exist \u2014 verify by counting zero in-degree.", "shortcut": "Kahn's: repeatedly remove vertex with in-degree 0. Add to order, update neighbors.", "frequency": 6, "last_year": 2025},
    "np_completeness": {"pattern": "Classify given problem as P, NP, NP-complete, or NP-hard.", "trap": "NP \u2260 NP-complete. NP-hard problems may not even be in NP.", "shortcut": "Show X\u2208NP: certificate verifiable in poly time. Reduction from known NPC \u2192 NPC.", "frequency": 6, "last_year": 2025},
    "kmap": {"pattern": "Minimize Boolean function using K-map. Find prime and essential prime implicants.", "trap": "Don't-cares can be grouped but not required to be covered.", "shortcut": "Essential PI = covers at least one minterm that no other PI covers. Must include.", "frequency": 3, "last_year": 2025},
    "master_theorem": {"pattern": "Solve T(n) = aT(n/b) + f(n) by comparing f(n) with n^{log_b a}.", "trap": "Master theorem inapplicable when f(n) is not polynomial (e.g., n log n sometimes).", "shortcut": "Case 1: f=O(n^{c-\u03b5}) \u2192 \u0398(n^c). Case 2: f=\u0398(n^c log^k n) \u2192 \u0398(n^c log^(k+1) n). Case 3+regularity.", "frequency": 4, "last_year": 2022},
    "parsing": {"pattern": "Identify grammar type (LL(1)/LR(1)/LALR) OR fill parse table.", "trap": "Shift-reduce conflict: both stack and input could trigger action \u2014 ambiguity.", "shortcut": "LR(0) \u2282 SLR(1) \u2282 LALR(1) \u2282 LR(1) in power. LALR = practical standard.", "frequency": 7, "last_year": 2025},
    "counting": {"pattern": "Permutation/combination counting OR pigeonhole principle application.", "trap": "Ordered = permutation. Unordered = combination. Stars and bars for repetition.", "shortcut": "C(n,r) = P(n,r)/r!. Pigeonhole: n+1 into n boxes \u2192 \u22651 box has \u22652.", "frequency": 4, "last_year": 2024}
  }
};
