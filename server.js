const express = require('express');
var app = express()
var path = require('path')
const mongoose = require('mongoose');
const multer = require('multer');
var bodyparser = require('body-parser')
mongoose.connect('mongodb://localhost:27017/fileupload')
.then(() => {
   console.log("connected")
}).catch(err => {
   console.log(err)
})

const imageSchema = new mongoose.Schema({
   name: String,
   image: String

})
const Image = mongoose.model('Image', imageSchema)

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.set('view engine', 'ejs')

const getRandomString = () => {

   return (Math.floor(Math.random() * 10000)).toString();

}

const storage = multer.diskStorage({
   destination: (req, file, callback) => {
      callback(null, './uploads/')
   },
   filename: (req, file, callback) => {
      callback(null, getRandomString() + file.originalname);
   },
})

const fileFilter = (req, file, callback) => {
   //reject if not JPG or PNG format
   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      callback(null, true);
   }
   else{
      callback(null, false);
   }
}

const upload = multer({
   storage: storage,
   limits:{
      //set filesize max to 5M
      fileSize:1024 * 1024 * 5
   },
   fileFilter:fileFilter
});

app.get('/upload', (req, res) => {
   res.sendFile(__dirname + '/file.html');
})
app.get('/gettoken', (req, res) => {
   res.sendFile(__dirname + '/test.html');
})

app.post('/uploadfile', upload.single('image'),  (req,res) => {
   const newData = new Image({
      name:req.body.name,
      image: req.file.path
   })
   console.log(req.file)
   newData.save(function(err, result){
      if(err){
         console.log(err)
      }
      else{
         console.log("create image!")
         console.log(result)
      }
   })
   res.redirect('all')
   
})

app.get('/all', (req, res) => {
   Image.find({}, (err, images) => {
      if (err) {
         res.send('error occured!');
         console.log(err)
      }
      else  {
         res.render('all',{
            images:images
         })
      }
   })
})

app.get('/delete/:id', (req, res) => {
   Image.findOneAndDelete(req.params.id, (err, resp) => {
      if (err){
         res.send("something went wrong");
         console.log(err);
      }
      else{
         console.log(resp)
         res.redirect('/all');
      }
   })
})

app.listen(3000);
console.log("server started")