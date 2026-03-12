# GATE Tracker Dev Tools

This folder contains non-deployable development assets moved out of the Vercel static build.

Key paths:

- Runtime site: `..`
- Runtime datasets: `../data`
- Source PDFs: `./gate pyq`, `./source-material/gateopedia 13.pdf`
- OCR cache: `./ocr_cache`
- Scrapers: `./scraper`
- Maintenance helpers: `./maintenance`

Common commands from the `gate` project root:

```powershell
python .\dev-tools\tools\pyq_pipeline.py
python .\dev-tools\tools\pyq_build.py
python .\dev-tools\tools\pyq_ocr_pipeline.py
python .\dev-tools\scraper\examside_scraper.py
python .\dev-tools\tools\generate_concepts.py
python .\dev-tools\tools\expand_concepts.py
python .\dev-tools\tools\expand_concepts_r3.py
python .\dev-tools\tools\expand_r4.py
python .\dev-tools\tools\expand_r5.py
python .\dev-tools\tools\fix_concepts.py
python .\dev-tools\tools\cleanup_js.py
python .\dev-tools\tools\sanity_check.py
```

`generate_flashcards.py` still requires explicit `--pdf`, `--out`, `--start`, and `--end` arguments. Use `.\dev-tools\source-material\gateopedia 13.pdf` as the PDF input and `.\data\data.js` as the output dataset target.
