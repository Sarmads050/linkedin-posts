# LinkedIn Posting Playbook — Sarmad Ali

Instructions for the automated daily LinkedIn run. Follow every rule. When in doubt, skip the post rather than publish something unverified.

## Who the posts are for

Sarmad Ali — Assistant IT / Data Processing Assistant, Nutrition Department, MAMTA Program, PPHI Sindh Head Office, Karachi. MS Computer Science (IQRA University), BS IT (SBBU). Work: weekly/monthly/review-meeting/CEO reports; Health Facility Activation, Functionalization, login-status and deviation reports; a web-based KPI dashboard; collecting and validating daily district data; coordinating with 50+ district focal persons; resolving MIS issues from the field.

Career direction: health information systems, MIS, M&E, data quality, DHIS2, public health / nutrition programmes. Never write about teaching or WordPress.

Audience: public health, nutrition, MIS/M&E and development-sector professionals in Pakistan (PPHI, SSPA, Health Dept Sindh, UNICEF, WFP, WHO, World Bank, Nutrition International, AKU, HISP/DHIS2) and recruiters.

## Schedule (Asia/Karachi)

| Day | Series |
|---|---|
| Mon, Wed, Fri | Research Brief |
| Tue, Thu, Sat | Data Tip |
| Sun | No post |

One post per day. Before creating a post, check Buffer for a post already scheduled or sent today on the LinkedIn channel; if one exists, do nothing.

## Research Brief rules

1. Only research **published 1 January 2026 or later**: peer-reviewed papers, official surveys/reports (NIPS, PBS, NNS, MICS, Ministry of Health, provincial health departments), WHO, UNICEF, World Bank, WFP, Gavi, Gates-funded evaluations, AKU, Health Services Academy, Lancet/BMJ/PLOS/BMC/JOGH/EMHJ etc. Research may be done inside Pakistan or abroad, but must be about **primary health care in Pakistan** (MNCH, nutrition, immunization, family planning, LHWs, BHUs/RHCs, PHC financing, HMIS/DHIS2, social protection linked to health).
2. Do deep research each run: search widely for new 2026 studies, open the primary source (paper, report PDF), and read the actual results. Prefer the newest study not yet in `posts-log.md`.
3. Verify every number against the primary source. If a number is only in news coverage and the primary source can't be opened, don't use it. If sources disagree, use the primary/final report and say so in the caption if relevant.
4. Think critically before posting: sample size, study design (RCT, quasi-experimental, cross-sectional, qualitative), which districts/provinces, limitations. Add one honest line about the limitation in the caption when it matters (e.g. "qualitative study in 3 districts, so not nationally representative"). Label preprints as "preprint (not yet peer-reviewed)", or skip them.
5. Never invent numbers, quotes, sample sizes or programme details. Never imply Sarmad worked on the study.
6. If no qualifying, verifiable 2026 study is available that day, post a Data Tip instead.
7. Show all key findings of the study graphically (bars, big numbers, timelines, icon arrays, comparisons). Every graphic shows the source and its month/year, and the "NEW · 2026" label.

## Data Tip rules

1. Practical tips from Sarmad's field: data validation, district reporting, KPI dashboards, Excel/Google Sheets, report writing for leadership, deviation reports, data quality checks (completeness, timeliness, consistency, accuracy), coordination with field teams, DHIS2/HMIS basics, MIS troubleshooting.
2. Write as general professional advice ("worth adding", "what helps", "a simple check"). Never claim specific events, numbers or results from PPHI/MAMTA work, and never show real programme data, district or facility names. Example tables use "District A", "RHC-01".
3. Never repeat a topic already in `posts-log.md`.

## Design system (both series)

- Size 1080×1350 PNG. Paper background `#FAF8F3` with a faint dot grid; ink `#14161B`; muted `#5D6270`; red `#E23D3D`; yellow highlight `#FFD84D`; green `#1F8A5B` for positive results.
- Fonts (Google Fonts): Bricolage Grotesque 800 for headlines, Instrument Serif italic for 1–3 accent words on a yellow highlighter, DM Sans for body, Caveat for handwritten notes, JetBrains Mono or Carlito for spreadsheet cells.
- Top row: series chip (Research Brief = red chip, Data Tip = black chip) with number, topic on the right. No profile photo and no large name inside the image (LinkedIn already shows them). Footer: source on the left (research) or a practical pointer (tips), and "Sarmad Ali · MIS & Data" small on the right.
- Start from `templates/research-brief.js` or `templates/data-tip.js`, keep the tokens and layout language, and change the content and the visual to fit the finding. Render with Playwright (`node templates/<file>.js images/<file>.png`), then look at the PNG and fix any overlap, clipping, orphan words or empty space before using it.

## Caption rules (engagement)

- First line: the most striking finding or idea in plain words (it appears before "see more").
- 120–220 words, short paragraphs, natural human voice, no emoji lists, at most 1–2 emoji total.
- Use field keywords in sentences: primary health care, maternal and child health, nutrition, stunting, immunization, antenatal care, first 1,000 days, health information systems, data quality, MIS, Sindh, Pakistan.
- Research: what was studied, key findings, one critical/limitation line, why it matters for PHC in Pakistan, then the source line: `Source: <authors/organisation>, <journal/report>, <Month 2026>`.
- End with one genuine question that people in the field can answer.
- 3–5 hashtags, e.g. #PublicHealth #PrimaryHealthCare #Pakistan #Nutrition #MIS #DataQuality.
- No links in the post body.

## Publishing steps

1. Save the image as `images/YYYY-MM-DD-<series>-NN.png` on branch `posts`, commit, push.
2. Build the image URL with the pushed commit's full SHA (not the branch name, which can serve a cached old file): `https://raw.githubusercontent.com/Sarmads050/linkedin-posts/<commit-sha>/images/<file>.png`, and confirm it returns HTTP 200 (retry for up to ~2 minutes).
3. Buffer: organization `6ae0788be586811d71fdec73`, LinkedIn channel `6b068cc88541f09ecb994420` (Sarmad Ali, profile). `create_post` with `schedulingType: "automatic"`, `mode: "shareNow"`, the caption as `text`, and the image URL as an image asset with descriptive `altText`.
4. Append a row to `posts-log.md` (date, series, number, topic/study, source with month, image file) and push.
