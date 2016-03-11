/*
 game_functionality.js contains function definitions called in official_canvas.php to implement game functionality
 Author: Stephen Dyksen (srd22)
 Date: May 22, 2014
 Calvin College CS 396
*/


/*
 * Note: Need quotes, else number may be rounded
 *
 * This function creates and sends http requests, and obtains the result for later use
 * Parameters: method (POST, PUT, GET, DELETE)
 *             resourceType (Game, User)
 *             resourceLocation (Some URL)
 *             getAll - specifies * in DB call if need to get all rows (true, false)
 *             ORSC - OnReadyStateChange specifies function call after received response
 *                    (getAllGames, newUser, newGame, updateGame)
 */
function httpRequest(method, resourceType, resourceLocation, getAll, ORSC){
    
    var serverPage = resourceLocation;
    var xmlhttp;
    
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    //Set "open" and headers based on request method
    if (method == "POST")
    {
        //Only non-necessarily idempotent RESTful method
        xmlhttp.open("POST",serverPage,true);
        xmlhttp.setRequestHeader("TRUE_METHOD","POST");
    }
    else if (method =="PUT")
    {
        xmlhttp.open("POST",serverPage,true);
        xmlhttp.setRequestHeader("TRUE_METHOD","PUT");
    }
    
    else if (method == "GET")
    {
        xmlhttp.open("GET",serverPage,true);
        xmlhttp.setRequestHeader("TRUE_METHOD","GET");
    }
    else if (method =="DELETE")
    {
        xmlhttp.open("GET",serverPage,true);
        xmlhttp.setRequestHeader("TRUE_METHOD","DELETE");
    }
    
    if(resourceType == "Game"){
        if(getAll == true){
            xmlhttp.setRequestHeader("GET_ALL","TRUE");
            xmlhttp.setRequestHeader("LFID",myFID);
            xmlhttp.setRequestHeader("GFID",myFID);
        }else if (getAll == false){
            xmlhttp.setRequestHeader("GET_ALL","FALSE");
            if(ORSC != "deleteFinished"){
                if(parseInt(myFID,10) > parseInt(friendFID,10)){
                    xmlhttp.setRequestHeader("GFID",myFID);
                    xmlhttp.setRequestHeader("LFID",friendFID);
                }else{
                    xmlhttp.setRequestHeader("LFID",myFID);
                    xmlhttp.setRequestHeader("GFID",friendFID);
                }
            }else{ //Case of deleteFinished
                xmlhttp.setRequestHeader("GFID",gameID);
                xmlhttp.setRequestHeader("LFID",gameID);
            }
        }
    }else{
        xmlhttp.setRequestHeader("LFID",myFID);
    }
    xmlhttp.send();
    
    xmlhttp.onreadystatechange=function(){
        //If response is ready
        if (xmlhttp.readyState==4 && (xmlhttp.status==200 || xmlhttp.status==201)){
            switch(ORSC){
                case "getAllGames":
                    parseIntoMyGamesOrMyResults(eval ("(" + xmlhttp.responseText + ")"), "game"); //Converts JSON text to a JavaScript object
                    break;
                case "getAllResults":
                    parseIntoMyGamesOrMyResults(eval ("(" + xmlhttp.responseText + ")"), "result");
                    break;
                case "getOneGame":
                    submitCurrentWordPart2(eval ("(" + xmlhttp.responseText + ")"));
                    break;
                case "newUser":
                    if(xmlhttp.responseText == "true"){
                        console.log("Welcome, New FF User!");
                    }else {
                        console.log("Welcome, back!");
                    }
                    break;
                case "updateGame":
                    if(xmlhttp.responseText == "true"){
                        //console.log("Resource Updated");
                    }else {
                        //console.log("Error!");
                    }
                    break;
                case "newGame":
                    if(xmlhttp.responseText == "true"){
                        console.log("Resource Created");
                    }else {
                        console.log("Error!");
                    }
                    break;
                case "deleteCurrent":
                    console.log("Delcur!");
                    break;
                case "deleteFinished":
                    console.log("Delfin!");
                    break;
                default:
                    console.log("default xmlhttp");
                    break;
            }
        }
    }
}

/*
 * Parses given object for game information which are stored by game in object myGames or myResults
 * Each game is stored as an object with the key being the friendFID_id
 *
 * obj is the object to parse
 * gameOrResult has value "game" or "result" depending on which functionality is desired
 */
