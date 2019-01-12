$(function () {

$('#editname').click(function(e){
   e.preventDefault();
   $('#nameform').toggle()
})

$('#editemail').click(function(e){
   e.preventDefault();
   $('#emailform').toggle()
})

$('#editgender').click(function(e){
   e.preventDefault();
   $('#genderform').toggle()
})

$('#editaddress').click(function(e){
   e.preventDefault();
   $('#addressform').toggle()
})

$('#picsbtn').click(function(e){
   e.preventDefault();
   $('#profilepics').toggle()
})

})