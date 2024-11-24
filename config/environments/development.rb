require "active_support/core_ext/integer/time"

# Settings specified here will take precedence over those in config/application.rb.
Rails.application.configure do
  config.enable_reloading = true # Make code changes take effect immediately without server restart.
  config.eager_load = false # Do not eager load code on boot.
  config.consider_all_requests_local = true # Show full error reports.
  config.server_timing = true # Enable server timing.

  # Enable/disable caching. By default caching is disabled.
  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.public_file_server.headers = { "cache-control" => "public, max-age=#{2.days.to_i}" }
  else
    config.action_controller.perform_caching = false
  end

  config.cache_store = :memory_store # Change to :null_store to avoid any caching.
  config.active_storage.service = :local # Store uploaded files on the local file system (see config/storage.yml for options).
  config.action_mailer.raise_delivery_errors = false # Don't care if the mailer can't send.
  config.action_mailer.perform_caching = false # Make template changes take effect immediately.
  config.action_mailer.default_url_options = { host: "localhost", port: 3000 } # Set localhost to be used by links generated in mailer templates.
  config.active_support.deprecation = :log # Print deprecation notices to the Rails logger.
  config.active_record.migration_error = :page_load # Raise an error on page load if there are pending migrations.
  config.active_record.verbose_query_logs = true # Highlight code that triggered database queries in logs.
  config.active_record.query_log_tags_enabled = true # Append comments with runtime information tags to SQL queries in logs.
  config.active_job.verbose_enqueue_logs = true # Highlight code that enqueued background job in logs.
  config.action_view.annotate_rendered_view_with_filenames = true # Annotate rendered view with file names.
  config.action_controller.raise_on_missing_callback_actions = true # Raise error when a before_action's only/except options reference missing actions.
end
