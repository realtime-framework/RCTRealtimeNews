'use strict';

var React = require('react-native');
var {
  Platform,
  View,
  LinkingIOS
} = React;

var WebIntent = require('react-native-webintent');

var Linking = React.createClass({

  openURL: function (url)
  {
    switch(Platform.OS) {
      case 'ios':
        LinkingIOS.openURL(url);
        break;
    case 'android':
        WebIntent.open(url);
        break;
    default:
        break;
    }
  },

  render: function() {}
});

module.exports = Linking;