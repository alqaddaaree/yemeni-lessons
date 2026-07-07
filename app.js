/* ============================================
 * CONFIGURATION
 * ============================================ */
const PAGE_SIZE = 50;

/* ============================================
 * STATE
 * ============================================ */
let allLessons = [];
let sheikhsSet = new Set();
let fuseInstance = null;
let filteredResults = [];
let currentPage = 1;
let totalPages = 1;

// Book index
let bookIndex = {};
let bookCategories = new Set();

/* ============================================
 * DOM REFS
 * ============================================ */
const $ = (id) => document.getElementById(id);
const dom = {
    searchInput: $('searchInput'),
    sheikhFilter: $('sheikhFilter'),
    searchScope: $('searchScope'),
    fuzzyToggle: $('fuzzyToggle'),
    countFilter: $('countFilter'),
    sortOrder: $('sortOrder'),
    results: $('results'),
    totalLessons: $('totalLessons'),
    totalSheikhs: $('totalSheikhs'),
    totalBooks: $('totalBooks'),
    resultCount: $('resultCount'),
    pageInfo: $('pageInfo'),
    prevPage: $('prevPage'),
    nextPage: $('nextPage'),
    aboutTotalLessons: $('aboutTotalLessons'),
    aboutTotalSheikhs: $('aboutTotalSheikhs'),
    aboutTotalBooks: $('aboutTotalBooks'),
    aboutUpdateDate: $('aboutUpdateDate'),
    aboutUpdateDate2: $('aboutUpdateDate2'),
    // Books tab
    bookCategoryFilter: $('bookCategoryFilter'),
    booksList: $('booksList'),
    booksCount: $('booksCount'),
    bookDetail: $('bookDetail'),
    bookDetailTitle: $('bookDetailTitle'),
    bookDetailCategory: $('bookDetailCategory'),
    bookDetailSheikhs: $('bookDetailSheikhs'),
};

/* ============================================
 * CATEGORY DETECTION
 * ============================================ */
const CATEGORY_KEYWORDS = {
    'فقه': ['فقه', 'صلاة', 'صيام', 'زكاة', 'حج', 'عمرة', 'طهارة', 'جنائز', 'أضاحي', 'بيع', 'ربا', 'نكاح', 'طلاق', 'حدود', 'قصاص', 'ديات', 'أيمان', 'نذور', 'أطعمة', 'أشربة', 'لباس', 'جهاد', 'سير', 'أحكام'],
    'عقيدة': ['عقيدة', 'توحيد', 'إيمان', 'شرك', 'كفر', 'نفاق', 'أسماء', 'صفات', 'قدر', 'إله', 'ربوبية', 'ألوهية', 'واسطية', 'طحاوية', 'تدمرية', 'حموية', 'لمعة', 'الاعتقاد'],
    'تفسير': ['تفسير', 'تيسير', 'كريم', 'منان', 'سورة', 'آية', 'قرآن', 'جزء', 'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'كهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'],
    'حديث': ['حديث', 'صحيح', 'مسلم', 'بخاري', 'سنن', 'أربعين', 'نووية', 'رياض', 'الصالحين', 'بلوغ', 'المرام', 'عمدة', 'الأحكام', 'منتقى', 'الجارود', 'مشكاة', 'مصابيح', 'ترمذي', 'نسائي', 'أبو داود', 'ابن ماجه', 'موطأ', 'مسند', 'أحمد', 'شافعي', 'مالك', 'حنبلي'],
    'سيرة': ['سيرة', 'رسول', 'نبوي', 'صلى الله عليه وسلم', 'خلفاء', 'صحابة', 'غزوة', 'بدر', 'أحد', 'خندق', 'فتح', 'مكة', 'تبوك', 'حنين', 'طائف', 'الهجرة', 'الإسراء', 'المعراج', 'السيرة النبوية', 'الفصول', 'سير'],
    'لغة': ['نحو', 'صرف', 'بلاغة', 'إعراب', 'آجرومية', 'ألفية', 'ابن مالك', 'قطر', 'الندى', 'ملحة', 'الإعراب', 'متممة', 'تحفة', 'الأطفال', 'الجزرية', 'المدخل', 'الصرف', 'الودود', 'اللطيف', 'التصريف', 'العوامل', 'المئة', 'لامية', 'الأفعال', 'البيقونية', 'مصطلح', 'الحديث', 'نخبة', 'الفكر', 'نزهة', 'النظر'],
    'أصول': ['أصول', 'فقه', 'الورقات', 'الوصول', 'سلم', 'قواعد', 'أصول الفقه', 'مذكرة', 'الشنقيطي', 'الأصول من علم الأصول', 'تسهيل', 'الطرقات', 'نظم الورقات'],
};


function detectCategory(title) {
    const lowerTitle = title.toLowerCase();
    for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const word of words) {
            if (lowerTitle.includes(word)) {
                return category;
            }
        }
    }
    return 'عام';
}

