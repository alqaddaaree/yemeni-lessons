/* ============================================
   BOOK INDEX (Reverse Index)
   ============================================ */
function buildBookIndex() {
    bookIndex = {};
    bookCategories = new Set();

    if (!allLessons || allLessons.length === 0) {
        console.warn('⚠️ No lessons to build index');
        return;
    }

    allLessons.forEach(lesson => {
        const title = lesson.title;
        const category = lesson.category || 'عام';
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

        // Avoid duplicate sheikhs
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

    // Sort sheikhs within each book by lessons count
    Object.keys(bookIndex).forEach(title => {
        bookIndex[title].sheikhs.sort((a, b) => (b.lessons_count || 0) - (a.lessons_count || 0));
    });

    const totalBooks = Object.keys(bookIndex).length;

    // Update stats
    if (dom.totalBooks) dom.totalBooks.textContent = totalBooks;
    if (dom.aboutTotalBooks) dom.aboutTotalBooks.textContent = totalBooks;
}

/* ============================================
   RENDER BOOKS - WITH SEARCH & FILTER
   ============================================ */
function renderBooks() {

    const container = document.getElementById('booksList');
    const categorySelect = document.getElementById('bookCategoryFilter');
    const searchInput = document.getElementById('booksSearchInput');
    const countEl = document.getElementById('booksCount');

    if (!container) {
        console.error('❌ booksList container not found');
        return;
    }

    if (!bookIndex || Object.keys(bookIndex).length === 0) {
        console.warn('⚠️ bookIndex is empty – waiting for data...');
        container.innerHTML = '<div class="loading">⏳ جاري تحميل الكتب...</div>';
        return;
    }

    const categoryFilter = categorySelect ? categorySelect.value : '';
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredBooks = Object.entries(bookIndex);

    // Category filter
    if (categoryFilter) {
        filteredBooks = filteredBooks.filter(([title, data]) => data.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
        filteredBooks = filteredBooks.filter(([title, data]) =>
            title.toLowerCase().includes(searchQuery)
        );
    }

    // Sort by number of sheikhs (desc), then by title
    filteredBooks.sort((a, b) => {
        const aSheikhs = a[1].sheikhs.length;
        const bSheikhs = b[1].sheikhs.length;
        if (aSheikhs !== bSheikhs) return bSheikhs - aSheikhs;
        return a[0].localeCompare(b[0], 'ar');
    });

    if (countEl) countEl.textContent = filteredBooks.length + ' كتاب';

    if (filteredBooks.length === 0) {
        container.innerHTML = '<div class="books-empty">📭 لا توجد كتب تطابق البحث</div>';
        return;
    }

    let html = '';
    filteredBooks.forEach(([title, data]) => {
        const category = data.category || 'عام';
        const sheikhCount = data.sheikhs.length;
        const totalLessons = data.total_lessons;
        const categoryClass = categoryColors[category] || 'category-other';
        const categoryLabel = categoryLabels[category] || 'عام';

        const escapedTitle = title.replace(/'/g, "\\'");

        html += `
            <div class="book-item" onclick="openBookDetail('${escapedTitle}')">
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
   CLEAR BOOKS FILTERS
   ============================================ */
function clearBooksFilters() {
    const searchInput = document.getElementById('booksSearchInput');
    const categorySelect = document.getElementById('bookCategoryFilter');
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    renderBooks();
}

/* ============================================
   OPEN BOOK DETAIL
   ============================================ */
function openBookDetail(title) {
    const data = bookIndex[title];
    if (!data) {
        console.error('❌ Book not found:', title);
        return;
    }

    document.getElementById('booksList').style.display = 'none';
    document.getElementById('bookDetail').style.display = 'block';

    document.getElementById('bookDetailTitle').textContent = title;
    const categoryLabel = categoryLabels[data.category] || 'عام';
    document.getElementById('bookDetailCategory').textContent = 'التصنيف: ' + categoryLabel;

    let html = '';
    data.sheikhs.forEach(sheikh => {
        const countText = sheikh.lessons_count ? sheikh.lessons_count + ' درس' : 'سلسلة';
        html += `
            <div class="book-sheikh-item">
                <span class="sheikh-name" onclick="switchToSheikh('${sheikh.name.replace(/'/g, "\\'")}')">${sheikh.name}</span>
                <span class="sheikh-lessons">${countText}</span>
                <a href="${sheikh.link}" target="_blank" class="sheikh-link" onclick="event.stopPropagation();">فتح 📂</a>
            </div>
        `;
    });
    document.getElementById('bookDetailSheikhs').innerHTML = html;
}

/* ============================================
   CLOSE BOOK DETAIL
   ============================================ */
function closeBookDetail() {
    document.getElementById('booksList').style.display = 'flex';
    document.getElementById('bookDetail').style.display = 'none';
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

    document.getElementById('sheikhFilter').value = sheikhName;
    applyFilters();
    window.scrollTo({ top: document.querySelector('.search-box').offsetTop - 20, behavior: 'smooth' });
}