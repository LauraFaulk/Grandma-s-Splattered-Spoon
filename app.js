// 1. Grab all the HTML elements we need to talk to
const textInput = document.getElementById('text-input');
const categorySelect = document.getElementById('category-select');
const saveBtn = document.getElementById('save-btn');
const recipeGrid = document.getElementById('recipe-grid');
const headingCards = document.querySelectorAll('.heading-card');

// 2. Load existing recipes from the browser's storage, or start with an empty list
let recipeRolodex = JSON.parse(localStorage.getItem('myRecipes')) || [];

// 3. Function to draw/render the recipe cards onto the screen
function displayRecipes(filterCategory = 'all') {
    // Clear out the grid so we don't duplicate cards
    recipeGrid.innerHTML = '';

    // Filter recipes based on which heading card was clicked
    const filteredRecipes = recipeRolodex.filter(recipe => {
        return filterCategory === 'all' || recipe.category === filterCategory;
    });

    // Loop through the filtered recipes and build their HTML structure
    filteredRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        
        // Match the border color of the card tab to its mid-century category theme
        if (recipe.category === 'chicken') card.style.borderTopColor = '#8ba88f'; // Green
        if (recipe.category === 'baked-goods') card.style.borderTopColor = '#dfb15b'; // Gold
        if (recipe.category === 'drinks') card.style.borderTopColor = '#6b8e93'; // Muted Teal

        card.innerHTML = `
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #a08060;">
                ■ ${recipe.category.replace('-', ' ')}
            </span>
            <p style="white-space: pre-wrap; margin-top: 10px;">${recipe.text}</p>
        `;
        
        recipeGrid.appendChild(card);
    });
}

// 4. Handle saving a new recipe when the button is clicked
saveBtn.addEventListener('click', () => {
    const recipeText = textInput.value.trim();
    const recipeCategory = categorySelect.value;

    if (recipeText === '') {
        alert("Grandma wouldn't store an empty recipe card! Please add some text first.");
        return;
    }

    // Create a recipe object
    const newRecipe = {
        text: recipeText,
        category: recipeCategory,
        id: Date.now() // Unique timestamp ID
    };

    // Add it to our master array list
    recipeRolodex.push(newRecipe);

    // Save the updated list to the browser's local storage
    localStorage.setItem('myRecipes', JSON.stringify(recipeRolodex));

    // Reset the input area and refresh the display
    textInput.value = '';
    displayRecipes();
});

// 5. Handle the Category Heading Cards filtering logic
headingCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedCategory = card.getAttribute('data-category');
        displayRecipes(selectedCategory);
    });
});

// 6. Run this automatically when the page first loads up
displayRecipes();

// ==========================================
// 7. SCREENSHOT OCR PARSING (Tesseract.js)
// ==========================================

const imageUpload = document.getElementById('image-upload');

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // 1. Give the user a hint that Grandma's gears are turning
    textInput.value = "Reading Grandma's handwriting... please wait a moment... 👵✨";
    saveBtn.disabled = true; // Temporary disable button while processing
    saveBtn.innerText = "Scanning...";

    // 2. Use a FileReader to convert the uploaded image into something Tesseract can read
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function() {
        const imageDataUrl = reader.result;

        // 3. Call Tesseract to recognize the text inside the image
        Tesseract.recognize(
            imageDataUrl,
            'eng', // Language code for English
            { logger: m => console.log(m) } // This logs the progress in your browser inspect console
        ).then(({ data: { text } }) => {
            
            // 4. Put the scanned text straight into your recipe text box!
            textInput.value = text;
            
            // 5. Reset our button back to normal
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Vintage Card";
        }).catch(error => {
            console.error("OCR Error: ", error);
            textInput.value = "Oh dear, something went wrong scanning that image. Try pasting manually!";
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Vintage Card";
        });
    };
});
