$(function () {
   var sendTo = "everyone"
   var socket = io.connect();
   var $messageForm = $('#messageForm');
   var $message = document.querySelector('#message');
   var $chat = $('#chat')
   var $messageArea = $('#messageArea');
   var $users = $('#users');
   var $currentUser = document.querySelector('#userone').innerHTML;

   socket.emit('new user', $currentUser, function () {
		console.log('user sent')
	})


   socket.on('get user', function (data) {
      var html = '';
      for (i = 0; i < data.length; i++) {
         if (data[i] === $currentUser){
            html += `<li class="list-group-item disabled"><a href="/${data[i]}"> ${data[i]} </a></li>`;
         }
         else{
            html += `<li class="list-group-item"><a href="/${data[i]}"> ${data[i]} </a></li>`;
         }
      }
   })

})