/* ============================================
 * CATEGORY UI HELPERS
 * ============================================ */
const categoryColors = {
    'فقه': 'category-fiqh',
    'عقيدة': 'category-aqeedah',
    'تفسير': 'category-tafsir',
    'حديث': 'category-hadith',
    'سيرة': 'category-sirah',
    'لغة': 'category-lughah',
    'أصول': 'category-usul',
    'عام': 'category-other',
};

const categoryLabels = {
    'فقه': 'فقه',
    'عقيدة': 'عقيدة',
    'تفسير': 'تفسير',
    'حديث': 'حديث',
    'سيرة': 'سيرة',
    'لغة': 'لغة',
    'أصول': 'أصول',
    'عام': 'عام',
};

/* ============================================
 * TABS
 * ============================================ */
function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = {
        index: document.getElementById('tab-index'),
        books: document.getElementById('tab-books'),
        bookmarks: document.getElementById('tab-bookmarks'), // <-- Added
        guide: document.getElementById('tab-guide'),
        about: document.getElementById('tab-about'),
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            Object.keys(contents).forEach(key => {
                contents[key].classList.toggle('active', key === tab);
            });

            if (tab === 'books' && Object.keys(bookIndex).length > 0) {
                renderBooks();
            }

            // Update bookmarks UI when switching to bookmarks tab
            if (tab === 'bookmarks') {
                updateBookmarksUI();
            }
        });
    });
}

/* ============================================
 * BOOK INDEX (Reverse Index)
 * ============================================ */
function buildBookIndex() {
    bookIndex = {};
    bookCategories = new Set();

    allLessons.forEach(lesson => {
        const title = lesson.title;
        const category = lesson.category;
        const sheikh = lesson.sheikh;
        const count = lesson.lessons_count;
        const link = lesson.link;

        if (!bookIndex[title]) {
            bookIndex[title] = {
                category: category,
                sheikhs: [],
                total_lessons: 0,
            };
        }

        const exists = bookIndex[title].sheikhs.some(s => s.name === sheikh);
        if (!exists) {
            bookIndex[title].sheikhs.push({
                name: sheikh,
                lessons_count: count,
                link: link,
            });
        }

        bookIndex[title].total_lessons += (count || 0);
        bookCategories.add(category);
    });

    Object.keys(bookIndex).forEach(title => {
        bookIndex[title].sheikhs.sort((a, b) => (b.lessons_count || 0) - (a.lessons_count || 0));
    });

    const totalBooks = Object.keys(bookIndex).length;
    if (dom.totalBooks) dom.totalBooks.textContent = totalBooks;
    if (dom.aboutTotalBooks) dom.aboutTotalBooks.textContent = totalBooks;
}

/* ============================================
 * RENDER BOOKS
 * ============================================ */
