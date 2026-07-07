/* ============================================
   DOM REFS
   ============================================ */
const $ = (id) => document.getElementById(id);

const dom = {
    searchInput: $('searchInput'),
    sheikhFilter: $('sheikhFilter'),
    searchScope: $('searchScope'),
    fuzzyToggle: $('fuzzyToggle'),
    countFilter: $('countFilter'),
    sortOrder: $('sortOrder'),
    results: $('results'),
    totalLessons: $('totalLessons'),
    totalSheikhs: $('totalSheikhs'),
    totalBooks: $('totalBooks'),
    resultCount: $('resultCount'),
    pageInfo: $('pageInfo'),
    prevPage: $('prevPage'),
    nextPage: $('nextPage'),
    aboutTotalLessons: $('aboutTotalLessons'),
    aboutTotalSheikhs: $('aboutTotalSheikhs'),
    aboutTotalBooks: $('aboutTotalBooks'),
    aboutUpdateDate: $('aboutUpdateDate'),
    aboutUpdateDate2: $('aboutUpdateDate2'),
    // Books tab
    bookCategoryFilter: $('bookCategoryFilter'),
    booksList: $('booksList'),
    booksCount: $('booksCount'),
    bookDetail: $('bookDetail'),
    bookDetailTitle: $('bookDetailTitle'),
    bookDetailCategory: $('bookDetailCategory'),
    bookDetailSheikhs: $('bookDetailSheikhs'),
};
