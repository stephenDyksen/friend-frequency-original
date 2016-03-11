/*
 official_deleted_backend.php responds to http calls by connecting to the database and modifying or returning data to the caller
 Author: Stephen Dyksen (srd22)
 Date: May 22, 2014
 Calvin College CS 396
 */

<?php
    /*
     * official_deleted_backend.php responds to requests to ResultTbl table in friendfrequency database
     */
    //This will display errors on the page if there are any in the php
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    //Setup mySQL connection
    require_once '../misc/mysql/login.php';
    $dbconn = mysql_connect($db_hostname, $db_username, $db_password);
    if (!$dbconn) die("Unable to connect to MySQL: " . mysql_error());
    
    //Select the database
    mysql_select_db($db_database)
    or die("Unable to select database: " . mysql_error());
    
    $least_fb_id = mysql_real_escape_string( ($_SERVER['HTTP_LFID']) );
    $greatest_fb_id = mysql_real_escape_string( ($_SERVER['HTTP_GFID']) );
    
    /*
     Alter behavior based on the request method
     Note: This actually tests the "TRUE_METHOD" header setting
     */
    switch ($_SERVER['HTTP_TRUE_METHOD'])
    {
        case "POST":
            doPost();
            break;
        case "PUT":
            doPut();
            break;
        case "GET":
            doGet();
            break;
        case "DELETE":
            doDelete();
            break;
    }
    
    function doPost()
    {
        $values =  "'" . $GLOBALS['least_fb_id'] . "', '" . $GLOBALS['greatest_fb_id'] . "', '" . mysql_real_escape_string($_GET['words_a']) . "', '" . mysql_real_escape_string($_GET['words_b']) . "', " . "now()";
        $result = json_encode(mysql_query("INSERT INTO DeletedTbl(fb_id_a,fb_id_b,words_a,words_b, timestamp) VALUES(" . $values . ")"));
        //$result = true if not present before insert
        //          false if error (like duplicate entry)
        //if (!$result) die ("Database access failed: " . mysql_error());
        sendResponse(201, $result);
    }
    
    function doPut()
    {
        //Functionality not supported
        $result = json_encode("Function Not Supported");
//        //echo "\"" . $_GET["words_a"] . "\"";
//        $values = "words_a=\"" . mysql_real_escape_string($_GET["words_a"]) . "\", words_b=\"" . mysql_real_escape_string($_GET["words_b"]) . "\"" . ", timestamp=now()";
//        $result = json_encode(mysql_query("UPDATE DeletedTbl SET " . $values . " WHERE fb_id_a=" . $GLOBALS['least_fb_id'] . " AND fb_id_b=" . $GLOBALS['greatest_fb_id']));
        sendResponse(200, $result);
    }
    
    function doGet()
    {
        //Functionality not supported
        $result = json_encode("Function Not Supported");
//        $result_arr = null;
//        if($_SERVER['HTTP_GET_ALL'] == "FALSE"){
//            $result = mysql_query("SELECT * FROM DeletedTbl WHERE fb_id_a=" . $GLOBALS['least_fb_id'] . " AND fb_id_b = " . $GLOBALS['greatest_fb_id']);
//            //            $result_arr[] = mysql_fetch_assoc($result);
//            //$result = array item if successful
//            //          false if resource was not present in DB
//        }else{
//            $result = mysql_query("SELECT * FROM DeletedTbl WHERE fb_id_a=" . $GLOBALS['least_fb_id'] . " OR fb_id_b = " . $GLOBALS['least_fb_id']);
//        }
//        while($row = mysql_fetch_assoc($result)) {
//            $result_arr[] = $row;
//        }
        sendResponse(200, json_encode($result_arr));
    }
    
    function doDelete()
    {
        //Functionality not supported
        $result = json_encode("Function Not Supported");
        //$result = json_encode(mysql_query("DELETE FROM DeletedTbl WHERE id=" . $GLOBALS['least_fb_id']));
        //$result = true if successfully deleted
        //          true if it was not in database at all to begin with
        
        sendResponse(200, $result);
    }
    
    // Method to send a HTTP response code/message
    function sendResponse($status = '', $body = '', $content_type = 'application/json')
    {
        $status_header = 'HTTP/1.1 ' . $status;
        header($status_header);
        header('Content-type: ' . $content_type);
        echo $body;
    }
    
    mysql_close($dbconn);
    ?>