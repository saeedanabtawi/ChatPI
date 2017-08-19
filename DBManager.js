//DataBase Manager 
//packages we need
var mysql = require('mysql');
//Databse connection 
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database:"mydb"
});
con.connect(function(err) {
	if (err) return callback(err);
	console.log("Connected!");
}); 
var localhost="http://172.20.251.104:3001";
//var  localhost = "http://192.168.1.15:3001";//for testing

//User
exports.INSERTUSER= function (username,password,firstname,lastname,email,phone,gender,image) {

	var filename="/profileimages/image"+Date.now()+".jpg";
	var actualpath = localhost+filename;

	console.log("the image data"+image);

	if(image!='null')
	fs.writeFile("."+filename, new Buffer(image, "base64"), function(err) {
    	if(err)
    		return console.log(err);
  		console.log("imaage uploeadded");
  		});
	var sql = "INSERT INTO Users (username,password,email,phone,first,last,gender,image) VALUES (?)";
	var values = [];
	values.push(username);
	values.push(password);
	values.push(email);
	values.push(phone);
	values.push(firstname);
	values.push(lastname);
	values.push(gender);
	if(image!='null')
		values.push(actualpath);
	else
		values.push(null);

	con.query(sql, [values], function (err, result) {
		if (err) return callback(err);
		console.log("Number of records inserted: " + result.affectedRows);
	});
}
exports.UPDATEUSER = function(username,password,firstname,lastname,email,phone){}
exports.CHECKUSER = function (username,callback){
	var sql = "SELECT userID,username,password,phone,email,first,last,gender,image FROM Users WHERE username = '"+username+"'";

	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.CHECKEMAIL = function (email,callback){
	var sql = "SELECT * FROM Users WHERE email = '"+email+"'";

	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.DELETEUSER = function (userID) {}
exports.ADDCONTACT= function (userID,friendID,callback) {
	var sql = "INSERT INTO Contacts (userID,friendID,blocked) VALUES (?)";
	var values = [];
	values.push(userID);
	values.push(friendID);
	values.push(1);
	con.query(sql, [values], function (err, result) {
		if (err)
		{ return callback({result:result,success:false ,Message:"Contact NotAdded",Error:err});
		}else{
			console.log("Number of records inserted: " + result.affectedRows);
			if(result.affectedRows>=1)
				return callback({code:result,success:true ,Message:"Contact Added"});
		}
	});
}
exports.DELETECONTACT = function (userID,friendID,callback) {
	var sql = "DELETE FROM Contacts WHERE userID in ('"+userID+"','"+friendID+"') and friendID in ('"+userID+"','"+friendID+"')";
	con.query(sql, function (err,result) {
	   	if (err){
	   		return callback({result:result,success:false ,Message:"Contact Not Deleted"});	
	   	}
	   	else
	   	{
	   		if(result.affectedRows>=1)
	   	    	return callback({result:result,success:true ,Message:"Contact Deleted"+userID+friendID});
	   	    else 	   		
	   	    	return callback({result:result,success:false ,Message:"Contact Not Deleted"});	
	
	   	}
	});
}
exports.GETCONTACT = function (my_id,friendID,callback) {
	var sql = "SELECT userID,username,email,phone,first,last,gender,image FROM users WHERE userID IN (SELECT friendID FROM Contacts WHERE userID='"+my_id+"' and friendID = '"+friendID+"')";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.GETCONTACTS = function (my_id,callback) {
	var sql = "SELECT userID,username,email,phone,first,last,gender,image FROM users WHERE userID IN (SELECT friendID FROM Contacts WHERE userID='"+my_id+"')";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.BLOCK = function(my_id,friendID,block){
	var sql = "UPDATE Contacts SET blocked = '"+block+"' WHERE userID = '"+my_id+"'and friendID = '"+friendID+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) updated");
	});
}
exports.ISBLOCKED = function(my_id,friendID,block){
	var sql = "SELECT blocked FROM  Contacts WHERE userID = '"+my_id+"'and friendID = '"+friendID+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    	return callback({success:true ,Message:"Contact Unblocked"});
	});	
}
exports.ISACTIVE = function(userID,callback){
	var sql = "SELECT * FROM  activeusers WHERE userID = '"+userID+"'";
	con.query(sql, function (err,result) {
	   	if (err)
	   		 return callback(err);
	    return callback(result);
	});	
}
exports.ACTIVE = function(userID,state,callback){
	var sql = "INSERT INTO activeusers (userID,active) VALUES (?)";
		var values = [];
		values.push(userID);
		values.push(state);
		con.query(sql,[values], function (err,result) {
			if (err){
			 	var sql = "UPDATE activeusers SET active='"+state+"' WHERE userID = "+userID+"";
				con.query(sql, function (err,dresult) {
					if(err)return callback(err)
						 return callback(dresult);
				});
			}else
			{
			   	return callback(result);
			}
		});	
}
exports.GETUSERNAME = function(userID,callback){
	var sql = "SELECT username FROM users WHERE userID= '"+userID+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.SELECTUSER = function(userID,callback){
	var sql = "SELECT * FROM users WHERE userID= '"+userID+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
//rest funcitons
exports.UPDATEPASS = function (password,email){
	var sql = "UPDATE users SET password = '"+password+"'  WHERE email = '"+email+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) updated");
	});

}
exports.SELECTEMAIL = function(email,callback){
	var sql = "SELECT * FROM users WHERE email= '"+email+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.SELECTRESTEMAIL = function(email,callback){
	var sql = "SELECT * FROM Passrests WHERE email = '"+email+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
//Token operations 
exports.INSERTTOKEN = function(email,token,expireIn){
	var sql = "INSERT INTO Passrests (email,token,expire_date) VALUES (?)";
	var values = [];
	values.push(email);
	values.push(token);
	values.push(expireIn);
	con.query(sql, [values], function (err, result) {
		//	if (err) return callback(err);
		console.log("Number of records inserted: " + result.affectedRows);
	});
}
exports.UPDATETOKEN = function(email,token,expireIn){
	var sql = "UPDATE Passrests SET token = '"+token+"', expire_date ='"+expireIn+"' WHERE email = '"+email+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) updated");
	});
}
exports.DELETETOKEN = function(token){
	var sql = "DELETE FROM Passrests WHERE token='"+token+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) Deleted");
	});
}
exports.SELECTTOKEN= function(token,callback){
	var sql = "SELECT * FROM Passrests WHERE token = '"+token+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
//Chat operation
exports.getUsersFromChat = function (chatID,callback) {
	var sql = "SELECT userID FROM chats_users WHERE chatID ='"+chatID+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.getUserDeviceToken = function (userID,callback) {
	var sql = "SELECT * FROM notif_tokens WHERE userID='"+userID+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.ISCHATEXIST = function (userID,friendID,callback) {
	var sql = "SELECT * FROM chats_users WHERE chatID IN (SELECT chatID FROM chats_users WHERE userID = "+userID+" or userID = "+friendID+" GROUP BY chatID HAVING COUNT(DISTINCT userID) = 2)";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			if(result[0])
				return callback({result:result,exists:true});
			else
				return callback({result:result,exists:false});
		}
	});
}
//Chat
exports.INSERTCHAT = function (chatname) {
	var sql = "INSERT INTO Chats (chatname) VALUES (?)";
	var values = [];
	values.push(chatname);
	con.query(sql, [values], function (err, result) {
		if (err) 
			console.log("chat already exists")
		else{
		console.log("Number of records inserted: " + result.affectedRows);
		}
	});
}

