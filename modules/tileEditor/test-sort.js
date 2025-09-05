// Test script for sort functionality
console.log('[Test] Testing sort functionality...');

// Test if sort buttons exist
const sortCategoriesByName = document.getElementById('sortCategoriesByName');
const sortCategoriesByType = document.getElementById('sortCategoriesByType');
const sortCategoriesByColor = document.getElementById('sortCategoriesByColor');

console.log('[Test] Category sort buttons found:', {
    sortCategoriesByName: !!sortCategoriesByName,
    sortCategoriesByType: !!sortCategoriesByType,
    sortCategoriesByColor: !!sortCategoriesByColor
});

// Test if tileEditor exists
console.log('[Test] TileEditor available:', !!window.tileEditor);

// Test if categories exist
if (window.tileEditor) {
    console.log('[Test] Categories count:', window.tileEditor.categories?.length);
    console.log('[Test] Categories:', window.tileEditor.categories);
}

// Add test event listeners for category buttons
if (sortCategoriesByName) {
    sortCategoriesByName.addEventListener('click', () => {
        console.log('[Test] Category sort by name clicked!');
        if (window.tileEditor) {
            window.tileEditor.sortCategories('name');
        }
    });
}

if (sortCategoriesByType) {
    sortCategoriesByType.addEventListener('click', () => {
        console.log('[Test] Category sort by type clicked!');
        if (window.tileEditor) {
            window.tileEditor.sortCategories('type');
        }
    });
}

if (sortCategoriesByColor) {
    sortCategoriesByColor.addEventListener('click', () => {
        console.log('[Test] Category sort by color clicked!');
        if (window.tileEditor) {
            window.tileEditor.sortCategories('color');
        }
    });
}

console.log('[Test] Test script loaded successfully');
