// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require_tree .

let currentPage = 1;
let loading = false;
let myIngredients = [];
let selectedRecipeWrapper = null;

document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const findRecipesButton = document.getElementById('find-recipes-button');
  const ingredientsInput = document.getElementById('ingredients');
  const recipesListBox = document.getElementById('recipes-list-box');

  if (addButton) {
    addButton.addEventListener('click', addIngredient);
  }
  if (findRecipesButton) {
    findRecipesButton.addEventListener('click', searchRecipes);
  }
  if (ingredientsInput) {
    ingredientsInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addIngredient();
      }
    });
  }
  if (recipesListBox) {
    recipesListBox.addEventListener('scroll', () => {
      if (recipesListBox.scrollTop + recipesListBox.clientHeight >= recipesListBox.scrollHeight) {
        loadMoreRecipes();
      }
    });
  }
  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      loadMoreRecipes();
    }
  });
});

function addIngredient() {
  const ingredient = document.getElementById('ingredients').value.trim();
  if (ingredient.length < 3) {
    alert('Please enter at least 3 characters.');
    return;
  }
  const ingredientInput = document.getElementById('ingredients');
  myIngredients.push(ingredient);
  ingredientInput.value = '';
  renderIngredients();
}

function removeIngredient(index) {
  myIngredients.splice(index, 1);
  renderIngredients();
}

function renderIngredients() {
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

async function searchRecipes() {
  currentPage = 1;
  const spinner = document.getElementById('spinner');
  const noResults = document.getElementById('no-results');
  const recipesListBox = document.getElementById('recipes');
  spinner.style.display = 'block';
  noResults.style.display = 'none';
  recipesListBox.innerHTML = ''; // Clear previous results

  try {
    const response = await fetch(`/recipes/search?ingredients=${encodeURIComponent(myIngredients.join(","))}&page=${currentPage}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const recipes = await response.json();

    if (recipes.length === 0) {
      noResults.style.display = 'block';
    } else {
      appendRecipes(recipes, myIngredients);
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    noResults.style.display = 'block';
  } finally {
    spinner.style.display = 'none';
  }
}

async function loadMoreRecipes() {
  if (loading) return;
  loading = true;
  currentPage++;
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'block';

  try {
    const response = await fetch(`/recipes/search?ingredients=${encodeURIComponent(myIngredients.join(","))}&page=${currentPage}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const recipes = await response.json();

    if (recipes.length > 0) {
      appendRecipes(recipes, myIngredients);
    }
  } catch (error) {
    console.error('Error fetching more recipes:', error);
  } finally {
    spinner.style.display = 'none';
    loading = false;
  }
}

function appendRecipes(recipes, myIngredients) {
  const recipesContainer = document.getElementById('recipes');
  recipes.forEach(recipe => {
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';
    const ingredientsList = recipe.recipe_ingredients.map(recipe_ingredient => {
      const ingredientName = recipe_ingredient.ingredient_name.toLowerCase();
      let isExactMatch = myIngredients.includes(ingredientName);
      let isPartialMatch = false;
      myIngredients.forEach(element => {
        if (element.includes(ingredientName) || ingredientName.includes(element)) {
          isPartialMatch = true;
        }
      });
      const className = isExactMatch ? 'highlight' : (isPartialMatch ? 'partial-match' : '');
      const amount = recipe_ingredient.amount ? recipe_ingredient.amount + ' ' : '';
      const measurement = recipe_ingredient.measurement ? recipe_ingredient.measurement + ' ' : '';
      return `<li class="${className}">${amount}${measurement}${ingredientName}</li>`;
    }).join('');
    const imageUrl = recipe.image_url;

    const fullStars = Math.floor(recipe.ratings);
    const partialStar = (recipe.ratings - fullStars) * 100;

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

    recipeDiv.querySelector('#recipe-wrapper').addEventListener('click', () => {
      if (selectedRecipeWrapper) {
        selectedRecipeWrapper.classList.remove('recipe-wrapper-selected');
        selectedRecipeWrapper.classList.add('recipe-wrapper');
      }
      recipeDiv.querySelector('#recipe-wrapper').classList.remove('recipe-wrapper');
      recipeDiv.querySelector('#recipe-wrapper').classList.add('recipe-wrapper-selected');
      selectedRecipeWrapper = recipeDiv.querySelector('#recipe-wrapper');
    });

    recipesContainer.appendChild(recipeDiv);
  });
}