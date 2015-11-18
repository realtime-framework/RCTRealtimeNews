'use strict';

var React = require('react-native');
var {
  Image,
  ListView,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  Platform
} = React;

var Subscribable = require('Subscribable');
var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var moduleStorage = require('../controllers/StorageController'); 

var LoadingIndicator = require('../utils/loading');

var confModule = require('../config/Config');
var Config = new confModule();

var dateModule = require('../utils/DateHelper');
var dateInstance = new dateModule();

var InfiniteScrollView = require('react-native-infinite-scroll-view');

var Alert = require('../utils/alert');
var AlertDialog = new Alert();

var LocalStorage = require("../utils/local_storage");
var localStorage = new LocalStorage();

var PlatformVisible = require('../utils/PlatformVisible');

var newsList;

var ListScreen = React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState: function() {
    return {
      dataSource: null,
      canLoadMoreContent: true,
      isLoadingContent: false
    };
  },

  componentDidMount: function(){
    this.refs.loadingControl.startLoading();
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_UPDATE, this.updateList);
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_FILTER, this.tabFilter);
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_INIT, this.getContentsByMonthYear); 
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_REFRESH, this.checkNewOrUpdated); 
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_DELETE, this.checkDeleted); 
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_RECONNECTING, this.reconnecting); 
    this.addListenerOn(RCTDeviceEventEmitter, Config.STORAGE_RECONNECTED, this.reconnected); 
    this.addListenerOn(RCTDeviceEventEmitter, Config.DRAWER_FILTER, this.drawerFilter);
  },

  getContentsByMonthYear: function(){
    var instance = moduleStorage.getInstance();
    var currentDate = dateInstance.getCurrentDate();
    newsList = instance.getContentsByMonthYearInit(currentDate);   
  },

  updateList: function(args){
    newsList = args.list;
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(newsList);
    this.setState({dataSource: newsDataSource});
    console.log("Update list");
    //this.refs.loadingControl.stopLoading();
  },

  checkDeleted: function(args){
    console.log("Item deleted");
    var itemDeleted = args.itemDeleted;
    for(var i = 0; i < newsList.length; i++) {
      if (newsList[i].Timestamp === itemDeleted.Timestamp) {
        newsList.splice(i, 1);
        break;
      }
    }
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(newsList);
    this.setState({dataSource: newsDataSource});
  },

  checkNewOrUpdated: function(args){
    var itemUpdated = args.itemUpdated;
    var isNew = true;
    for(var i = 0; i < newsList.length; i++) {
      if (newsList[i].Timestamp === itemUpdated.Timestamp) {
        newsList[i] = itemUpdated;
        newsList[i].Updated = true;
        newsList[i].IsNew = false;
        isNew = false;
        break;
      }
    }
    if(isNew){
      newsList.splice(0, 0, itemUpdated);
      newsList[0].Updated = false;
      newsList[0].IsNew = true;
    }
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(newsList);
    this.setState({dataSource: newsDataSource});
    
  },

  updateCachedItem: function(item, rowID){
    item.isCached = true;
    newsList[rowID] = item;

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(newsList);
    this.setState({dataSource: newsDataSource});
  },

  tabFilter: function(type){
    if(type.toLowerCase() === 'recents'){
      var filteredNewsList = newsList;
    } else{
      var filteredNewsList = newsList.filter(function (el, index, arr) {
        return (el.Type.toLowerCase() === type.toLowerCase());
      });
    }

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(filteredNewsList);
    this.setState({dataSource: newsDataSource});
  },

  drawerFilter: function(tag){
    if(tag.toLowerCase() === 'recent'){
      var filteredNewsList = newsList;
    } else{
      var filteredNewsList = newsList.filter(function (el, index, arr) {
        return (el.Tag.toLowerCase() === tag.toLowerCase() || el.Type.toLowerCase() === tag.toLowerCase());
      });
    }

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var newsDataSource = ds.cloneWithRows(filteredNewsList);
    this.setState({dataSource: newsDataSource});
  },

  loadMoreNews: function(){
    var instance = moduleStorage.getInstance();
    var loadMoreDataNewsList = [];
    var lastTimestamp = this.refs.listView.props.dataSource._dataBlob.s1[this.refs.listView.props.dataSource._dataBlob.s1.length-1].Timestamp;
    var lastMonthYear = this.refs.listView.props.dataSource._dataBlob.s1[this.refs.listView.props.dataSource._dataBlob.s1.length-1].MonthYear;
    instance.loadMoreData(loadMoreDataNewsList,lastMonthYear,lastTimestamp,this.callbackLoadMoreNews);
    this.setState({isLoadingContent: true});
    this.setState({canLoadMoreContent: false});
  },

  callbackLoadMoreNews: function(newsList, canLoadMoreNews){
    this.updateList({ list: newsList })
    this.setState({isLoadingContent: false});
    this.setState({canLoadMoreContent: canLoadMoreNews});
  },

  reconnecting: function(){
    localStorage._loadCachedNews(this.loadOfflineData);
    AlertDialog.show('Reconnecting to storage...');
  },

  loadOfflineData: function(cachedNewsList){
    if(cachedNewsList){
      cachedNewsList = JSON.parse(cachedNewsList);
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      var newsDataSource = ds.cloneWithRows(cachedNewsList);
      this.setState({dataSource: newsDataSource});
    }
    else{
      this.setState({dataSource: null});
    }
  },

  reconnected: function(){
    this.getContentsByMonthYear();
    AlertDialog.show('Reconnected to storage!');
  },
  
  render: function() {
    if(this.state.dataSource){
      var topMargin = Platform.OS === 'ios' ? 64 : 0;
      console.log(topMargin);
      return (
        <View style={{flex: 1, marginTop: topMargin}}>
          <ListView
            ref="listView"
            renderScrollComponent={props => <InfiniteScrollView {...props} />}
            distanceToLoadMore = {0}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            canLoadMore={this.state.canLoadMoreContent}
            isLoadingMore={this.state.isLoadingContent}
            onLoadMoreAsync ={this.loadMoreNews}
          />
          <PlatformVisible.iOS>
            <TabBarIOS 
              ref="tabBar"
              style={{flex: 0.1}}
              translucent={false}
              selectedTab={this.state.selectedTab} >
              <TabBarIOS.Item
                title="Recents"
                selected={this.state.selectedTab === 'recents'}
                icon={require('../recents.png')}
                onPress={() => {
                    this.setState({
                        selectedTab: 'recents',
                    });
                    this.tabFilter('Recents');
                }}>
                <Text>Recents</Text>
              </TabBarIOS.Item>
              <TabBarIOS.Item
                title="White Papers"
                selected={this.state.selectedTab === 'White Papers'}
                icon={require('../whitepapers.png')}
                onPress={() => {
                    this.setState({
                        selectedTab: 'White Papers',
                    });
                    this.tabFilter('White Papers');
                }}>
                <Text>White Papers</Text>
              </TabBarIOS.Item>
              <TabBarIOS.Item
                title="Blog"
                selected={this.state.selectedTab === 'blog'}
                icon={require('../blog.png')}
                onPress={() => {
                    this.setState({
                        selectedTab: 'blog',
                    });
                    this.tabFilter('Blog');
                }}>
                <Text>Blog</Text>
              </TabBarIOS.Item>
            </TabBarIOS>
          </PlatformVisible.iOS>
        </View>
      );
    }
    else{
      return (
       <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <LoadingIndicator ref="loadingControl"/>
        </View>
      );
    }
  },

  checkUpdatedStyle: function(updated){
    if(updated){
      return{
        borderRadius: 8,
        backgroundColor: '#FF0000',
        color: '#FFFFFF',
        padding: 5,
        marginRight: 10,
        fontSize: 14,
      } 
    }
    else{
      return{
        opacity: 0
      }
    }
  },

  checkNewStyle: function(isNew){
    if(isNew){
      return{
        borderRadius: 8,
        backgroundColor: '#FF0000',
        color: '#FFFFFF',
        padding: 5,
        marginRight: 10,
        fontSize: 14,
      } 
    }
    else{
      return{
        opacity: 0
      }
    }
  },

  onPressCacheBtn: function(rowData, rowID){
    var isCached = rowData.isCached;
    if(isCached){
      return null;
    }
    else{
      this._saveNews(rowData, rowID);
    }
  },

  _renderRow: function(rowData: string, sectionID: number, rowID: number) {

    var imgSource = {
      uri: rowData.IMG,
    };

    var body = rowData.Body;
    var url = rowData.URL;
    var updated = rowData.Updated;
    var isNew = rowData.IsNew;
    var isCached = rowData.isCached;
    var isCachedImgSource = isCached ? require('../saved.png') : require('../download.png');

    var date = dateInstance.convertTimestampToDate(parseInt(rowData.Timestamp/1));

    return (
      <TouchableHighlight onPress={() => this._pressRow(rowID, url, body)}>
        <View>

          <View style={styles.row}>
            <Text style={styles.text, styles.marginL}>
                {rowData.Title}
            </Text>

            <View style={styles.textRow}>
              <Image style={styles.thumb} source={imgSource} />
              <Text style={styles.text}>
                {rowData.Description}
              </Text>
            </View>
            
            <View style={styles.saveButtonView}>
              <Text style={this.checkUpdatedStyle(updated)}>
                Updated
              </Text>
              <Text style={this.checkNewStyle(isNew)}>
                New
              </Text>
              <TouchableHighlight onPress={() => this.onPressCacheBtn(rowData, rowID)}>
                <Image style={styles.saveButton} source={isCachedImgSource} />
              </TouchableHighlight>
            </View>

          </View>

          <View style={styles.textFooter}>
            <Text style={styles.textDate}>
              {date}
            </Text>
            <Text style={styles.tag}>
              {rowData.Tag}
            </Text>
          </View>
          <View style={styles.separator} />
        </View>
      </TouchableHighlight>
    );
  },

  _saveNews: function(rowData, rowID){
    var instance = moduleStorage.getInstance();
    var cachedNewsList = instance.getCachedNewsList();
    var url = rowData.URL;
    fetch(url, {method: 'get'})
      .then((response) => response.text())
      .then((responseText) => {
        var body = responseText;
        rowData.Body = body;
        rowData.isCached = true;

        if(cachedNewsList){
          cachedNewsList.push(rowData);
        }
        else{
          cachedNewsList = [];
          cachedNewsList.push(rowData);
        }

        localStorage._saveCachedNews(JSON.stringify(cachedNewsList));
        AlertDialog.show('News Saved!');
        this.updateCachedItem(rowData, rowID);
      })
      .catch((error) => {
        AlertDialog.show('An error has occured: '+ error.message);
      })
      .finally(() => {
        
      });
  },

  _pressRow: function(rowID: number, url: string, body:string) {
    this.props.navigate(url,body);
    // this.props.navigator.push({
    //   component: WebViewScreen,
    //   passProps: { url: url, body: body },  
    // });
  },
});

var styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 5,
    paddingLeft: 5,
    backgroundColor: '#FCFCFC',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    backgroundColor: '#FCFCFC',
  },
  textFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#FAFAFA',
  },
  saveButtonView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#FCFCFC',
  },
  saveButton: {
    marginRight: 5,
    width: 24,
    height: 24,
  },
  marginL: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  thumb: {
    width: 100,
    height: 100,
    marginTop: 3,
    marginRight: 10,
  },
  tag: {
    color: '#999999',
    fontSize: 13,
  },
  status: {
    borderRadius: 8,
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    padding: 5,
    marginRight: 10,
    fontSize: 14,
  },
  textDate: {
    flex: 1,
    color: '#999999',
    fontSize: 13,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
    color: '#999999',
  },
});

module.exports = ListScreen;