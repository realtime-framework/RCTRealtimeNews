'use strict';

var React = require('react-native');
var {
  View,
  Text,
  ListView,
  TouchableHighlight,
  Image,
  StyleSheet
} = React

var CategoryList = ['Recent', 'Blog', 'Storage', 'News', 'Guides', 
        'Examples', 'Messaging', 'White Papers', 'Session', 'Logout'];

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var confModule = require('../config/Config');
var Config = new confModule();

var EventEmitter = require('RCTDeviceEventEmitter');

module.exports = React.createClass({

  getInitialState: function() {
  var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  return {
      dataSource: ds.cloneWithRows(this._genRows({})),
    };
  },

  _pressData: ({}: {[key: number]: boolean}),

  componentWillMount: function() {
    this._pressData = {};
  },

  render: function() {
    return (
      <ListView
        style={styles.controlPanel}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
      />
    );
  },

  _renderRow: function(rowData: string, sectionID: number, rowID: number) {
    
    if(rowID == 0 || rowID == 1 || rowID == 7 || rowID == 8){
      return (
        <TouchableHighlight onPress={() => this._pressRow(rowID)}>
          <View>

            <Text style={styles.menuListItems}>
                  {CategoryList[rowID]}
            </Text>
    
            <View style={styles.separator} />
          </View>
        </TouchableHighlight>
      );
    }
    else{
      return (
        <TouchableHighlight onPress={() => this._pressRow(rowID)}>
          <View>

            <Text style={styles.menuSubListItems}>
                  {CategoryList[rowID]}
            </Text>
    
            <View style={styles.separator} />
          </View>
        </TouchableHighlight>
      );
    }

    
  },

  _genRows: function(pressData: {[key: number]: boolean}): Array<string> {
    var dataBlob = [];
    for (var ii = 0; ii < 10; ii++) {
      var pressedText = pressData[ii] ? ' (pressed)' : '';
      dataBlob.push('Row ' + ii + pressedText);
    }
    return dataBlob;
  },

  _pressRow: function(rowID: number) {
    if(rowID == CategoryList.length - 1){
      this.props.logout();
    }
    else{
      this._pressData[rowID] = !this._pressData[rowID];
      this.setState({dataSource: this.state.dataSource.cloneWithRows(
        this._genRows(this._pressData)
      )});
      this.props.closeDrawer();
      EventEmitter.emit(Config.DRAWER_FILTER, CategoryList[rowID] );
    }
  }
});

var styles = StyleSheet.create({
  controlPanel: {
    backgroundColor: '#E6E6E6'
  },
  menuListItems: {
    marginLeft: 20,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
    color: 'black'
  },
  menuSubListItems: {
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
    textAlign: 'left'
  },
  separator: {
    height: 10
  }
});