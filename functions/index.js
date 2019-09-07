
var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});
var webpush=require('web-push');


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-9f355.firebaseio.com/'
});


exports.storePostData = functions.https.onRequest(function(request, response) {
 cors(request, response, function() {
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
     .then(function() {
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
        webpush.sendNotification(pushConfig,JSON.stringify({
          title:"New Post",
          content: "A new Post was added "
        }))
        .catch(function(err){
          console.log(err)
        })
      });
      response.status(201).json({message: 'Data stored', id: request.body.id});
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});
