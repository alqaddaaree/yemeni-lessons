/* ============================================
   BOOKMARKS (Save/Load from localStorage)
   ============================================ */
function getBookmarks() {
    try {
        const data = localStorage.getItem(BOOKMARKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
        console.error('Error saving bookmarks:', e);
    }
}

function isBookmarked(link) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.link === link);
}

function toggleBookmark(link, title, sheikh) {
    let bookmarks = getBookmarks();
    const existing = bookmarks.findIndex(b => b.link === link);

    if (existing !== -1) {
        bookmarks.splice(existing, 1);
        saveBookmarks(bookmarks);
        showToast('🗑️ تم إزالة الدرس من المفضلة', 'success');
        updateBookmarkButton(link, false);
    } else {
        const bookmark = {
            link: link,
            title: title,
            sheikh: sheikh,
            saved_at: new Date().toISOString(),
        };
        bookmarks.push(bookmark);
        saveBookmarks(bookmarks);
        showToast('⭐ تم حفظ الدرس في المفضلة', 'success');
        updateBookmarkButton(link, true);
    }

    updateBookmarksUI();
}

function updateBookmarkButton(link, isBookmarked) {
    const buttons = document.querySelectorAll('.btn-bookmark');
    buttons.forEach(btn => {
        if (btn.dataset.link === link) {
            btn.textContent = isBookmarked ? '⭐' : '☆';
            btn.classList.toggle('bookmarked', isBookmarked);
        }
    });
}

function updateBookmarksUI() {
    const bookmarks = getBookmarks();

    const countEl = document.getElementById('bookmarksCount');
    if (countEl) {
        countEl.textContent = bookmarks.length + ' درس محفوظ';
    }

    const listEl = document.getElementById('bookmarksList');
    if (listEl && document.getElementById('tab-bookmarks').classList.contains('active')) {
        renderBookmarksList(bookmarks);
    }
}

function renderBookmarksList(bookmarks) {
    const container = document.getElementById('bookmarksList');
    if (!container) return;

    if (bookmarks.length === 0) {
        container.innerHTML = '<div class="bookmarks-empty">⭐ لم تقم بحفظ أي درس بعد. ابحث عن درس و اضغط على ⭐ لحفظه.</div>';
        return;
    }

    let html = '';
    bookmarks.forEach(bookmark => {
        const date = new Date(bookmark.saved_at);
        const dateStr = date.toLocaleDateString('ar-EG');

        html += `
            <div class="bookmark-item">
                <div class="bookmark-info">
                    <div class="bookmark-sheikh">${bookmark.sheikh}</div>
                    <div class="bookmark-title">📖 ${bookmark.title}</div>
                    <div class="bookmark-meta">
                        <span class="bookmark-date">📅 ${dateStr}</span>
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button class="btn btn-remove" onclick="removeBookmark('${bookmark.link}')" title="إزالة من المفضلة">🗑️</button>
                    <a href="${bookmark.link}" target="_blank" class="btn-link">فتح 📂</a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function removeBookmark(link) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => b.link !== link);
    saveBookmarks(bookmarks);
    updateBookmarksUI();
    updateBookmarkButton(link, false);
    showToast('🗑️ تم إزالة الدرس من المفضلة', 'success');
}

function clearBookmarks() {
    if (confirm('هل أنت متأكد من حذف جميع الدروس من المفضلة؟')) {
        saveBookmarks([]);
        updateBookmarksUI();
        document.querySelectorAll('.btn-bookmark').forEach(btn => {
            btn.textContent = '☆';
            btn.classList.remove('bookmarked');
        });
        showToast('🗑️ تم حذف جميع الدروس من المفضلة', 'success');
    }
}

function exportBookmarks() {
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
        showToast('⚠️ لا توجد دروس محفوظة للتصدير', 'error');
        return;
    }

    const data = {
        exported_at: new Date().toISOString(),
        total: bookmarks.length,
        bookmarks: bookmarks,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sada_bookmarks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅ تم تصدير المفضلة بنجاح', 'success');
}

function importBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                const bookmarks = data.bookmarks || data;
                if (!Array.isArray(bookmarks)) {
                    showToast('❌ ملف غير صالح', 'error');
                    return;
                }
                const existing = getBookmarks();
                const merged = [...existing, ...bookmarks];
                const unique = merged.filter((item, index, self) =>
                    index === self.findIndex(b => b.link === item.link)
                );
                saveBookmarks(unique);
                updateBookmarksUI();
                document.querySelectorAll('.btn-bookmark').forEach(btn => {
                    const isSaved = unique.some(b => b.link === btn.dataset.link);
                    btn.textContent = isSaved ? '⭐' : '☆';
                    btn.classList.toggle('bookmarked', isSaved);
                });
                showToast(`✅ تم استيراد ${bookmarks.length} درس بنجاح`, 'success');
            } catch (err) {
                showToast('❌ ملف غير صالح', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
