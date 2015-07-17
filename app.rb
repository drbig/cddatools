require 'rubygems'
require 'bundler'

Bundler.require
$: << File.expand_path('../', __FILE__)

require 'app/auth'
require 'app/data'
require 'app/routes'

module CDDATools
  class App < Sinatra::Base
    set :environment, ENV['RACK_ENV'].to_sym

    configure do
      set :root,        File.expand_path('../', __FILE__)
      set :views,       'app/views'
      set :public_dir,  ENV['ASSETS']
      set :pass,        ENV['PASSWORD']
      set :domain,      ENV['DOMAIN']
      set :haml,        ugly: true
    end

    configure :development, :staging do
      enable :static
      enable :logging
      enable :dump_errors
      enable :raise_errors
    end

    use Rack::Session::Cookie,
        key:          'cddatools',
        expire_after: 3600 * 24 * 365,
        secret:       ENV['SESSION_SECRET']

    register CDDATools::Auth
    register CDDATools::Data
    register CDDATools::Routes
  end
end
