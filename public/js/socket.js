$(function () {
   var socket = io.connect();
   var $messageForm = $('#messageForm');
   var $message = document.querySelector('#message');
   var $chat = $('#chat')
   var $messageArea = $('#messageArea');
   var $users = $('#users');
   var $currentUser = document.querySelector('#userone').innerHTML;

   socket.emit('new user', $currentUser, function(){
      console.log('user sent')
   })


   $('#addlink').click(function(e){
      e.preventDefault();
      $('#link-form').toggle()
   })
   
   $('#linkbtn').click(function(e){
      e.preventDefault();
      const $linktext = $('#linktext').val();
      const $link = document.querySelector('#link');
      console.log($link)
      if ($link.value.includes('http')){
         const html = `<a href='${link.value}'>${$linktext}</a>`;
         $message.innerHTML += ' ' + html;
      }
      else{
         const html = `<a href='http://${link.value}' target='_blank'>${$linktext}</a>`;
         $message.innerHTML += ' ' + html;
      }
   })

   $('#btn').click(function () {
      console.log($message.value)
      //Emit 'send message' event after sending a message
      socket.emit('send message', $message.value);

      //clear message area
      $message.value = '';
   })
   socket.on('new message', function (data) {
      if (data.user == $currentUser){
         var html = `<div class="outgoing_msg">
         <div class="sent_msg">
            <p>${data.msg}</p>
            <span class="time_date"> from ${data.user} | ${new Date().toLocaleTimeString()}</span>
         </div>
      </div>`
         $('.msg_history').append(html);
      }
      else{
         var html = `<div class="incoming_msg">
         <div class="incoming_msg_img">
          <img src="img/avatar-1.jpg" alt=""> </div>
         <div class="received_msg">
            <div class="received_withd_msg">
               <p>${data.msg}</p>
               <span class="time_date"> from ${data.user} | 
               ${new Date().toLocaleDateString()}</span>
            </div>
         </div>
      </div>`
      $('.msg_history').append(html);
      }
   })
   
   socket.on('get user', function (data) {
      var html = '';
      for (i = 0; i < data.length; i++) {
         html += '<li class="list-group-item">' + data[i] + '</li>';
      }
      $users.html(html);
   })

})