/*
 official_user_backend.php responds to http calls by connecting to the database and modifying or returning data to the caller
 Author: Stephen Dyksen (srd22)
 Date: May 22, 2014
 Calvin College CS 396
 */

<?php
    /*
     * official_user_backend.php responds to requests to UserTbl table in friendfrequency database
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

    $least_fb_id = mysql_real_escape_string($_SERVER['HTTP_LFID']);

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
        $result = json_encode(mysql_query("INSERT INTO UserTbl(fb_id) VALUES('" . $GLOBALS['least_fb_id'] . "')"));
        //$result = true if not present before insert
        //          false if error (like duplicate entry)
        //if (!$result) die ("Database access failed: " . mysql_error());
        sendResponse(201, $result);
    }
    
    function doPut()
    {
        //Used mainly for updating records
        //Not currently applicable for friendfrequency UserTbl
        sendResponse(405, "Method Not Allowed");
    }
    
    function doGet()
    {
        $result = mysql_query("SELECT * FROM UserTbl WHERE fb_id =" . $GLOBALS['least_fb_id']);
        $result_arr[] = mysql_fetch_assoc($result);
        //$result = array item if successful
        //          false if resource was not present in DB
        sendResponse(200, json_encode($result_arr));
    }
    
    function doDelete()
    {
        $result = json_encode(mysql_query("DELETE FROM UserTbl WHERE fb_id = " . $GLOBALS['least_fb_id']));
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