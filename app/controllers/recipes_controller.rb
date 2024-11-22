class RecipesController < ApplicationController
  def index
  end

  def search
    if params[:ingredients].present?
      search_terms = params[:ingredients].split(",").map(&:strip).map(&:downcase)
      like_conditions = search_terms.map { |term| "LOWER(name) LIKE ?" }.join(" OR ")
      like_values = search_terms.map { |term| "%#{term}%" }

      matching_ingredients = Ingredient.where(like_conditions, *like_values)

      recipe_matches = Recipe.joins(:recipe_ingredients)
                             .where(recipe_ingredients: { ingredient_id: matching_ingredients.pluck(:id) })
                             .select("recipes.*, COUNT(recipe_ingredients.ingredient_id) AS match_count, COUNT(DISTINCT recipe_ingredients.ingredient_id) * 1.0 / COUNT(DISTINCT ingredients.id) AS match_percentage")
                             .joins(:ingredients)
                             .group("recipes.id")
                             .having("COUNT(recipe_ingredients.ingredient_id) > 0")
                             .order("match_percentage DESC")
                             .page(params[:page]).per(50) # Pagination via Kaminari gem

      render json: recipe_matches.as_json(include: { recipe_ingredients: { only: [ :amount, :measurement ], methods: :ingredient_name } }, methods: :image_url)
    else
      render json: []
    end
  end
end

class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  def ingredient_name
    ingredient.name
  end

  def as_json(options = {})
    super(options.merge(methods: :ingredient_name))
  end
end