function parseIntoMyGamesOrMyResults(obj, gameOrResult){
    if(obj != null){
        for(var i=0; i<Object.keys(obj).length; i++){
            if(obj[i]["fb_id_a"] == myFID){ //If I am 'a"
                
                if(gameOrResult == "game"){
                    //Add fbid to friendIDArray
                    friendIDArray[i] = obj[i]["fb_id_b"];
                    
                    //Fill appropriate global object (myGames or myResults)
                    var key = obj[i]["fb_id_b"] + "_" + "1";
                    myGames[key] = {
                        "myWords":obj[i]["words_a"],
                        "friendWords":obj[i]["words_b"],
                        "gameStatus":getGameStatus(obj[i]["words_a"],obj[i]["words_b"])
                    }
                }else{
                    //Fill appropriate global object (myGames or myResults)
                    var key = obj[i]["fb_id_b"] + "_" + obj[i]["id"];
                    myResults[key] = {
                        "myWords":obj[i]["words_a"],
                        "friendWords":obj[i]["words_b"],
                        "gameStatus":getGameStatus(obj[i]["words_a"],obj[i]["words_b"])
                    }
                }
                
            }else{ //I am "b"
                
                if(gameOrResult == "game"){
                    //Add fbid to friendIDArray
                    friendIDArray[i] = obj[i]["fb_id_a"];
                    
                    //Fill appropriate global object (myGames or myResults)
                    var key = obj[i]["fb_id_a"] + "_" + "1";
                    myGames[key] = {
                        "myWords":obj[i]["words_b"],
                        "friendWords":obj[i]["words_a"],
                        "gameStatus":getGameStatus(obj[i]["words_b"],obj[i]["words_a"])
                    }
                }else{
                    //Fill appropriate global object (myGames or myResults)
                    var key = obj[i]["fb_id_a"] + "_" + obj[i]["id"];
                    myResults[key] = {
                        "myWords":obj[i]["words_b"],
                        "friendWords":obj[i]["words_a"],
                        "gameStatus":getGameStatus(obj[i]["words_b"],obj[i]["words_a"])
                    }
                }
            }
        }
        
        //Populate respective friendZone area with items in myGames or myResults
        if(gameOrResult == "game"){
            populateFriendZone("current");
            checkForRequests(1);
        }else{
            populateFriendZone("finished");
            checkForRequests(2);
        }
    }
}

/*
 * Parses the words list and determines the game turn state
 * Takes parameters specifying list of myWords, and list of friendWords
 * Returns turn state: (ME, FRIEND, NEW, ENDED)
 */
function getGameStatus(myWords, friendWords){
    var myWordsArray = myWords.split(',');
    var friendWordsArray = friendWords.split(',');
    
    if(myWords == ""){
        return "NEW";
    }else{
        var myWordCount = myWordsArray.length;
    }
    if(friendWords == ""){
        var myFriendWordCount = 0;
    }else{
        var myFriendWordCount = friendWordsArray.length;
    }
    
    var difference = myWordCount - myFriendWordCount;
    
    //Store the last word from each player
    var myLastWord = myWordsArray[myWordCount-1];
    var friendLastWord = friendWordsArray[myWordCount-1];
    if(friendLastWord != undefined && myLastWord != undefined){
        //Ensure all letters are lowercase
        myLastWord = myLastWord.toLowerCase();
        friendLastWord = friendLastWord.toLowerCase();
        //Take out any spaces in the word (including before and after)
        myLastWord = myLastWord.replace(/ /g,'');
        friendLastWord = friendLastWord.replace(/ /g,'');
    }
    
    if( difference == 0 && myLastWord == friendLastWord || difference == 0 && myWordCount == 20){
        return "ENDED";
    }else if( difference > 0 ){
        return "FRIEND";
    }else{
        return "ME";
    }
}

/*
 * Using items in specified Games Object, makes FB.api calls to get pictures and names and display them in gameBubbles
 * Takes paramater to distinguish between 'current' and 'result' friendZone (current, finished)
 */
