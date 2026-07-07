/* ============================================
   CATEGORY DETECTION
   ============================================ */
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
   CATEGORY CHECKBOX HELPERS
   ============================================ */
function getSelectedCategories() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return [];
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function clearCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    if (!container) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

function onCategoryCheckboxChange() {
    applyFilters();
}

function getSearchKeys(scope) {
    if (scope === 'title') return ['title'];
    if (scope === 'sheikh') return ['sheikh'];
    return ['title', 'sheikh'];
}
