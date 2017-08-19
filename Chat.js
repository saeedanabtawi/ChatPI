var method = Chat.prototype;
function Chat(users, messages,chatname,chatid) {
    // always initialize all instance properties
    this.users = users;
    this.messages = messages; 
    this.chatname = chatname; 
    this.chatid = chatid;
}
method.setUsers = function (users) {
  this.users = users;
}
method.setMessages = function (messages){
  this.messages = messages;
}
method.setChatName = function (){
  this.chatname = chat.name;
}
method.setChatif = function (){
  this.chatid = chatid;
}
method.getUsers = function (){
  return users;
}
method.getMessages = function (){
  return messages;
}
method.getChatname = function (){
  return chatname;
}
method.getChatid = function (){
  return chatid;
}
module.exports = Chat;