function populateFriendZone(specifiedZone){
    var theGamesObject;
    if(specifiedZone == "current"){
        var theZoneDiv = document.getElementById("scrollingCurrentGames");
        theGamesObject = myGames;
    }else{
        var theZoneDiv = document.getElementById("scrollingFinishedGames");
        theGamesObject = myResults;
    }
    
    theZoneDiv.innerHTML = "";
    
    //Loop through all items in theGamesObject
    for(var key in theGamesObject){
            nameAndPictureCall(key, theGamesObject[key]["gameStatus"]);
    }
    
    //Get gameBubble information from facebook
    function nameAndPictureCall(friendFIDKey, status){
        var IDArray = friendFIDKey.split('_');
        FB.api({ method: 'fql.query', query: 'SELECT name, pic_square FROM user WHERE uid=' + IDArray[0] },function(response){
               
            switch(status){
            case "ME":
                var borderColor = "style='border: #FF3366 7px solid;'"; //Bright Red
                break;
            case "FRIEND":
                var borderColor = "style='border: #49b7f7 7px solid;'"; //FF Blue
                break;
            case "NEW":
                var borderColor = "style='border: #FF3366 7px solid;'"; //Bright Red
                break;
            case "ENDED":
                var borderColor = "style='border: #B6E2FB 7px solid;'"; //Light Blue
                break;
            default:
                break;
            }
            
            var divID = "id='"+ friendFIDKey +"'";
            var friendDisplayName = (response[0].name.length > 14) ? response[0].name.substr(0,12) + "..." : response[0].name;
            var newGameBubble = "<div class='gameBubble' onclick='displayInGameZone(this.id)'" + borderColor + divID + "><img src='" +response[0].pic_square + "'/><div>" + friendDisplayName + "</div></div>";
            theZoneDiv.innerHTML = theZoneDiv.innerHTML + newGameBubble;
        });
    }
}

//Check for game requests (if requests present, display most current request game)
//Parameter oneOrTwo has values 1 (called from game call), and 2 (called from result call)
function checkForRequests(oneOrTwo) {
    
    var urlParams = {};
    (function () {
     var match,
     pl     = /\+/g,  // Regex for replacing addition symbol with a space
     search = /([^&=]+)=?([^&]*)/g,
     decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
     query  = window.location.search.substring(1);
     
     while (match = search.exec(query))
     urlParams[decode(match[1])] = decode(match[2]);
     })();
    
    var requestType = urlParams["app_request_type"];
    var fbSource = urlParams["fb_source"];
    
    if (requestType == "user_to_user" || fbSource == "request") { // There is a request
        
        //Leave the screen with the most recent request game rendered in gameZone
        var requestIDString = urlParams["request_ids"];
        var requestArray = requestIDString.split(',');
        
        var len = requestArray.length;
        
        for(var i=0; i<len; i++){
            var addedNames = "";
            var countFinishedGames = 0;
            asynchLoop(i);
        }
        
        function asynchLoop(i){
            
            var aRequestID = requestArray[i];
            FB.api(aRequestID, function(response) {
                if (response && !response.error) {
                    //Request (Proper) Page Load
                    var returnID = response.from["id"];
                    var returnMessage = response.message;
                   
                    if(response.data == '2'){
                        if(i == len-1) { //For most recent request
                            addedNames += "<br>" + response.from.name + "<br>";
                            document.getElementById("completedGameFromRequestPopup").style.display = "block";
                            var theDiv = document.getElementById("completedGameFromRequestPopup");
                            if(countFinishedGames != 0){
                                var addedText = "Your recent games with the following friends are complete:<br>";
                                var addTextEnding = "<br>They have been moved to your list of 'Finished' games.";
                            }else{
                                var addedText = "Your recent game with the following friend is complete:<br>";
                                var addTextEnding = "<br>It has been moved to your list of 'Finished' games.";
                            }
                            theDiv.innerHTML = addedText + addedNames + addTextEnding + theDiv.innerHTML;
                            //alert("Your recent game with " + response.from.name + " has been completed!  It has been moved to your list of 'Finished' games.");
                        }else{
                            addedNames += "<br>" + response.from.name;
                            countFinishedGames++;
                        }
                    }

                    //Delete request
                    FB.api(aRequestID, 'delete', function(response){
                        if (response && !response.error) {
                        }
                    });

                    if(oneOrTwo == 1){ //Only displayInGameZone if this function was called from game call
                        if(i == len-1) { //For most recent request
                            //Call to render GameZone with given ID
                            if(response.data){
                                displayInGameZone(returnID+"_1");
                            }else{
                                //prompt user that a game ended and can be found under the 'finished' tab of 'My Games'
                            }
                        }
                   }
                }else{
                    //Request (Error) Page Load
                }
            });
        }
    } else{
        //Natural Page Load
    }
}

