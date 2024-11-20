Rails.application.routes.draw do
  root 'recipes#index'
  get 'recipes/search'
end