function renderBooks() {
    const categoryFilter = dom.bookCategoryFilter ? dom.bookCategoryFilter.value : '';
    const container = dom.booksList;

    let filteredBooks = Object.entries(bookIndex);

    // --- Category filter (multi-select) ---
    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(l => selectedCategories.includes(l.category));
    }

    filteredBooks.sort((a, b) => {
        const aSheikhs = a[1].sheikhs.length;
        const bSheikhs = b[1].sheikhs.length;
        if (aSheikhs !== bSheikhs) return bSheikhs - aSheikhs;
        return a[0].localeCompare(b[0], 'ar');
    });

    if (dom.booksCount) {
        dom.booksCount.textContent = filteredBooks.length + ' كتاب';
    }

    if (filteredBooks.length === 0) {
        container.innerHTML = '<div class="books-empty">📭 لا توجد كتب في هذا التصنيف</div>';
        return;
    }

    let html = '';
    filteredBooks.forEach(([title, data]) => {
        const category = data.category;
        const sheikhCount = data.sheikhs.length;
        const totalLessons = data.total_lessons;
        const categoryClass = categoryColors[category] || 'category-other';
        const categoryLabel = categoryLabels[category] || 'عام';

        html += `
        <div class="book-item" onclick="openBookDetail('${title.replace(/'/g, "\\'")}')">
        <span class="book-title">${title}</span>
        <div class="book-meta">
        <span class="book-category-pill ${categoryClass}">${categoryLabel}</span>
        <span class="book-sheikhs-count">👤 ${sheikhCount} شيخ</span>
        <span class="book-total-lessons">📚 ${totalLessons} درس</span>
        <span class="book-arrow">‹</span>
        </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

/* ============================================
 * OPEN BOOK DETAIL
 * ============================================ */
function openBookDetail(title) {
    const data = bookIndex[title];
    if (!data) return;

    dom.booksList.style.display = 'none';
    dom.bookDetail.style.display = 'block';

    dom.bookDetailTitle.textContent = title;

    const categoryLabel = categoryLabels[data.category] || 'عام';
    dom.bookDetailCategory.textContent = 'التصنيف: ' + categoryLabel;

    let html = '';
    data.sheikhs.forEach(sheikh => {
        const count = sheikh.lessons_count;
        const countText = count ? count + ' درس' : 'سلسلة';

        html += `
        <div class="book-sheikh-item">
        <span class="sheikh-name" onclick="switchToSheikh('${sheikh.name.replace(/'/g, "\\'")}')">${sheikh.name}</span>
        <span class="sheikh-lessons">${countText}</span>
        <a href="${sheikh.link}" target="_blank" class="sheikh-link" onclick="event.stopPropagation();">فتح 📂</a>
        </div>
        `;
    });

    dom.bookDetailSheikhs.innerHTML = html;
}

/* ============================================
 * CLOSE BOOK DETAIL
 * ============================================ */
function closeBookDetail() {
    dom.bookDetail.style.display = 'none';
    dom.booksList.style.display = 'flex';
}

/* ============================================
 * SWITCH TO INDEX TAB WITH SHEIKH FILTER
 * ============================================ */
function switchToSheikh(sheikhName) {
    // Switch to index tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="index"]').classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-index').classList.add('active');

    dom.sheikhFilter.value = sheikhName;
    applyFilters();

    window.scrollTo({ top: document.querySelector('.search-box').offsetTop - 20, behavior: 'smooth' });
}

/* ============================================
 * DATA LOADING
 * ============================================ */
async function loadData() {
    try {
        const res = await fetch('flat_lessons.json');
        if (!res.ok) throw new Error('Network response was not ok');
        allLessons = await res.json();

        allLessons.forEach(l => {
            l.category = detectCategory(l.title);
        });

        allLessons.forEach(l => sheikhsSet.add(l.sheikh));
        populateSheikhFilter();

        buildBookIndex();
        // After building bookIndex and categoriesSet
        populateCategoryCheckboxes();
        initFuse();

        const dateStr = new Date().toLocaleDateString('ar-EG');
        dom.totalLessons.textContent = allLessons.length;
        dom.totalSheikhs.textContent = sheikhsSet.size;
        dom.totalBooks.textContent = Object.keys(bookIndex).length;
        dom.aboutTotalLessons.textContent = allLessons.length;
        dom.aboutTotalSheikhs.textContent = sheikhsSet.size;
        dom.aboutTotalBooks.textContent = Object.keys(bookIndex).length;
        dom.aboutUpdateDate.textContent = dateStr;
        dom.aboutUpdateDate2.textContent = dateStr;

        // Apply theme
        applyTheme(getPreferredTheme());

        renderBooks();

        // --- Apply URL parameters ---
        applyURLParams(); // <-- This replaces applyFilters() on load

    } catch (err) {
        console.error('Error loading data:', err);
        dom.results.innerHTML =
        '<div class="no-results">❌ فشل تحميل البيانات. تأكد من وجود ملف <code>flat_lessons.json</code> في نفس المجلد.</div>';
        if (dom.booksList) {
            dom.booksList.innerHTML = '<div class="books-empty">❌ فشل تحميل البيانات</div>';
        }
    }
}

/* ============================================
 * FUSE.JS INIT
 * ============================================ */
function initFuse() {
    const fuseOptions = {
        keys: ['title', 'sheikh'],
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        useExtendedSearch: true,
        ignoreDiacritics: true,
    };
    fuseInstance = new Fuse(allLessons, fuseOptions);
}

/* ============================================
 * UI HELPERS
 * ============================================ */
function populateSheikhFilter() {
    const select = dom.sheikhFilter;
    while (select.options.length > 1) {
        select.remove(1);
    }
    const sorted = Array.from(sheikhsSet).sort((a, b) => a.localeCompare(b, 'ar'));
    sorted.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    });
}

function getSearchKeys(scope) {
    if (scope === 'title') return ['title'];
    if (scope === 'sheikh') return ['sheikh'];
    return ['title', 'sheikh'];
}

/* ============================================
 * MAIN FILTER LOGIC
 * ============================================ */
function applyFilters() {
    const query = dom.searchInput.value.trim();
    const sheikhFilter = dom.sheikhFilter.value;
    // categoryFilter removed - using checkboxes instead
    const scope = dom.searchScope.value;
    const fuzzyMode = dom.fuzzyToggle.value === 'fuzzy';
    const countFilter = dom.countFilter.value;
    const sortOrder = dom.sortOrder.value;

    let filtered = [];

    // --- Search ---
    if (query) {
        if (fuzzyMode) {
            const keys = getSearchKeys(scope);
            const results = fuseInstance.search(query, { keys });
            filtered = results.map(r => ({ ...r.item, _score: r.score }));
        } else {
            const q = query.toLowerCase();
            filtered = allLessons.filter(l => {
                if (scope === 'title') return l.title.toLowerCase().includes(q);
                if (scope === 'sheikh') return l.sheikh.toLowerCase().includes(q);
                return l.search_text.includes(q);
            });
        }
    } else {
        filtered = [...allLessons];
    }

    // --- Sheikh filter ---
    if (sheikhFilter) {
        filtered = filtered.filter(l => l.sheikh === sheikhFilter);
    }

    // --- Category filter (multi-select) ---
    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(l => selectedCategories.includes(l.category));
    }

    // --- Count filter ---
    if (countFilter !== 'any') {
        filtered = filtered.filter(l => {
            const count = l.lessons_count;
            if (countFilter === 'null') return count === null || count === undefined;
            if (count === null || count === undefined) return false;
            if (countFilter === '1-10') return count >= 1 && count <= 10;
            if (countFilter === '11-50') return count >= 11 && count <= 50;
            if (countFilter === '51-100') return count >= 51 && count <= 100;
            if (countFilter === '100+') return count > 100;
            return true;
        });
    }

    // --- Sorting ---
    filtered = sortLessons(filtered, sortOrder);

    // --- Store & reset pagination ---
    filteredResults = filtered;
    currentPage = 1;
    totalPages = Math.ceil(filteredResults.length / PAGE_SIZE) || 1;

    dom.resultCount.textContent = filteredResults.length;

    renderPage();
    updatePagination();

    // --- Update URL ---
    updateURL();
}

/* ============================================
 * SORTING
 * ============================================ */
function sortLessons(lessons, order) {
    const copy = [...lessons];
    switch (order) {
        case 'lessons-desc':
            return copy.sort((a, b) => (b.lessons_count || 0) - (a.lessons_count || 0));
        case 'lessons-asc':
            return copy.sort((a, b) => (a.lessons_count || 0) - (b.lessons_count || 0));
        case 'date-desc':
            return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'alpha':
            return copy.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        case 'relevance':
            return copy.sort((a, b) => (a._score || 1) - (b._score || 1));
        default:
            return copy;
    }
}

/* ============================================
 * PAGINATION
 * ============================================ */
function renderPage() {
    const container = dom.results;
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, filteredResults.length);
    const pageItems = filteredResults.slice(start, end);

    if (pageItems.length === 0) {
        container.innerHTML = '<div class="no-results">🔍 لا توجد نتائج مطابقة</div>';
        return;
    }

    let html = '';
    pageItems.forEach(lesson => {
        const count = lesson.lessons_count;
        let countHtml;
        if (count === null || count === undefined) {
            countHtml = '<span class="result-count series">📚 سلسلة</span>';
        } else {
            countHtml = '<span class="result-count">' + count + ' درس</span>';
        }

        let dateDisplay = '';
        if (lesson.date) {
            try {
                const d = new Date(lesson.date);
                dateDisplay = d.toLocaleDateString('ar-EG');
            } catch (_) { /* ignore */ }
        }

        const fuzzyBadge = (lesson._score !== undefined) ? '<span class="fuzzy-badge">🎯</span>' : '';
        const categoryClass = categoryColors[lesson.category] || 'category-other';
        const categoryLabel = categoryLabels[lesson.category] || 'عام';

        // Inside renderPage(), in the html += section, add:
        const isSaved = isBookmarked(lesson.link);
        const bookmarkBtn = `<button class="btn-bookmark ${isSaved ? 'bookmarked' : ''}"
        data-link="${lesson.link}"
        onclick="toggleBookmark('${lesson.link}', '${lesson.title.replace(/'/g, "\\'")}', '${lesson.sheikh.replace(/'/g, "\\'")}')"
        title="${isSaved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
        ${isSaved ? '⭐' : '☆'}
        </button>`;

        html += `
        <div class="result-item">
        <div class="result-info">
        <div class="result-sheikh">${lesson.sheikh}</div>
        <div class="result-title">📖 ${lesson.title} ${fuzzyBadge}</div>
        <div class="result-meta">
        ${countHtml}
        <span class="category-pill ${categoryClass}">${categoryLabel}</span>
        ${dateDisplay ? '<span class="result-date">📅 ' + dateDisplay + '</span>' : ''}
        </div>
        </div>
        <div class="result-link">
        <button class="btn-bookmark ${isSaved ? 'bookmarked' : ''}"
        data-link="${lesson.link}"
        onclick="toggleBookmark('${lesson.link}', '${lesson.title.replace(/'/g, "\\'")}', '${lesson.sheikh.replace(/'/g, "\\'")}')"
        title="${isSaved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
        ${isSaved ? '⭐' : '☆'}
        </button>
        <button class="btn-copy" onclick="copyLink('${lesson.link}')" title="نسخ الرابط">📋</button>
        <a href="${lesson.link}" target="_blank">فتح 📂</a>
        </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

