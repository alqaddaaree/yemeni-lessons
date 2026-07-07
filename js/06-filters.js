/* ============================================
   MAIN FILTER LOGIC
   ============================================ */
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
console.log('applyFilters: rendering page with', filteredResults.length, 'results'); // <-- Add this
    renderPage();
    updatePagination();

    // --- Update URL ---
    updateURL();

    // --- Update sheikh banner and page title ---
    const sheikhFromFilter = dom.sheikhFilter.value;
    if (sheikhFromFilter) {
        renderSheikhBanner(sheikhFromFilter);
        updatePageTitle(sheikhFromFilter);
        updateSheikhLessonCount();
    } else {
        renderSheikhBanner(null);
        updatePageTitle(null);
    }
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
   CLEAR FILTERS
   ============================================ */
function clearFilters() {
    dom.searchInput.value = '';
    dom.sheikhFilter.value = '';
    clearCategoryCheckboxes();
    dom.searchScope.value = 'all';
    dom.fuzzyToggle.value = 'fuzzy';
    dom.countFilter.value = 'any';
    dom.sortOrder.value = 'lessons-desc';
    applyFilters();
}
