# MELATI PROGRAM HUB – PRD

## Original problem statement
Responsive Indonesian web app for reporting & evaluating programs of UPT Puskesmas Melati (green professional design): roles admin/PJ/kepala; dashboard monthly/quarterly/yearly; PJ reporting; program & indicator management; flexible tables w/ templates + Excel import; kepala feedback; auto presentation (edit, fullscreen); SWOT/TOWS; fishbone/5 Why; export Word/Excel/PDF/PPTX; month-end reminders + email; follow-up tracking; autosave, shared DB, revision history, activity log. Rules: recap from monthly by indicator method (no double cumulative), unreported = "Belum tersedia", analyses cite sources and separate fakta/dugaan + validation, no fabricated data, flow Draf → Diajukan → Perlu perbaikan/Disetujui.

## User choices
Password login (JWT), AI = Gemini 3 Flash via Emergent LLM key, Resend email (Emergent-managed), seeded sample programs/indicators (no fake achievement data), attached logo used.

## Architecture
- Backend FastAPI: core.py (db/auth/notify/log), recap.py (aggregation: kumulatif/rasio/terakhir, completeness, deadlines), ai.py, emailer.py, exports.py (docx/xlsx/pdf/pptx), seed.py, server.py (routes). MongoDB with uuid `id` fields.
- Cron: .emergent/crons.yml hourly → POST /api/cron/reminders (Bearer WEBHOOK_CRON_SECRET), sends at configured WIB hour.
- Frontend React + shadcn + recharts + xlsx; Outfit/Plus Jakarta Sans; forest green #1A4D3A.

## Implemented (Oct 2026)
- All 13 features above; iteration_1 testing: backend 41/41, frontend critical flows pass.
- Iteration 2: presentations generated from PJ entries (incl. drafts, toggle) + "Buat presentasi" button in report editor; PJ can export own presentations/reports; PJ sees only own programs on dashboard/export/presentations; PJ manages own program profile (labels, custom profile fields), indicators, can add/delete own programs. Tests 22/22 pass.

## Backlog
- P1: attachments/evidence upload on reports, per-PJ email for real accounts (demo .test emails skipped)
- P2: comparison year-over-year, dashboard PDF snapshot, WhatsApp reminders
