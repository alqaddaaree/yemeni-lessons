/* ============================================
   RENDER PAGE
   ============================================ */
function renderPage() {
    console.log('renderPage called, filteredResults length:', filteredResults.length); // <-- Add this
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
                    ${bookmarkBtn}
                    <button class="btn-copy" onclick="copyLink('${lesson.link}')" title="نسخ الرابط">📋</button>
                    <a href="${lesson.link}" target="_blank">فتح 📂</a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ============================================
   PAGINATION CONTROLS
   ============================================ */
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
    updateURL();
    window.scrollTo({ top: document.querySelector('.search-box').offsetTop - 20, behavior: 'smooth' });
}
