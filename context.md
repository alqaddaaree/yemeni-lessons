# فهرس الدروس العلمية - مؤسسة صدى السلفية

## 📋 Project Overview

This is a **static, serverless web application** that provides a searchable index of Islamic audio lessons (دروس علمية) from the Telegram channel **"الفهرس لمؤسسة صدى SADA السلفية"** (https://t.me/alawe1434).

The project extracts data from a Telegram JSON export, processes it into a structured format, and presents it through a modern, responsive single-page application with advanced search capabilities, filtering, bookmarking, and offline support (PWA).

---

## 🎯 Core Purpose

Provide students of knowledge (طلاب العلم) with an easy-to-use interface to discover and access thousands of Islamic lessons categorized by:

- **Sheikh (Teacher)** – over 50+ scholars
- **Category (Science)** – Fiqh, Aqeedah, Tafsir, Hadith, Sirah, Arabic Language, Usul, etc.
- **Number of lessons** – from 1 to 250+
- **Book titles** – browse by book, see which sheikhs taught it

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3 (modular), JavaScript (ES6) |
| **Search Engine** | Fuse.js (fuzzy search, autocomplete) |
| **Data Format** | JSON (flat structure, client-side) |
| **PWA** | Service Worker + Web App Manifest |
| **Hosting** | GitHub Pages (or any static host) |
| **Deployment** | No build step – pure static files |

---

## 📁 Complete File Structure

```
/
├── index.html                    # Main HTML page
├── manifest.json                 # PWA app manifest
├── sw.js                         # Service Worker (offline caching)
├── flat_lessons.json             # Data source (generated from Telegram export)
│
├── css/                          # Modular CSS files
│   ├── 01-theme.css              # Light/Dark theme variables
│   ├── 02-base.css               # Reset, body, container
│   ├── 03-header.css             # Header, stats, theme toggle
│   ├── 04-tabs.css               # Tab navigation
│   ├── 05-search.css             # Search box & suggestions
│   ├── 06-filters.css            # Filters (selects, buttons)
│   ├── 07-results.css            # Results items, meta, pills
│   ├── 08-pagination.css         # Pagination controls
│   ├── 09-books.css              # Books browser & detail
│   ├── 10-guide-about.css        # Guide & About pages
│   ├── 11-bookmarks.css          # Bookmarks tab & buttons
│   ├── 12-category-checkboxes.css # Multi-category filter
│   ├── 13-responsive.css         # All responsive styles
│   ├── 14-toast.css              # Toast notifications
│   └── 15-sheikh-page.css        # Sheikh banner styles
│
├── js/                           # Modular JavaScript files
│   ├── 01-config.js              # Constants, config, category keywords
│   ├── 02-state.js               # Global state variables
│   ├── 03-dom.js                 # DOM element references
│   ├── 04-category-helpers.js    # Category detection & helpers
│   ├── 05-book-index.js          # Book index building & rendering
│   ├── 06-filters.js             # Main filter logic & sorting
│   ├── 07-pagination.js          # Page rendering & pagination controls
│   ├── 08-data-loader.js         # Data loading, Fuse.js init
│   ├── 09-tabs.js                # Tab switching logic
│   ├── 10-dark-mode.js           # Dark mode functions
│   ├── 11-clipboard.js           # Copy link & toast notifications
│   ├── 12-suggestions.js         # Autocomplete suggestions
│   ├── 14-bookmarks.js           # Bookmark CRUD operations
│   ├── 15-category-checkboxes.js # Category checkbox logic
│   ├── 16-page-title.js          # Dynamic page title
│   ├── 17-service-worker.js      # PWA service worker registration
│   └── app.js                    # Main entry point
│
└── icons/                        # PWA app icons
    ├── logo.jpg                  # Original logo (source)
    ├── icon-192.png              # Home screen icon (192x192)
    └── icon-512.png              # Splash screen icon (512x512)
```

---

## 📊 Data Structure

### Input: `flat_lessons.json`

```json
{
  "sheikh": "أبو محمد عبد الله بن لمح الخولاني",
  "title": "شرح العقيدة الواسطية",
  "lessons_count": 23,
  "link": "https://t.me/alawe1434/8942",
  "date": "2022-10-17T06:34:35",
  "search_text": "ابو محمد عبد الله بن لمح الخولاني شرح العقيدة الواسطية",
  "category": "عقيدة"
}
```

### Derived: Book Index (Built at runtime)

```javascript
{
  "شرح العقيدة الواسطية": {
    "category": "عقيدة",
    "total_lessons": 0,
    "sheikhs": [
      { "name": "الخليل بن أحمد العديني", "lessons_count": 125, "link": "..." },
      { "name": "فتح بن عبدالحافظ القدسي", "lessons_count": 55, "link": "..." }
    ]
  }
}
```

---

## ✨ Features (Complete List)

### Phase 1 – Quick Wins
| # | Feature | Description |
|---|---------|-------------|
| 1a | 🌙 Dark Mode | Toggleable dark/light theme with system preference detection |
| 1b | 📋 Copy Lesson Link | One-click copy to clipboard with toast notification |
| 1c | 🎯 Search Suggestions | Autocomplete dropdown showing sheikhs, books, categories |
| 1d | 🔗 Permalink / URL Sharing | All filters reflected in URL; shareable search states |

### Phase 2 – User Experience
| # | Feature | Description |
|---|---------|-------------|
| 2a | 🔖 Save/Bookmark Lessons | localStorage-based bookmarking with export/import |
| 2b | 🏷️ Multi-Category Filter | Select multiple categories (OR logic) with visual pills |

### Phase 3 – Shareability & SEO
| # | Feature | Description |
|---|---------|-------------|
| 3 | 📑 Per-Sheikh Pages | `?sheikh=NAME` URLs with dynamic banners and page titles |

### Phase 4 – Offline & Installability
| # | Feature | Description |
|---|---------|-------------|
| 4 | 📱 PWA | Service Worker + Manifest; works offline, installable on devices |

### Core Features (Always Present)
| # | Feature | Description |
|---|---------|-------------|
| - | 📚 Book Browser | Browse books by science, see which sheikhs taught them |
| - | 📄 Pagination | 50 results per page with Previous/Next controls |
| - | 🏷️ Category Detection | Auto-tagging based on title keywords |
| - | 📊 Statistics | Total lessons, sheikhs, books in header |
| - | 📱 Responsive | Works on all devices (mobile-first) |

---

## 🔄 Data Pipeline

1. **Source**: Telegram channel export (`result.json`) from channel `@alawe1434`
2. **Extraction**: Python script parses `text_entities` to extract:
   - Sheikh name (from hashtag)
   - Lesson title (from plain text before link)
   - Lesson count (regex: `\d+ درس`)
   - Link (from link entity)
   - Date (from message)
3. **Cleaning**: Remove duplicates, clean titles, handle missing counts
4. **Output**: `flat_lessons.json` – flat array of all lessons
5. **Runtime**: Browser loads `flat_lessons.json` and builds:
   - Fuse.js search index
   - Book index (reverse index: book → sheikhs)
   - Category counts
   - Sheikh dropdown

---

## 🧠 Key Algorithms

### Category Detection
- Keyword-based matching on title
- 8 categories: فقه, عقيدة, تفسير, حديث, سيرة, لغة, أصول, عام
- Fallback to "عام" if no match

### Book Index (Reverse Index)
- Groups all lessons by unique book title
- Within each book, lists all sheikhs who taught it
- Sorts sheikhs by lesson count (descending)
- Used in "تصفح الكتب" tab

### Search (Fuse.js)
- Keys: `['title', 'sheikh']`
- Threshold: `0.4` (fuzzy)
- `ignoreLocation: true` (search anywhere in string)
- `ignoreDiacritics: true` (Arabic diacritics ignored)

### Pagination
- `PAGE_SIZE = 50`
- Client-side slicing: `filteredResults.slice(start, end)`
- URL parameter: `?page=2`

---

## 🎨 UI Design System

### Color Palette (Light)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Blue | `#0984e3` |
| Background | Light Gray | `#f0f2f5` |
| Card | White | `#ffffff` |
| Text Primary | Dark | `#2d3436` |
| Text Secondary | Gray | `#636e72` |
| Border | Light | `#dfe6e9` |

### Category Colors
| Category | Color | Hex |
|----------|-------|-----|
| فقه | Blue | `#0984e3` |
| عقيدة | Purple | `#6c5ce7` |
| تفسير | Green | `#00b894` |
| حديث | Red | `#e17055` |
| سيرة | Yellow | `#fdcb6e` |
| لغة | Teal | `#00cec9` |
| أصول | Pink | `#fd79a8` |
| عام | Gray | `#636e72` |

---

## 🧪 Testing Checklist

- [ ] Search works (fuzzy + exact)
- [ ] Filters: Sheikh dropdown
- [ ] Filters: Multi-category checkboxes
- [ ] Filters: Count filter
- [ ] Filters: Sort order
- [ ] Search suggestions appear with 2+ characters
- [ ] Dark mode toggle works (persists)
- [ ] Copy link works (toast appears)
- [ ] Bookmark save/remove works (persists)
- [ ] Bookmarks tab shows saved items
- [ ] Export bookmarks as JSON
- [ ] Book browser shows books by category
- [ ] Book detail shows sheikhs who taught it
- [ ] Click sheikh name → switches to index tab
- [ ] URL parameters work (shareable links)
- [ ] Pagination works (Previous/Next, page info)
- [ ] Per-sheikh page (`?sheikh=NAME`)
- [ ] PWA: manifest loads
- [ ] PWA: service worker registers
- [ ] PWA: works offline (after first load)
- [ ] Responsive on mobile (<640px)

---

## 🚀 Deployment Instructions

### GitHub Pages
1. Push all files to a GitHub repository
2. Go to Settings → Pages → Set source to `main` branch, root folder
3. Site will be live at `https://<username>.github.io/<repo>/`

### Local Testing
```bash
# Python 3 – simple HTTP server
python3 -m http.server 8000

# Node.js – serve
npx serve

# Open http://localhost:8000
```

### PWA Notes
- Must be served over HTTPS (or localhost for testing)
- Service worker caches all assets on first load
- Update `CACHE_NAME` in `sw.js` when making changes

---

## 📦 Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| Fuse.js | 7.0.0 | Fuzzy search engine |
| (No other dependencies) | - | Pure vanilla JS |

---

## 🔧 Development Commands

```bash
# Generate flat_lessons.json from Telegram export
python parse_export.py

# Create modular CSS files (see CSS refactoring commands)
# Create modular JS files (see JS refactoring commands)

# Build PWA icons (requires ImageMagick or online tool)
convert icons/logo.jpg -resize 192x192 -gravity center -extent 192x192 icons/icon-192.png
convert icons/logo.jpg -resize 512x512 -gravity center -extent 512x512 icons/icon-512.png

# Serve locally for testing
python3 -m http.server 8000
```

---

## 📝 Notes for Future Development

1. **Add more categories** – Update `CATEGORY_KEYWORDS` in `js/01-config.js`
2. **Change page size** – Update `PAGE_SIZE` in `js/01-config.js`
3. **Adjust fuzziness** – Change `threshold` in `initFuse()` (`js/08-data-loader.js`)
4. **Add new features** – Follow the modular pattern; each feature gets its own JS file
5. **Update data** – Replace `flat_lessons.json` with new export
6. **PWA updates** – Increment `CACHE_NAME` in `sw.js` when assets change

---

## 🏁 Project Status

| Phase | Status | Completion |
|-------|--------|------------|
| Data Extraction & Parsing | ✅ Complete | 100% |
| Core UI (HTML/CSS/JS) | ✅ Complete | 100% |
| Phase 1: Quick Wins | ✅ Complete | 100% |
| Phase 2: UX Features | ✅ Complete | 100% |
| Phase 3: Shareability | ✅ Complete | 100% |
| Phase 4: PWA | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |

**Total Lessons Indexed:** ~1,500+  
**Total Sheikhs:** ~50+  
**Total Books:** ~200+  

---

## Contact

**Project Maintainer:** alqaddaaree@gmail.com  
**Source Channel:** https://t.me/alawe1434  
**Repository:** [(GitHub URL)](https://github.com/alqaddaaree/yemeni-lessons)
