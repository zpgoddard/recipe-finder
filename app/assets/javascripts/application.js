//= require rails-ujs
//= require_tree .

let currentPage = 1; // Page number for paginated results
let loading = false; // Flag to prevent multiple simultaneous requests and provide user feedback that data is loading
let myIngredients = []; // Array to store user's ingredients
let selectedRecipeWrapper = null; // Reference to the currently selected recipe wrapper, avoids duplicates

// Add event listeners to the buttons and input fields
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const findRecipesButton = document.getElementById('find-recipes-button');
  const ingredientsInput = document.getElementById('ingredients');
  const recipesListBox = document.getElementById('recipes-list-box');

  // Add event listener to the Add button to trigger the addIngredient function
  if (addButton) addButton.addEventListener('click', addIngredient);

  // Add event listener to the Find Recipes button to trigger the searchRecipes function
  if (findRecipesButton) findRecipesButton.addEventListener('click', searchRecipes);

  // Add event listener to the ingredients input field to detect when the user has pressed the Enter key
  if (ingredientsInput) {
    ingredientsInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') addIngredient();
    });
  }

  // Add event listener to the recipes list box to detect when the user has scrolled to the bottom of the list
  if (recipesListBox) {
    recipesListBox.addEventListener('scroll', () => {
      if (recipesListBox.scrollTop + recipesListBox.clientHeight >= recipesListBox.scrollHeight) loadMoreRecipes();
    });
  }
});

// Function to add an ingredient to the list of user's ingredients
const addIngredient = () => {
  const ingredientInput = document.getElementById('ingredients');
  if (ingredientInput.value.trim().length < 3) {
    alert('Please enter at least 3 characters.'); // If ingridient is too short show alert and disallow adding
  } else {
    myIngredients.push(ingredientInput.value.trim());
    ingredientInput.value = '';
    renderIngredients();
  }
}

// Function to remove an ingredient from the list of user's ingredients
const removeIngredient = (index) => {
  myIngredients.splice(index, 1);
  renderIngredients();
}

// Function to clear then re-render the list of user's ingredients
const renderIngredients = () => {
  const ingredientsRow = document.getElementById('my-ingredients-row');
  ingredientsRow.innerHTML = '';
  myIngredients.forEach((ingredient, index) => {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'my-ingredient';
    ingredientDiv.textContent = ingredient;
    ingredientDiv.onclick = () => removeIngredient(index);
    ingredientsRow.appendChild(ingredientDiv);
  });
}

// Function to search for recipes based on the user's ingredients
const searchRecipes = async() => {
  const ingredientInput = document.getElementById('ingredients');
  const ingredientValue = ingredientInput.value.trim();
  if (ingredientValue.length >= 3) addIngredient(); // Check if the input field has a value and trigger the addIngredient function

  currentPage = 1; // Reset page number to 1
  const spinner = document.getElementById('spinner');
  const noResults = document.getElementById('no-results');
  const recipesListBox = document.getElementById('recipes');
  spinner.style.display = 'block';
  noResults.style.display = 'none';
  recipesListBox.innerHTML = ''; // Clear previous results

  try {
    const response = await fetch(`/recipes/search?ingredients=${encodeURIComponent(myIngredients.join(","))}&page=${currentPage}`); // Fetch recipes from the server
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const recipes = await response.json();
    // console.log(recipes);

    if (recipes.length === 0) {
      noResults.style.display = 'block'; // Display a message if no recipes are found
    } else {
      appendRecipes(recipes, myIngredients); // Append the recipes to the recipes list
    }
  } catch (error) {
    console.error('Error fetching recipes:', error); // Log any errors to the console
    noResults.style.display = 'block';
  } finally {
    spinner.style.display = 'none';
  }
}

// Function to load more recipes when the user scrolls to the bottom of the list
// Due to paigination, we could reduce size of file by combining this function with searchRecipes in future.
const loadMoreRecipes = async() => {
  if (loading) return; // If data is already loading, do nothing
  loading = true;
  currentPage++;
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'block';

  try {
    const response = await fetch(`/recipes/search?ingredients=${encodeURIComponent(myIngredients.join(","))}&page=${currentPage}`); // Fetch more recipes from the server
    if (!response.ok) throw new Error('Network response was not ok');
    const recipes = await response.json();
    // console.log(recipes);
    if (recipes.length > 0) appendRecipes(recipes, myIngredients);
  } catch (error) {
    console.error('Error fetching more recipes:', error); // Log any errors to the console
  } finally {
    spinner.style.display = 'none';
    loading = false;
  }
}

