module CDDATools
  module Auth extend self
    def registered(app)
      app.set(:auth) do |act|
        condition do
          unless session[:logged]
            redirect '/index' if act == :html
            error 403
          end
        end
      end
    end
  end
end
