class RecipesController < ApplicationController
  def index
  end

  def search
    search_terms = params[:ingredients].split(",").map(&:strip)
    matching_ingredients = []

    search_terms.each do |term|
      matching_ingredients += Ingredient.where("name LIKE ?", "%#{term}%")
    end

    matching_ingredients.uniq!

    recipe_matches = Recipe.joins(:recipe_ingredients)
                           .where(recipe_ingredients: { ingredient_id: matching_ingredients.pluck(:id) })
                           .select("recipes.*, COUNT(recipe_ingredients.ingredient_id) AS match_count, COUNT(DISTINCT recipe_ingredients.ingredient_id) * 1.0 / COUNT(DISTINCT ingredients.id) AS match_percentage")
                           .joins(:ingredients)
                           .group("recipes.id")
                           .having("COUNT(recipe_ingredients.ingredient_id) > 0")
                           .order("match_percentage DESC")

    render json: recipe_matches.as_json(include: { ingredients: { only: :name } }, methods: :image_url)
  end
end
