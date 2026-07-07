/* ============================================
   BOOK INDEX (Reverse Index)
   ============================================ */
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
   RENDER BOOKS
   ============================================ */
function renderBooks() {
    const categoryFilter = dom.bookCategoryFilter ? dom.bookCategoryFilter.value : '';
    const container = dom.booksList;

    let filteredBooks = Object.entries(bookIndex);

    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length > 0) {
        filteredBooks = filteredBooks.filter(([title, data]) => selectedCategories.includes(data.category));
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
                    <span class="book-sheikhs-count">${sheikhCount} شيخ</span>
                    <span class="book-total-lessons">📚 ${totalLessons} درس</span>
                    <span class="book-arrow">‹</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ============================================
   OPEN BOOK DETAIL
   ============================================ */
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
   CLOSE BOOK DETAIL
   ============================================ */
function closeBookDetail() {
    dom.bookDetail.style.display = 'none';
    dom.booksList.style.display = 'flex';
}

/* ============================================
   SWITCH TO INDEX TAB WITH SHEIKH FILTER
   ============================================ */
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
