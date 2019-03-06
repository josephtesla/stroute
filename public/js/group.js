$(function () {

	//takes user to last post when page loads
  window.location.href = "#last";
  var queries = location.search.substr(1);
  var type = queries.split('&')[0].split('=')[1];
  var sendTo = queries.split('&')[1].split('=')[1];
  var socket = io.connect();
	var $message = document.querySelector('#message');
	var $users = $('#usersonline');
  var $currentUser = document.querySelector('#userone').innerHTML;
  var groupid = document.querySelector('#groupid').value;
  var userid = document.querySelector('#deleteuser').value;
  let groupusers = []
  var usersPoint = document.querySelectorAll('.groupusers');
  for (let i = 0; i < usersPoint.length; i++) {
    groupusers.push(usersPoint[i].value)
  }


  $('#exitconfirm').click(function() {
    var userWantsToLeave = confirm("Do you want to leave the group?");
    if (userWantsToLeave){
      window.location.href = `/deleteuser?groupid=${groupid}&userid=${userid}`;
    }
  })
 
	socket.emit('new user', $currentUser, function () {
		console.log('user sent')
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
		if ($message.value.length){
      const messageBody = {
        receiver: sendTo,
        msg: $message.value
      }
      socket.emit('group message', messageBody);
  
      //clear message area
      $message.value = '';
    }
	})
	socket.on('newgroup message', function (data) {

		//send message to group members
		if (data.groupusers.includes($currentUser)) {
			if (data.user == $currentUser) {
				var html = `<div class="outgoing_msg">
            <div class="sent_msg">
               <p class="card">${toUrlCheck(data.msg)}</p>
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
                  <p class="card">${toUrlCheck(data.msg)}</p>
                  <span class="time_date"><a style="color:black;"	href="/users/${data.user}">${data.user.toUpperCase()}</a> |
                  ${new Date().toLocaleString()}</span>
                
               </div>
            </div>
         </div>`
				$('.msg_hist').append(html);
      }
      new Howl({
        src: ['fb.mp3'],
        volume: 0.4
      }).play();
    }
		window.location.href = "#last";

  })
  socket.on('get user', function (data) {
    var html = '';
    for (let i = 0; i < data.length; i++) {
      if (groupusers.includes(data[i])){
        html += `,<a href="/users/${data[i]}">${data[i]}</a>`;
      }
    }
    html = html.replace(',',' ');
		$users.html(html);
  })

  socket.on('newimage msg', function (data) {
    var html = '';
    if (data.receiver === sendTo && data.user !== $currentUser){
      html += `<div class="incoming_msg">
      <div class="incoming_msg_img"> <img id="imgavatar" src="img/user.svg" alt="sunil"> </div>
      <div class="received_msg">
        <div class="received_withd_msg">
        <span class="imgwhite card"><img style="border:3px solid white;"	src="${data.imageurl}" />
        <span class="time_date"><a style="color:#f2dede;"	href="/users/${data.user}">${data.user.toUpperCase()}</a> |${new Date().toLocaleString()}</span></span>
        </div></div></div>`;
      $('.msg_hist').append(html)
      new Howl({
        src: ['fb.mp3'],
        volume: 0.4
      }).play();
      window.location.href = '#last'
    }
  })
  
  var realtexts = document.querySelectorAll('.realtext');
    for (let i = 0; i < realtexts.length; i++) {
      const splitNow = realtexts[i].textContent.toString()
      var textHtml = toUrlCheck(splitNow);
      realtexts[i].innerHTML = textHtml;
    }

})

