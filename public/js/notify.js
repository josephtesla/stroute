$(function() {
  const socket = io.connect();
  console.log(socket.on)
  socket.on('notification', function(message){
    console.log(message)
  })

})