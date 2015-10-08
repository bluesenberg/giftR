$( document ).ready(function() {

    //Get the URL and Title. As well as set it as the Gift Name on form.
  function getPageInfo() {
    chrome.tabs.query({active: true, windowId : chrome.windows.WINDOW_ID_CURRENT}, function(array_of_Tabs) {
      var tab = array_of_Tabs[0];
      currentURL = tab.url;
      currentTitle = tab.title;
      console.log(currentURL);
      document.getElementById("giftNameBox").value = currentTitle;
    });
    getNames(names);
  };


  function getNames(){
    chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      if (typeof allKeys === "undefined")//!!!
      {
      }else{
        console.log(names);
        names = allKeys;
        localStorageItems = items;
        populateGifteeList(names);
      };
    });
  };

  //Updates localStorage and refreshes the appropriate elements
  function updateLocalStorageAndRefresh(gifteeName,updateFunction){
        chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      if (typeof allKeys === "undefined")
      {
      }else{
        console.log(names);
        names = allKeys;
        localStorageItems = items;
        updateFunction();
      };
    });
  }

    //Create the list of Giftees to display and style it.
  function populateGifteeList(nameArray){ //!!! add weird loop is definitely here
      $('#giftees').find('*').remove();
       $('#giftees').text('');
    var arrayPoint = 0;
    arrayIndex = 0;
    console.log(arrayPoint);
    $.each(nameArray ,function(arrayPoint,v) {
      arrayPoint = arrayPoint + arrayIndex;
      var a = "icon"+arrayPoint;
      $("#giftees").append("<span><li>" + v + "<img id="+a+" src='ic_view_list_black_24px.svg'class='listIcon'></li>");
      console.log(a);

     $('#'+a).click(function(){
        var parentOfEvent = $(event.target).parent();
        var parentText = parentOfEvent.text();
        openShoppingTab(parentText);
      });
    });
    arrayIndex = arrayIndex + nameArray.length;

    //$(".listIcon").addClass("listIcon");
    addRollover();
    $("#dynamicList").addClass("gifteeList");
    $("#dynamicList ul").addClass("gifteeList_ul");
    $("#dynamicList li").addClass("gifteeList_ul_li_a");
    $('#dynamicList li').click(function(){
      if($(event.target).is('LI')){
        if($('#giftNameBox').val() == ''){
          $('#giftNameBox').attr("placeholder","Please Enter Name Of Gift");
        }else{
          var gifteeName = $(this).text();
          addGift(gifteeName);
          $(this).css("opacity", '0.1');
          $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith("Gift Added!");
          $(this).animate({opacity: '1'},500,function () {
          $(this).css("opacity", '0.1');
          $(this).contents().filter(function(){ return this.nodeType == 3; }).first().replaceWith(gifteeName);
          $(this).animate({opacity: '1.0'},500);
          });
          // $(this).text(gifteeName);
        }
      }else{
        //Calls fix function that stops sticky hover.
        fix(this);
      }
    });
    if ($("#giftees").children().length < 1){
      console.log("No Giftees yet");
      $("#giftees").append("<li>" + "Add Giftees Below!" + "</li>");
      // $("#dynamicList").addClass("gifteeList");
      // $("#dynamicList ul").addClass("gifteeList_ul");
      // $("#dynamicList li").addClass("gifteeList_ul_li_a");
      $("#dynamicList li").addClass("gifteeAddPrompt");
    }
  };

  function addGift(name){
    console.log("name is "+name);
    console.log(name);
    var nameofGift = $('#giftNameBox').val();
    var giftPackage = {giftName:nameofGift,giftURL:currentURL};
    console.log(localStorageItems);
    localStorageItems[name].push(giftPackage);
    console.log(localStorageItems);
    sendToStorage(name,giftPackage)
  };

    function sendToStorage(nameKey,storageContents,callback){
      chrome.storage.sync.get(function(cfg) {
        if(typeof(cfg[nameKey]) !== 'undefined' && cfg[nameKey] instanceof Array) { 
          cfg[nameKey].push(storageContents);
        } else {
          cfg[nameKey] = [storageContents];
        }
        chrome.storage.sync.set(cfg);
        console.log( $(this).text() + "Saved!"); 
        console.log(currentURL);
        console.log(currentTitle);
        if (callback) callback();
      });
    };



  function addNewGiftee(){
    var gifteeName = $('#gifteeAddBox').val();
    if (gifteeName !== ""){
      console.log(gifteeName);
      if ($.inArray(gifteeName, names) === -1){
        var giftPackage = {giftName:null,giftURL:null};
        var localPackage = {name,arrGiftPackage};
        var arrGiftPackage = [giftPackage];
        localStorageItems[gifteeName] = arrGiftPackage;
        console.log("localStorageItems are");
        console.log(localStorageItems);
        sendToStorage(gifteeName,giftPackage,function(){
           updateLocalStorageAndRefresh(gifteeName,function(){
          var allKeys = Object.keys(localStorageItems);
          populateGifteeList(allKeys);
        });
          });
        // var nameArray = [gifteeName];
        // names.push(nameArray);
        $('#gifteeAddBox').val('');
      }else{
        console.log(gifteeName + " is already in List!")
      }
    }
  };
  // ++++++++++++++++++++++++START OF PROGRAM, MOVE SOMEWHERE ELSE!!!

    $('#giftTab').toggleClass('cssmenu-ul-li-selected');
    $('#shoppingListTab').addClass("showContent");

    var arrayIndex = 0;
    var currentURL = "TEATS";
    var currentTitle = "GIFT!";
    var localStorageItems = {};
    var names = [];
    $('.addNameFlatButton').click(addNewGiftee);

    getPageInfo();

    console.log('Good times!')
    $('#gifteeAddBox').keyup(function(event){
      if((event.keyCode == 13) && ($('#gifteeAddBox').is(':focus'))){
            console.log('More Good times!')
          $("#gifteeAddButton").click(addNewGiftee());
      }
    });

  $('#giftTab').click( function() {
    if(!$('#giftTab').hasClass("cssmenu-ul-li-selected")){
    switchTab();
    $('#deliconTitle').unbind();
  };
  });

 // ++++++++++++++++++++++++END OF NASTY CODE

  function unpackFromStorage(fromStorage){
  var allKeys = Object.keys(fromStorage);
    for( i = 0;  i < allKeys.length; i++) {
      var key = allKeys[i];
      var value = fromStorage[key];
      console.log(key + "key!");
      console.log(fromStorage);
      console.log(value);
    };
  };

  function addRollover(){
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
  };


  function openShoppingTab(gifteeName){
    console.log("IN SHOPPING TAB");
    console.log("Storage Items");
    console.log(localStorageItems);
    var giftList = localStorageItems[gifteeName];
    console.log("giftee name is");
    console.log(gifteeName);
    console.log("gifts are");
    console.log(gifts);
    populateGiftList(giftList,gifteeName);
    switchTab();
  };

  function populateGiftList(gifts,gifteeName){
    if(!(typeof gifts === 'undefined')){
      console.log("Title should be");
      console.log(gifteeName);
      $('#shoppingListTitle').html(gifteeName);
      $('#deliconTitle').click( function() {
        console.log("Item To be deleted");
        console.log(gifteeName);
        deleteFromStorage(gifteeName,-1);
        $('#deliconTitle').unbind();
  });
      console.log("should be here");
      $("#gifts li").remove();
      $("#gifts img").remove();
      $.each(gifts,function(i,v) {
        var gift = gifts[i];
        console.log("gift is");
        console.log(gift);
        var URL = gift.giftURL;
        console.log("gift URL is ");
        console.log(URL);
        var giftNameText = gift["giftName"];
        console.log(giftNameText);
        if(!(giftNameText == null)){
            console.log(giftNameText);
            var giftURL = gift["giftURL"];
            $("#gifts").append("<li><span class='shoppingListListSpan'><img id=delicon"+i+" src='del.png'class='deleteIcon'><p class='shoppingList_p'>" + giftNameText + 
              "</p></span></li>");
            $('#gifts li').click(function(){
              if($(event.target).is('P')){
                var win = window.open(giftURL);
                  if(win){
                        //Browser has allowed it to be opened
                    win.focus();
                  }else{
                      //Browser has blocked it
                    alert('Please allow popups for this site');
                  }
              }
            });
            $('#delicon'+i).click(function(){
              console.log(event.target);
              console.log("delete button clicked");
              deleteFromStorage(gifteeName, i);
              $('#deliconTitle').unbind();
            });
        }
      });

      $("#storageList").addClass("gifteeList");
      $("#storageList ul").addClass("gifteeList_ul");
      $("#storageList li").addClass("shoppingListList_a");
      $("#storageList li").addClass("shoppingListList_li");
    };
  };

  function deleteFromStorage(gifteeName,indexNo){
    var checkName = gifteeName
    console.log(checkName);
    console.log(gifteeName);
    console.log(indexNo);
    var giftIndex = indexNo;

    chrome.storage.sync.get(function(items,gifteeName) {
      console.log(items);
      console.log(checkName);
      console.log(gifteeName);
      deleteItem(items,checkName,giftIndex);
});

  };
  // deletes items,  if index is > 0, index for gift. if index < 0, delete entire
  // gift array 
  function deleteItem(giftee,gifteeName,index){
    console.log("in giftee Items, giftee is ");
    console.log(index);
    console.log(giftee);
    var giftArray = giftee[gifteeName];
    if(index > 0){
    console.log(giftArray);
    giftArray.splice(index, 1);
    console.log(giftArray);
      chrome.storage.sync.set(giftee, function() {
        console.log('Item deleted!');
        updateLocalStorageAndRefresh(gifteeName,function(){
        var giftList = localStorageItems[gifteeName];
        populateGiftList(giftList, gifteeName);
        });

      });
    }else{

          chrome.storage.sync.remove(gifteeName,function(){
            console.log("BALEETED!");
            console.log(gifteeName);
            updateLocalStorageAndRefresh(gifteeName,function(){
              switchTab();
              console.log(localStorageItems);
              populateGifteeList(names);
            });
          });
    };
  };


  function switchTab(){
   $('#giftTab').toggleClass('cssmenu-ul-li-selected');//unselect gift tab
   $('#shoppingListTab').toggleClass("cssmenu-ul-li-selected");// select shopping list tab
   $('#shoppingListTab').toggleClass("showContent");//show shopping list tab
   $('#shoppingTabCont').toggleClass("showContent"); //show Shopping list tab content.
   $('#giftTabCont').toggleClass("showContent"); //hide gift tab content.
  };



  //Fixes sticky Css hover when tab is switched.
  function fix(param){
      var el = param;
      var par = el.parentNode;
      var next = el.nextSibling;
      par.removeChild(el);
      setTimeout(function() {par.insertBefore(el, next);}, 0)
  };

});

  // Prevent doubles from being added.
  // Possibly show shopping list as one list, get rid of list button, use tab.
  // Add Swipe animation.?
  // Add Back arrow/logo.?
  // Debug and test.