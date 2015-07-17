module CDDATools
  module Routes
    autoload :Ajax, 'app/routes/ajax'
    autoload :Web,  'app/routes/web'

    def self.registered(app)
      constants.each {|c| app.register const_get(c) }
    end
  end
end
