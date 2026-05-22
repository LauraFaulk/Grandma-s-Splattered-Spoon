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
