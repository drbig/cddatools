module CDDATools
  module Routes
    module Ajax extend self
      module Helpers
        def ajax_do(&blk)
          content_type :json
          begin
            halt({success: true, data: blk.call}.to_json)
          rescue Data::Error => e
            halt({success: false, error: e.to_s}.to_json)
          end
        end
      end

      def registered(app)
        app.helpers Helpers

        app.get '/ajax/sites/get', auth: true do
          ajax_do { sites }
        end

        app.get '/ajax/sites/save', auth: true do
          ajax_do { save_sites }
        end

        app.post '/ajax/mod', auth: true do
          ajax_do { mod_site(params[:orig], params[:host], params[:title],
                             params[:url], params[:desc]) }
        end

        app.post '/ajax/del', auth: true do
          ajax_do { del_site(params[:host]).to_h }
        end
      end
    end
  end
end
