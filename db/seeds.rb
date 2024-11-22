# Require necessary libraries
require 'json'
require 'open-uri'

# Clear existing data
RecipeIngredient.delete_all
Ingredient.delete_all
Recipe.delete_all

# Load and parse the JSON file
file = File.read('recipes-parsed.json')
recipes = JSON.parse(file)

# Create records
recipes.each_with_index do |recipe_data, i|
  puts "Creating Entry #{i + 1}..."

  # image_url = recipe_data["image"] This was previously used to decode URL before it was decoded in the JSON itself.

  # Create the recipe record
  recipe = Recipe.create(
    title: recipe_data["title"],
    prep_time: recipe_data["prep_time"],
    cook_time: recipe_data["cook_time"],
    ratings: recipe_data["ratings"],
    cuisine: recipe_data["cuisine"],
    category: recipe_data["category"],
    author: recipe_data["author"],
    image_url: recipe_data["image"]
  )

  # Create the recipe ingredients records
  recipe_data["ingredients"].each do |ingredient_data|
    ingredient_name = ingredient_data["name"]
    ingredient = Ingredient.find_or_create_by(name: ingredient_name)
    RecipeIngredient.create(
      recipe: recipe, # This is the recipe record created above
      ingredient: ingredient,
      amount: ingredient_data["amount"],
      measurement: ingredient_data["measurement"]
    )
  end
end
