// 1. Grab all the HTML elements we need
const textInput = document.getElementById('text-input');
const categorySelect = document.getElementById('category-select');
const saveBtn = document.getElementById('save-btn');
const recipeGrid = document.getElementById('recipe-grid');
const headingCards = document.querySelectorAll('.heading-card');
const imageUpload = document.getElementById('image-upload');

// Temporary storage for image uploads
let currentUploadedImageBase64 = "";

// Tracks if we are editing an existing recipe
let editingRecipeId = null;

// 2. Load existing recipes from localStorage
let recipeRolodex = JSON.parse(localStorage.getItem('myRecipes')) || [];

// 3. Function to draw/render the recipe cards onto the screen
function displayRecipes(filterCategory = 'all') {
    recipeGrid.innerHTML = '';

    const filteredRecipes = recipeRolodex.filter(recipe => {
        return filterCategory === 'all' || recipe.category === filterCategory;
    });

    filteredRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        
        // Match the border color of the card tab to its mid-century theme
        if (recipe.category === 'chicken') card.style.borderTopColor = '#8ba88f';
        if (recipe.category === 'baked-goods') card.style.borderTopColor = '#dfb15b';
        if (recipe.category === 'drinks') card.style.borderTopColor = '#6b8e93';

        // NEW: Included the Delete button next to the Edit button in the string template
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

// 4. Prepare the form for an edit
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

// NEW: 5. Delete a recipe permanently from the list
window.deleteRecipe = function(id) {
    // Ask the user for confirmation so they don't click by mistake
    const confirmDelete = confirm("Are you sure you want to discard this recipe card from Grandma's box?");
    
    if (confirmDelete) {
        // Filter out the recipe that matches the clicked ID
        recipeRolodex = recipeRolodex.filter(recipe => recipe.id !== id);
        
        // Save the shortened list back to localStorage
        localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));
        
        // Refresh the page grid instantly
        displayRecipes();
    }
};

// 6. Handle saving a recipe (Handles BOTH new creations and edits!)
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

// 7. Handle Category Heading Cards filtering
headingCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedCategory = card.getAttribute('data-category');
        displayRecipes(selectedCategory);
    });
});

// 8. SCREENSHOT OCR PARSING & IMAGE CAPTURE
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    textInput.value = "Reading Grandma's handwriting... please wait a moment... 👵✨";
    saveBtn.disabled = true;
    saveBtn.innerText = "Scanning...";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
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
            console.error("OCR Error: ", error);
            textInput.value = "Scanned the image, but couldn't auto-parse text. Type details below!";
            saveBtn.disabled = false;
            saveBtn.innerText = editingRecipeId ? "Update Vintage Card" : "Save Vintage Card";
        });
    };
});

// Run automatically on load
displayRecipes();
