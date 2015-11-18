'use strict';

var React = require('react-native');
var {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView
} = React;

var HEADER = '#3b5998';
var BGWASH = 'rgba(255,255,255,0.8)';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';

var WebViewAndroid = require('react-native-webview-android');

var WebViewModule = React.createClass({

  getInitialState: function() {
    return {
      url: this.props.url,
      status: 'No Page Loaded',
      backButtonEnabled: true,
      forwardButtonEnabled: true,
      loading: true,
      scalesPageToFit: true,
      body: this.props.body
    };
  },

  render: function() {
    if(Platform.OS === 'ios'){
      if(this.state.body){
        return(
          <View style={[styles.containerIOS]}>
            <View style={[styles.addressBarRow]}>
              <TouchableOpacity
                onPress={this.goBack}
                style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
                <Text>
                   {'<'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.goForward}
                style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
                <Text>
                  {'>'}
                </Text>
              </TouchableOpacity>
          </View>
       
          <WebView
              ref={WEBVIEW_REF}
              automaticallyAdjustContentInsets={false}
              style={styles.webView}
              html={this.state.body}
              javaScriptEnabledAndroid={true}
              onNavigationStateChange={this.onNavigationStateChange}
              startInLoadingState={false}
              scalesPageToFit={this.state.scalesPageToFit}
            />
          </View>
        );
      }
      else{
        return(
          <View style={[styles.containerIOS]}>
            <View style={[styles.addressBarRow]}>
              <TouchableOpacity
                onPress={this.goBack}
                style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
                <Text>
                   {'<'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.goForward}
                style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
                <Text>
                  {'>'}
                </Text>
              </TouchableOpacity>
          </View>
          <WebView
              ref={WEBVIEW_REF}
              automaticallyAdjustContentInsets={false}
              style={styles.webView}
              url={this.state.url}
              javaScriptEnabledAndroid={true}
              onNavigationStateChange={this.onNavigationStateChange}
              startInLoadingState={true}
              scalesPageToFit={this.state.scalesPageToFit}
            />
          </View>
        );
      }
    }else{
      if(this.state.body){
        return(
          <WebViewAndroid
              ref={WEBVIEW_REF}
              style={styles.webView}
              html={this.state.body}
              javaScriptEnabled={true}
            />
        );
      }
      else{ 
        return(
          <WebViewAndroid
              ref={WEBVIEW_REF}
              style={styles.webView}
              url={this.state.url}
              javaScriptEnabled={true}
            />
        );
      }
    }
  },

  renderError(){
    console.log(Error)
  },

  goBack: function() {
    this.refs[WEBVIEW_REF].goBack();
  },

  goForward: function() {
    this.refs[WEBVIEW_REF].goForward();
  },

  onNavigationStateChange: function(navState) {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      url: navState.url,
      status: navState.title,
      loading: navState.loading,
      scalesPageToFit: true
    });
  }
});

var styles = StyleSheet.create({
  containerAndroid: {
    flex: 1,
    backgroundColor: HEADER
  },
  containerIOS: {
    flex: 1,
    backgroundColor: HEADER,
    marginTop: 64
  },
  addressBarRow: {
    flexDirection: 'row',
    padding: 8,
  },
  webView: {
    flex:1,
    backgroundColor: BGWASH
  },
  navButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BGWASH,
    borderColor: 'transparent',
    borderRadius: 3,
  },
  disabledButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DISABLED_WASH,
    borderColor: 'transparent',
    borderRadius: 3,
  },
  goButton: {
    height: 24,
    padding: 3,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: BGWASH,
    borderColor: 'transparent',
    borderRadius: 3,
    alignSelf: 'stretch',
  },
  spinner: {
    width: 20,
    marginRight: 6,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 22,
  },
  statusBarText: {
    color: 'white',
    fontSize: 13,
  }
});

module.exports = WebViewModule;