$(document).ready(function() {
    //Get the URL and Title. As well as set it as the Gift Name on form.
  function getPageInfo() {
    chrome.tabs.query(
      {active: true, windowId : chrome.windows.WINDOW_ID_CURRENT},
       function(array_of_Tabs) {
      var tab = array_of_Tabs[0];
      Mylib.currentURL = tab.url;
      Mylib.currentTitle = tab.title;
      if (document.getElementById("giftNameBox") != null){
      document.getElementById("giftNameBox").value = Mylib.currentTitle;
    }
    });
    getNames();
  }

  function getNames(){
    chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      if (typeof allKeys !== "undefined"){
        Mylib.names = allKeys;
        Mylib.localStorageItems = items;
        populateGifteeList(Mylib.names);
      }
    });
  }

  //Updates localStorage and refreshes the appropriate elements
  function updateLocalStorageAndRefresh(gifteeName,updateFunction){
        chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      if (typeof allKeys !== "undefined"){
        Mylib.names = allKeys;
        Mylib.localStorageItems = items;
        if (typeof(updateFunction) == "function"){
        updateFunction();
        }
      }
    });
  }

  //Create the list of Giftees to display and style it.
  function populateGifteeList(nameArray){
    var $giftees = $('#giftees');
      $giftees.find('*').remove();
       $giftees.text('');
    var arrayPoint = 0;
    arrayIndex = 0;
    $.each(nameArray ,function(arrayPoint,v) {
      // arrayPoint = arrayPoint + arrayIndex;
      var a = "icon"+arrayPoint;
      $giftees.append("<span><li>" + v + "<img id="+a+" src='ic_view_list_black_24px.svg'class='listIcon'></li>");
     $('#'+a).click(function(){
        var parentOfEvent = $(event.target).parent();
        var parentText = parentOfEvent.text();
        $(this).attr("src", "ic_view_list_black_24px.svg");
        $(this).removeClass("opaque");
        openShoppingTab(parentText);
      });
    });
    arrayIndex = arrayIndex + nameArray.length;
    addRolloverToListIcon();
    $("#dynamicList").addClass("gifteeList");
    $("#dynamicList ul").addClass("gifteeList_ul");
    $("#dynamicList li").addClass("gifteeList_ul_li_a");
    $('#dynamicList li').click(function(){
      if($(event.target).is('LI')){
        if($('#giftNameBox').val() == ''){
          $('#giftNameBox').attr("placeholder","Please Enter Name Of Gift");
        }else{
          var gifteeName = $(this).text();
          var isInList = checkIfAlreadyInList(gifteeName);
          if (!checkIfAlreadyInList(gifteeName)){
            addGift(gifteeName);
            $(this).css("opacity", '0.1');
            $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith("Gift Added!");
            $(this).animate({opacity: '1'},500,function () {
              $(this).css("opacity", '0.1');
              $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith(gifteeName);
              $(this).animate({opacity: '1.0'},500);
            });
          }else{
            $(this).css("opacity", '0.1');
            $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith("Gift is already in list");
            $(this).animate({opacity: '1'},1000,function () {
              $(this).css("opacity", '0.1');
              $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith(gifteeName);
              $(this).animate({opacity: '1.0'},1000);
            });
        }
        }
      }else{
        //Calls fix function that stops sticky hover.
        fix(this);
      }
    });
    if ($giftees.children().length < 1){
      $giftees.append("<li>" + "Add Giftees Below!" + "</li>");
      $("#dynamicList li").addClass("gifteeAddPrompt");
    }
  }

  function gifteeListClick(listElement){

  }

  function addGift(name){
    var nameofGift = $('#giftNameBox').val();
    var giftPackage = {giftName:nameofGift,giftURL:Mylib.currentURL};
    Mylib.localStorageItems[name].push(giftPackage);
    sendToStorage(name,giftPackage);
  }

  function checkIfAlreadyInList(name){
    var giftList = Mylib.localStorageItems[name];
    var isAlreadyInList = false;
    $.each(giftList,function(i,v) {
      if(v.giftURL == Mylib.currentURL){
        isAlreadyInList = true;
      }
    });
    return isAlreadyInList;

  }

  function sendToStorage(nameKey,storageContents,callback){
    chrome.storage.sync.get(function(cfg) {
      if(typeof(cfg[nameKey]) !== 'undefined' && cfg[nameKey] instanceof Array) { 
        cfg[nameKey].push(storageContents);
      } else {
        cfg[nameKey] = [storageContents];
      }
      chrome.storage.sync.set(cfg);
      if (callback) callback();
    });
  }

  function addNewGiftee(){
    var $gifteeAddBox = $('#gifteeAddBox')
    var gifteeName = $gifteeAddBox.val();
    if (gifteeName !== ""){
      if ($.inArray(gifteeName, Mylib.names) === -1){
        var giftPackage = {giftName:null,giftURL:null};
        var arrGiftPackage = [giftPackage];
        Mylib.localStorageItems[gifteeName] = arrGiftPackage;
        sendToStorage(gifteeName,giftPackage,function(){
           updateLocalStorageAndRefresh(gifteeName,function(){
          var allKeys = Object.keys(Mylib.localStorageItems);
          $gifteeAddBox.attr("placeholder","Enter Recipient Name");
          populateGifteeList(allKeys);
        });
          });
        $gifteeAddBox.val('');
      }else{
        $gifteeAddBox.val('');
        $gifteeAddBox.attr("placeholder","Giftee is already in list!");

      }
    }
  }

  function addRolloverToListIcon(){
    $(".listIcon").hover(function(){
        $(this).attr("src", function(index, attr){
            $(this).addClass("opaque");
            return attr.replace("ic_view_list_black_24px.svg", "ic_view_list_white_24px.svg");
        });
    }, function(){
        $(this).attr("src", function(index, attr){
            $(this).removeClass("opaque");
            return attr.replace("ic_view_list_white_24px.svg", "ic_view_list_black_24px.svg");
        });
    });
  }

  // Opens the shopping Tab when Clicked
  function openShoppingTab(gifteeName){
    var giftList = Mylib.localStorageItems[gifteeName];
    populateGiftList(giftList,gifteeName);
    switchTab();
  }
  //Creates the List of Gifts for a given giftee.
  function populateGiftList(gifts,gifteeName){
    if(typeof gifts !== 'undefined'){
      $('#shoppingListTitle').html(gifteeName);
      $('#deleteIconTitle').click( function() {
        deleteFromStorage(gifteeName,-1);
        $('#deleteIconTitle').unbind();
  });
      $("#gifts li").remove();
      $("#gifts img").remove();
      $.each(gifts,function(i,v) {
        var gift = gifts[i];
        var URL = gift.giftURL;
        var giftNameText = gift["giftName"];
        if(giftNameText !== null){
            var giftURL = gift["giftURL"];
            $("#gifts").append("<li id = gift"+i+"><span class='shoppingListListSpan'><img id=deleteIcon"+i+" src='del.png'class='deleteIconClass'><p class='shoppingList_p'>" + giftNameText + 
              "</p></span></li>");
            $('#gift'+ i).click(function(){
              if($(event.target).is('P')){
                console.log(giftURL);
                var win = window.open(giftURL);
                  if(win){
                        //Browser has allowed it to be opened
                    win.focus();
                  }else{
                      //Browser has blocked it
                    alert('Please allow popups for this extension');
                  }
              }
            });
            $('#deleteIcon'+i).click(function(){
              deleteFromStorage(gifteeName, i);
              $('#deleteIconTitle').unbind();
            });
        }
      });

      $("#storageList").addClass("gifteeList");
      $("#storageList ul").addClass("gifteeList_ul");
      $("#storageList li").addClass("shoppingListList_a");
      $("#storageList li").addClass("shoppingListList_li");
    }
  }

  function deleteFromStorage(gifteeName,indexNo){
    var checkName = gifteeName;
    var giftIndex = indexNo;
    chrome.storage.sync.get(function(items,gifteeName) {
      deleteItem(items,checkName,giftIndex);
});

  }
  //if index is > 0, it is a gift deletion. if index < 0, it is a giftee deletion 
  function deleteItem(giftee,gifteeName,index){
    var giftArray = giftee[gifteeName];
    if(index > 0){
    giftArray.splice(index, 1);
      chrome.storage.sync.set(giftee, function() {
        updateLocalStorageAndRefresh(gifteeName,function(){
        var giftList = Mylib.localStorageItems[gifteeName];
        populateGiftList(giftList, gifteeName);
        });

      });
    }else{

          chrome.storage.sync.remove(gifteeName,function(){
            updateLocalStorageAndRefresh(gifteeName,function(){
              switchTab();
              populateGifteeList(Mylib.names);
            });
          });
    }
  }

  function switchTab(){
    var $shoppingListTab = $('#shoppingListTab');
   $('#gifteeTab').toggleClass('cssmenu-ul-li-selected');//unselect gift tab
   $shoppingListTab.toggleClass("cssmenu-ul-li-selected");// select shopping list tab
   $shoppingListTab.toggleClass("showContent");//show shopping list tab
   $('#shoppingTabCont').toggleClass("showContent"); //show Shopping list tab content.
   $('#gifteeTabCont').toggleClass("showContent"); //hide gift tab content.
  }



  //Fixes sticky Css hover when tab is switched.
  function fix(param){
      var el = param;
      var par = el.parentNode;
      var next = el.nextSibling;
      par.removeChild(el);
      setTimeout(function() {par.insertBefore(el, next);}, 0);
  }


  // Initiate Program.
  var Mylib = {
    localStorageItems:{},
    currentURL : "Default",
    currentTitle : "Default Gift Name",
    names : [],
    };

  var $gifteeTab = $('#gifteeTab');
  $gifteeTab.toggleClass('cssmenu-ul-li-selected');
  $('#shoppingListTab').addClass("showContent");

  $('.addNameFlatButton').click(addNewGiftee);

  getPageInfo();

  $('#gifteeAddBox').keyup(function(event){
    if((event.keyCode == 13) && ($('#gifteeAddBox').is(':focus'))){
        $("#gifteeAddButton").click(addNewGiftee());
    }
  });

$gifteeTab.click( function() {
  if(!$gifteeTab.hasClass("cssmenu-ul-li-selected")){
  switchTab();
  $('#deleteIconTitle').unbind();
  }
  });
});