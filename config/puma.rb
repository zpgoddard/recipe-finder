# Specifies the number of threads to use for serving requests.
# Minimum and maximum threads count can be specified.
threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count

# Specifies the port that Puma will listen on to receive requests.
port ENV.fetch("PORT") { 3000 }

# Specifies the environment that Puma will run in.
environment ENV.fetch("RAILS_ENV") { "production" }

# Specifies the `pidfile` that Puma will use.
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Specifies the number of worker processes to boot in clustered mode.
# Workers are forked web server processes. If using threads and workers together,
# the concurrency of the application would be max `threads_count * workers`.
workers ENV.fetch("WEB_CONCURRENCY") { 2 }

# Use the `preload_app!` method when specifying a `workers` number.
# This directive tells Puma to first boot the application and load code before forking the application.
preload_app!

# Allow puma to be restarted by `rails restart` command.
plugin :tmp_restart

# Plugin for SolidQueue if the environment variable is set.
plugin :solid_queue if ENV["SOLID_QUEUE_IN_PUMA"]
