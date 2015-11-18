'use strict';

var React = require('react-native');
var {
  Platform,
  ActivityIndicatorIOS,
  ProgressBarAndroid,
  View,
  StyleSheet
} = React;

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var Loading = React.createClass({

  getInitialState() {
    return {
      animating: false,
      opacity: 0
    };
  },

  startLoading: function ()
  {
    this.setState({animating: true}); 
    this.setState({opacity: 1}); 
  },

  stopLoading: function()
  {
    this.setState({animating: false}); 
    this.setState({opacity: 0}); 
  },

  render: function() {
    switch(Platform.OS) {
      case 'ios':
        return(
          <ActivityIndicatorIOS
           animating={this.state.animating}
           style={[styles.centering, {height: 40}]}
           size="large"
         />
        );
        break;
    case 'android':
        return(
          <View style={{opacity: this.state.opacity}}>
            <ProgressBarAndroid />
          </View>
        );
        break;
    default:
        break;
    }
    return null;
  }
});

var styles = StyleSheet.create({
  centering: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

module.exports = Loading;