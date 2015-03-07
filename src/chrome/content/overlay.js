var simplepinboardbutton = {
    
  prefs: null,
  searchMode: "",
  searchKeyword: "pin",
  saveMode: "",

  bookmarkCurrent: function() {
    var uri   = window._content.document.location.href;
    var desc  = '';
    var title = '';
                
    var title = window._content.document.title;
        
    this.bookmarkCall(uri, desc, title);   
  },

  bookmarkLink: function() {
    var title = '';
    try {
      title = gContextMenu.linkText();
    }
    catch(err){
    }
    var desc = '';
    var uri  = gContextMenu.linkURL ? gContextMenu.linkURL : window._content.document.location.href;
    this.bookmarkCall(uri, desc, title);
  },

  bookmarkCall: function(uri, desc, title) {
    var where = 'current';
    var tags  = 'yes';
    switch(this.saveMode) {
      case "popuptags":
        tags  = 'yes';
        where = 'window';
        break;
      case "popup":
        tags  = 'no';
        where = 'window';
        break;
      case "samewindow":
        tags  = 'no';
        where = 'current';
        break;
      case "samewindowtags":
        tags  = 'yes';
        where = 'current';
        break;
    }

    var pinurl = 'https://pinboard.in/add?showtags='+tags+'&url='+encodeURIComponent(uri)+'&description='+encodeURIComponent(desc)+'&title='+encodeURIComponent(title);

    if (where == 'window') {
      void(open(pinurl,'pinboard', 'toolbar=no,scrollbars=yes,width=700,height=700'));
    } 
    else {
      openUILinkIn(pinurl, 'current');
    }
  },

  startup: function() {
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]  
         .getService(Components.interfaces.nsIPrefService)  
         .getBranch("extensions.simplepinboardbutton.");  
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);  
    this.prefs.addObserver("", this, false);  
       
    this.saveMode = this.prefs.getCharPref("savemode");
    this.searchMode = this.prefs.getCharPref("searchmode");

    // call search initialization
    this.initKeywordSearch();
  },

  shutdown: function() {
    // remove pref listener
    this.prefs.removeObserver("", this);  
  },

  observe: function(subject, topic, data) {  
     if (topic != "nsPref:changed")  
     {  
       return;  
     }  
   
     switch(data) {  
       case "savemode":
           this.saveMode = this.prefs.getCharPref("savemode");
           break;
       case "searchmode":
           this.searchMode = this.prefs.getCharPref("searchmode");
           this.initKeywordSearch();
           break;
     }  
  }, 

  onToolbarButtonCommand: function(e) {
    switch (e) {
      case "pin":
        this.bookmarkCurrent();
        break;
      case "home":
        openUILinkIn('https://pinboard.in/', 'current');
        break;
    }
  },

  onMenuItemCommand: function(e, url) {
    var pinurl = encodeURIComponent(url);

    switch(e) {
      case "pinLink":
        this.bookmarkLink(url);
        break;
      case "pinPage":
        this.bookmarkCurrent();
        break;
    }
  },

  initKeywordSearch: function() {
    var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
        .getService(Components.interfaces.nsINavBookmarksService);
    var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"]
        .getService(Components.interfaces.nsICookieManager2);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);

    //
    // Define the URIs for the keyword search
    //
    if (this.searchMode == "fulltext") {
      // set full text search query URI
      var uri = ios.newURI("http://pinboard.in/search/?query=%s&mine=Search+Mine", null, null);
    } else {
     // find cookies for pinboard.in 
     var cookies = cookieManager.getCookiesFromHost("pinboard.in");
     var uri = ios.newURI("http://pinboard.in/", null, null);
     var login = "";
     // find the login cookie and retrieve pinboard.in login name
     while (cookies.hasMoreElements()) {
       var cookie = cookies.getNext().QueryInterface(Components.interfaces.nsICookie);
       if (cookie.name == "login") {
         login = cookie.value;
       }
     }
     // set tag search query URI
     var uri = ios.newURI("http://pinboard.in/u:"+login+"/t:%s/", null, null)
    }


    //
    // Create/update a bookmark pointing to the search URI with
    // an associated keyword
    //
    var pinboardbm = bmsvc.getURIForKeyword(this.searchKeyword);
    // if there is no bookmark associated with this keyword we create one
    if (pinboardbm == null) {
      var menuFolder = bmsvc.bookmarksMenuFolder;
      var newBkmkId = bmsvc.insertBookmark(menuFolder, uri, bmsvc.DEFAULT_INDEX, "pinboard.in quick search");
      bmsvc.setKeywordForBookmark( newBkmkId, "pin");
    } else {
      // otherwise we retrieve all bookmarks for the keyword URI
      var bookmarksArray = bmsvc.getBookmarkIdsForURI(pinboardbm, {})
      // loop over bookmarks and if a our keyword is set for a bookmark, update URI
      for(var i=0, len=bookmarksArray.length; i < len; i++) {
        if (bmsvc.getKeywordForBookmark(bookmarksArray[i]) == this.searchKeyword) {
          bmsvc.changeBookmarkURI(bookmarksArray[i], uri);
        }
      }
    }
  }

};

window.addEventListener("load", function(e) { simplepinboardbutton.startup(); }, false);
window.addEventListener("unload", function(e) { simplepinboardbutton.shutdown(); }, false);
