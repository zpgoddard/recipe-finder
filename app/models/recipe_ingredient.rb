class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  # Add the new attributes
  attribute :amount, :string
  attribute :measurement, :string
end
