$(function () {
  var sound = new Howl({
    src: ['fb.mp3'],
    volume: 0.4
  })

	//takes user to last post when page loads
  window.location.href = "#last";
  var queries = location.search.substr(1);
  var type = queries.split('&')[0].split('=')[1];
  var sendTo = queries.split('&')[1].split('=')[1];
	var socket = io.connect();
	var $message = document.querySelector('#message');
	var $users = $('#users');
	var $currentUser = document.querySelector('#userone').innerHTML;

	socket.emit('new user', $currentUser, function () {
		console.log('user sent')
	})

	$('#addlink').click(function (e) {
		e.preventDefault();
		alert('working on that')
	})

	$('#imgLink').click(function (e) {
		e.preventDefault();
		$('#img-form').toggle();
	})

	$('#mpLink').click(function (e) {
		e.preventDefault();
		$('#mp-form').toggle();
	})

	$('#linkbtn').click(function (e) {
		e.preventDefault();
		const $linktext = $('#linktext').val();
		const $link = document.querySelector('#link');
		console.log($link)
		if ($link.value.includes('http')) {
			const html = `<a href='${link.value}'>${$linktext}</a>`;
			$message.innerHTML += ' ' + html;
		}
		else {
			const html = `<a href='http://${link.value}' target='_blank'>${$linktext}</a>`;
			$message.innerHTML += ' ' + html;
		}
  })
  
	$('#btn').click(function () {
    //Emit 'send message' event after sending a message
    const completemsg = $message.value
		const messageBody = {
			receiver: sendTo,
			msg: `${completemsg}`
		}
		socket.emit('send message', messageBody);

		//clear message area
		$message.value = '';
	})
	socket.on('new message', function (data) {
		//send message privately
		if (data.receiver === $currentUser && data.user === sendTo || data.user === $currentUser) {
			if (data.user == $currentUser) {
				var html = `<div class="outgoing_msg">
            <div class="sent_msg">
               <p>${data.msg}</p>
               <span class="time_date">  ${new Date().toLocaleString()}</span>
            </div>
         </div>`
				$('.msg_hist').append(html);
			}
			else {
				var html = `<div class="incoming_msg">
            <div class="incoming_msg_img">
             <img id="imgavatar"	src="img/user.svg" alt=""> </div>
            <div class="received_msg">
               <div class="received_withd_msg">
                  <p>${data.msg}</p>
                  <span class="time_date"><a style="color:#f2dede;"	href="/users/${data.user}">${data.user.toUpperCase()}</a> |
                  ${new Date().toLocaleString()}</span>
                
               </div>
            </div>
         </div>`
				$('.msg_hist').append(html);
      }
      sound.play();
		}
		window.location.href = "#last";

	})


	socket.on('get user', function (data) {
		var html = '';
		if (data.includes(sendTo)){
			html += `<strong><a href="/users/${sendTo}">${sendTo}</a>: active </strong>`;
		}
		else{
			html += `<strong><a href="/users/${sendTo}">${sendTo}</a>: offline </strong>`;
		}
		$users.html(html);
  })
  
  socket.on('newimage msg', function (data) {
    var html = '';
    if (data.receiver === $currentUser){
      html += `<div class="incoming_msg">
      <div class="incoming_msg_img"> <img id="imgavatar" src="img/user.svg" alt="sunil"> </div>
      <div class="received_msg">
        <div class="received_withd_msg">
        <span class="imgwhite"><img style="border:3px solid white;"	src="${data.imageurl}" /></span>
        <span class="time_date"><a style="color:#f2dede;"	href="/users/${data.user}">${data.user.toUpperCase()}</a> |${new Date().toLocaleString()}</span>
        </div></div></div>`;
      $('.msg_hist').append(html)
      window.location.href = '#last'
    }
  })

})

