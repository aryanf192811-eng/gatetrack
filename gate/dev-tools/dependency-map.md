# Dependency Map

## Runtime Files

- `public/index.html`
- `public/widget.html`
- `public/sw.js`
- `public/manifest.json`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/data/data.js`
- `public/data/pyq_intelligence.js`
- `public/data/dataset_v6_pyq_quiz.js`
- `public/data/dataset_examside.js`

## Dataset Files

- `public/data/data.js`
- `public/data/data_flashcards_v2.js`
- `public/data/data_flashcards_v3.js`
- `public/data/dataset_examside.js`
- `public/data/dataset_v6_pyq_quiz.js`
- `public/data/pyq_intelligence.js`
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

- `public/index.html` -> `public/manifest.json`
- `public/index.html` -> `public/icons/icon-192.png`
- `public/index.html` -> `public/data/data.js`
- `public/index.html` -> `public/data/pyq_intelligence.js`
- `public/index.html` -> `public/data/dataset_v6_pyq_quiz.js`
- `public/index.html` -> dynamic `public/data/dataset_examside.js`
- `public/index.html` -> `public/sw.js`
- `public/sw.js` -> cached runtime files under `public/`
