Version: v53.0.2-audited-clean

# RealStock v53 Clean

Compatible with the latest workbook:
- Master schema v2
- conversion control
- `_th` display columns
- `DICT_TH_LABEL` fallback sheet (optional)

## Deploy notes
1. Replace the workbook ID in `backend/Code.gs` if this is a standalone Apps Script project.
2. If your Apps Script is bound to the workbook, you can leave `SPREADSHEET_ID` as placeholder.
3. Deploy the Apps Script web app and update `src/config.v51.js` if your web app URL changes.
4. Push this folder to GitHub Pages and hard refresh the browser.

## What changed
- server-side conversion kept from hardened build
- auto Thai label detection from workbook (`*_th`)
- DICT_TH_LABEL fallback support
- cleaned package (legacy notes / old workbooks removed)
