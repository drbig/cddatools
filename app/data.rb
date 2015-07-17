module CDDATools
  module Data extend self
    class Error < StandardError; end

    class Site
      attr_reader :host, :title, :url, :desc, :since, :hits

      def initialize(host, title, url, desc, since, hits)
        @host   = host
        @title  = title
        @url    = url
        @desc   = desc
        @since  = since
        @hits   = hits

        @mtx    = Mutex.new
      end

      def hit
        @mtx.synchronize { @hits += 1 }
      end

      def to_h
        {host: @host, title: @title, url: @url, desc: @desc, since: @since, hits: @hits}
      end

      def to_json(*args)
        to_h.to_json(*args)
      end

      def marshal_dump
        [@host, @title, @url, @desc, @since, @hits]
      end

      def marshal_load(ary)
        @host, @title, @url, @desc, @since, @hits = ary
        @mtx = Mutex.new
      end
    end

    @@mtx = Mutex.new

    def load_sites(verbose)
      @@mtx.synchronize do
        if File.exists? @@db_path
          STDERR.puts "Loading datafile from #{@@db_path}" if verbose
          @@sites = File.open(@@db_path, 'rb') {|fd| Marshal.load(fd) }
        else
          STDERR.puts 'Using fresh datafile' if verbose
          @@sites = Hash.new
        end
      end
    end

    def save_sites(verbose)
      @@mtx.synchronize do
        begin
          File.open(@@db_path, 'wb') do |fd|
            STDERR.puts "Saving datafile to #{@@db_path}" if verbose
            fd.write Marshal.dump(@@sites)
          end
        rescue StandardError => e
          STDERR.puts "FATAL: Couldn't save datafile."
          STDERR.puts e.to_s
          STDERR.puts e.backtrace.join("\n")
          raise Error, "Couldn't save sites datafile."
        end
      end
    end

    module Helpers
      def sites
        settings.sites
      end

      def mod_site(orig, host, title, url, desc)
        if orig.nil? || orig.empty?
          raise Error, "Site '#{host}' already defined." if sites.has_key? host
          since = Time.now
          hits  = 0
        else
          raise Error, "Original site '#{orig}' undefined." unless sites.has_key? orig
          orig  = sites.delete(orig)
          since = orig.since
          hits  = orig.hits
        end

        sites[host] = Site.new(host, title, url, desc, since, hits)
      end

      def del_site(host)
        raise(Error, "Site '#{host}' undefined.") unless sites.has_key? host
        sites.delete(host)
      end

      def save_sites
        Data.save_sites(!settings.production?)
      end
    end

    def registered(app)
      app.helpers Helpers

      verbose = !app.production?
      @@db_path = File.join(app.root, 'data.bin')
      app.set :sites, load_sites(verbose)

      interval = ENV['SAVE_EVERY'].to_i * 60
      STDERR.puts "Will auto-save datafile every #{interval} seconds." if verbose
      Thread.new do
        loop do
          sleep(interval)
          Data.save_sites(verbose)
        end
      end
    end
  end
end