//Render a game in the 'gameZone'
function displayInGameZone(keyID){
    
    document.getElementById("wordZone").innerHTML = "";

    var gameAndIDArray = keyID.split('_');
    friendFID = gameAndIDArray[0];
    gameID = gameAndIDArray[1];
    
    if(gameID != undefined){
        if(gameID != 1){
            var currentOrFinished = "finished";
        }else{
            var currentOrFinished = "current";
        }
    }
    setupWordsAndButtons(currentOrFinished);
    
    document.getElementById('ffGame').style.zIndex = '11';
    document.getElementById('instructionsAndLogo').style.zIndex = '1';
}

/*
 * Adds wordBubbles to the gameZone by parsing the words in a selected game
 * takes parameter 'current', or 'finished' to distinguish between game type
 */
function setupWordsAndButtons(currentOrFinished){
    if(currentOrFinished == "current"){
        var myWords = myGames[friendFID+"_1"]["myWords"].split(',');
        var friendWords = myGames[friendFID+"_1"]["friendWords"].split(',');
    }else{
        var myWords = myResults[friendFID+"_"+gameID]["myWords"].split(',');
        var friendWords = myResults[friendFID+"_"+gameID]["friendWords"].split(',');
    }
    
    var myWordsLength = myWords.length;
    var friendWordsLength = friendWords.length;
    console.log("myWords length: " + myWords.length);
    console.log("friendWords length: " + friendWords.length);
    
    //Fix word length of 1 when "" is stored and no word is present
    if( myWords == "") myWordsLength = 0;
    if( friendWords == "") friendWordsLength = 0;
    
    //Set roundNum to determine how many game rounds I can currently display
    if(myWordsLength == friendWordsLength){
        var roundNum = myWordsLength;
    }
    else{
        var roundNum = (myWordsLength > friendWordsLength) ? friendWordsLength : myWordsLength;
    }
    
    var theWordZoneDiv = document.getElementById("wordZone");
    
    //Setup all current "wordBubbles"
    for(var i=0; i<roundNum; i++){
        addWordBubble(myWords[i], friendWords[i]);
    }
    
    if(currentOrFinished == "finished"){  //If we are displaying a finished game
        document.getElementById('gameMessage').innerHTML = "Game Complete!";
        document.getElementById('inputZone').style.display = 'none';
        document.getElementById('submitWordButton').style.display = 'none';
        document.getElementById('wordZone').style.height = '450px';
        document.getElementById('wordScrollersWrapper').style.height = '450px';
    }else{
        if(myWordsLength == friendWordsLength){
            document.getElementById('gameMessage').innerHTML = "It's your turn!  Opponent hasn't entered item for this round.";
            document.getElementById('inputZone').style.display = 'block';
            document.getElementById('wordGuessField').disabled = false;
            document.getElementById('submitWordButton').style.display = 'block';
            document.getElementById('wordZone').style.height = '400px';
            document.getElementById('wordScrollersWrapper').style.height = '400px';
        }else if(myWordsLength > friendWordsLength){
            document.getElementById('gameMessage').innerHTML = "Waiting on opponent to finish this round.";
            document.getElementById('inputZone').style.display = 'block';
            document.getElementById('wordGuessField').disabled = true;
            document.getElementById('submitWordButton').style.display = 'none';
            document.getElementById('wordZone').style.height = '400px';
            document.getElementById('wordScrollersWrapper').style.height = '400px';
        }else{
            document.getElementById('gameMessage').innerHTML = "It's your turn! Opponent has entered their item for this round";
            document.getElementById('inputZone').style.display = 'block';
            document.getElementById('wordGuessField').disabled = false;
            document.getElementById('submitWordButton').style.display = 'block';
            document.getElementById('wordZone').style.height = '400px';
            document.getElementById('wordScrollersWrapper').style.height = '400px';
        }
    }
}

//Opens friend picker and sends game invite
function openRequestPicker(){

    FB.ui({method: 'apprequests',
          message: 'Join Me For a Game of Friend Frequency!',
          max_recipients: 1,
          exclude_ids: friendIDArray
          }, openRequestPickerCallback);
}

