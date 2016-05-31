'use strict';
// client data helpers
angular.module('swigit.data_mdl', [])

  .factory('data_fac',['$http','auth_fac',function($http,auth_fac) {

    // http requests with params object, returns promise
    const GET = (params) => $http({method:'GET', url:'/_api/posts', data:params});
    const POST = (params) => $http({method:'POST', url:'/_api/posts', data:params});

// 'db' structure example:
// --->
    // const db = {
    //   lukas: {
    //     fullname: 'LM Welinder',
    //     data: { feed: postArray, hash: postIndexByUrlSlug }
    //   },
    //   anotherUserName: {
    //     fullname: 'Another Name',
    //     data: { feed: postArray, hash: postIndexByUrlSlug }
    //   }
    // };
    const db = {};

    /**
     * [ 'Feed' constructor, accepts data from server and indexes
     *   the array of posts by url_slug property for quick lookup ]
     * @param {[Object]} data [ server response w/ properties:
     *                          fullname(String), feed(Array) ]
     */
    const Feed = function(data) {
      let hash = data.feed.reduce((curr, val) => {
        curr[val.url_slug] = val;
        return curr;
      },{});
      this.fullname = data.fullname;
      this.data = {feed:data.feed, hash:hash};
    };
    
    /**
     * [get_feed: checks local db object for feed data using params,
     * if none exists, make http call to the server; params as data  ]
     * @param  {[Object]} params    [ query for local 'db' or server ]
     * @return {[Feed || Promise]}  [ if 'params.feed' in 'db', 
     *                                    return Object
     *                                  else,
     *                                    query server,
     *                                    construct Feed for 'db',
     *                                    return promise              ]
     */
    const get_feed = function(params) {
      if(db[params.feed])
        return db[params.feed];
      return GET(params) 
        .then((resp) => (db[params.feed] = new Feed(resp.fullname,resp.feed)))
        .catch((err) => ( console.error(err) )); //TODO: consider redirecting to error page
    };

    /**
     * [get_post: checks local db object for post data using params,
     * if none exists, make http call to the server; params obj as data]
     * @param  {[Object]} params    [ query for local 'db' or server ]
     * @return {[Feed || Promise]}  [ if 'params' in 'db', 
     *                                    return Object
     *                                  else,
     *                                    query server,
     *                                    construct Feed for 'db',
     *                                    return promise             ]
     */
    const get_post = function(params) {
      if(db[params.feed].hash[params.url_slug])
        return db[params.feed].hash[params.url_slug];
      return GET(params)
        .then((resp) => (db[params.feed] = new Feed(resp.data)))
        .catch((err) => ( console.error(err) )); //TODO: consider redirecting to error page
    };

    const upd_post = function(params) {
      params.username = $window.localStorage.getItem('swigit.bling');
      if(!params)
        throw error('Invalid Post Data!');
      return POST(params)
        .then((resp) => (console.log(resp)))
        .catch((err) => ( console.error(err) )); //TODO: consider redirecting to error page
    };

    return {
      get_feed: get_feed,
      get_post: get_post,
      upd_post: upd_post
    };

  }]);






