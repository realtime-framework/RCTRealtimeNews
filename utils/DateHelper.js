'use strict';

var React = require('react-native');

var moment = require('moment');

var confModule = require('../config/Config');
var Config = new confModule();

var LocalStorage = require("./local_storage");
var localStorage = new LocalStorage();

var DateHelper = React.createClass({
  
  convertTimestampToDate: function(timestamp){
    var dateTime = moment(timestamp);
    return dateTime.format(Config.DATE_FORMAT);
  },

  getCurrentDate: function(){
  	var now = moment();
  	return now.format(Config.MONTHYEAR_DATE_FORMAT);
  },

  getPreviousMonth: function(currentDate){
  	var current = moment(currentDate);
  	var splitCurrentDate = currentDate.split('/');
  	var newCurrentDate = moment(splitCurrentDate[1] + '-' + splitCurrentDate[0]);
  	return newCurrentDate.add(-1,'month').format('MM/YYYY');
  },

  isDateBeyondLimit: function(currentDate, maxDate){
  	var splitCurrentDate = currentDate.split('/');
  	var splitMaxDate = maxDate.split('/');
  	var newCurrentDate = splitCurrentDate[1] + '-' + splitCurrentDate[0] + '-01';
  	var newMaxDate = splitMaxDate[1] + '-' + splitMaxDate[0] + '-01';
  	return moment(newCurrentDate).isBefore(newMaxDate);
  },

  render: function() {}
});

module.exports = DateHelper;