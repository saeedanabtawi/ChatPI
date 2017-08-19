//User Manager
// call the packages we need
var DBManager = require('./DBManager.js'); 
var User = require('./User.js');
var bcrypt = require('bcrypt');
var async = require('async'); 
var crypto = require('crypto');
var jwt = require('jsonwebtoken'); 
var User = require('./User.js');
var nodemailer = require('nodemailer');
var gcm = require('node-gcm');
const hour = 3600000;
var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
var phoneformat = /^\d\d{0,10}\d$/;
//Login user 
//Autheinttacte JWT token 
function authehnticate(request,callback){
  var token=request.body.token || request.headers['token'] ;
   // console.log(request.headers);
  if(token){
    jwt.verify(token,process.env.SECRET_KEY,function(err,result){
      if(err) 
      	 return callback({Error:'Token Invalid'},null);
      return callback(null,result);
   	});
  }else{
      return callback({Error:'Please send a token'},null);
  }
}
//login 
exports.login = function(username,password,callback){
	if(!username||!password)
       return callback({ success: false, message: 'Please enter username and password.' });
    DBManager.CHECKUSER(username,function(result){
    	if(result.length>=1){
 		bcrypt.compare(password, result[0].password, function(err, isPasswordMatch) {
		    if (!err && isPasswordMatch) {
		    	var token=jwt.sign(result[0],process.env.SECRET_KEY,{expiresIn:86400});
		        // Create token if the password matched and no error was thrown
		        console.log("user ID"+result[0].userID)
		        return callback({ success: true, token:token, userinfo : result[0]}); 
		    }else{
		    	return callback({ success: false, message: "Wrong password, Try again !"});
		    }
		});
 	}else{
 		return callback({ success: false, message: "Username dose not exist"});
 	}

	});
}
exports.signup= function (username,password,firstname,lastname,email,phone,gender,image,callback) {
	//validate 
	DBManager.CHECKUSER(username,function(result){
		if(result.length>0){
			return callback({success: false,message:"username is taken"})
		}else{
		if(username && password && firstname && lastname && email && phone && gender && image){
			if(email.match(mailformat)){
				if(phone.match(phoneformat)){
				bcrypt.hash(password, 10, function(err, hash) {
					DBManager.INSERTUSER(username,hash,firstname,lastname,email,phone,gender,image);
					return callback({ success: true,message:"Account created successfly."});
				});
				}else{
					return callback({success: false,message:"Phone not vailed"});
				}
				}else{
				return callback({success: false,message:"Email not vailed"});
			}
		}else{
			return callback({success: false,message:"User creation faild. please send vailed infromaiton."})
		}
		}
	});	

}
exports.deleteAccount = function (userID) {}
exports.blockUser = function (request,callback) {
	    var contact_id = request.body.contact_id;
	 	var block = request.body.block;
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.BLOCK(result.userID,contact_id,block);
				if(block==0)
					return callback({success:true ,Message:"Contact Blocked"});
				else if(block==1)
					return callback({success:false ,Message:"Contact Unblocked"});
			}
	});
}
exports.isblocked = function(senuser,recuser){
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.ISBLOCKED(result.userID,contact_id,function(result){
				return callback(result);			
				});
		}
	});
}
exports.getcontact = function (request,callback) {
		var contact_id = request.params.contact_id;
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.GETCONTACT(result.userID,contact_id,function(dresult){
					return callback(dresult);
				});
			}
	});
}
exports.getcontacts = function (request,callback) {
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.GETCONTACTS(result.userID,function(dbres){
			   		return	callback({result:dbres});
				});
			}		
	});
}
exports.addContact = function (request,callback) {
	var contact_id = request.body.contact_id;
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.ADDCONTACT(result.userID,contact_id,function(dresult){
					return callback(dresult);
				});		
			}		
	});
}
exports.savetoken = function (request,callback) {
	var gcmToken = request.body.gcmToken;
	//console.log(request.headers)
	authehnticate(request,function(err,result){
		if(err){
			return callback(err);
		}else{
			DBManager.ADDTOKEN(result.userID,gcmToken,function(result){
				return callback(result);
			});
		}			
	});
}
exports.deleteContact = function (request,callback) {
	var contact_id = request.body.contact_id || request.headers['contact_id'] ;
	console.log("userID you want to delete "+contact_id);
	authehnticate(request,function(err,result){
		if(err){
			return callback(err);
		}else{
			DBManager.DELETECONTACT(result.userID,contact_id,function(dresult){
				console.log(dresult);
				return callback(dresult);
			});
		}			
	});	
}
exports.forgotpass = function (email,done){
	async.waterfall([
    function(callback) {
    	//create random token 20 char long 
	  	crypto.randomBytes(20, function(err, buf) {
			var token = buf.toString('hex');
			return callback(err, token);
		});
    },
    function(token, callback) {
       	DBManager.SELECTEMAIL(email,function(result){
	    	if (result[0].email != email)
	    		//check if user signed up in the app 
	    		return callback({error:'No account with that email address exists.'},token,result[0]);
	    	DBManager.SELECTRESTEMAIL(email,function(restemail){
	    		//calcualte current time 
			    resetPasswordExpires = Date.now() + hour; // 1 hour.
			   	//check if email in databse , insret new token to database.
			   	if (restemail.length == 0 ){
			   		//if email is not in the databse , bind token to email ,insert token to databse .
			   		DBManager.INSERTTOKEN(result[0].email,token,resetPasswordExpires.toString());
				    return callback(null,token,result[0]);
			   	}else{	
			   		if(restemail[0].email == result[0].email){
			   			//if email in the databse and euqals rest mail .
			   			//calculate reamining time for the token 
			   			var remainingTime = Date.now() -  Number(restemail[0].expire_date); 
			   			if(remainingTime>=hour){
			   				//if token is expired update database with new token.
			   				DBManager.UPDATETOKEN(result[0].email,token,resetPasswordExpires.toString());
			   				return callback(null,token,result[0]);
			   			}else{
			   			//if token not expired and email have a rest token .
			   			return callback({error:'link is already sent to email ,link is not expired',time:remainingTime/hour+1+"hour"},token,result[0]);
			   			}
			   		}
			   	}
	    	});
       	});    	
    },
    function(token, user, callback) {
    	//send email 
    	//email data
    	var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'charlarobot@gmail.com',
		    pass: 'test123123'
		  }
		});
		//email content
		var mailOptions = {
		  from: 'charlarobot@gmail.com',
		  to: user.email,
		  subject: 'Password Reset',
		  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://127.0.0.1:3000/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		};
		//send email
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    return callback(error,'not done');
		  } else {
		    return done({message:'Email was sent to : '+user.email});
		  }
		}); 
    }
  ], function(err) {
    if (err) done(err);
  });
}
exports.restpass = function(password,token,result){
	 async.waterfall([
    function(done) {
    //check if token is experid else change passowrd 
    DBManager.SELECTTOKEN(token,function(result){
    	if(!result)
    		//if token is not in the data base token not vailed 
    		return done({message:"Password reset token is invalid or has expired."},result[0]);
    	//calcuate remaining time .
    	var remainingTime = Date.now() - Number(result[0].expire_date);
    	if(remainingTime>=hour){
    		//if tkone is expride delete token .
    		DBManager.DELETETOKEN(token);
    		return done({success:false,message:"Password reset token is invalid or has expired."},result[0]);
    	}else{
    		//upadte password .
    		bcrypt.hash(password, 10, function(err, hash) {
	    		DBManager.UPDATEPASS(hash,result[0].email);
    		});
    		return done(null,result[0])
    	}
    });
    },
    function(user, done) {
    	//Send email to user 
    	console.log('sending email');
    	var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'charlarobot@gmail.com',
		    pass: 'test123123'
		  }
		});
    	//email content
    	var mailOptions = {
        from: 'charlarobot@gmail.com',
		to: user.email,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      //send email
      transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    callback(error,'not done');
		  } else {
		    result({Success:"true",message:'Success! Your password has been changed.'});
		  }
		}); 
    }
  ], function(err) {
  	if (err) throw err;
  });
}
exports.viewprofile = function(request,callback){
	  	var user_id = request.params.user_id;
		authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.SELECTUSER(user_id,function(result){
					return callback(result[0]);
				});
			}	
	});
}

