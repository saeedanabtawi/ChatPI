var method = User.prototype;
function User(userid, username, password, email, firstname, lastname, phonenumber,contacts,chats) {
    // always initialize all instance properties
    this.userid = userid;
    this.username =  username;
    this.password = password;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.phonenumber =phonenumber;
    this.contacts = contacts;
    this.chats = chats;
}
method.setUserId = function (userid){
  this.userid = userid;
}
method.setUserName = function (username){
  this.username = username;
}
method.setPassWord = function (password){
  this.password = password;
}
method.setEmail = function (emai){
  this.email = email;
}
method.setFirstName = function (firstname){
  this.firstname = firstname;
}
method.setLastName = function (lastname){
  this.lastname = lastname;
}
method.setPhoneNumebr = function (phonenumber){
  this.phonenumber = phonenumber;
}
method.setContacts = function (contacts){
  this.contacts = contacts;
}
method.setChats = function (chats){
  this.chats = chats;
}
method.getUserId = function (){
  return  this.userid;
}
method.getUserName = function (){
  return  this.username;
}
method.getPassWord = function (){
  return  this.password;
}
method.getEmail = function (){
  return this.email;
}
method.getFirstName = function (){
  return this.firstname;
}
method.getLastName = function (){
  return  this.lastname;
}
method.getPhoneNumber = function (){
  return  this.phonenumber;
}
method.getContacts = function (){
  return  this.contacts;
}
method.getChats = function (){
  return this.chats;
}
module.exports = User;