// Function to append recipes to the recipes list
const appendRecipes = (recipes) => {
  const recipesContainer = document.getElementById('recipes');
  recipes.forEach(recipe => { // Loop through each recipe and create a recipe div
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';

    const imageUrl = recipe.image_url;
    const fullStars = Math.floor(recipe.ratings); // Calculate the number of full stars
    const partialStar = (recipe.ratings - fullStars) * 100; // Calculate the percentage of the partial star by multiplying the reamaining decimal part of the rating by 100

    // Create the recipe div with the recipe details
    recipeDiv.innerHTML = `
      <div id="recipe-wrapper" class="recipe-wrapper">
        <div style="display: flex;">
          <div id="recipe-img-wrapper" class="recipe-img-wrapper">
            <img id="recipe-img" class="recipe-img" src="${imageUrl}" alt="${recipe.title}">
          </div>
          <div id="recipe-text-wrapper" class="recipe-text-wrapper">
            <div id="recipe-title" class="recipe-title">${recipe.title}</div>
            <div id="recipe-time" class="recipe-time"><strong>${parseInt(recipe.prep_time) + parseInt(recipe.cook_time)} mins</strong></div>
          </div>
        </div>
        <div id="recipe-rating-wrapper" class="recipe-rating-wrapper">
          <div id="recipe-rating-stars" class="recipe-rating-stars">
            ${[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: 100%;"></div>
                  </div>`;
              } else if (i === fullStars) {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: ${partialStar}%;"></div>
                  </div>`;
              } else {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: 0%;"></div>
                  </div>`;
              }
            }).join('')}
          </div>
          <div id="recipe-rating-text" class="recipe-rating-text">${recipe.ratings} / 5</div>
        </div>
      </div>
    `;

    // Add event listeners to the recipe div to display the recipe details when clicked
    recipeDiv.addEventListener('click', () => {
      const recipeBox = document.getElementById('recipe-box');

      recipeBox.innerHTML = `
        <div id="recipe-panel-category" class="recipe-panel-category">Category: ${recipe.category}</div>
        <div id="recipe-panel-header" class="recipe-panel-header">
          <div id="recipe-panel-img" class="recipe-panel-img">
            <img id="recipe-img" class="recipe-img" src="${imageUrl}" alt="${recipe.title}">
          </div>
          <div id="recipe-panel-header-info" class="recipe-panel-header-info">
            <div id="recipe-panel-titles" class="recipe-panel-titles">
              <div id="recipe-panel-title" class="recipe-panel-title">${recipe.title}</div>
              <div id="recipe-panel-author" class="recipe-panel-author">By ${recipe.author}</div>
            </div>
            <div id="recipe-panel-other-info" class="recipe-panel-other-info">
              <div id="recipe-panel-times" class="recipe-panel-times">
                <div id="recipe-panel-prep-time" class="recipe-panel-prep-time"><strong>Prep Time:</strong> ${recipe.prep_time} mins</div>
                <div id="recipe-panel-cook-time" class="recipe-panel-cook-time"><strong>Cook Time:</strong> ${recipe.cook_time} mins</div>
              </div>
              <div id="recipe-panel-ratings-wrapper" class="recipe-panel-ratings-wrapper">
                <div id="recipe-panel-stars" class="recipe-panel-stars">
                    ${[...Array(5)].map((_, i) => {
                    if (i < fullStars) {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: 100%;"></div>
                        </div>`;
                    } else if (i === fullStars) {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: ${partialStar}%;"></div>
                        </div>`;
                    } else {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: 0%;"></div>
                        </div>`;
                    }
                    }).join('')}
                  </div>
                <div id="recipe-panel-rating" class="recipe-panel-rating">${recipe.ratings} / 5</div>
              </div>
            </div>
          </div>
        </div>
        <div id="recipe-panel-ingredients" class="recipe-panel-ingredients">
          <div><strong>INGREDIENTS</strong></div>
          ${recipe.recipe_ingredients.map(ingredient => `
            <li id="ingredient" class="ingredient">${ingredient.amount ? ingredient.amount : ""}${ingredient.measurement ? " " + ingredient.measurement : ""} ${ingredient.ingredient_name}</li>
          `).join('')}
        </div>
      `;
    });

    // Add event listener to the recipe wrapper to highlight the selected recipe
    recipeDiv.querySelector('#recipe-wrapper').addEventListener('click', () => {
      if (selectedRecipeWrapper) {
        selectedRecipeWrapper.classList.remove('recipe-wrapper-selected'); // Remove the selected class from the previously selected recipe
        selectedRecipeWrapper.classList.add('recipe-wrapper'); // Add the default class to the previously selected recipe
      }
      recipeDiv.querySelector('#recipe-wrapper').classList.remove('recipe-wrapper'); // Remove the default class from the selected recipe
      recipeDiv.querySelector('#recipe-wrapper').classList.add('recipe-wrapper-selected'); // Add the selected class to the selected
      selectedRecipeWrapper = recipeDiv.querySelector('#recipe-wrapper'); // Update the reference to the selected recipe wrapper
    });

    recipesContainer.appendChild(recipeDiv); // Append the recipe div to the recipes list
  });
}