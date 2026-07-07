/* ============================================
   COPY LINK
   ============================================ */
function copyLink(link) {
    if (!navigator.clipboard) {
        fallbackCopyLink(link);
        return;
    }

    navigator.clipboard.writeText(link)
        .then(function() {
            showToast('✅ تم نسخ الرابط بنجاح!', 'success');
            const buttons = document.querySelectorAll('.btn-copy');
            buttons.forEach(function(btn) {
                if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(link)) {
                    btn.textContent = '✓';
                    btn.classList.add('copied');
                    setTimeout(function() {
                        btn.textContent = '📋';
                        btn.classList.remove('copied');
                    }, 2000);
                }
            });
        })
        .catch(function() {
            fallbackCopyLink(link);
        });
}

function fallbackCopyLink(link) {
    const textarea = document.createElement('textarea');
    textarea.value = link;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('✅ تم نسخ الرابط بنجاح!', 'success');
    } catch (err) {
        showToast('❌ فشل نسخ الرابط. الرجاء نسخه يدويًا.', 'error');
    }
    document.body.removeChild(textarea);
}

/* ============================================
   TOAST NOTIFICATION
   ============================================ */
function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
        toast.classList.add('show');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 400);
    }, 2500);
}
