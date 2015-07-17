$(function() {
  var $login = $('#login');
  var $help  = $('#help');

  window.login = function() {
    $login.toggle();
  };

  window.help = function() {
    $help.toggle('slow');
  };
});