function updatePagination() {
    dom.pageInfo.textContent = 'صفحة ' + currentPage + ' من ' + totalPages;
    dom.prevPage.disabled = currentPage <= 1;
    dom.nextPage.disabled = currentPage >= totalPages;
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
    updatePagination();
    window.scrollTo({ top: document.querySelector('.search-box').offsetTop - 20, behavior: 'smooth' });
}

/* ============================================
 * SEARCH INPUT (with debounce)
 * ============================================ */
let searchTimeout = null;

function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        applyFilters();
    }, 300);
}

/* ============================================
 * CLEAR FILTERS
 * ============================================ */
function clearFilters() {
    dom.searchInput.value = '';
    dom.sheikhFilter.value = '';
    clearCategoryCheckboxes(); // <-- Added
    dom.searchScope.value = 'all';
    dom.fuzzyToggle.value = 'fuzzy';
    dom.countFilter.value = 'any';
    dom.sortOrder.value = 'lessons-desc';
    applyFilters();
}

/* ============================================
 * START
 * ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    loadData();
});

/* ============================================
 *  DARK MODE
 *  ============================================ */
function getPreferredTheme() {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/* ============================================
 *  COPY LINK
 *  ============================================ */
function copyLink(link) {
    if (!navigator.clipboard) {
        // Fallback for older browsers
        fallbackCopyLink(link);
        return;
    }

    navigator.clipboard.writeText(link)
    .then(function() {
        showToast('✅ تم نسخ الرابط بنجاح!', 'success');
        // Visual feedback on button
        const buttons = document.querySelectorAll('.btn-copy');
        buttons.forEach(function(btn) {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(link)) {
                btn.textContent = '✓';
                btn.classList.add('copied');
                setTimeout(function() {
                    btn.textContent = '📋';
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    })
    .catch(function() {
        fallbackCopyLink(link);
    });
}

function fallbackCopyLink(link) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = link;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ تم نسخ الرابط بنجاح!', 'success');
    } catch (err) {
        showToast('❌ فشل نسخ الرابط. الرجاء نسخه يدويًا.', 'error');
    }
    document.body.removeChild(textarea);
}

/* ============================================
 *  TOAST NOTIFICATION
 *  ============================================ */
let toastTimer = null;

function showToast(message, type) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function() {
        toast.classList.add('show');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 400);
    }, 2500);
}

