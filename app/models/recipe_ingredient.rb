class RecipeIngredient < ApplicationRecord
  belongs_to :recipe # This line establishes a belongs_to association between the RecipeIngredient model and the Recipe model.
  belongs_to :ingredient # This line establishes a belongs_to association between the RecipeIngredient model and the Ingredient model.
  attribute :amount, :string
  attribute :measurement, :string
end
