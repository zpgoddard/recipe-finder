class RecipesController < ApplicationController
  RECIPES_TO_FETCH = 50 # Number of recipes to fetch per page

  # Used to render the index view
  def index
  end

  def search
    if params[:ingredients].present?
      # Split the ingredients by comma, strip whitespace, and downcase each term
      search_terms = params[:ingredients].split(",").map(&:strip).map(&:downcase)

      # Create LIKE conditions for singular, plural, and plural with 'es' endings
      like_conditions = search_terms.flat_map { |term| [ "LOWER(name) LIKE ?", "LOWER(name) LIKE ?", "LOWER(name) LIKE ?" ] }.join(" OR ")
      like_values = search_terms.flat_map { |term| [ "%#{term}%", "%#{term}s%", "%#{term}es%" ] }

      # Find ingredients that match the search terms
      matching_ingredients = Ingredient.where(like_conditions, *like_values)

      # Find recipes that contain the matching ingredients
      recipe_matches = Recipe.joins(:recipe_ingredients)
                             .where(recipe_ingredients: { ingredient_id: matching_ingredients.pluck(:id) }) # Only include recipes that have at least one matching ingredient
                             .select("recipes.*, COUNT(recipe_ingredients.ingredient_id) AS match_count, COUNT(DISTINCT recipe_ingredients.ingredient_id) * 1.0 / COUNT(DISTINCT ingredients.id) AS match_percentage, COUNT(DISTINCT ingredients.id) AS ingredient_count, COUNT(DISTINCT recipe_ingredients.ingredient_id) AS search_terms_matched") # Calculate the match percentage, ingredient count, and search terms matched
                             .joins(:ingredients)
                             .group("recipes.id") # Group by recipe ID to avoid duplicates
                             .having("COUNT(recipe_ingredients.ingredient_id) > 0") # Only include recipes that have at least one matching ingredient
                             .order("match_percentage DESC, search_terms_matched DESC, ingredient_count ASC") # Order by match percentage, search terms matched, then ingredient count
                             .page(params[:page]).per(RECIPES_TO_FETCH) # Paginate results using Kaminari gem

      # Render the recipes as JSON, including recipe ingredients and image URL
      render json: recipe_matches.as_json(include: { recipe_ingredients: { only: [ :amount, :measurement ], methods: :ingredient_name } }, methods: :image_url)
    else
      # Return an empty array if no ingredients are provided
      render json: []
    end
  end
end

class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  # Method to get the name of the ingredient
  def ingredient_name
    ingredient.name
  end

  # Include the ingredient_name method in the JSON representation
  def as_json(options = {})
    super(options.merge(methods: :ingredient_name))
  end
end
