//Request Handller
// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');  
var passport = require('passport');  
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local').Strategy;
var server = require('http').createServer(app);

var io = require('socket.io').listen(server)
var ChatManager = require('./ChatManager.js');
var UserManager = require('./UserManager.js');
var connect = require('connect');
var fs = require('fs')
var jwt = require('jsonwebtoken'); 


app.use(express.static(__dirname + '/public'));
app.use(connect.cookieParser());
app.use(connect.logger('dev'));
app.use(connect.bodyParser());
app.use(connect.json());
app.use(connect.urlencoded());
var DBManager = require('./DBManager.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Log requests to console
app.use(morgan('dev')); 
var port = process.env.PORT || 3001;        // set our port
process.env.SECRET_KEY="thisismysecretkey";
process.env.GCM_API_TOKEN='AIzaSyCnKq9hlgoLTv-juQsltPB_a6um9ZA0P9M';
process.env.ONLINE=false;
var online=false;
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
var gcm = require('node-gcm');

var sharedsession = require("express-socket.io-session");
app.use(session);
var sender = new gcm.Sender(process.env.GCM_API_TOKEN);


io.use(sharedsession(session));
var onlineUsers=[];
var usersInchats=[];
io.on('connection',function(socket){

    console.log('one user connected '+socket.id);
    process.env.ONLINE=true;

    socket.on("login", function(token) {
        jwt.verify(token,process.env.SECRET_KEY,function(err,result){


            console.log('session  userID '+ result.userID);
            socket.handshake.session.userID = result.userID;
            socket.handshake.session.username = result.username;
            console.log('session  username '+  socket.handshake.session.username);
            onlineUsers[result.userID]=socket.id;

            socket.handshake.session.save();
            //change the state of the user // 1 = active
            UserManager.active(result.userID,1,function(result)
            {
              //do somthing
            });

        });
       
        socket.on('disconnect',function(){
            var userID=socket.handshake.session.userID
            if (userID&&socket.handshake.session.username) {
                console.log('one user disconnected '+socket.id);
                //change the state of the user // 0 = notActive
                UserManager.active(userID,0,function(result)
                {
                     //do somthing
                });

                onlineUsers.splice(onlineUsers.indexOf(socket.handshake.session.userID), 1);
                console.log(socket.handshake.session.userID);

                delete socket.handshake.session.userID;
                delete socket.handshake.session.username;
                socket.handshake.session.save();
            }
        }) 


    });
 socket.on('create', function (room,userID) {
        console.log("room"+room);
        console.log("userID "+userID+" is in chatID "+room)
        usersInchats[userID]=room;

        socket.join(room);


        
        });
        socket.on("exitchat",function(room,userID){
         console.log("userID "+userID+" has left chatID "+room)
           
        usersInchats.forEach(function(user,index){
            usersInchats.splice(index, 1);

        })

        });
    socket.on('message',function(data){  
          var req=JSON.parse(data);

      
          var chatID =req.chatID;
          console.log("chatid "+req.chatID);
          var friendID;
          DBManager.getUsersFromChat(chatID,function(dresult){

              for(var uID in dresult){

                if(dresult[uID].userID!=socket.handshake.session.userID){ 

                  console.log("userid"+dresult[uID].userID);
                  friendID=dresult[uID].userID;
                  DBManager.ISACTIVE(friendID,function(res)
                  {

                    console.log("ISACTIVE"+ res[0].active);
                    if(res[0].active==1)
                    {
                        DBManager.INSERTMSG(socket.handshake.session.userID,req.message,req.chatID,req.text,function(msgresult){ 
                            console.log(msgresult.success);
                            //if(dresult.success=="true"){     
                                    //socket noftification message
                                
                                DBManager.GETUSERNAME(socket.handshake.session.userID,function(nameres){

                                  var message = {
                                    title:nameres[0].username,
                                    message: 'You Have a new Message!!',
                                    chatID:req.chatID
                                    }              
                                //send notification through socket
                                  console.log("sending notification through socket "+ res[0].active);
                                  onlineUsers.forEach(function(usercode, userID) {
                                      console.log(usercode+" "+userID+" "+friendID+" "+usersInchats[friendID]+" "+req.chatID);
                                          if(usersInchats[friendID]!=req.chatID)
                                              socket.to(usercode).emit('notification', message);  
                                  });
                                  console.log(msgresult);
                                });

                              
                           // }
                        });

                    }else{
                           
                        console.log("sending notification throuh GCM "+ res[0].active+res[0].userID);
                        DBManager.INSERTMSG(socket.handshake.session.userID,req.message,req.chatID,req.text,function(dresult){       
                           // if(dresult.success=="true"){
                                 //GCM notification message
                            DBManager.GETUSERNAME(socket.handshake.session.userID,function(nameres){

                                    var message = new gcm.Message({
                                            data: {
                                                tite:nameres[0].username,
                                                message: 'You Have a new Message!!',
                                                type: "messageRequest",
                                                chatID:req.chatID
                                            }                                
                                     });
                                    DBManager.getUserDeviceToken(res[0].userID,function(res){
                                    //for every user in chat get his token to send GCM notification to.
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
                               // }
                             console.log(dresult.success);
                            });
                          });
                    }
                });
            }
        } 
    });
    console.log("chatid room "+req.chatID)
    socket.broadcast.to(req.chatID).emit('message',{'message':req.message,'text': req.text}); 

})
    socket.on('freindRequest',function(friendID){          
        //req.userID=dresult[uID].userID 
        console.log("sending notification to user  ID "+friendID);
        DBManager.ISACTIVE(friendID,function(res)
        {
            console.log("ISACTIVE"+ res[0].active);
           if(res[0].active==1){
                                
                var message = {
                    message: "You have a friend request" 
                }              
            //send notification through socket
                console.log("sending notification through socket to user with ID "+friendID);
                onlineUsers.forEach(function(usercode, userID) {
                    console.log(usercode+" "+userID)
                    if(friendID==userID)
                        socket.to(usercode).emit('friendNotification', message);  
                });
                               // }
                            
            }else{
                               
                console.log("sending notification throuh GCM to user with ID "+ friendID);
                               // if(dresult.success=="true"){
                                     //GCM notification message
                var message = new gcm.Message({
                    data: {
                        message: "You have a friend request" 
                        ,type: "freindRequest"
                    }                                
                });
                DBManager.getUserDeviceToken(friendID,function(res){
                                    //for every user in chat get his token to send GCM notification to.
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
        });
    })          
 
    
})
app.get('/uploads/:param',function(req,res){
fs.readFile('./uploads/'+req.params.param, function(err, data) {
    if (err) throw err; // Fail if the file can't be read.
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data); // Send the file data to the browser.
  });
})
app.get('/profileimages/:param',function(req,res){
fs.readFile('./profileimages/'+req.params.param, function(err, data) {
    if (err) 
      return console.log("File is not exist") // Fail if the file can't be read.
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      res.end(data); // Send the file data to the browser.
  });
})
//create chat
app.post('/api/chat/', function(req, res) {
    ChatManager.createChat(req,function(result){
        res.send(result);
  });
});
//delete chat
app.delete('/api/chat/:chat_id', function(req, res) {  
    ChatManager.deleteChat(req,function(result){
        res.send(result);
  });
});
//view user chats 
app.get('/api/user/chats/', function(req, res) {
    ChatManager.viewchats(req,function(result){
        res.send(result);
  });
});

//view chat msgs 
app.get('/api/chat/:chat_id', function(req, res) {  
  var chat_id = req.params.chat_id;
  console.log("chat to get message from"+ chat_id);
    ChatManager.viewmsgs(chat_id,req,function(result){

        res.send({messages:result});
    });
});

// ROUTES FOR OUR API
app.get('/api/', function(req, res) {
    res.json({message: 'welcome to our api!' });   
});
app.post('/api/', function(req, res) {
    console.log(req.body);
    res.json({message: 'welcome to our api!' });   
});
//log in
app.post('/api/authenticate', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if(password&& username)
        UserManager.login(username,password,function(result){
           res.send(result);
       });
});
//create user sign up
app.post('/api/user/', function(req, res) {
  console.log(req.headers);

  var image=req.body.image
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var phone = req.body.phone;
  var gender = req.body.gender;
  UserManager.signup(username,password,firstname,lastname,email,phone,gender,image,function(result){
      res.json(result);
  });
});
//edit user data (edit profile)
app.put('/api/user/:user_id', function(req, res) {
});

//view user data
app.get('/api/user/:user_id', function(req, res) {
 UserManager.viewprofile(req,function(user){
    delete user.password;
    res.send(user);
});
});

//get contact info
app.get('/api/contact/:user_id', function(req, res) {
    UserManager.getcontact(req,function(user){
        res.send(user);
 });
});

//get all contacts for the user with my_id
app.get('/api/contact/', function(req, res) {
    UserManager.getcontacts(req,function(user){
        res.send(user);

    });
});
//send msg
app.post('/api/msg/', function(req, res) {

    ChatManager.sendMessage(req,function(result){
      res.send(result);
      //if (err) throw err;
      console.log(result);
  });
});
//add contact to contacts 
app.post('/api/contact/', function( req,res) { 	

    UserManager.addContact(req,function(result){
        res.send(result);
    });
});
//save notification token
app.post('/api/saveNotificationToken/', function( req,res) {  

    UserManager.savetoken(req,function(result){
        res.send(result);
    });
});
//delete user from contacs
app.delete('/api/contact/', function(req, res) {
    UserManager.deleteContact(req,function(result){
        res.send(result);
    });
});

//block user
app.post('/api/block/', function(req, res) {	 
  UserManager.blockUser(req,function(result){
    res.send(result);
});
});

//rest password (forgot my password) 
app.post('/api/user/forgot',function(req,res,next){
	UserManager.forgotpass(body.email,function(result){
       res.send(result);
   })
});
app.post('/reset/:token', function(req, res) {
	UserManager.restpass(req.body.password,req.params.token,function(result){
       res.send(result);
   })
});
//delete user 
app.delete('/api/user/:user_id', function(req, res) {
});
//one fucntion edit all user settting's
app.put('/api/chat/:chat_id', function(req, res) {   
});


// view chat data  , select from chats_users,chat,messages
app.get('/api/chat/:chat_id', function(req, res) {  
  var chat_id = req.params.chat_id;
  ChatManager.viewchatmsgs(chat_id,function(result){
      res.send(result);
  });
});

//delete user 
app.delete('/api/chat/:chat_id', function(req, res) {
});
// one function can edit all chat setting's 
app.put('/api/chat/:chat_id', function(req, res) {  
});

//search for a user
app.get('/api/search/:name', function(req, res) {
	var name = req.params.name;

    UserManager.searchUser(req,function(users){
      res.json({ result : users });
    });
});

//Send friend request
app.post('/api/friendreq', function(req, res) {
  UserManager.sendFreindRequest(req,function(result){
      res.send({result:result});
  });
});
app.post('/api/send-friend-request/', function( req,res) {    

    UserManager.sendNotify(req,function(result){
        res.send(result);
    });
});

//view all msgs
//View friend request 
app.get('/api/friendreq',function(req,res){
  UserManager.viewFriendRequest(req,function(result){
    res.send({result:result});
  })
});
//Aprove friend request
app.put('/api/friendreq',function(req,res){
  UserManager.approveFriendRequest(req,function(result){
      res.send({result:result});
  })
});
//Discard friend request
app.delete('/api/friendreq',function(req,res){
  UserManager.deleteFriendRequest(req,function(result){
     res.send({result:result});
  });
});
//view all msgs 
app.get('/api/msg/', function(req, res) {  
});
// view msg
app.get('/api/msg/:msg_id', function(req, res) {  
});
// start the server
server.listen(port, function(){
  console.log('listening on *: '+port);
});
console.log('Server started! At http://localhost:' + port);