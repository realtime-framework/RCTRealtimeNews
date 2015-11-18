'use strict';

var React = require('react-native');

var Config = React.createClass({
  
  render: function() {}
});

Config.prototype.TOKEN = 'YOUR_TOKEN';
Config.prototype.APPKEY = 'YOUR_APP_KEY';
Config.prototype.CONNECTION_METADATA = 'Connection Metadata';
Config.prototype.PROJECT_ID = "YOUR_GOOGLE_PROJECT_NUMBER";

Config.prototype.TABLE_TAGS = "Tags";
Config.prototype.TABLE_CONTENTS = "Contents";

Config.prototype.ITEM_PROPERTY_MONTHYEAR= "MonthYear";
Config.prototype.ITEM_PROPERTY_TYPE= "Type";
Config.prototype.ITEM_PROPERTY_URL= "URL";
Config.prototype.ITEM_PROPERTY_TAG= "Tag";
Config.prototype.ITEM_PROPERTY_TITLE= "Title";
Config.prototype.ITEM_PROPERTY_IMG= "IMG";
Config.prototype.ITEM_PROPERTY_DESCRIPTION= "Description";
Config.prototype.ITEM_PROPERTY_TIMESTAMP= "Timestamp";
Config.prototype.ITEM_PROPERTY_BODY= "Body";

Config.prototype.BROADCAST_MESSAGE = "message";
Config.prototype.BROADCAST_EVENT = "realtime-storage-event";

Config.prototype.STORAGE_CONNECTED = 0;
Config.prototype.STORAGE_INIT = 1;
Config.prototype.STORAGE_REFRESH = 2;
Config.prototype.STORAGE_RECONNECTING = 3;
Config.prototype.STORAGE_RECONNECTED = 4;
Config.prototype.STORAGE_UPDATE = 5;
Config.prototype.STORAGE_DELETE = 6;
Config.prototype.STORAGE_REFRESH_RECONNECTED = 7;
Config.prototype.STORAGE_FILTER = 8;
Config.prototype.DRAWER_FILTER = 9;
Config.prototype.STORAGE_NOTIFICATIONS = 10;
Config.prototype.LOGOUT = 11;

Config.prototype.ITEMS_MAX = 5;

Config.prototype.DATE_FORMAT = "DD/MM/YYYY HH:mm";	
Config.prototype.MONTHYEAR_DATE_FORMAT = "MM/YYYY";
Config.prototype.DEFAULT_FIRST_CONTENT_DATE = "01/2015";

Config.prototype.CODEHOSTING_STORAGE_URL = "https://codehosting.realtime.co/%s/authenticate?user=%s&password=%s&role=%s";
Config.prototype.CODEHOSTING_NOTIFICATIONS_URL = "https://codehosting.realtime.co/%s/saveAuthentication?token=%s";
Config.prototype.CODEHOSTING_FIRST_CONTENT_DATE = "https://codehosting.realtime.co/%s/firstMonthYear";
Config.prototype.CLUSTER_URL = "http://ortc-developers.realtime.co/server/2.1/";

Config.prototype.ROLE = "iOSApp";

Config.prototype.NOTIFICATIONS_CHANNEL = "notifications";


module.exports = Config;