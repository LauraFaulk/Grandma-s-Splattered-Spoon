// 1. Grab all the HTML elements we need (Updated with the new photo button!)
const textInput = document.getElementById('text-input');
const categorySelect = document.getElementById('category-select');
const saveBtn = document.getElementById('save-btn');
const recipeGrid = document.getElementById('recipe-grid');
const categoryNav = document.getElementById('category-nav');
const imageUpload = document.getElementById('image-upload');
const cardPhotoUpload = document.getElementById('card-photo-upload'); // NEW!

// Category creation & editing elements
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const tabEditorZone = document.getElementById('tab-editor-zone');
const editCategoryInput = document.getElementById('edit-category-input');
const updateCategoryBtn = document.getElementById('update-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');

// Temporary storage trackers
let currentUploadedImageBase64 = "";
let editingRecipeId = null;
let editingCategoryId = null; 

// 2. Load existing data safely from localStorage
let recipeRolodex = JSON.parse(localStorage.getItem('myRecipes')) || [];

const defaultCategories = [
    { id: 'chicken', name: '🍗 Chicken' },
    { id: 'beef', name: '🥩 Beef' },
    { id: 'baked-goods', name: '🍞 Baking' },
    { id: 'desserts', name: '🍰 Sweets' },
    { id: 'drinks', name: '🍹 Drinks' }
];
let customCategories = JSON.parse(localStorage.getItem('myCategoriesObjects')) || defaultCategories;

// 3. Draw the physical filing folder tabs dynamically
function displayCategoryTabs() {
    categoryNav.innerHTML = '<div class="heading-card" data-category="all" style="background-color: #4a3c31; color: #fffdf9;">All Recipes</div>';
    categorySelect.innerHTML = '';

    customCategories.forEach(cat => {
        const tab = document.createElement('div');
        tab.classList.add('heading-card');
        tab.setAttribute('data-category', cat.id);
        
        tab.innerHTML = `${cat.name} <span style="font-size:0.65rem; color:#a08060; display:block; margin-top:2px; font-weight:normal;">[Click to Filter / Double-Click to Edit Name]</span>`;
        
        tab.addEventListener('click', () => {
            displayRecipes(cat.id);
        });

        tab.addEventListener('dblclick', () => {
            prepareCategoryEdit(cat.id, cat.name);
        });

        categoryNav.appendChild(tab);

        const option = document.createElement('option');
        option.value = cat.id;
        option.innerText = cat.name;
        categorySelect.appendChild(option);
    });

    document.querySelector('.heading-card[data-category="all"]').addEventListener('click', () => displayRecipes('all'));
}

// 4. Function to open the category renamer tool
function prepareCategoryEdit(id, currentName) {
    const systemIds = ['chicken', 'beef', 'baked-goods', 'desserts', 'drinks'];
    if (systemIds.includes(id)) {
        alert("Grandma's core default folders can't be renamed, but you can edit any custom tabs you created!");
        return;
    }
    editingCategoryId = id;
    editCategoryInput.value = currentName;
    tabEditorZone.style.display = 'flex';
    editCategoryInput.focus();
}

// Handle updating a custom tab name
updateCategoryBtn.addEventListener('click', () => {
    const updatedName = editCategoryInput.value.trim();
    if (updatedName === '') return;

    const index = customCategories.findIndex(c => c.id === editingCategoryId);
    if (index !== -1) {
        customCategories[index].name = updatedName;
        localStorage.setItem('myCategoriesObjects', JSON.stringify(customCategories));
        
        tabEditorZone.style.display = 'none';
        editingCategoryId = null;
        
        displayCategoryTabs();
        displayRecipes(); 
    }
});

cancelCategoryBtn.addEventListener('click', () => {
    tabEditorZone.style.display = 'none';
    editingCategoryId = null;
});

// 5. Function to draw/render the recipe cards onto the screen
function displayRecipes(filterCategory = 'all') {
    recipeGrid.innerHTML = '';

    const filteredRecipes = recipeRolodex.filter(recipe => {
        return filterCategory === 'all' || recipe.category === filterCategory;
    });

    filteredRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        
        const matchingCat = customCategories.find(c => c.id === recipe.category);
        const printableCategoryName = matchingCat ? matchingCat.name : recipe.category.toUpperCase().replace('-', ' ');

        const hash = recipe.category.charCodeAt(0) || 0;
        const colors = ['#8ba88f', '#dfb15b', '#6b8e93', '#c76d3c'];
        card.style.borderTopColor = colors[hash % colors.length];

        card.innerHTML = `
            <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">Delete</button>
            <button class="edit-btn" onclick="prepareEdit(${recipe.id})">Edit</button>
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #a08060; font-weight:bold;">
                ■ ${printableCategoryName}
            </span>
            <p style="white-space: pre-wrap; margin-top: 10px;">${recipe.text}</p>
        `;

        if (recipe.image) {
            const imgElement = document.createElement('img');
            imgElement.src = recipe.image;
            imgElement.classList.add('recipe-card-img');
            imgElement.alt = "Recipe clipping";
            card.appendChild(imgElement);
        }

        recipeGrid.appendChild(card);
    });
}

