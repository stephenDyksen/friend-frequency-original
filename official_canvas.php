<!--
official_canvas.php sets up the html for FriendFrequency for Web and calls functions in game_functionality.js to run the game
Author: Stephen Dyksen
Date: May 22, 2014
Calvin College CS 396

//<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
//<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
-->

<html>
<head>
    <link rel="stylesheet" type="text/css" href="../ff_canvas_style.css">
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Varela+Round">

    <script>
        //Page Globals
        var myFID = 100;
        var friendFID = 200;
        var gameID = 0;
        var globalCounter = -1;
        var myGames = {}; //Object to hold parsed DB Game info
        var myResults = {}; //Object to hold my parsed DB Result info
        var friendIDArray = []; //Array to hold current games (Use to restrict request sender info)
        var storeTheWord = "theWord"; //string to hold the word that the user inputs
    </script>

    <script>
    //Items in head script are functions that run on some event such as a user-click

        function showCurrentGamesEvent(){
            //Present current games in friendZone to users
            document.getElementById('scrollingFinishedGames').style.zIndex = '1';
            document.getElementById('showFinishedGamesButton').style.background = '#ECF7F8';
            document.getElementById('scrollingCurrentGames').style.zIndex = '11';
            document.getElementById('showCurrentGamesButton').style.background = '#FFFFFF';
        }

        function showFinishedGamesEvent(){
            //Present finished games in friendZone to users
            document.getElementById('scrollingCurrentGames').style.zIndex = '1';
            document.getElementById('showCurrentGamesButton').style.background = '#ECF7F8';
            document.getElementById('scrollingFinishedGames').style.zIndex = '11';
            document.getElementById('showFinishedGamesButton').style.background = '#FFFFFF';
        }

        function startNewGameEvent(){
            openRequestPicker();
        }

        function instructionsEvent(){
            //alert("Game Instructions Here!");
            document.getElementById("howToPlayPopup").style.display = "block";
        }

        function submitWordEvent(newWord){
            submitCurrentWordPart1(newWord);
        }

        function backEvent(){
            //Present the 'instructionsAndLogo' div to users
            document.getElementById('instructionsAndLogo').style.zIndex = '11';
            document.getElementById('ffGame').style.zIndex = '1';
        }

        function deleteEvent(){
            deleteCurrentGame();
        }

        function closePopup(div){
            document.getElementById(div).style.display = "none";
        }

    </script>