function openRequestPickerCallback(response) {
    if (response && response.request != undefined) {
        //Add game to DB
        friendFID = response.to[0];
        httpRequest('POST','Game','https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php', false, 'newGame');
        
        //Add to friendIDArray
        friendIDArray.push(friendFID);
        
        //Add game to myGames
        myGames[response.to[0]+ "_1"] = {
            "myWords":"",
            "friendWords":"",
            "gameStatus":"NEW"
        }
        
        //Display the "current" part of the friendZone
        document.getElementById('scrollingCurrentGames').style.zIndex = '11';
        document.getElementById('scrollingFinishedGames').style.zIndex = '1';
        
        //Change the color of the current and finished tabs appropriately
        document.getElementById('showCurrentGamesButton').style.background = '#FFFFFF';
        document.getElementById('showFinishedGamesButton').style.background = '#ECF7F8';
        
        //Call to update "gameZone" with that game
        displayInGameZone(response.to[0]+ "_1");
        
        //Make sure the gameZone is displayed
        document.getElementById('instructionsAndLogo').style.zIndex = '1';
        document.getElementById('ffGame').style.zIndex = '11';
        
        //Call to update "friendZone" (will add the new item)
        populateFriendZone("current");
        
        console.log(response.request);
        console.log("Request Response: " + response);
        console.log("Requested Friend ID: " + response.to[0]);
        console.log("two" + myFID);
    }
}

//Called after user enters a word guess
function submitWordRequest(){
    
    FB.ui({method: 'apprequests',
          message: 'I just played a word... it is your turn now!',
          to: friendFID,
          action_type:'turn',
          title: 'It is your turn in FriendFrequency',
          data: '1'
          }, submitWordRequestCallback);
}

function submitWordRequestCallback(response) {
    if (response && response.request != undefined) {
        //Do nothing!
    }
}

//Called when submit button is pressed
function submitCurrentWordPart1(theWord){
    //Clear input box
    document.getElementById('wordGuessField').value = "";
    
    noSpaceWord = theWord.replace(/ /g,''); //Get rid of any spaces
    var pattern = new RegExp(/^[A-Za-z0-9]+$/); //Pattern for alphanumeric input
    var patternResult = pattern.test(noSpaceWord);
    if(patternResult == true){
        //Request to get most current version of current game matching myFID GameTbl - puts it in myGames
        httpRequest('GET','Game','https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php', false, 'getOneGame');
        storeTheWord = theWord;
    }else{
        console.log("Invalid User Input");
        //Add invalid word message
        //alert("You entered an invalid word... The word may only contain alpha-numeric items (a-z and 0-1).  Please try again!");
        document.getElementById("invalidWordPopup").style.display = "block";
    }
}

function submitCurrentWordPart2(obj){
    if(obj[0]["fb_id_a"] == myFID){
        var status = getGameStatus(obj[0]["words_a"]+","+storeTheWord ,obj[0]["words_b"]);
        myGames[friendFID+"_1"]["friendWords"] = obj[0]["words_b"];
    }else{
        var status = getGameStatus(obj[0]["words_b"]+","+storeTheWord ,obj[0]["words_a"]);
        myGames[friendFID+"_1"]["friendWords"] = obj[0]["words_a"];
    }
    
    //Update myGames
    if(myGames[friendFID+"_1"]["myWords"] == ""){
        myGames[friendFID+"_1"]["myWords"] = storeTheWord;
    }else{
        myGames[friendFID+"_1"]["myWords"] = myGames[friendFID+"_"+gameID]["myWords"] + "," + storeTheWord;
    }
    //gameStatus
    var newStatus = getGameStatus(myGames[friendFID+"_"+gameID]["myWords"],myGames[friendFID+"_"+gameID]["friendWords"]);
    myGames[friendFID+"_1"]["gameStatus"] = newStatus;
    
    if(newStatus == "ENDED"){
        saveCurrentGame();
    }else{
        updateAllWithCurrentWord();
    }
}

