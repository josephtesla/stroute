const CLOUDINARY_URL='https://api.cloudinary.com/v1_1/josephtesla/image/upload'
const CLOUDINARY_PRESET='xg5vw8la';
var socket = io.connect();
var queriess = location.search.substr(1);
var receiver = queriess.split('&')[1].split('=')[1];
var imageUpload = document.getElementById('image-upload');
var mpUpload = document.getElementById('mp-upload');
var chats = document.querySelector('.msg_hist');
var btnPrivateImageSend = document.getElementById('btnPrivateImageSend');
var btnGroupImageSend = document.getElementById('btnGroupImageSend');
var btnPrivateMpSend = document.getElementById('btnMpSend');
/**
 * var sound = new Howl({
  src: ['fb.mp3'],
  volume: 0.4
})
 */


function UploadImage(msgType) {
  document.querySelector('#loader').style.display = 'block'
  window.location.href = '#last'
  var file = imageUpload.files[0];
  var formData = new FormData();
  formData.append('file',file)
  formData.append('upload_preset', CLOUDINARY_PRESET);

  axios({
    url: CLOUDINARY_URL,
    method: 'POST',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    },
    data: formData
  }).then(resp  =>  {
    var Data = {
      url: resp.data.secure_url,
      receiver: receiver,
      type: msgType,
      user: document.getElementById('userone').innerHTML
    };
    fetch('http://stroutechat.herokuapp.com/api/saveimageurl',{
      method: 'POST',
      headers:{
         'Content-Type': 'application/json; charset=utf-8'
      },
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify(Data)
    }).then(response => response.text())
    .then(res => {
      document.querySelector('#loader').style.display = 'none';
      console.log(res)
      var html = `<div class="outgoing_msg"><div class="sent_msg"><span class="outimgwhite ">
      <img class="bg-white card" style="border:2px solid 2d3aa0"	src="${resp.data.secure_url}"	 width="100%"/>
      <span class="time_date">  ${new Date().toLocaleString()}</span></span></div></div>`;
      $('.msg_hist').append(html);
      socket.emit('image msg', Data);
      new Howl({
        src: ['fb.mp3'],
        volume: 0.4
      }).play();
      window.location.href = '#last'
    }).catch(err => {
      console.log(err)
    })
  }).catch(error  =>  {
    console.log(error)
  })
}
if (btnPrivateImageSend){
  btnPrivateImageSend.addEventListener('click', function (e) {
    e.preventDefault();
    UploadImage("private");
  })
}

if (btnGroupImageSend){
  btnGroupImageSend.addEventListener('click',function (e) {
    e.preventDefault();
    UploadImage("group");
  })
}


