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

function populateCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return;

    const categoryCounts = {};
    allLessons.forEach(l => {
        const cat = l.category || 'عام';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const sortedCategories = Object.keys(categoryCounts).sort((a, b) => {
        if (categoryCounts[a] !== categoryCounts[b]) {
            return categoryCounts[b] - categoryCounts[a];
        }
        return a.localeCompare(b, 'ar');
    });

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

/* ============================================
   DATA LOADING
   ============================================ */
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

        applyTheme(getPreferredTheme());
        renderBooks();
        applyURLParams();

    } catch (err) {
        console.error('Error loading data:', err);
        dom.results.innerHTML =
            '<div class="no-results">❌ فشل تحميل البيانات. تأكد من وجود ملف <code>flat_lessons.json</code> في نفس المجلد.</div>';
        if (dom.booksList) {
            dom.booksList.innerHTML = '<div class="books-empty">❌ فشل تحميل البيانات</div>';
        }
    }
}
