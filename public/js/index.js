window.onload = () => {
   document.querySelector('#onlinechats').style.display = 'none';
   if (location.pathname.includes('addfriend')){
      document.querySelector('#welcomepage').style.display = 'none';
      document.querySelector('#onlinechats').style.display = 'none';
   }
   if (location.pathname.includes('friendlist')){
      document.querySelector('#welcomepage').style.display = 'none';
      document.querySelector('#onlinechats').style.display = 'none';
   }
   if (location.pathname.includes('chats')){
      document.querySelector('#welcomepage').style.display = 'none';
      document.querySelector('#onlinechats').style.display = 'block';
   }
}