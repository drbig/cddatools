module CDDATools
  module Routes
    module Web extend self
      module Helpers
        def domain
          settings.domain
        end
      end

      def registered(app)
        app.helpers Helpers

        app.get '/admin', auth: :html do
          haml :admin
        end

        app.post '/login' do
          redirect '/' unless params[:pass] == settings.pass
          session[:logged] = true
          redirect '/admin'
        end

        app.get '/logout' do
          session.delete(:logged)
          redirect '/index'
        end

        app.get '/' do
          if request.host == domain
            haml :index
          else
            if site = sites[request.host.split('.').first]
              site.hit
              redirect site.url
            else
              redirect "http://#{domain}/"
            end
          end
        end

        app.get '/:host' do
          if site = sites[params[:host]]
            site.hit
            redirect site.url
          else
            redirect "http://#{domain}/"
          end
        end
      end
    end
  end
end
