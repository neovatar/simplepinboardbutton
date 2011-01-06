var simplepinboardbutton = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("simplepinboardbutton-strings");

    // call search initialization
    simplepinboardbutton.initSearch();
  },

  onToolbarButtonCommand: function(e) {
    var command = [];
    command["pin"] = "javascript:q=location.href;if(window.getSelection){d=window.getSelection();}else{d='';};p=document.title;void(open('http://pinboard.in/add?showtags=yes&url='+encodeURIComponent(q)+'&description='+encodeURIComponent(d)+'&title='+encodeURIComponent(p),'Pinboard',%20'toolbar=no,width=700,height=600'));";
    command["home"] = "javascript:void(open('http://pinboard.in/','_newtab'));";
    document
      .getElementById("content")
      .webNavigation
      .loadURI(command[e], 0, null, null, null);
  },

  onMenuItemCommand: function(e, url) {
    var command = [];
    var pinurl = encodeURIComponent(url);
    command["pinLink"] = "javascript:void(open('http://pinboard.in/add?showtags=yes&url="+pinurl+"','Pinboard',%20'toolbar=no,width=700,height=600'));"; 
    command["pinPage"] = "javascript:q=location.href;if(window.getSelection){d=window.getSelection();}else{d='';};p=document.title;void(open('http://pinboard.in/add?showtags=yes&url='+encodeURIComponent(q)+'&description='+encodeURIComponent(d)+'&title='+encodeURIComponent(p),'Pinboard',%20'toolbar=no,width=700,height=600'));"; 
    document
      .getElementById("content")
      .webNavigation
      .loadURI(command[e], 0, null, null, null);  
  },

  initSearch: function() {
     var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
        .getService(Components.interfaces.nsINavBookmarksService);
     var ios = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
     var uri = ios.newURI("http://pinboard.in/search/?query=%s&mine=Search+Mine", null, null);
     var keyword = "pin";
     var pinboardbm = bmsvc.getURIForKeyword(keyword);
     if (pinboardbm == null) {
       var menuFolder = bmsvc.bookmarksMenuFolder;
       var newBkmkId = bmsvc.insertBookmark(menuFolder, uri, bmsvc.DEFAULT_INDEX, "pinboard.in quick search");
       bmsvc.setKeywordForBookmark( newBkmkId, "pin");
     }
  }

};

window.addEventListener("load", simplepinboardbutton.onLoad, false);
