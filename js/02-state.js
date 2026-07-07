/* ============================================
   STATE
   ============================================ */
let allLessons = [];
let sheikhsSet = new Set();
let fuseInstance = null;
let filteredResults = [];
let currentPage = 1;
let totalPages = 1;

// Book index
let bookIndex = {};
let bookCategories = new Set();

// Search timeout
let searchTimeout = null;
let suggestionTimeout = null;
let currentSuggestions = [];
let toastTimer = null;