exports.searchUser = function (request,callback) {
	var name = request.params.name;
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				DBManager.SEARCHUSER(result.userID,name,function(result){
					return callback(result);
				});
			}
	});
}
exports.sendFreindRequest = function (request,callback){
	//insert Friend request to  database.
	var reciver_id = Number(request.body.reciver_id);
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				//token id is sender id 
				var sender_id  =  result.userID;
				if(sender_id == reciver_id){
					return callback({Error:"Request is not valid"});
				}
				//console.log(typeof sender_id,typeof  reciver_id);
				DBManager.INSERTFREQ(sender_id,reciver_id,function(insresult){
					return callback(insresult);
				});
			}
	});
}
exports.approveFriendRequest = function(request,callback){
	// Delete request from database , add user to contact list.
	var sender_id = request.body.sender_id;
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				//token id is  reciver id 
				var  reciver_id  = result.userID;
				//Delete Friend request from Database 
			    DBManager.DELETEFREQ(sender_id,reciver_id,function(deleteresult){});
				//Add user as contact and none blocked
				DBManager.ADDCONTACT(reciver_id,sender_id,function(addresult){
					DBManager.ADDCONTACT(sender_id,reciver_id,function(addresult){
					return callback(addresult);
				});
				});
			}
	});
}
exports.active = function (userID,state,callback) {

	
	DBManager.ACTIVE(userID,state,function(result){
		callback(result);
	});	
}
exports.viewFriendRequest = function(request,callback){
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				//Token id is reciver id 
				var reciver_id  =  result.userID;
				console.log(reciver_id);
				DBManager.SELECTFREQ(reciver_id,function(result){
					return callback(result);
				});
			}
	});
}
exports.deleteFriendRequest =function(request,callback){
	var sender_id  =request.headers['sender_id'];
	authehnticate(request,function(err,result){
			if(err){
				return callback(err);
			}else{
				//Token id is reciver id 
				var reciver_id  =  result.userID;
				DBManager.DELETEFREQ(sender_id,reciver_id,function(result){
					return callback(result);
				});
			}
	});
}