//After word has been entered, this function updates all appropriate items
function updateAllWithCurrentWord(){
    //Update database
    if(parseInt(friendFID,10) > parseInt(myFID,10)){
            var urlData = "?words_a=" + myGames[friendFID+"_1"]["myWords"] + "&words_b=" + myGames[friendFID+"_"+gameID]["friendWords"];
    }else{
            var urlData = "?words_a=" + myGames[friendFID+"_1"]["friendWords"] + "&words_b=" + myGames[friendFID+"_"+gameID]["myWords"];
    }
    
    var urlWithData = "https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php" + urlData;
    httpRequest('PUT','Game', urlWithData, false, 'updateGame');
    
    //Update gameZone
    displayInGameZone(friendFID+"_1");
    
    //Change gameBubble border color
    switch(getGameStatus(myGames[friendFID+"_1"]["myWords"],myGames[friendFID+"_1"]["friendWords"]))
    {
        case "ME":
            document.getElementById(friendFID+"_"+gameID).style.border="#FF3366 7px solid";
            break;
        case "FRIEND":
            document.getElementById(friendFID+"_"+gameID).style.border="#49b7f7 7px solid";
            break;
        case "NEW":
            document.getElementById(friendFID+"_"+gameID).style.border="#FF3366 7px solid";
            break;
        case "ENDED":
            document.getElementById(friendFID+"_"+gameID).style.border="#B6E2FB 7px solid";
            break;
        default:
            break;
    }
    //Send request to friend
    submitWordRequest();
}

//Helpful function to add a wordBubble to the wordZone
function addWordBubble(word1,word2){
    //Div that holds the wordBubbles
    var theDiv = document.getElementById("wordZone");
    
    //Both invisible divs for height and width testing only
    var testDiv1 = document.getElementById("testWidthDiv1");
    var testDiv2 = document.getElementById("testWidthDiv2");
    //Ensure beginning font size is correct
    testDiv1.style.fontSize = "27px";
    testDiv2.style.fontSize = "27px";
    //Place user words in test divs
    testDiv1.innerHTML = word1;
    testDiv2.innerHTML = word2;
    //Obtain the pixel width of the entered div (giving width of word)
    var testDivWidth1 = testDiv1.clientWidth;
    var testDivWidth2 = testDiv2.clientWidth;
    
    //If width is greater than my desired display box width (270px)
    if(testDivWidth1 > 230){
        //Use proportions to define a new fontSize
        var newFontSize = Math.floor((230*27)/testDivWidth1) - 1;
        //Update test div with calculated fontSize to obtain new word height
        testDiv1.style.fontSize = newFontSize;
        var testDivHeight1 = testDiv1.clientHeight;
        //Calculate the top and bottom padding given my desired display box height (33px)
        var calculatedDiff = (33-testDivHeight1)/2;
        var newHeight = testDivHeight1 + calculatedDiff;
        var newTopPadding = calculatedDiff;
        //Create appropriate inline style
        var style1 = "style='font-size: "+ newFontSize + "px; padding-top: "+ newTopPadding + "px; height: "+ newHeight + "px;'";
    }else{
        //Keep style the same
        var style1 = "style='font-size: "+ 27 + "px';";
    }
    if(testDivWidth2 > 230){
        var newFontSize = Math.floor((230*27)/testDivWidth2) - 1;
        testDiv2.style.fontSize = newFontSize;
        var testDivHeight2 = testDiv2.clientHeight;
        var calculatedDiff = (33-testDivHeight2)/2;
        var newHeight = testDivHeight2 + calculatedDiff;
        var newTopPadding = calculatedDiff;
        //Create appropriate inline style
        var style2 = "style='font-size: "+ newFontSize + "px; padding-top: "+ newTopPadding + "px; height: "+ newHeight + "px;'";
    }else{
        var style2 = "style='font-size: "+ 27 + "px';";
    }
    
    newWordBubble = "<div class='wordBubble'><div class='word1'" + style1 + ">" + word1 + "</div><div class='word2'" + style2 + ">" + word2 + "</div></div>";
    theDiv.innerHTML = theDiv.innerHTML + newWordBubble;
}

