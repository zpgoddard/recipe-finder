class Recipe < ApplicationRecord
  has_many :recipe_ingredients # Join table for recipes and ingredients
  has_many :ingredients, through: :recipe_ingredients # Ingredients for the recipe
  attribute :image_url, :string
end