exports.DELETECHAT = function (chatid) {
	var sql = "DELETE FROM Chats WHERE chatid='"+chatid+"'";

	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) Deleted");
	});
	con.end();
}
exports.ADDUSERCHAT = function(chatID,userID,chatname,friendID){
	var sql = "INSERT INTO chats_users (chatID,userID,chatname,chatImage) VALUES ("+chatID+","+userID+",'"+chatname+"',(SELECT image FROM users WHERE userID="+friendID+"))";
	var values = [];
	values.push(chatID);
	values.push(userID);
	values.push(chatname);
	con.query(sql, [values], function (err, result) {
		if (err) 
			console.log(err);
		console.log("Number of records inserted: ");
	});

}
exports.ADDTOKEN = function(userID,token,callback){
	console.log("token from database"+token)
	var sql = "INSERT INTO notif_tokens (userID,notif_token) VALUES (?)";
		var values = [];
		values.push(userID);
		values.push(token);
		con.query(sql,[values], function (err,result) {
			if (err){
			 	var sql = "UPDATE notif_tokens SET notif_token='"+token+"' WHERE userID = "+userID+"";
				con.query(sql, function (err,dresult) {
					if(err)
						return callback(err)
					callback(dresult);

				});
			}else
			{
			   	return callback(result);
			}
		});	
}

