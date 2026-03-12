# Dependency Map

## Runtime Files

- `index.html`
- `widget.html`
- `sw.js`
- `manifest.json`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `data/data.js`
- `data/pyq_intelligence.js`
- `data/dataset_v6_pyq_quiz.js`
- `data/dataset_examside.js`

## Dataset Files

- `data/data.js`
- `data/data_flashcards_v2.js`
- `data/data_flashcards_v3.js`
- `data/dataset_examside.js`
- `data/dataset_v6_pyq_quiz.js`
- `data/pyq_intelligence.js`
- `dev-tools/source-material/dataset_examside_demo.js`

## Build And Maintenance Scripts

- `dev-tools/maintenance/cleanup.py`
- `dev-tools/maintenance/cleanup.ps1`
- `dev-tools/maintenance/cleanup.js`
- `dev-tools/maintenance/extract_chunk.py`
- `dev-tools/maintenance/fix_data.js`
- `dev-tools/tools/*`
- `dev-tools/launchers/*`

## Scraping And Source Pipelines

- `dev-tools/scraper/*`
- `dev-tools/gate pyq/*`
- `dev-tools/ocr_cache/*`
- `dev-tools/source-material/gateopedia 13.pdf`
- `dev-tools/python-deps/*`
- `dev-tools/python-deps-2/*`

## Temporary Artifacts

- `dev-tools/temp/chunk1.txt`
- `dev-tools/temp/data.err`

## Verified Unused In Runtime

- `dev-tools/source-material/dataset_examside_demo.js`
- `dev-tools/temp/chunk1.txt`
- `dev-tools/temp/data.err`

## Browser Dependency Edges

- `index.html` -> `manifest.json`
- `index.html` -> `icons/icon-192.png`
- `index.html` -> `data/data.js`
- `index.html` -> `data/pyq_intelligence.js`
- `index.html` -> `data/dataset_v6_pyq_quiz.js`
- `index.html` -> dynamic `data/dataset_examside.js`
- `index.html` -> `sw.js`
- `sw.js` -> cached runtime files under repo root
