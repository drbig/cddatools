$(function() {
  // reserved for the /:host routes
  var reserved = ['admin', 'login', 'logout'];
  // nesting components in react is funny, so we just
  // generate new ids on each update and call it a day
  var number = 0;

  // SITE
  var Site = React.createClass({
    getInitialState: function() {
      return $.extend({}, this.props);
    },
    handleChange: function(prop, event) {
      var newVal = event.target.value;
      var newState = {};
      newState[prop] = newVal;
      newState[prop + 'Style'] = newVal != this.props[prop] ? {color: 'black'} : {};
      if (prop == 'host') {
        if ($.inArray(newVal, reserved) != -1) {
          newState[prop + 'Style'] = {color: 'red'};
        }
      }
      this.setState(newState);
    },
    handleSave: function() {
      $.ajax({
        type: 'post',
        url: '/ajax/mod',
        xhrFields: {
          withCredentials: true
        },
        data: {
          orig:   this.props.host,
          host:   this.state.host,
          title:  this.state.title,
          url:    this.state.url,
          desc:   this.state.desc
        },
        success: function(data, stat, xhr) {
          if (data.success) {
            this.props.onSaved(this.props.host, data.data);
          } else {
            this.setState({error: data.error});
          }
        }.bind(this),
        error: function(xhr, stat, err) {
          this.setState({error: err});
        }.bind(this)
      });
    },
    handleDelete: function() {
      $.ajax({
        type: 'post',
        url: '/ajax/del',
        xhrFields: {
          withCredentials: true
        },
        data: {
          host: this.props.host,
        },
        success: function(data, stat, xhr) {
          if (data.success) {
            this.props.onDeleted(this.state.host);
          } else {
            this.setState({error: data.error});
          }
        }.bind(this),
        error: function(xhr, stat, err) {
          this.setState({error: err});
        }.bind(this)
      });
    },
    canDelete: function() {
      if (!this.props.blank &&
          (this.props.host == this.state.host)) {
        return (
          <button className='btn btn-md btn-danger' onClick={this.handleDelete}>
            <span className='glyphicon glyphicon-remove' />
          </button>
        );
      }
    },
    canSave: function() {
      try {
        if (((this.state.title        != this.props.title) ||
             (this.state.host         != this.props.host)  ||
             (this.state.url          != this.props.url)   ||
             (this.state.desc         != this.props.desc)) &&
            ((this.state.title.length > 0) &&
             (this.state.host.length  > 0) &&
             (this.state.url.length   > 0) &&
             ($.inArray(this.state.host, reserved) == -1))) {
          return (
            <button className='btn btn-md btn-success' onClick={this.handleSave}>
              <span className='glyphicon glyphicon-save' />
            </button>
          );
        }
      } catch(e) {}
    },
    showStats: function() {
      if (!this.props.blank) {
        return (
          <span className='small'>
            Since: {this.props.since}, Hits: {this.props.hits}
          </span>
        );
      }
    },
    showError: function() {
      if (this.state.error) {
        return (
          <div className='well well-sm'>
            Error: {this.state.error}
          </div>
        );
      }
    },
    render: function() {
      return (
        <tr>
          <th>
            <div className='btn-group-vertical'>
              {this.canSave()}
              {this.canDelete()}
            </div>
          </th>
          <th>
            <input style={this.state.hostStyle} onChange={this.handleChange.bind(this, 'host')} type='text' className='form-control' placeholder='Host' value={this.state.host} />
          </th>
          <th>
            <input style={this.state.titleStyle} onChange={this.handleChange.bind(this, 'title')} type='text' className='form-control' placeholder='Title' value={this.state.title} />
            <input style={this.state.urlStyle} onChange={this.handleChange.bind(this, 'url')} type='text' className='form-control' placeholder='URL' value={this.state.url} />
            {this.showStats()}
            {this.showError()}
          </th>
          <th>
            <textarea style={this.state.descStyle} onChange={this.handleChange.bind(this, 'desc')} className='form-control' rows='3' placeholder='Description' value={this.state.desc} />
          </th>
        </tr>
      );
    },
  });

  // PANEL
  var AdminPanel = React.createClass({
    getInitialState: function() {
      return {
        sites: {}
      };
    },
    deletedSite: function(host) {
      var sites = $.extend({}, this.state.sites);
      delete sites[host];
      this.replaceState({sites: sites});
    },
    savedSite: function(orig, data) {
      var sites = $.extend({}, this.state.sites);
      delete sites[orig];
      sites[data.host] = data;
      this.replaceState({sites: sites});
    },
    showMsg: function() {
      if (this.state.msg) {
        return (
          <div>
            <br/>
            <div className='well'>
              {this.state.msg}
            </div>
          </div>
        );
      }
    },
    handleSave: function() {
      $.ajax({
        type: 'get',
        url: '/ajax/sites/save',
        xhrFields: {
          withCredentials: true
        },
        success: function(data, stat, xhr) {
          if (data.success) {
            this.setState({msg: 'Saved successfully! (size: ' + data.data + ' bytes)'});
          } else {
            this.setState({msg: 'Error: ' + data.error});
          }
        }.bind(this),
        error: function(xhr, stat, err) {
          this.setState({msg: 'Error: ' + err});
        }.bind(this)
      });
    },
    componentDidMount: function() {
      $.ajax({
        type: 'get',
        url: '/ajax/sites/get',
        xhrFields: {
          withCredentials: true
        },
        success: function(data, stat, xhr) {
          if (data.success) {
            this.replaceState({sites: data.data});
          } else {
            this.setState({msg: 'Error: ' + data.error});
          }
        }.bind(this),
        error: function(xhr, stat, err) {
          this.setState({msg: 'Error: ' + err});
        }.bind(this)
      });
    },
    render: function() {
      return (
        <div>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th width='64px'>&nbsp;</th>
                <th width='164px'>Host</th>
                <th>Title and URL</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.sites).sort().map(function (host) {
                var site = this.state.sites[host];
                number++;
                return (
                  <Site key={'site' + number} onSaved={this.savedSite} onDeleted={this.deletedSite} {...site} />
                );
              }, this)}
              <Site key={'site' + number} onSaved={this.savedSite} blank='true' />
            </tbody>
          </table>
          <div className='btn-group'>
            <a className='btn btn-primary' href='/'>
              <span className='glyphicon glyphicon-arrow-left' />
              &nbsp;
              Back to index
            </a>
            <button className='btn btn-danger' onClick={this.handleSave}>
              <span className='glyphicon glyphicon-save' />
              &nbsp;
              Save data to disk
            </button>
          </div>
          {this.showMsg()}
        </div>
      );
    }
  });

  React.render(<AdminPanel />, document.getElementById('admin'));
});
