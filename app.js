/* ============================================
   CONFIGURATION
   ============================================ */
const PAGE_SIZE = 50;

/* ============================================
   STATE
   ============================================ */
let allLessons = [];
let sheikhsSet = new Set();
let categoriesSet = new Set();
let fuseInstance = null;
let filteredResults = [];
let currentPage = 0;
let isLoadingMore = false;
let hasMore = true;

/* ============================================
   DOM REFS (cached for performance)
   ============================================ */
const $ = (id) => document.getElementById(id);
const dom = {
    searchInput: $('searchInput'),
    sheikhFilter: $('sheikhFilter'),
    categoryFilter: $('categoryFilter'),
    searchScope: $('searchScope'),
    fuzzyToggle: $('fuzzyToggle'),
    countFilter: $('countFilter'),
    sortOrder: $('sortOrder'),
    results: $('results'),
    totalLessons: $('totalLessons'),
    totalSheikhs: $('totalSheikhs'),
    resultCount: $('resultCount'),
    updateDate: $('updateDate'),
};

/* ============================================
   CATEGORY DETECTION
   ============================================ */
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
   CATEGORY UI HELPERS
   ============================================ */
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
   DATA LOADING
   ============================================ */
async function loadData() {
    try {
        const res = await fetch('flat_lessons.json');
        if (!res.ok) throw new Error('Network response was not ok');
        allLessons = await res.json();

        // Add category to each lesson
        allLessons.forEach(l => {
            l.category = detectCategory(l.title);
            categoriesSet.add(l.category);
        });

        // Build sheikh list
        allLessons.forEach(l => sheikhsSet.add(l.sheikh));
        populateSheikhFilter();

        // Initialize Fuse.js
        initFuse();

        // Update stats
        dom.totalLessons.textContent = allLessons.length;
        dom.totalSheikhs.textContent = sheikhsSet.size;
        dom.updateDate.textContent = new Date().toLocaleDateString('ar-EG');

        // Initial filter
        filterResults();

        // Setup scroll listener
        setupScrollListener();
    } catch (err) {
        console.error('Error loading data:', err);
        dom.results.innerHTML =
            `<div class="no-results">❌ فشل تحميل البيانات. تأكد من وجود ملف <code>flat_lessons.json</code> في نفس المجلد.</div>`;
    }
}

/* ============================================
   FUSE.JS INIT
   ============================================ */
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
   UI HELPERS
   ============================================ */
function populateSheikhFilter() {
    const select = dom.sheikhFilter;
    // Clear existing options (except the first one)
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

function getFilterValue(id) {
    return document.getElementById(id).value;
}

/* ============================================
   MAIN FILTER LOGIC
   ============================================ */
function filterResults() {
    const query = dom.searchInput.value.trim();
    const sheikhFilter = dom.sheikhFilter.value;
    const categoryFilter = dom.categoryFilter.value;
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
    if (categoryFilter) {
        filtered = filtered.filter(l => l.category === categoryFilter);
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
    currentPage = 0;
    hasMore = true;
    dom.resultCount.textContent = filteredResults.length;

    renderBatch();
}

/* ============================================
   SORTING
   ============================================ */
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
   RENDER BATCH (Lazy Loading)
   ============================================ */
function renderBatch() {
    const container = dom.results;
    const start = currentPage * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, filteredResults.length);
    const batch = filteredResults.slice(start, end);

    if (batch.length === 0) {
        hasMore = false;
        if (currentPage === 0) {
            container.innerHTML = '<div class="no-results">🔍 لا توجد نتائج مطابقة</div>';
        }
        return;
    }

    // Clear on first page
    if (currentPage === 0) {
        container.innerHTML = '';
    }

    let html = '';
    batch.forEach(lesson => {
        const count = lesson.lessons_count;
        let countHtml;
        if (count === null || count === undefined) {
            countHtml = `<span class="result-count series">📚 سلسلة</span>`;
        } else {
            countHtml = `<span class="result-count">${count} درس</span>`;
        }

        let dateDisplay = '';
        if (lesson.date) {
            try {
                const d = new Date(lesson.date);
                dateDisplay = d.toLocaleDateString('ar-EG');
            } catch (_) { /* ignore */ }
        }

        const fuzzyBadge = (lesson._score !== undefined) ? `<span class="fuzzy-badge">🎯</span>` : '';
        const categoryClass = categoryColors[lesson.category] || 'category-other';
        const categoryLabel = categoryLabels[lesson.category] || 'عام';

        html += `
            <div class="result-item">
                <div class="result-info">
                    <div class="result-sheikh">${lesson.sheikh}</div>
                    <div class="result-title">📖 ${lesson.title} ${fuzzyBadge}</div>
                    <div class="result-meta">
                        ${countHtml}
                        <span class="category-pill ${categoryClass}">${categoryLabel}</span>
                        ${dateDisplay ? `<span class="result-date">📅 ${dateDisplay}</span>` : ''}
                    </div>
                </div>
                <div class="result-link">
                    <a href="${lesson.link}" target="_blank">فتح 📂</a>
                </div>
            </div>
        `;
    });

    container.insertAdjacentHTML('beforeend', html);

    currentPage++;
    hasMore = end < filteredResults.length;

    // Clean up loader
    const loader = document.querySelector('.loading-more');
    if (loader) loader.remove();
}

/* ============================================
   INFINITE SCROLL
   ============================================ */
function setupScrollListener() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (!hasMore || isLoadingMore) {
                    ticking = false;
                    return;
                }
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                if (scrollY + windowHeight >= documentHeight - 200) {
                    loadMore();
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

function loadMore() {
    if (isLoadingMore || !hasMore) return;
    isLoadingMore = true;
    setTimeout(() => {
        renderBatch();
        isLoadingMore = false;
    }, 100);
}

/* ============================================
   CLEAR FILTERS
   ============================================ */
function clearFilters() {
    dom.searchInput.value = '';
    dom.sheikhFilter.value = '';
    dom.categoryFilter.value = '';
    dom.searchScope.value = 'all';
    dom.fuzzyToggle.value = 'fuzzy';
    dom.countFilter.value = 'any';
    dom.sortOrder.value = 'lessons-desc';
    filterResults();
}

/* ============================================
   START
   ============================================ */
document.addEventListener('DOMContentLoaded', loadData);
