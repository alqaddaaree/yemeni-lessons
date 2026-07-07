/* ============================================
   URL PARAMETERS (Permalink)
   ============================================ */
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

function updateURL() {
    const state = getFilterState();
    const params = new URLSearchParams();

    if (state.q) params.set('q', state.q);
    if (state.sheikh) params.set('sheikh', state.sheikh);

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

function applyURLParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('q')) dom.searchInput.value = params.get('q');
    if (params.has('sheikh')) dom.sheikhFilter.value = params.get('sheikh');

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

    // --- Render sheikh banner after filters are applied ---
    const sheikhFromURL = params.get('sheikh');
    if (sheikhFromURL) {
        renderSheikhBanner(sheikhFromURL);
        updatePageTitle(sheikhFromURL);
    }
}
