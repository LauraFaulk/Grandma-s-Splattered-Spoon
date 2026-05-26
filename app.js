// 1. Grab all the HTML elements we need
const textInput = document.getElementById('text-input');
const categorySelect = document.getElementById('category-select');
const saveBtn = document.getElementById('save-btn');
const recipeGrid = document.getElementById('recipe-grid');
const categoryNav = document.getElementById('category-nav');
const imageUpload = document.getElementById('image-upload');

// NEW: Elements for custom categories
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');

// Temporary storage for image uploads
let currentUploadedImageBase64 = "";

// Tracks if we are editing an existing recipe
let editingRecipeId = null;

// 2. Load existing data from localStorage (or defaults if empty)
let recipeRolodex = JSON.parse(localStorage.getItem('myRecipes')) || [];
let customCategories = JSON.parse(localStorage.getItem('myCategories')) || ['chicken', 'beef', 'baked-goods', 'desserts', 'drinks'];

// NEW: 3. Function to draw the physical filing folder tabs dynamically
function displayCategoryTabs() {
    // Clear out the navigation box drawer, except for the "All" tab
    categoryNav.innerHTML = '<div class="heading-card" data-category="all">All</div>';
    
    // Clear the dropdown select box too
    categorySelect.innerHTML = '';

    // Emojis mapping for default categories to keep it retro-pretty
    const emojiMap = {
        'chicken': '🍗 Chicken', 'beef': '🥩 Beef', 'baked-goods': '🍞 Baking', 'desserts': '🍰 Sweets', 'drinks': '🍹 Drinks'
    };

    customCategories.forEach(cat => {
        const displayName = emojiMap[cat] || `📁 ${cat.replace('-', ' ')}`;

        // A. Add tab to top navigation
        const tab = document.createElement('div');
        tab.classList.add('heading-card');
        tab.setAttribute('data-category', cat);
        tab.innerText = displayName;
        
        // Wire up click event for filtering
        tab.addEventListener('click', () => displayRecipes(cat));
        categoryNav.appendChild(tab);

        // B. Add option to the submission dropdown menu
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = displayName;
        categorySelect.appendChild(option);
    });

    // Make sure clicking the 'All' tab works too
    document.querySelector('.heading-card[data-category="all"]').addEventListener('click', () => displayRecipes('all'));
}

// 4. Function to draw/render the recipe cards onto the screen
function displayRecipes(filterCategory = 'all') {
    recipeGrid.innerHTML = '';

    const filteredRecipes = recipeRolodex.filter(recipe => {
        return filterCategory === 'all' || recipe.category === filterCategory;
    });

    filteredRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        
        // Dynamically rotate tab border colors for variety
        const hash = recipe.category.charCodeAt(0) || 0;
        const colors = ['#8ba88f', '#dfb15b', '#6b8e93', '#c76d3c'];
        card.style.borderTopColor = colors[hash % colors.length];

        let cardHTML = `
            <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">Delete</button>
            <button class="edit-btn" onclick="prepareEdit(${recipe.id})">Edit</button>
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #a08060;">
                ■ ${recipe.category.replace('-', ' ')}
            </span>
            <p style="white-space: pre-wrap; margin-top: 10px;">${recipe.text}</p>
        `;

        if (recipe.image) {
            cardHTML += `<img src="${recipe.image}" class="recipe-card-img" alt="Recipe clipping">`;
        }

        card.innerHTML = cardHTML;
        recipeGrid.appendChild(card);
    });
}

// NEW: 5. Handle adding a brand new custom folder tab category
addCategoryBtn.addEventListener('click', () => {
    const rawName = newCategoryInput.value.trim();
    // Turn "Appetizers & Snacks" into "appetizers-&-snacks" for code safety
    const cleanId = rawName.toLowerCase().replace(/\s+/g, '-'); 

    if (rawName === '') return;
    if (customCategories.includes(cleanId)) {
        alert("That folder tab already exists inside your box!");
        return;
    }

    customCategories.push(cleanId);
    localStorage.setItem('myCategories', JSON.stringify(customCategories));
    
    newCategoryInput.value = '';
    displayCategoryTabs(); // Redraw the UI tabs instantly
});

// 6. Prepare the form for an edit
window.prepareEdit = function(id) {
    const recipeToEdit = recipeRolodex.find(r => r.id === id);
    if (!recipeToEdit) return;

    textInput.value = recipeToEdit.text;
    categorySelect.value = recipeToEdit.category;
    currentUploadedImageBase64 = recipeToEdit.image || "";

    editingRecipeId = id;
    saveBtn.innerText = "Update Vintage Card";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 7. Delete a recipe permanently
window.deleteRecipe = function(id) {
    const confirmDelete = confirm("Are you sure you want to discard this recipe card from Grandma's box?");
    if (confirmDelete) {
        recipeRolodex = recipeRolodex.filter(recipe => recipe.id !== id);
        localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));
        displayRecipes();
    }
};

// 8. Handle saving a recipe
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

// 9. SCREENSHOT OCR PARSING & IMAGE CAPTURE
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    textInput.value = "Reading Grandma's handwriting... please wait a moment... 👵✨";
    saveBtn.disabled = true;
    saveBtn.innerText = "Scanning Image...";

    const reader = new FileReader();
    
    reader.onload = function() {
        currentUploadedImageBase64 = reader.result;

        Tesseract.recognize(
            currentUploadedImageBase64,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            textInput.value = text;
            saveBtn.disabled = false;
            saveBtn.innerText = editingRecipeId ? "Update Vintage Card" : "Save Vintage Card";
        }).catch(error => {
            console.error("Tesseract Core Error: ", error);
            textInput.value = "Scanned the image, but couldn't auto-parse text. Type details below!";
            saveBtn.disabled = false;
            saveBtn.innerText = editingRecipeId ? "Update Vintage Card" : "Save Vintage Card";
        });
    };

    reader.readAsDataURL(file);
});

// Setup both elements automatically on load
displayCategoryTabs();
displayRecipes();