//Called when user presses delete game
function deleteCurrentGame(){
    
    //Prompt 'are you sure... game will not be recoverable'
    var deleteResponse=confirm("Are you sure you want to delete the current game?  You and your friend will no longer be able to view or recover any of the game data.");
    if (deleteResponse==true)
    {
        //Check if this is a Saved Game
        if(gameID == 1){ //Current Game
            
            //Add to DeletedTbl in DB
            if(parseInt(friendFID,10) > parseInt(myFID,10)){
                var urlData = "?words_a=" + myGames[friendFID+"_1"]["myWords"] + "&words_b=" + myGames[friendFID+"_1"]["friendWords"];
            }else{
                var urlData = "?words_a=" + myGames[friendFID+"_1"]["friendWords"] + "&words_b=" + myGames[friendFID+"_1"]["myWords"];
            }
            
            var urlWithData = "https://friendfrequency-friendfrequency.rhcloud.com/official_deleted_backend.php" + urlData;
            httpRequest('POST','Game', urlWithData, false, 'newGame');
            
            //Remove from myGames
            delete myGames[friendFID+"_1"];
            
            //Re-populate friendZone current area
            populateFriendZone("current");
            console.log("Game was deleted");
            
            //Remove from GameTbl in DB
            httpRequest('DELETE', 'Game', 'https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php', false, 'deleteCurrent');
            
            //Remove from friendIDArray
            friendIDArray.splice(friendIDArray.indexOf(friendFID),1); //splice(index,numberToRemove)
            
        }else{ //Saved Game
            
            //Add to DeletedTbl in DB
            if(parseInt(friendFID,10) > parseInt(myFID,10)){
                var urlData = "?words_a=" + myResults[friendFID+"_"+gameID]["myWords"] + "&words_b=" + myResults[friendFID+"_"+gameID]["friendWords"];
            }else{
                var urlData = "?words_a=" + myResults[friendFID+"_"+gameID]["friendWords"] + "&words_b=" + myResults[friendFID+"_"+gameID]["myWords"];
            }
            
            var urlWithData = "https://friendfrequency-friendfrequency.rhcloud.com/official_deleted_backend.php" + urlData;
            httpRequest('POST','Game', urlWithData, false, 'newGame');
            
            //Remove from myResults
            delete myResults[friendFID+"_"+gameID];
            
            //Re-populate friendZone finished area
            populateFriendZone("finished");
            console.log("Game was deleted");
            
            //Remove from ResultTbl in DB
            httpRequest('DELETE', 'Game', 'https://friendfrequency-friendfrequency.rhcloud.com/official_result_backend.php', false, 'deleteFinished');
        }
        
        //Put default instruction page up
        document.getElementById('ffGame').style.zIndex = '1';
        document.getElementById('instructionsAndLogo').style.zIndex = '11';
        
        //Send notification to friend?
    }
    else
    {
        console.log("Did not delete");
    }
}

//Called when game is completed
function saveCurrentGame(){
    //Prompt 'moved game to completed games'
    //alert("This game is complete! It has been moved to your list of 'Finished' games.");
    document.getElementById("completedGamePopup").style.display = "block";
    
    //Put default instruction page up
    document.getElementById('ffGame').style.zIndex = '1';
    document.getElementById('instructionsAndLogo').style.zIndex = '11';
    
    
    //Send notification to opponent alerting them of completed game!
    FB.ui({method: 'apprequests',
          message: 'Our game just ended... we are on the same frequency!',
          to: friendFID,
          title: 'Our game just finished!',
          data: '2'
          }, function(response){
          console.log("Finished Game: "+ response);
          }
    );
    
    //Add to myResults
    var index = friendFID+"_"+globalCounter;
    myResults[index] = {
        "friendFID":friendFID,
        "myWords":myGames[friendFID+"_"+gameID]["myWords"],
        "friendWords":myGames[friendFID+"_"+gameID]["friendWords"],
        "gameStatus":myGames[friendFID+"_"+gameID]["gameStatus"]
    }
    
    //Decrement globalCounter
    globalCounter--;
    
    //Add to ResultTbl in DB
    if(parseInt(friendFID,10) > parseInt(myFID,10)){
        var urlData = "?words_a=" + myGames[friendFID+"_"+gameID]["myWords"] + "&words_b=" + myGames[friendFID+"_"+gameID]["friendWords"];
    }else{
        var urlData = "?words_a=" + myGames[friendFID+"_"+gameID]["friendWords"] + "&words_b=" + myGames[friendFID+"_"+gameID]["myWords"];
    }
    
    var urlWithData = "https://friendfrequency-friendfrequency.rhcloud.com/official_result_backend.php" + urlData;
    httpRequest('POST','Game', urlWithData, false, 'newGame');
    
    //Remove from myGames
    delete myGames[friendFID+"_1"];
    
    //Remove from GameTbl in DB
    httpRequest('DELETE', 'Game', 'https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php', false, 'deleteCurrent');
    
    //Remove from friendIDArray
    friendIDArray.splice(friendIDArray.indexOf(friendFID),1); //splice(index,numberToRemove)
    
    //Re-populate scrollingFinished in friendZone
    populateFriendZone("finished");
    //Re-populate scrollingCurrent in friendZone
    populateFriendZone("current");
    
}


