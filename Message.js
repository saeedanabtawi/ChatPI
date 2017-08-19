var method = Message.prototype;
function Message (body, sender, receiver, time ) {
        // always initialize all instance properties
        this.body = body;
        this.sender = sender;
        this.receiver = receiver;
        this.time = time;
}
method.setBody = function (body) {
  this.body = body;
}
method.setSender = function () {
  this.sender = sender;
}
method.setReceiver = function () {
  this.receiver = receiver;
}
method.setTime = function (){
  this.time = time;
}
method.getBody = function () {
  return this.body;
}
method.getSender = function () {
  return this.sender;
}
method.getReceiver = function () {
  return this.receiver;
}
method.getTime = function (){
  return this.time;
}
module.exports = Message;