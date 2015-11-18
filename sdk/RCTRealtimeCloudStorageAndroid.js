//  Created by Joao Caixinha on 14/04/15.
//  Copyright (c) 2015 Realtime. All rights reserved.
//

/**
 * @providesModule RCTRealtimeCloudStorageAndroid
 * @flow
 */

'use strict';

var React = require('react-native');
var NativeModules = require('NativeModules');
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
var storage = NativeModules.RealtimeCloudStorage;
var RTEvents = {};
var instances = 0;

class RCTRealtimeCloudStorageAndroid extends React.Component {
	sId:Number;

	constructor(props) {
    	super(props);
    	this.sId = instances++;
	}

	static RTEventListener(notification, callBack: Function){
		var modNotification = String(notification);
		var channelExists = RTEvents[modNotification];
		if (channelExists){
			RCTRealtimeCloudStorageAndroid.RTRemoveEventListener(notification);
		}

		RTEvents[modNotification] = (
			require('RCTDeviceEventEmitter').addListener(
			  modNotification,
			  callBack
			)
		);
	};

	static RTRemoveEventListener(notification)
	{
		var modNotification = String(notification);
		RTEvents[modNotification].remove(),
		delete RTEvents[modNotification];
	};

	RTLog(tag,log){
		storage.log(tag, log);
	}


	storageRef(aApplicationKey, aAuthenticationToken){
		storage.storageRef(aApplicationKey, aAuthenticationToken, this.sId);
		return this;
	}

	storageRefCustom(aApplicationKey, aAuthenticationToken, aIsCluster, aIsSecure, aUrl){
		storage.storageRefCustom(aApplicationKey, aAuthenticationToken, aIsCluster, aIsSecure, aUrl, this.sId);
		return this;
	}

