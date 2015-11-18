'use strict';

var React = require('react-native');
var {
  AsyncStorage
} = React;

var STORAGE_KEY = '@RealtimeNews:token';
var FIRST_CONTENT_MONTH_YEAR_KEY = '@RealtimeNews:firstContentMonthYear';
var CACHED_NEWS_KEY = '@RealtimeNews:cachedNews';

var LocalStorage = React.createClass({

  render: function() {},

  async _loadCachedNews(callback, rowData) {
    try {
        await AsyncStorage.getItem(CACHED_NEWS_KEY).then((value) => {
            callback(value,rowData);
        }).done();
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }, 

  async _saveCachedNews(newsList) {
    try {
      await AsyncStorage.setItem(CACHED_NEWS_KEY, newsList);
      console.log('Saved selection to disk: ' + newsList);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }, 

  async _getFirstContentMonthYear(callback, currentDate) {
    try {
        await AsyncStorage.getItem(FIRST_CONTENT_MONTH_YEAR_KEY).then((value) => {
            callback(value, currentDate);
        }).done();
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }, 

  async _setFirstContentMonthYear(firstMonthYear) {
    try {
      await AsyncStorage.setItem(FIRST_CONTENT_MONTH_YEAR_KEY, firstMonthYear);
      console.log('Saved selection to disk: ' + firstMonthYear);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }, 

  async _getToken(callback) {
    try {
        await AsyncStorage.getItem(STORAGE_KEY).then((value) => {
            callback(value);
        }).done();
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }, 

  async _deleteToken(callback) {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY).then(() => {
            callback();
        }).done();
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  },

  async _onValueChange(selectedValue) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, selectedValue);
      console.log('Saved selection to disk: ' + selectedValue);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
});

module.exports = LocalStorage;
