/* ============================================
   PAGE TITLE
   ============================================ */
const BASE_TITLE = 'فهرس الدروس - مؤسسة صدى السلفية';

function updatePageTitle(sheikhName) {
    if (sheikhName) {
        document.title = `دروس الشيخ ${sheikhName} - فهرس الدروس`;
    } else {
        document.title = BASE_TITLE;
    }
}
