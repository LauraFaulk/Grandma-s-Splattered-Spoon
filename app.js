// 1. Grab all the HTML elements we need
const textInput = document.getElementById('text-input');
const categorySelect = document.getElementById('category-select');
const saveBtn = document.getElementById('save-btn');
const recipeGrid = document.getElementById('recipe-grid');
const headingCards = document.querySelectorAll('.heading-card');
const imageUpload = document.getElementById('image-upload');

// This temporary variable will hold our image data string until we hit "Save"
let currentUploadedImageBase64 = "";

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
        if (recipe.category === 'chicken') card.style.borderTopColor = '#8ba88f'; // Green
        if (recipe.category === 'baked-goods') card.style.borderTopColor = '#dfb15b'; // Gold
        if (recipe.category === 'drinks') card.style.borderTopColor = '#6b8e93'; // Muted Teal

        // Build card content
        let cardHTML = `
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #a08060;">
                ■ ${recipe.category.replace('-', ' ')}
            </span>
            <p style="white-space: pre-wrap; margin-top: 10px;">${recipe.text}</p>
        `;

        // IF the recipe has a saved image, append it to the card's HTML
        if (recipe.image) {
            cardHTML += `<img src="${recipe.image}" class="recipe-card-img" alt="Recipe clipping">`;
        }

        card.innerHTML = cardHTML;
        recipeGrid.appendChild(card);
    });
}

// 4. Handle saving a new recipe
saveBtn.addEventListener('click', () => {
    const recipeText = textInput.value.trim();
    const recipeCategory = categorySelect.value;

    if (recipeText === '') {
        alert("Grandma wouldn't store an empty recipe card! Please add some text first.");
        return;
    }

    const newRecipe = {
        text: recipeText,
        category: recipeCategory,
        image: currentUploadedImageBase64, // Save the image string here!
        id: Date.now()
    };

    recipeRolodex.push(newRecipe);
    localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));

    // Reset everything
    textInput.value = '';
    currentUploadedImageBase64 = ""; // Clear out the temporary image variable
    displayRecipes();
});

// 5. Handle Category Heading Cards filtering
headingCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedCategory = card.getAttribute('data-category');
        displayRecipes(selectedCategory);
    });
});

// 6. SCREENSHOT OCR PARSING & IMAGE CAPTURE
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    textInput.value = "Reading Grandma's handwriting... please wait a moment... 👵✨";
    saveBtn.disabled = true;
    saveBtn.innerText = "Scanning...";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function() {
        // Store the raw image text string so we can attach it to the recipe card later
        currentUploadedImageBase64 = reader.result;

        // Run Tesseract to pull text out of it simultaneously
        Tesseract.recognize(
            currentUploadedImageBase64,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            textInput.value = text;
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Vintage Card";
        }).catch(error => {
            console.error("OCR Error: ", error);
            textInput.value = "Scanned the image, but couldn't auto-parse text. Type details below!";
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Vintage Card";
        });
    };
});

// Run automatically on load
displayRecipes();
