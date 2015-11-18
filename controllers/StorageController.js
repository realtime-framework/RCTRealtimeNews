'use strict';

var React = require('react-native');
var {
  Platform
} = React;

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var confModule = require('../config/Config');
var Config = new confModule();

if(Platform.OS === 'ios'){
  var storage = require('../sdk/RCTRealtimeCloudStorageIOS');
}
else{
  var storage = require('../sdk/RCTRealtimeCloudStorageAndroid');
}

var RCTRealtimeCloudStorage = new storage();

var dateModule = require('../utils/DateHelper');
var dateInstance = new dateModule();


var EventEmitter = require('RCTDeviceEventEmitter');

var sprintf = require("sprintf-js").sprintf;

var Alert = require('../utils/alert');
var AlertDialog = new Alert();

var instance;

var newsList = [];

var firstMonthYearDate;

var cachedNewsList = [];

var StorageController = React.createClass({

  init: function(){

    localStorage._loadCachedNews(this.initWithCache);   
  },

  initWithCache: function(savedNewsList){
    if(savedNewsList){
      cachedNewsList = JSON.parse(savedNewsList);
    }
    localStorage._getToken(this.storageInitCallback);
  },

  getCachedNewsList: function(){
    return cachedNewsList;
  },

  resetStorage: function(){
    instance = null;
  },

  storageInitCallback: function(token){
    fetch(sprintf(Config.CODEHOSTING_NOTIFICATIONS_URL, Config.APPKEY, token), {method: 'post', 
      headers: {'Accept': 'application/json','Content-Type': 'application/json'},body:''})
      .then((response) => response.text())
      .then((responseText) => {
        if(responseText.contains("true")){
          EventEmitter.emit(Config.STORAGE_NOTIFICATIONS);
        }
        else{
          AlertDialog.show('Unable to authenticate');
        }
      })
      .catch((error) => {
        AlertDialog.show('An error has occured: '+ error);
      })
      .finally(() => {
        
      });

    if(Platform.OS === 'ios'){
      var storageRef = RCTRealtimeCloudStorage.storageRef(Config.APPKEY, '', token);
    }
    else{
      var storageRef = RCTRealtimeCloudStorage.storageRef(Config.APPKEY, token);
    }

    storageRef.onReconnecting(function(){
      console.log('onReconnecting');
      EventEmitter.emit(Config.STORAGE_RECONNECTING);
    });

    storageRef.onReconnected(function(){
      console.log('onReconnected');
      EventEmitter.emit(Config.STORAGE_RECONNECTED);
    });

    var tabref = RCTRealtimeCloudStorage.table(Config.TABLE_CONTENTS);
    tabref.on('StorageEvent_UPDATE', function(item){
      StorageController.prototype.storageItemUpdate(item);
    });
    tabref.on('StorageEvent_DELETE', function(item){
      StorageController.prototype.storageItemDelete(item);
    });
    EventEmitter.emit(Config.STORAGE_INIT);
  },

  checkIsCached: function(timestamp){
    for (var i=0; i<cachedNewsList.length; i++) {
      var newsItem = cachedNewsList[i];
      if(newsItem.Timestamp === timestamp){
        return cachedNewsList[i];
      }
    }
    return null;
  },

  getContentsByMonthYearInit: function(currentDate){    
    var tabref = RCTRealtimeCloudStorage.table(Config.TABLE_CONTENTS);
    var itemsMaxLimit = Config.ITEMS_MAX - newsList.length;
    tabref.limit(itemsMaxLimit);
    tabref.equalsString(Config.ITEM_PROPERTY_MONTHYEAR, currentDate).desc().getItems(function(receivedData) {
      console.log(receivedData);
      if(receivedData){
        var itemCached = StorageController.prototype.checkIsCached(receivedData.Timestamp);
        if(itemCached){
          itemCached.isCached = true;
          newsList.push(itemCached);
        }
        else{
          newsList.push(receivedData);
        }
      }
      else{
        localStorage._getFirstContentMonthYear(StorageController.prototype.checkLimits,currentDate);        
      }
    },
    function(data){
      console.log('error:' + JSON.stringify(data));
    });
  },

  loadMoreData: function(loadMoreDataList,lastMonthYear,lastTimestamp,callback){
    var tabref = RCTRealtimeCloudStorage.table(Config.TABLE_CONTENTS);
    tabref.limit(Config.ITEMS_MAX);
    tabref.desc().equalsString(Config.ITEM_PROPERTY_MONTHYEAR, lastMonthYear).lesserThanString(Config.ITEM_PROPERTY_TIMESTAMP, lastTimestamp).getItems(function(receivedData) {
      console.log(receivedData);
      if(receivedData){
        var itemCached = StorageController.prototype.checkIsCached(receivedData.Timestamp);
        if(itemCached){
          itemCached.isCached = true;
          loadMoreDataList.push(itemCached);
        }
        else{
          loadMoreDataList.push(receivedData);
        }
      }
      else{
        StorageController.prototype.checkLimitsMoreData(loadMoreDataList,lastMonthYear, lastTimestamp, callback);        
      }
    },
    function(data){
      console.log('error:' + JSON.stringify(data));
    });
  },

  checkLimitsMoreData: function(loadMoreDataList,lastMonthYear,lastTimestamp,callback){
    var isDateBeyondLimit = dateInstance.isDateBeyondLimit(lastMonthYear, firstMonthYearDate);
    if(loadMoreDataList.length >= Config.ITEMS_MAX || isDateBeyondLimit){
        Array.prototype.push.apply(newsList,loadMoreDataList);
        callback(newsList, !isDateBeyondLimit);
    }
    else{
        StorageController.prototype.loadMoreData(loadMoreDataList,dateInstance.getPreviousMonth(lastMonthYear),lastTimestamp,callback);
    }
  },

  checkLimits: function(firstMonthYear, currentDate){
    if(newsList.length >= Config.ITEMS_MAX || dateInstance.isDateBeyondLimit(currentDate, firstMonthYear)){
        EventEmitter.emit(Config.STORAGE_UPDATE, { list: newsList });
        firstMonthYearDate = firstMonthYear;
    }
    else{
        StorageController.prototype.getContentsByMonthYearInit(dateInstance.getPreviousMonth(currentDate));
    }
  },

  storageItemUpdate: function(item){
    console.log("Storage Item update");
    EventEmitter.emit(Config.STORAGE_REFRESH, { itemUpdated: item });
  },

  storageItemDelete: function(item){
    console.log("Storage Item delete");
    EventEmitter.emit(Config.STORAGE_DELETE, { itemDeleted: item });
  },

  updateData: function(){
    EventEmitter.emit(Config.STORAGE_UPDATE, { list: newsList });
  },

  render: function() {},

});

StorageController.createInstance = function(){
  var object = new StorageController();
  object.init();
  return object;
}

StorageController.getInstance = function(){
  if (!instance) {
    instance = StorageController.createInstance();
  }
  return instance;
}

module.exports = StorageController;
