# Require necessary libraries
require 'json'
require 'open-uri'
require 'base64'
require 'cgi'

# Clear existing data
RecipeIngredient.delete_all
Ingredient.delete_all
Recipe.delete_all

# Load and parse the JSON file
file = File.read('recipes-en.json')
recipes = JSON.parse(file)

# Create records
recipes.each do |recipe_data|
  encoded_image_url = recipe_data["image"]
  decoded_image_url = CGI.unescape(encoded_image_url)

  recipe = Recipe.create(
    title: recipe_data["title"],
    prep_time: recipe_data["prep_time"],
    cook_time: recipe_data["cook_time"],
    ratings: recipe_data["ratings"],
    cuisine: recipe_data["cuisine"],
    category: recipe_data["category"],
    author: recipe_data["author"],
    image_url: decoded_image_url
  )

  recipe_data["ingredients"].each do |ingredient_name|
    ingredient = Ingredient.find_or_create_by(name: ingredient_name)
    RecipeIngredient.create(recipe: recipe, ingredient: ingredient)
  end
end
