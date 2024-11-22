class Ingredient < ApplicationRecord
  has_many :recipe_ingredients # Define the relationship between Ingredient and RecipeIngredient
  has_many :recipes, through: :recipe_ingredients # Define the relationship between Ingredient and Recipe
end
