const express=require('express'),
app=express(),
multer=require('multer'),
upload=multer(),
mongoose   = require('mongoose'),
bodyParser = require('body-parser'),
fs=require('fs'),
https=require('https');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',(req, res)=>{
  res.render('home');
});
const videoSchema = new mongoose.Schema({
  name: String,
  contentType: String,
   data:  Buffer
});
const Video=mongoose.model('video',videoSchema);
mongoose.connect('mongodb://localhost:27017/video',{
   useNewUrlParser: true,
   useFindAndModify: false,
   useUnifiedTopology: true,
   useCreateIndex: true
});
app.post('/save-video',upload.single('video_data'),(req, res)=>{
  //let uploadLocation = __dirname + '/public/uploads/' + req.file.originalname // where to save the file to. make sure the incoming name has a .wav extension
  console.log(req.file.buffer);
 // console.log(new Blob([req.file.buffer]));
  console.log(req.file.originalname);
  const finalVideo = {
    name: req.file.originalname,
    contentType: req.file.mimetype,
    data:  new Buffer(req.file.buffer, 'base64')
 };
 Video.create(finalVideo,(err, audio)=>{
    if(err){
      console.log(err);
    }else{
      console.log('video uploaded to db!!');
      res.sendStatus(200);
    }
  });
});
  app.get('/play',(req,res)=>{
    Video.findOne({name: 'filename.mp4'},(err, video)=>{
      if(err) console.log(err);
      else{
        const src = "data:video/mp4;base64," + (video.data).toString('base64');
       // console.log((audio.data).toString('base64'));
        res.render('play',{src:src});
      }
    })
  })
 // fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
 // res.sendStatus(200); //send back that everything went ok
https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})