/* ============================================
 * SUGGESTIONS / AUTOCOMPLETE
 * ============================================ */
let suggestionTimeout = null;
let currentSuggestions = [];

function getSuggestions(query) {
    if (!query || query.length < 2) {
        hideSuggestions();
        return;
    }

    // Use Fuse.js to search across title and sheikh
    const results = fuseInstance.search(query, {
        keys: ['title', 'sheikh'],
        limit: 10,
        includeMatches: true,
    });

    if (results.length === 0) {
        showEmptySuggestions();
        return;
    }

    // Build suggestions list
    const suggestions = results.map(result => {
        const item = result.item;
        // Determine type
        let type = 'درس';
        let badge = '';
        if (item.title.toLowerCase().includes(query.toLowerCase())) {
            type = 'كتاب';
        } else if (item.sheikh.toLowerCase().includes(query.toLowerCase())) {
            type = 'شيخ';
        } else {
            // Check category
            const cat = item.category || 'عام';
            if (cat !== 'عام') {
                type = 'تصنيف';
                badge = cat;
            }
        }

        // Highlight matched text
        let displayTitle = item.title;
        let displaySheikh = item.sheikh;
        if (result.matches) {
            result.matches.forEach(match => {
                if (match.key === 'title') {
                    displayTitle = highlightMatch(item.title, match.indices);
                } else if (match.key === 'sheikh') {
                    displaySheikh = highlightMatch(item.sheikh, match.indices);
                }
            });
        }

        return {
            text: `${displayTitle} — ${displaySheikh}`,
            rawTitle: item.title,
            rawSheikh: item.sheikh,
            link: item.link,
            type: type,
            badge: badge,
            // For click action
            action: function() {
                dom.searchInput.value = item.title;
                hideSuggestions();
                applyFilters();
            }
        };
    });

    // Remove duplicates (by rawTitle + rawSheikh)
    const seen = new Set();
    const unique = suggestions.filter(s => {
        const key = s.rawTitle + '|' + s.rawSheikh;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Limit to 8
    const final = unique.slice(0, 8);

    if (final.length === 0) {
        showEmptySuggestions();
        return;
    }

    renderSuggestions(final);
}

function highlightMatch(text, indices) {
    // indices is array of [start, end] pairs
    if (!indices || indices.length === 0) return text;
    let result = '';
    let lastIdx = 0;
    const sorted = indices.sort((a, b) => a[0] - b[0]);
    for (const [start, end] of sorted) {
        if (start > lastIdx) {
            result += text.substring(lastIdx, start);
        }
        result += `<mark>${text.substring(start, end + 1)}</mark>`;
        lastIdx = end + 1;
    }
    if (lastIdx < text.length) {
        result += text.substring(lastIdx);
    }
    return result;
}

function renderSuggestions(items) {
    const container = document.getElementById('suggestions');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
        <span class="suggestion-text">${item.text}</span>
        <span class="suggestion-type">${item.type}</span>
        ${item.badge ? `<span class="suggestion-badge">${item.badge}</span>` : ''}
        `;
        div.addEventListener('click', item.action);
        container.appendChild(div);
    });
    container.style.display = 'block';
    currentSuggestions = items;
}

function showEmptySuggestions() {
    const container = document.getElementById('suggestions');
    if (!container) return;
    container.innerHTML = `<div class="suggestion-empty">🔍 لا توجد نتائج</div>`;
    container.style.display = 'block';
    currentSuggestions = [];
}

function hideSuggestions() {
    const container = document.getElementById('suggestions');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    currentSuggestions = [];
}

// Override onSearchInput to use suggestions
const originalOnSearchInput = onSearchInput;
onSearchInput = function() {
    const query = dom.searchInput.value.trim();
    clearTimeout(suggestionTimeout);
    if (query.length >= 2) {
        suggestionTimeout = setTimeout(() => {
            getSuggestions(query);
        }, 200);
    } else {
        hideSuggestions();
    }
    // Still apply filters (debounced)
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
};

// Close suggestions on Escape or click outside
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideSuggestions();
    }
});

document.addEventListener('click', function(e) {
    const suggestions = document.getElementById('suggestions');
    const input = dom.searchInput;
    if (suggestions && !suggestions.contains(e.target) && e.target !== input) {
        hideSuggestions();
    }
});

/* ============================================
 *  URL PARAMETERS (Permalink)
 *  ============================================ */

/**
 * Get all current filter values
 */
function getFilterState() {
    const selectedCategories = getSelectedCategories();
    return {
        q: dom.searchInput.value.trim(),
        sheikh: dom.sheikhFilter.value,
        categories: selectedCategories.join(','),
        scope: dom.searchScope.value,
        fuzzy: dom.fuzzyToggle.value,
        count: dom.countFilter.value,
        sort: dom.sortOrder.value,
        page: currentPage.toString()
    };
}

/**
 * Update URL with current filter state
 */
function updateURL() {
    const state = getFilterState();
    const params = new URLSearchParams();

    if (state.q) params.set('q', state.q);
    if (state.sheikh) params.set('sheikh', state.sheikh);

    // Handle multiple categories
    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
    }

    if (state.scope && state.scope !== 'all') params.set('scope', state.scope);
    if (state.fuzzy && state.fuzzy !== 'fuzzy') params.set('fuzzy', state.fuzzy);
    if (state.count && state.count !== 'any') params.set('count', state.count);
    if (state.sort && state.sort !== 'lessons-desc') params.set('sort', state.sort);
    if (state.page && state.page !== '1') params.set('page', state.page);

    const url = params.toString() ? '?' + params.toString() : window.location.pathname;
    window.history.replaceState({ filters: state }, '', url);
}

/**
 * Read URL parameters and apply filters
 */
function applyURLParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('q')) dom.searchInput.value = params.get('q');
    if (params.has('sheikh')) dom.sheikhFilter.value = params.get('sheikh');

    // Handle multiple categories
    if (params.has('categories')) {
        const categories = params.get('categories').split(',');
        const container = document.getElementById('categoryCheckboxes');
        if (container) {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = categories.includes(cb.value);
            });
        }
    }

    if (params.has('scope')) dom.searchScope.value = params.get('scope');
    if (params.has('fuzzy')) dom.fuzzyToggle.value = params.get('fuzzy');
    if (params.has('count')) dom.countFilter.value = params.get('count');
    if (params.has('sort')) dom.sortOrder.value = params.get('sort');
    if (params.has('page')) currentPage = parseInt(params.get('page')) || 1;

    applyFilters();

    if (params.has('page')) {
        const page = parseInt(params.get('page')) || 1;
        if (page !== currentPage) {
            currentPage = page;
            renderPage();
            updatePagination();
        }
    }
}

/**
 * Override applyFilters to also update URL
 */
// Replace your existing applyFilters function with this one
function applyFilters() {
    const query = dom.searchInput.value.trim();
    const sheikhFilter = dom.sheikhFilter.value;
    const scope = dom.searchScope.value;
    const fuzzyMode = dom.fuzzyToggle.value === 'fuzzy';
    const countFilter = dom.countFilter.value;
    const sortOrder = dom.sortOrder.value;

    let filtered = [];

    // --- Search ---
    if (query) {
        if (fuzzyMode) {
            const keys = getSearchKeys(scope);
            const results = fuseInstance.search(query, { keys });
            filtered = results.map(r => ({ ...r.item, _score: r.score }));
        } else {
            const q = query.toLowerCase();
            filtered = allLessons.filter(l => {
                if (scope === 'title') return l.title.toLowerCase().includes(q);
                if (scope === 'sheikh') return l.sheikh.toLowerCase().includes(q);
                return l.search_text.includes(q);
            });
        }
    } else {
        filtered = [...allLessons];
    }

    // --- Sheikh filter ---
    if (sheikhFilter) {
        filtered = filtered.filter(l => l.sheikh === sheikhFilter);
    }

    // --- Category filter ---
    // --- Category filter (multi-select) ---
    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(l => selectedCategories.includes(l.category));
    }

    // --- Count filter ---
    if (countFilter !== 'any') {
        filtered = filtered.filter(l => {
            const count = l.lessons_count;
            if (countFilter === 'null') return count === null || count === undefined;
            if (count === null || count === undefined) return false;
            if (countFilter === '1-10') return count >= 1 && count <= 10;
            if (countFilter === '11-50') return count >= 11 && count <= 50;
            if (countFilter === '51-100') return count >= 51 && count <= 100;
            if (countFilter === '100+') return count > 100;
            return true;
        });
    }

    // --- Sorting ---
    filtered = sortLessons(filtered, sortOrder);

    // --- Store & reset pagination ---
    filteredResults = filtered;
    currentPage = 1;
    totalPages = Math.ceil(filteredResults.length / PAGE_SIZE) || 1;

    dom.resultCount.textContent = filteredResults.length;

    renderPage();
    updatePagination();

    // --- Update URL ---
    updateURL();
}

/**
 * Override goToPage to update URL when page changes
 */
// Replace your existing goToPage function with this one
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
    updatePagination();
    updateURL(); // <-- Added this
    window.scrollTo({ top: document.querySelector('.search-box').offsetTop - 20, behavior: 'smooth' });
}

/**
 * Override clearFilters to reset URL
 */
// Replace your existing clearFilters function with this one
function clearFilters() {
    dom.searchInput.value = '';
    dom.sheikhFilter.value = '';
    dom.categoryFilter.value = '';
    dom.searchScope.value = 'all';
    dom.fuzzyToggle.value = 'fuzzy';
    dom.countFilter.value = 'any';
    dom.sortOrder.value = 'lessons-desc';
    applyFilters();
    // URL will be updated by applyFilters
}


/* ============================================
 *  BOOKMARKS (Save/Load from localStorage)
 *  ============================================ */
const BOOKMARKS_KEY = 'sada_bookmarks';

/**
 * Get all bookmarks from localStorage
 */
function getBookmarks() {
    try {
        const data = localStorage.getItem(BOOKMARKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
        console.error('Error saving bookmarks:', e);
    }
}

/**
 * Check if a lesson is bookmarked
 */
function isBookmarked(link) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.link === link);
}

/**
 * Toggle bookmark for a lesson
 */
function toggleBookmark(link, title, sheikh) {
    let bookmarks = getBookmarks();
    const existing = bookmarks.findIndex(b => b.link === link);

    if (existing !== -1) {
        // Remove bookmark
        bookmarks.splice(existing, 1);
        saveBookmarks(bookmarks);
        showToast('🗑️ تم إزالة الدرس من المفضلة', 'success');
        // Update button
        updateBookmarkButton(link, false);
    } else {
        // Add bookmark
        const bookmark = {
            link: link,
            title: title,
            sheikh: sheikh,
            saved_at: new Date().toISOString(),
        };
        bookmarks.push(bookmark);
        saveBookmarks(bookmarks);
        showToast('⭐ تم حفظ الدرس في المفضلة', 'success');
        // Update button
        updateBookmarkButton(link, true);
    }

    // Update bookmarks count and list if on bookmarks tab
    updateBookmarksUI();
}

/**
 * Update bookmark button state
 */
function updateBookmarkButton(link, isBookmarked) {
    const buttons = document.querySelectorAll('.btn-bookmark');
    buttons.forEach(btn => {
        if (btn.dataset.link === link) {
            btn.textContent = isBookmarked ? '⭐' : '☆';
            btn.classList.toggle('bookmarked', isBookmarked);
        }
    });
}

/**
 * Update bookmarks UI (count + list)
 */
function updateBookmarksUI() {
    const bookmarks = getBookmarks();

    // Update count
    const countEl = document.getElementById('bookmarksCount');
    if (countEl) {
        countEl.textContent = bookmarks.length + ' درس محفوظ';
    }

    // Update list if on bookmarks tab
    const listEl = document.getElementById('bookmarksList');
    if (listEl && document.getElementById('tab-bookmarks').classList.contains('active')) {
        renderBookmarksList(bookmarks);
    }
}

/**
 * Render bookmarks list
 */
function renderBookmarksList(bookmarks) {
    const container = document.getElementById('bookmarksList');
    if (!container) return;

    if (bookmarks.length === 0) {
        container.innerHTML = '<div class="bookmarks-empty">⭐ لم تقم بحفظ أي درس بعد. ابحث عن درس و اضغط على ⭐ لحفظه.</div>';
        return;
    }

    let html = '';
    bookmarks.forEach(bookmark => {
        const date = new Date(bookmark.saved_at);
        const dateStr = date.toLocaleDateString('ar-EG');

        html += `
        <div class="bookmark-item">
        <div class="bookmark-info">
        <div class="bookmark-sheikh">${bookmark.sheikh}</div>
        <div class="bookmark-title">📖 ${bookmark.title}</div>
        <div class="bookmark-meta">
        <span class="bookmark-date">📅 ${dateStr}</span>
        </div>
        </div>
        <div class="bookmark-actions">
        <button class="btn btn-remove" onclick="removeBookmark('${bookmark.link}')" title="إزالة من المفضلة">🗑️</button>
        <a href="${bookmark.link}" target="_blank" class="btn-link">فتح 📂</a>
        </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Remove a single bookmark
 */
function removeBookmark(link) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => b.link !== link);
    saveBookmarks(bookmarks);
    updateBookmarksUI();
    // Update button if it exists in current view
    updateBookmarkButton(link, false);
    showToast('🗑️ تم إزالة الدرس من المفضلة', 'success');
}

/**
 * Clear all bookmarks
 */
function clearBookmarks() {
    if (confirm('هل أنت متأكد من حذف جميع الدروس من المفضلة؟')) {
        saveBookmarks([]);
        updateBookmarksUI();
        // Update all bookmark buttons
        document.querySelectorAll('.btn-bookmark').forEach(btn => {
            btn.textContent = '☆';
            btn.classList.remove('bookmarked');
        });
        showToast('🗑️ تم حذف جميع الدروس من المفضلة', 'success');
    }
}

/**
 * Export bookmarks as JSON
 */
function exportBookmarks() {
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        showToast('⚠️ لا توجد دروس محفوظة للتصدير', 'error');
        return;
    }

    const data = {
        exported_at: new Date().toISOString(),
        total: bookmarks.length,
        bookmarks: bookmarks,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sada_bookmarks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅ تم تصدير المفضلة بنجاح', 'success');
}

/**
 * Import bookmarks from JSON (optional)
 */
function importBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                const bookmarks = data.bookmarks || data;
                if (!Array.isArray(bookmarks)) {
                    showToast('❌ ملف غير صالح', 'error');
                    return;
                }
                const existing = getBookmarks();
                const merged = [...existing, ...bookmarks];
                // Remove duplicates by link
                const unique = merged.filter((item, index, self) =>
                index === self.findIndex(b => b.link === item.link)
                );
                saveBookmarks(unique);
                updateBookmarksUI();
                // Refresh bookmark buttons
                document.querySelectorAll('.btn-bookmark').forEach(btn => {
                    const isSaved = unique.some(b => b.link === btn.dataset.link);
                    btn.textContent = isSaved ? '⭐' : '☆';
                    btn.classList.toggle('bookmarked', isSaved);
                });
                showToast(`✅ تم استيراد ${bookmarks.length} درس بنجاح`, 'success');
            } catch (err) {
                showToast('❌ ملف غير صالح', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

/* ============================================
 *  CATEGORY CHECKBOXES
 *  ============================================ */
function populateCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return;

    // Get category counts from bookIndex or allLessons
    const categoryCounts = {};
    allLessons.forEach(l => {
        const cat = l.category || 'عام';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Sort categories by count (descending) then alphabetically
    const sortedCategories = Object.keys(categoryCounts).sort((a, b) => {
        if (categoryCounts[a] !== categoryCounts[b]) {
            return categoryCounts[b] - categoryCounts[a];
        }
        return a.localeCompare(b, 'ar');
    });

    // Category colors mapping
    const categoryColors = {
        'فقه': 'category-fiqh',
        'عقيدة': 'category-aqeedah',
        'تفسير': 'category-tafsir',
        'حديث': 'category-hadith',
        'سيرة': 'category-sirah',
        'لغة': 'category-lughah',
        'أصول': 'category-usul',
        'عام': 'category-other'
    };

    // Get selected categories from URL or stored state
    const selectedCategories = getSelectedCategories();

    let html = '';
    sortedCategories.forEach(cat => {
        const count = categoryCounts[cat] || 0;
        const colorClass = categoryColors[cat] || 'category-other';
        const isChecked = selectedCategories.includes(cat) ? 'checked' : '';

        html += `
        <label class="category-checkbox ${colorClass}">
        <input type="checkbox"
        value="${cat}"
        ${isChecked}
        onchange="onCategoryCheckboxChange()">
        <span class="category-label">${cat}</span>
        <span class="category-count">${count}</span>
        </label>
        `;
    });

    container.innerHTML = html;
}

/**
 * Get selected categories from checkboxes
 */
function getSelectedCategories() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return [];
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Handle category checkbox change
 */
function onCategoryCheckboxChange() {
    applyFilters();
}

/**
 * Clear category checkboxes
 */
function clearCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}
