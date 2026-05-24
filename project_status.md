# Iqraa Thuluth — Project Status



> Islamic night thirds (Thuluth) and midnight calculator based on prayer times.  

> **Stack:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES6+). Fully client-side.



---



## Current Phase: **Phase 3 — Complete** ✅



**Status:** All three phases delivered. Post-launch UI polish applied.



---



## Recent Updates — UI Polish (May 2026)



| Change | Details |

|--------|---------|

| Night section title | Arabic: **ثلث الليل** · English: **Night Thirds** |

| Country dropdown arrow | Wrapped select in relative container; chevron uses logical `end-3` positioning |

| RTL/LTR direction sync | `dir` set on both `<html>` and `<body>`; LTR font rule targets `html[dir="ltr"] body` |

| Select styling | `.select-field` uses `appearance-none` + inline SVG icon (no broken CSS background-image) |

| City list | Listbox excludes dropdown arrow styling; consistent horizontal padding |



**Root cause fixed:** Dropdown CSS used `body[dir="ltr"]` but `dir` was only on `<html>`, so English mode never received correct arrow positioning.



---



## Phase 1 — UI, Localization & Location ✅



- Mobile-first UI, Arabic default (RTL), English toggle

- Country → searchable city selection with `localStorage` persistence



---



## Phase 2 — Prayer Times API ✅



- Aladhan `timingsByCity` integration (today + tomorrow)

- Country-specific calculation methods (Egypt = 5, Saudi = 4, etc.)

- Date in URL path (`DD-MM-YYYY`); loading, error, and refresh states



---



## Phase 3 — Night Calculation & Toggle ✅



### Achieved



| Item | Status | Notes |

|------|--------|-------|

| Night calculation engine | ✅ | Runs automatically after prayer times load |

| Maghrib / Isha toggle | ✅ | OFF = Maghrib→Fajr (default), ON = Isha→Fajr |

| Total night duration | ✅ | Hours + minutes |

| Thirds & half durations | ✅ | ⅓, ½, ⅔ of the night |

| Islamic midnight (نصف الليل) | ✅ | Clock time when first half ends |

| Last third start (بداية الثلث الأخير) | ✅ | Clock time for Tahajjud/Qiyam |

| Toggle persistence | ✅ | Saved in `localStorage` |

| Bilingual labels | ✅ | All strings in AR/EN |



### Calculation Logic



```

Toggle OFF (default):

  nightStart = today.Maghrib

  nightEnd   = tomorrow.Fajr



Toggle ON:

  nightStart = today.Isha

  nightEnd   = tomorrow.Fajr



totalNight   = nightEnd − nightStart

oneThird     = totalNight / 3

half         = totalNight / 2

twoThirds    = 2 × totalNight / 3



Islamic midnight    = nightStart + half

Last third start    = nightStart + twoThirds

```



---



## File Structure



```

iqraa-thuluth/

├── index.html          # Full SPA: location, prayer times, night calc

├── app.js              # i18n, API, night engine, UI controllers

└── project_status.md   # This document

```



---



## Deployment



Upload `index.html` and `app.js` to any static host (cPanel, Netlify, GitHub Pages). Requires internet for Aladhan API calls.



---



*Last updated: UI polish — May 23, 2026*

