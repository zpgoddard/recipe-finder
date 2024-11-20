class CreateRecipes < ActiveRecord::Migration[8.0]
  def change
    create_table :recipes do |t|
      t.string :title
      t.integer :prep_time
      t.integer :cook_time
      t.float :ratings
      t.string :cuisine
      t.string :category
      t.string :author
      t.string :image_url

      t.timestamps
    end
  end
end
