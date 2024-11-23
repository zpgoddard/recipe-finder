require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RecipeFinderDb
  class Application < Rails::Application
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "*"
        resource "*", headers: :any, methods: [ :get, :post, :patch, :put ]
      end
    end

    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true
  end
end
