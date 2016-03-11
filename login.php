/*
 login.php uses OpenShift environment variables to provide database login
 Author: Stephen Dyksen (srd22)
 Date: May 22, 2014
 Calvin College CS 396
 */

<?php
    $db_hostname = $_ENV['OPENSHIFT_MYSQL_DB_HOST'] . ':' . $_ENV['OPENSHIFT_MYSQL_DB_PORT'];
    $db_database = $_ENV['OPENSHIFT_APP_NAME'];
    $db_username = $_ENV['OPENSHIFT_MYSQL_DB_USERNAME'];
    $db_password = $_ENV['OPENSHIFT_MYSQL_DB_PASSWORD'];
    ?>