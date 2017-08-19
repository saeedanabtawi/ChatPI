//Create database  init DB
// packages we need
var mysql = require('mysql');
//Databse connection 
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database:"mydb"
});
//connect
con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	/*
	//User Table
	var sql = "CREATE TABLE Users (userID INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255),email VARCHAR(255),phone VARCHAR(255),first VARCHAR(255),last VARCHAR(255),gender VARCHAR(10))";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Users table created");
	});
	// Contacts table
	var sql = "CREATE TABLE Contacts (userID INT AUTO_INCREMENT PRIMARY KEY, firendID INT,blocked BOOLEAN)";
	 con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Contacts table created");
	});
	//Chats table 
	var sql = "CREATE TABLE Chats (chatID INT AUTO_INCREMENT PRIMARY KEY, chatname VARCHAR(255))";
	con.query(sql, function (err, result) {
		if (err) throw err;
	    console.log("Chats table created");
	});
	//chats_user table
	var sql = "CREATE TABLE chats_users (chatID INT, userID INT, FOREIGN KEY (chatID) REFERENCES Chats(chatID),FOREIGN KEY (userID) REFERENCES Users(userID))";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("chats_users table created");
	});
	// Messages table 
	var sql = "CREATE  TABLE  Messages  (msgID INT AUTO_INCREMENT PRIMARY KEY, sender INT, reciever INT,msg_body VARCHAR(1024),msg_time TIMESTAMP, chatID INT,FOREIGN KEY (chatID) REFERENCES Chats(chatID)) ";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Messages table created");
	});
	//Password rest table 
	var sql = "CREATE  TABLE  Passrests  (email VARCHAR(255) PRIMARY KEY, token VARCHAR(255),expire_date VARCHAR(255)) ";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Passrests table created");
	});
	*/
	// Contacts table	
	var sql = "CREATE TABLE friendreq ( senderID INT, reciverID INT)";
	 con.query(sql, function (err, result) {
	    if (err) throw err;
	    console.log("Friendreq table created");
	});
	
	con.end();
});