exports.DELETETUSERCHAT = function(Deleteded_user,chatid){
	var sql = "DELETE FROM chats_users WHERE userID='"+Deleted+"' AND chatid='"+chatid+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
	    console.log(result.affectedRows + " record(s) Deleted");
	});
	con.end();
}
exports.SELECTCHAT = function (chatname,callback) {
	var sql = "SELECT chatID FROM Chats WHERE chatname = '"+chatname+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			console.log(result)
			return callback(result);
		}
	});
}
exports.SELECTCHATS = function (userid,callback) {
	var sql = "SELECT chatID,chatname,chatImage FROM chats_users WHERE userID = '"+userid+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
exports.SELECTCHATUSERS = function (chatid,callback) {
	var sql = "SELECT userID FROM chats_users WHERE chatID = '"+chatid+"'";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
var fs = require("fs");

//Message operations 
exports.INSERTMSG= function (sender,msgbody,chatID,istext,callback) {
	console.log(sender,chatID,istext);

 

	if(istext==true)
		var sql = "INSERT INTO messages (sender,msg_body,chatID) VALUES ("+sender+",'"+msgbody+"',"+chatID+");";
	else{
		var filename="/uploads/image"+Date.now()+".jpg";
		var actualpath = localhost+filename;
		var sql = "INSERT INTO imagemessages (sender,msg_body,chatID) VALUES ("+sender+",'"+actualpath+"',"+chatID+");";				

		 fs.writeFile("."+filename, new Buffer(msgbody, "base64"), function(err) {
		 if(err)
		 	return console.log(err);

  			console.log("imaage uploeadded");
  		});
	}

	con.query(sql, function (err, result) {

		if (err) {
				console.log(err);

			return callback({success:false ,message:"Message is NOT sent !"});}
		else 
			return callback({success:true ,message:"Message sent !"});

	});
}

exports.SELECTMSGS= function (chatid,callback) {
	var sql = "SELECT * FROM Messages WHERE chatID = '"+chatid+"' UNION SELECT * FROM imagemessages WHERE chatID = '"+chatid+"' order by msg_time";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}
//search users with thier first name or last name or both,users that is not friend with me
exports.SEARCHUSER= function (userID,name,callback) {
	// select like name
	var sql = "SELECT userID,username,email,phone,first,last,gender,image FROM users WHERE concat(first,\" \" ,last) like '%"+name+"%' ";
	//dont select from contacts 
	sql += "AND userID not in (SELECT friendID from Contacts WHERE userID='"+userID+"') ";
	//dont select requster 
	sql += "AND userID!='"+userID+"'  ";
	//dont select already sent users
	sql += "AND userID not in (SELECT reciverID from friendreq WHERE senderID='"+userID+"') ";

	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
			console.log('username'+ err);

		}else{
			return callback(result);
		}
	});
}
exports.INSERTFREQ =  function(sender_id,receiver_id,callback){
	var sql = "INSERT INTO friendreq (senderID,reciverID) VALUES (?)";
	var values = [];
	values.push(sender_id);
	values.push(receiver_id);
	con.query(sql, [values], function (err, result) {
		if (err) return callback(err);
		console.log("Number of records inserted: " + result.affectedRows);
		return callback('Request is sent');
	});
}
exports.DELETEFREQ =  function(sender_id,receiver_id,callback){
	var sql = "DELETE FROM friendreq WHERE senderID='"+sender_id+"' AND reciverID = '"+receiver_id+"'";
	con.query(sql, function (err,result) {
	   	if (err) return callback(err);
		console.log(result.affectedRows + " record(s) Deleted");
		return callback("Request is Deleted")
	});
}
exports.SELECTFREQ = function(receiver_id,callback){
	var sql = "SELECT * FROM users WHERE userID IN  (SELECT senderID FROM friendreq WHERE reciverID = '"+receiver_id+"')";
	con.query(sql, function (err, result) {
		if (err) {
			return callback(err);
		}else{
			return callback(result);
		}
	});
}