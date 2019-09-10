
var functions = require('firebase-functions');
var admin = require('firebase-admin');
const cors = require('cors')({
  origin: true
});
var webpush=require('web-push');
var formidable = require('formidable-serverless');
var fs=require('fs');
var UUID=require('uuid-v4');

var serviceAccount = require('./serviceAccountKey.json');

const {Storage} = require("@google-cloud/storage");

const gcconfig = {
  projectId: "pwagram-9f355",
  keyFilename: "serviceAccountKey.json"
};

const gcs = new Storage(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-9f355.firebaseio.com/'
});




exports.storePosts = functions.https.onRequest(function (request, response) {
   cors(request, response, function () {
     var uuid = UUID();
     var formData = new formidable.IncomingForm();
     return new Promise(function(resolve, reject) {
     formData.parse(request, function(err, fields, files) { 
      var file=files.file;
      if(!file){
      reject("no file to upload, please choose a file.");
      return;
      }
    /*
     security mecanism to ensure that the uploaded files dosen't get cleaned up while we are processing it : we move it to the folder /tmp of firebase cloud storage before we permanently store it 
     */
     
     fs.rename(file.path, '/tmp/' + file.name,function(err){
      if(err){
        console.log(err)
      }
    });

         var bucket=gcs.bucket('pwagram-9f355.appspot.com');
         bucket.upload('/tmp/'+file.name,{
           uploadType:'media',
           metadata:{
             metadata:{
               contentType:files.file.type,
               firebaseStorageDownloadTokens:uuid
             }
           }
         },function(err,file){
         if(err){
           console.log("Error when uploading" ,err)
         }else{
           admin.database().ref('posts').push({
             id: fields.id,
             title: fields.title,
             location: fields.location,
             rawLocation:{
               lat:fields.locationLat,
               lng:fields.locationLng
             },
             image:  'https://firebasestorage.googleapis.com/v0/b/' + bucket.name + '/o/' + encodeURIComponent(file.name) + '?alt=media&token=' + uuid

           })
           .then(function() {
             resolve()
             webpush.setVapidDetails('mailto:inggl2023@gmail.com','BJIRbjVjjHlREP3m7owq6q-s3OQD4J6_N6CcMKZcUS8hYUwLHm31NSWRBEjRI_KLUEdLoBhopGseoUW8DXvtYN4','b_-caQy18PcVmSp3s6a9oe2mV1tEMf3uPkP-FjfbPtc');
             return admin.database().ref('subscriptions').once('value');
             })
             .then(function(subs){
             subs.forEach(function(sub) {
               var pushConfig={
                 endpoint:sub.val().endpoint,
                 keys:{
                   auth:sub.val().keys.auth,
                   p256dh:sub.val().keys.p256dh,
                 }
               }
               /* or simply here in our case : var pushConfig = sub.val() ;beacuse they have the same structure 
               It may be not the case when using webpush in some other languages 
               */

               //sending a notification(you can send any stringified Js Object that dosen't pass 4 KB now at least)
               
             
               webpush.sendNotification(pushConfig,JSON.stringify({
                 title:"New Post",
                 content: "A new Post was added "
               }))
               .catch(function(err){
                 console.log(err)
               })
             });
             response.status(201).json({message: 'Data stored', id: fields.id});
             })
             .catch(function(err) {
               response.status(500).json({error: err});
             });
         }
         });
       
        
       });
      });    
});
});
