source "https://rubygems.org"

ruby "3.3.6"

gem "rails", "~> 8.0.0"
gem "pg", ">= 0.18", "< 2.0"
gem "puma", ">= 5.0"
gem "kaminari"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"
gem "bootsnap", require: false
gem "rack-cors"
gem "dotenv-rails", groups: [ :development, :test ]

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end

group :production do
  gem "rails_12factor"
end