	getTables(success:Function, error:Function){
		storage.getTables(this.sId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.sId + "-getTables", function(data){
			if (data.error)
			{
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	table(tableName)
	{
		var tableref = new tableRef(this.sId, tableName);
		storage.table(tableName, this.sId, tableref.tId);
		return tableref;
	}

	isAuthenticated(aAuthenticationToken, success: Function, error: Function)
	{
		storage.isAuthenticated(aAuthenticationToken, this.sId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.sId + "-isAuthenticated", function(data){
			if (data.error)
			{
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	onReconnected(callback: Function){
		storage.onReconnect(this.sId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.sId + "-onReconnected", callback);
	}

	onReconnecting(callback: Function){
		storage.onReconnecting(this.sId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.sId + "-onReconnecting", callback);
	}

	activateOfflineBuffering(){
		storage.activateOfflineBuffering(this.sId);
	}

	deactivateOfflineBuffering(){
		storage.deactivateOfflineBuffering(this.sId);
	}
}


class tableRef{
	tId:String;
	sId:Number;
	name:String;


	constructor(storageRef, table) {
		this.sId = storageRef;
		this.name = table;
    	this.tId = table;
	}

	asc(){
		storage.asc(this.sId, this.tId);
		return this;
	}

	desc(){
		storage.desc(this.sId, this.tId);
		return this;
	}

	beginsWithString(item, value){
		storage.beginsWithString(item, value, this.sId, this.tId);
		return this;
	}

	beginsWithNumber(item, value){
		storage.beginsWithNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	betweenString(item, beginValue, endValue){
		storage.betweenString(item, beginValue, endValue, this.sId, this.tId);
		return this;
	}

	betweenNumber(item, beginValue, endValue){
		storage.betweenNumber(item, ""+beginValue, ""+endValue, this.sId, this.tId);
		return this;
	}
	
	containsString(item, value){
		containsString(item, value, this.sId, this.tId);
		return this;
	}

	containsNumber(item, value){
		storage.containsNumber(item, ""+value, this.sId, this.tId);
		return this;
	}
	
	equalsString(item, value){
		storage.equalsString(item, value, this.sId, this.tId);
		return this;
	}

	equalsNumber(item, value){
		storage.equalsNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	greaterEqualString(item, value){
		storage.greaterEqualString(item, value, this.sId, this.tId);
		return this;
	}

	greaterEqualNumber(item, value){
		storage.greaterEqualNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	greaterThanString(item, value){
		storage.greaterThanString(item, value, this.sId, this.tId);
		return this;
	}

	greaterThanNumber(item, value){
		storage.greaterThanNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	lesserEqualString(item, value){
		storage.lesserEqualString(item, value, this.sId, this.tId);
		return this;
	}

	lesserEqualNumber(item, value){
		storage.lesserEqualNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	lesserThanString(item, value){
		storage.lesserThanString(item, value, this.sId, this.tId);
		return this;
	}

	lesserThanNumber(item, value){
		storage.lesserThanNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	notContainsString(item, value){
		storage.notContainsString(item, value, this.sId, this.tId);
		return this;
	}

	notContainsNumber(item, value){
		storage.notContainsNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	notEqualString(item, value){
		storage.notEqualString(item, value, this.sId, this.tId);
		return this;
	}

	notEqualNumber(item, value){
		storage.notEqualNumber(item, ""+value, this.sId, this.tId);
		return this;
	}

	notNull(item){
		storage.notNull(item, this.sId, this.tId);
		return this;
	}
	Null(item){
		storage.Null(item, this.sId, this.tId);
		return this;
	}

	create(aPrimaryKey, aPrimaryKeyDataType, aProvisionType, aProvisionLoad, success: Function, error: Function){
		storage.create(aPrimaryKey, aPrimaryKeyDataType, aProvisionType, aProvisionLoad, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-create", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	createCustom(aPrimaryKey, aPrimaryKeyDataType, aSecondaryKey, aSecondaryKeyDataType, aProvisionType, aProvisionLoad, success: Function, error: Function){
		storage.createCustom(aPrimaryKey, aPrimaryKeyDataType, aSecondaryKey, aSecondaryKeyDataType, aProvisionType, aProvisionLoad, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-create", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	del(success: Function, error: Function){
		storage.del(this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-del", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	update(ProvisionType, aProvisionLoad, success: Function, error: Function){
		storage.update(ProvisionType, aProvisionLoad, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-update", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	item(primaryKey){
		var itemref = new itemRef();
		storage.item(primaryKey, (typeof primaryKey), this.sId, this.tId, itemref.iId);
		return itemref;
	}

	itemCustom(primaryKey, secondary){
		var itemref = new itemRef();
		storage.itemCustom(""+primaryKey,(typeof primaryKey) , ""+secondary, (typeof secondary), this.sId, this.tId, itemref.iId);
		return itemref;
	}

	getItems(itemSnapshot: Function, error: Function)
	{
		storage.getItems(this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-getItems", function(data){
			if (data && data.error) {
				error(data);
			}else
			{
				itemSnapshot(data);
			}
		});
	}

	push(aItem, success:Function, error: Function){
		storage.push(aItem, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-push", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	limit(value){
		storage.limit(value, this.sId, this.tId);
	}

	meta(meta, success:Function, error: Function){
		storage.meta(this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId + "-meta", function(data){
			if (data.error) {
				error(data);
			}else
			{
				success(data);
			}
		});
	}

	name(){
		return this.name;
	}

	on(eventType, callback: Function){
		storage.on(eventType, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId+"-on-"+eventType, callback);
	}

	onCustom(eventType, aPrimaryKeyValue, callback: Function){
		storage.onCustom(eventType, aPrimaryKeyValue, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId+"-on-"+eventType, callback);
	}

	off(eventType){
		storage.off(eventType, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTRemoveEventListener(this.tId+"-on-"+eventType);
	}

	offCustom(eventType, aPrimaryKey){
		storage.offCustom(eventType, aPrimaryKeyValue, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTRemoveEventListener(this.tId+"-on-"+eventType);
	}

	once(eventType, callback: Function){
		storage.once(eventType, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId+"-once-"+eventType, callback);
	}

	onceCustom(eventType, aPrimaryKey, callback: Function){
		storage.onceCustom(eventType, aPrimaryKeyValue, this.sId, this.tId);
		RCTRealtimeCloudStorageAndroid.RTEventListener(this.tId+"-once-"+eventType, callback);
	}
	enablePushNotifications(){
		storage.enablePushNotifications(this.sId, this.tId);
	}
	disablePushNotifications(){
		storage.disablePushNotifications(this.sId, this.tId);
	}
}
	
class itemRef{
	iId:Number;

	constructor() {
    	this.iId = instances++;
	}

	del(success: Function, error: Function){
		storage.itemRefdel(this.iId, success, error);
	}

	get(success: Function, error: Function){
		storage.itemRefget(this.iId, success, error);
	}

	set(attributes, success: Function, error: Function){
		storage.itemRefset(attributes, this.iId, success, error);
	}

	incr(property, value, success:Function, error:Function){
		storage.itemRefincr(property, value, ithis.iId, success, error);
	}

	incrCustom(property, success:Function, error:Function){
		storage.itemRefincrCustom(property, this.iId, success, error);
	}

	decrValue(property, value, success:Function, error:Function){
		storage.itemRefdecrValue(property, value, ithis.iId, success, error);
	}

	decrCustom(property, success:Function, error:Function){
		storage.itemRefdecrCustom(property, this.iId, success, error);
	}

	on(eventType:String, callback: Function){
		storage.itemRefon(eventType, this.iId, callback);
	}

	off(eventType:String){
		storage.itemRefoff(eventType, this.iId);
	}

	once(eventType:String, callback: Function){
		storage.itemRefonce(eventType, this.iId, callback);
	}

	enablePushNotifications(){
		storage.itemRefenablePushNotifications(this.iId);
	}

	disablePushNotifications(){
		storage.itemRefdisablePushNotifications(this.iId);
	}
 }

 module.exports = RCTRealtimeCloudStorageAndroid;




