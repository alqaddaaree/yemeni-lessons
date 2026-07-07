/* ============================================
   TABS
   ============================================ */
function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = {
        index: document.getElementById('tab-index'),
        books: document.getElementById('tab-books'),
        bookmarks: document.getElementById('tab-bookmarks'),
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

            if (tab === 'bookmarks') {
                updateBookmarksUI();
            }
        });
    });
}