// 6. Handle adding a brand new custom folder tab category
addCategoryBtn.addEventListener('click', () => {
    const originalName = newCategoryInput.value.trim();
    if (originalName === '') return;

    const uniqueId = originalName.toLowerCase().replace(/\s+/g, '-'); 

    if (customCategories.some(c => c.id === uniqueId)) {
        alert("A tab with that name already exists!");
        return;
    }

    const newTabObject = { id: uniqueId, name: originalName };
    customCategories.push(newTabObject);
    localStorage.setItem('myCategoriesObjects', JSON.stringify(customCategories));
    
    newCategoryInput.value = '';
    displayCategoryTabs(); 
    categorySelect.value = uniqueId; 
});

// 7. Prepare the form for an edit
window.prepareEdit = function(id) {
    const recipeToEdit = recipeRolodex.find(r => r.id === id);
    if (!recipeToEdit) return;

    textInput.value = recipeToEdit.text;
    
    if (customCategories.some(c => c.id === recipeToEdit.category)) {
        categorySelect.value = recipeToEdit.category;
    } else {
        categorySelect.selectedIndex = 0; 
    }
    
    currentUploadedImageBase64 = recipeToEdit.image || "";
    editingRecipeId = id;
    saveBtn.innerText = "Update Vintage Card";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 8. Delete a recipe permanently
window.deleteRecipe = function(id) {
    const confirmDelete = confirm("Are you sure you want to discard this recipe card from Grandma's box?");
    if (confirmDelete) {
        recipeRolodex = recipeRolodex.filter(recipe => recipe.id !== id);
        localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));
        displayRecipes();
    }
};

// 9. Handle saving a recipe
saveBtn.addEventListener('click', () => {
    const recipeText = textInput.value.trim();
    const recipeCategory = categorySelect.value;

    if (recipeText === '') {
        alert("Grandma wouldn't store an empty recipe card!");
        return;
    }

    if (editingRecipeId !== null) {
        const index = recipeRolodex.findIndex(r => r.id === editingRecipeId);
        if (index !== -1) {
            recipeRolodex[index].text = recipeText;
            recipeRolodex[index].category = recipeCategory;
            recipeRolodex[index].image = currentUploadedImageBase64;
        }
        editingRecipeId = null;
        saveBtn.innerText = "Save Vintage Card";
    } else {
        const newRecipe = {
            text: recipeText,
            category: recipeCategory,
            image: currentUploadedImageBase64,
            id: Date.now()
        };
        recipeRolodex.push(newRecipe);
    }

    localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));
    textInput.value = '';
    currentUploadedImageBase64 = "";
    displayRecipes();
});

// ==========================================
// 10. DUAL IMAGE HANDLERS (SCANNER VS PHOTO)
// ==========================================

// HANDLER A: The Text Scanner (Direct Tesseract OCR Engine)
if (imageUpload) {
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Force the loading message to show immediately
        textInput.value = "Reading Grandma's handwriting... please wait a moment... 👵✨";
        saveBtn.disabled = true;
        saveBtn.innerText = "Scanning Image...";

        const reader = new FileReader();
        reader.onload = function() {
            // Direct call to Tesseract without complex background workers
            Tesseract.recognize(
                reader.result,
                'eng'
            ).then(({ data: { text } }) => {
                console.log("OCR scanning complete successfully!");
                
                // Drop the beautifully parsed text directly into the text area!
                textInput.value = text;
                
                // Re-enable our save button
                saveBtn.disabled = false;
                saveBtn.innerText = editingRecipeId ? "Update Vintage Card" : "Save Vintage Card";
            }).catch(error => {
                console.error("Tesseract Core Error Details: ", error);
                textInput.value = "Scanned the image, but couldn't auto-parse text. Type details below!";
                saveBtn.disabled = false;
                saveBtn.innerText = editingRecipeId ? "Update Vintage Card" : "Save Vintage Card";
            });
        };
        reader.readAsDataURL(file);
    });
}

// HANDLER B: Dedicated Card Photo Upload (Bypasses OCR completely!)
if (cardPhotoUpload) {
    cardPhotoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function() {
            currentUploadedImageBase64 = reader.result;
            alert("Beautiful recipe photo attached successfully! 📸");
        };
        reader.readAsDataURL(file);
    });
}

// Initialize layout elements automatically on page load
displayCategoryTabs();
displayRecipes();
