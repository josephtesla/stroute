const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/josephtesla/image/upload`;
const CLOUDINARY_PRESET = 'noafxwoj'
var queriess = location.search.substr(1);
var receiver = queriess.split('&')[1].split('=')[1];
var imageUpload = document.getElementById('image-upload');
var chats = document.querySelector('.msg_history');
var btnImageSend = document.getElementById('btnImageSend');

var sound = new Howl({
  src: ['fb.mp3'],
  volume: 0.4
})

btnImageSend.addEventListener('click', function (e) {
  e.preventDefault();
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
      received: receiver
    };
    fetch('http://localhost:5000/api/saveimageurl',{
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
      console.log(res)
      var html = `<div class="outgoing_msg"><div class="sent_msg"><span class="imgwhite ">
      <img class="bg-white" style="border:3px solid white"	src="${resp.data.secure_url}"	 width="100%"/>
      </span></div></div>`;
      $('.msg_history').append(html);
      sound.play();
    })
    .catch(err => {
      console.log(err)
    })
  }).catch(error  =>  {
    console.log(error)
  })
})