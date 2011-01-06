simplepinboardbutton.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ simplepinboardbutton.showFirefoxContextMenu(e); }, false);
};

simplepinboardbutton.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-simplepinboardbuttonPinLink").hidden = !gContextMenu.onLink;
  document.getElementById("context-simplepinboardbuttonPinPage").hidden = gContextMenu.onLink;
};

window.addEventListener("load", simplepinboardbutton.onFirefoxLoad, false);
