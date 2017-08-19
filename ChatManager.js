//ChatManager
var DBManager = require('./DBManager.js');
var Chat = require('./Chat.js');
var Message = require('./Message.js');
var jwt = require('jsonwebtoken'); 
var gcm = require('node-gcm');



function authehnticate(request,callback){
  var token=request.body.token || request.headers['token'] ;
 //   console.log(token);

  if(token){
    jwt.verify(token,process.env.SECRET_KEY,function(err,result){
      if(err) 
      	callback('Token Invalid',result);

      callback(null,result);
   	});
  }else{
      return callback('Please send a token');
  }
}

exports.sendMessage = function (request,callback) {

    var msgbody = request.body.msgbody;
    var chatname = request.body.chatname;
    var users;
    	authehnticate(request,function(err,result){
			if(err){
				 callback(err);
			}else{
				var sender = new gcm.Sender(process.env.GCM_API_TOKEN);
				var message = new gcm.Message({
    				data: { message: 'You Have a new Message!!',
    				chatname:chatname}
					});
	 			 
				//send notification to every user in this chat.

				DBManager.INSERTMSG(result.userID,chatname,msgbody,function(dresult){		
				//if(process.env.ONLINE==false){			
						DBManager.getUsersFromChat(chatID,function(dresult){
							for(var uID in dresult){
								if(dresult[uID].userID!=result.userID){	
 	

									DBManager.getUserDeviceToken(dresult[uID].userID,function(res){
									//for every user in chat get his token to send notification to.
									for(var i in res){							

										var regTokens=[res[i].notif_token];
										sender.send(message, { registrationTokens:regTokens  }, function (err, response) {
											if (err)
											 console.error(err);
											else
											 console.log(response);
										});
									}	
								});
							}
						}	

					});
				//}

					return callback(dresult);
				});
			}
			
	});

	
}
sendMessageNotification = function(userID) {


}
exports.receiveMessage = function (argument) {
}
//create chat funciton 
exports.createChat = function (request,callback) {
	console.log("chat name : "+request.body.chatname);
	console.log("user ID you want to create chat with : "+request.body.userID);

	if(request.body.chatname){
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{	
				DBManager.ISCHATEXIST(result.userID,request.body.userID,function(checkres){
				//	console.log(checkres.result[0].ch);
					if(!checkres.exists){
											console.log("instasr");
						//create the chat
						DBManager.INSERTCHAT(request.body.chatname);
						//get the chat ID
						DBManager.SELECTCHAT(request.body.chatname,function(res)
						{	//add users to chat 
							DBManager.ADDUSERCHAT(res[0].chatID,result.userID,request.body.chatname,request.body.userID);
							DBManager.ADDUSERCHAT(res[0].chatID,request.body.userID,result.username,result.userID);

							return callback({Message:"Chat created",chatID:res[0].chatID});

						});
					}
					else{
						console.log("elseeee");
												console.log(checkres);

						return callback({Message:"Chat Already created",chatID:checkres.result[0].chatID});
					}
				});
				
			//	return callback({Message:"Chat created"});
			}
		});
	}else{
		return callback({error:"Request is not correct .Please send vailed request."})
	}
}
// delete chat 
exports.deleteChat = function (request,callback) {
	var chatid = request.params.chat_id;
	if (chatid){
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.DELETECHAT(chatid);
				return callback({Message:'Chat deleted'});
			}
		});
	}else{
		return callback({error:"Request is not correct .Please send vailed request."})
	}
}
// add user 
exports.addUserToChat = function (request,callback) {

	var added_user = request.body.added_user;
    var chatid = request.body.chatid;

	if( added_user && chatid ){
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.ADDUSERCHAT(added_user,chatid);
				return callback({Message:"User added"});
			}
		});
	}else{
		return callback({error:"Request is not correct .Please send vailed request."})
	}
}
//delete user 
exports.deleteUsersFromChat = function (deleted_user,chatid,callback) {
	if(deleted_user&& chatid){
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.DELETETUSERCHAT(deleted_user,chatid);
				return callback({Message:"User deleted"});
			}
		});
	}else{
		return callback({error:"Request is not correct .Please send vailed request."})
	}
}
exports.viewchats = function(request,callback){
	authehnticate(request,function(err,result){
		if(err){
			return callback(err);
		}else{
			DBManager.SELECTCHATS(result.userID,function(chats){
				return callback({chats:chats});
			});
		}
	});
}
exports.viewmsgs = function(chatid,request,callback){
	authehnticate(request,function(err,result){
		if(err){
			return callback(err);
		}else{
			DBManager.SELECTMSGS(chatid,function(result){
					return callback(result);
			});
		}
	});
}
//mybe not needed
exports.viewchatusers = function(chatid,request,callback){
	authehnticate(request,function(err,result){
		if(err){
			return callback(err);
		}else{
			DBManager.SELECTCHATUSERS(chatid,function(result){
					return callback(result);
			});
		}
	});
}