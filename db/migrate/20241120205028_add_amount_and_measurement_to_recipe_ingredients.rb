class AddAmountAndMeasurementToRecipeIngredients < ActiveRecord::Migration[8.0]
  def change
    add_column :recipe_ingredients, :amount, :string
    add_column :recipe_ingredients, :measurement, :string
  end
end
