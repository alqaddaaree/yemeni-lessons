/* ============================================
   SUGGESTIONS / AUTOCOMPLETE
   ============================================ */

// --- This function overrides the search input handler ---
// It's defined here (not using "original" reference)

function onSearchInput() {
    const query = dom.searchInput.value.trim();

    // Handle suggestions
    clearTimeout(suggestionTimeout);
    if (query.length >= 2) {
        suggestionTimeout = setTimeout(() => {
            getSuggestions(query);
        }, 200);
    } else {
        hideSuggestions();
    }

    // Apply filters (debounced)
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

// --- Suggestion functions ---
function getSuggestions(query) {
    if (!query || query.length < 2) {
        hideSuggestions();
        return;
    }

    const results = fuseInstance.search(query, {
        keys: ['title', 'sheikh'],
        limit: 10,
        includeMatches: true,
    });

    if (results.length === 0) {
        showEmptySuggestions();
        return;
    }

    const suggestions = results.map(result => {
        const item = result.item;
        let type = 'درس';
        let badge = '';
        if (item.title.toLowerCase().includes(query.toLowerCase())) {
            type = 'كتاب';
        } else if (item.sheikh.toLowerCase().includes(query.toLowerCase())) {
            type = 'شيخ';
        } else {
            const cat = item.category || 'عام';
            if (cat !== 'عام') {
                type = 'تصنيف';
                badge = cat;
            }
        }

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
            action: function() {
                dom.searchInput.value = item.title;
                hideSuggestions();
                applyFilters();
            }
        };
    });

    const seen = new Set();
    const unique = suggestions.filter(s => {
        const key = s.rawTitle + '|' + s.rawSheikh;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const final = unique.slice(0, 8);

    if (final.length === 0) {
        showEmptySuggestions();
        return;
    }

    renderSuggestions(final);
}

function highlightMatch(text, indices) {
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