</head>
<body>
    <div id="fb-root"></div>
    <script>
    //Items in top body script are needed on page-load to generate content in the page or load SDK

        //Run as soon as FB-SDK has completed loading
        window.fbAsyncInit = function() {
            FB.init({
                appId      : '216747611849094',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true,  // parse XFBML
                frictionlessRequests : true //keep users from always confirming request send
            });
            
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    console.log("all systems go");
                    // response.authResponse supplies user's ID, a valid access token, a signed request, and the time the access token and signed request each expire
                    myFID = response.authResponse.userID;
                    //Request to add id and info into DB if new user
                    httpRequest('POST','User','https://friendfrequency-friendfrequency.rhcloud.com/official_user_backend.php', false, 'newUser');
                    //Request to get all games matching myFID GameTbl - puts them in myGames
                    httpRequest('GET','Game','https://friendfrequency-friendfrequency.rhcloud.com/official_game_backend.php', true, 'getAllGames');
                    //Request to get all games matching myFID from ResultTbl - puts them in myResults
                    httpRequest('GET','Game','https://friendfrequency-friendfrequency.rhcloud.com/official_result_backend.php', true, 'getAllResults');
                } else if (response.status === 'not_authorized') {
                    // the user isn;t logged into app, but is logged into Facebook
                    top.location.href="https://www.facebook.com/dialog/oauth?client_id=216747611849094&redirect_uri=https://apps.facebook.com/friendfrequency/&scope=basic_info";
                } else {
                    // the user isn't logged in to Facebook.
                    top.location.href="https://www.facebook.com/dialog/oauth?client_id=216747611849094&redirect_uri=https://apps.facebook.com/friendfrequency/&scope=basic_info";
                }
            });

        };

        // Load the SDK asynchronously
        (function(d){
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)){ return; }
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);
            }(document)
        );

    </script>

    <div id="gameWrapper">
        <div id="friendZone">
            <div id="myGames">
                My Games
                <div id="showCurrentGamesButton" onclick="showCurrentGamesEvent()">Current</div>
                <div id="showFinishedGamesButton" onclick="showFinishedGamesEvent()">Finished</div>
            </div>
            <div id="startNewGameButton" onclick="startNewGameEvent()">New Game +</div>
            <div id="gameScrollers">
                <div id="scrollingCurrentGames"></div>
                <div id="scrollingFinishedGames"></div>
            </div>
        </div>
        <div id="gameZone">

            <div id="instructionsAndLogo">
                <div id="introInstructions"><div onclick="startNewGameEvent()">Start a New Game<br></div>or<br>Choose a Game From the Left<br></div>
                <img id="logoImage" src="../images/ffLogoOpacity.png" alt="friend_frequency_logo"/>
                <div id="instructionsButton" onclick="instructionsEvent()">How To Play</div>
            </div>
            <div id="ffGame">
                <div id="gameMessage"></div>
                <div id="wordScrollersWrapper">
                    <div id="wordZone">
                        <div class="wordBubble" style="display:none;">
                            <div class="word1">Word1</div>
                            <div class="word2">Word2</div>
                        </div>
                    </div>
                </div>
                <div id="inputZone">
                    <div id="myWordField" style="display:none;">My Word</div>
                    <input type="text" id="wordGuessField" name="wordGuessField" maxlength="20" autofocus>
                    <div id="friendWordField">?</div>
                </div>
                <div id="submitWordButton" onclick="submitWordEvent(document.getElementById('wordGuessField').value)">Submit Word</div>
                <div id="testWidthDiv1" style="position: absolute; height: auto; width: auto; font-size:27px; visibility:hidden;"></div>
                <div id="testWidthDiv2" style="position: absolute; height: auto; width: auto; font-size:27px; visibility:hidden;"></div>
                <div id="backButton" onclick="backEvent()"> <- Back </div>
                <div id="deleteButton" onclick="deleteEvent()"> Delete Game </div>
            </div>
        </div>
        <!-- Popups -->
        <div id="howToPlayPopup" class="popups">
            <a href="https://www.facebook.com/photo.php?v=1421688934767900&set=vb.216747611849094&type=2&theater&notif_t=video_processed" target="_blank">Video Demonstration Of Game Here!</a><br><br>
            Instructions:<br>
            Friend Frequency is a game meant to enhance your cognitive ability to find relationships between words.<br>
            Start a new game by pressing the 'New Game +' button and choosing a friend to play with.<br>
            You can view both your current and finished games by pressing on the tabs in the left 'game column'.<br>
            Current Games in which it is your turn will be outlined in red.<br><br>
            Rules of the Game:<br>
            You and your invited friend start the game by each entering a random word.<br>
            Once you have both entered a word, they will appear to you and it is now time to think of a word that relates the two words.<br>
            You keep doing this (you have 20 rounds to finish in) until you both type in the same word in a given round.<br>
            <div class="popupButton" onclick="closePopup('howToPlayPopup')" style="left:232px;">OK</div>
        </div>
        <div id="completedGamePopup" class="popups">
            This game is complete! It has been moved to your list of 'Finished' games.
            <div class="popupButton" onclick="closePopup('completedGamePopup')" style="left:67px;">OK</div>
        </div>
        <div id="invalidWordPopup" class="popups">
            You entered an invalid word... The word may only contain alpha-numeric items (a-z and 0-1).  Please try again!
            <div class="popupButton" onclick="closePopup('invalidWordPopup')" style="left:107px;">OK</div>
        </div>
        <div id="completedGameFromRequestPopup" class="popups">
            <div class="popupButton" onclick="closePopup('completedGameFromRequestPopup')" style="left:105px;">OK</div>
        </div>
    </div>

    <script>
        //Items in bottom body script run after basic html elements are shown
    </script>
    <script src="../gameFunctionality.js"></script>

</body>
<footer></footer>
</html>


