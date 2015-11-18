'use strict';

var React = require('react-native');
var {
  Platform,
  AlertIOS,
  ToastAndroid
} = React;

var Alert = React.createClass({

  show: function(text){
    switch(Platform.OS) {
      case 'ios':
        AlertIOS.alert(text);
        break;
    case 'android':
        ToastAndroid.show(text, ToastAndroid.SHORT);
        break;
    default:
        break;
    }
  },

  render: function() {}
});

module.exports = Alert;