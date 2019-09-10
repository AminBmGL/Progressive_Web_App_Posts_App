importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
importScripts('./src/js/idb.js');
importScripts('./src/js/utilities.js');

  workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/,
  new workbox.strategies.StaleWhileRevalidate({
   cacheName: 'post-images'
  }));

  workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/,new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ], 
    
  }));
  
  workbox.routing.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'material-css'
  }));

  workbox.routing.registerRoute('https://pwagram-9f355.firebaseio.com/posts.json', function(args){
      return fetch(args.event.request)
      .then(function(response){
          var clonedResponse=response.clone();
            /* we need to clear the storage otherwise if an item in the indexedDB gets deleted from the realtime database , the change will not be reflected in the indexed db because the put method dosen't delete the entry if it is removed from the Realtime database */
          deleteAllData('posts')
          .then(function(){
              clonedResponse.json()
              .then(function(data){
                  for(var key in data){
                     writeData('posts',data[key]);
                  }
              })
          })
         
          return response;
  });
});

workbox.routing.registerRoute(function (routeData) {
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  }, function(args) {
    return caches.match(args.event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(args.event.request)
            .then(function (res) {
              return caches.open('dynamic')
                .then(function (cache) {
                  cache.put(args.event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function (err) {
              return caches.match('/offline.html')
                .then(function (res) {
                  return res;
                });
            });
        }
      })
  });
  
  workbox.precaching.precacheAndRoute([], {});

  
  self.addEventListener('sync',function(event){
    console.log('From Service Worker : Background Synchronization',event)
    if(event.tag==='sync-new-post'){
        console.log('From Service Worker : Syncing new posts')
        event.waitUntil(
            readAllData('sync-posts')
            .then(function(posts){
                for (var post of posts) {
                    var postData=new FormData();
                    postData.append('id',post.id);
                    postData.append('title',post.title);
                    postData.append('location',post.location);
                    postData.append('file',post.picture,post.id+'.png');
                    postData.append('locationLat',post.rawLocation.lat);
                    postData.append('locationLng',post.rawLocation.lng);

                   
                    fetch('https://us-central1-pwagram-9f355.cloudfunctions.net/storePosts', {
                        method: 'POST',
                        body: postData
                      })
                        .then(function(res) {
                          console.log('Sent data', res);
                          if(res.ok){
                              res.json()
                              .then(function(data){
                                deleteItemFromStore('sync-posts',data.id)

                              })
                          }
                        })  
                        .catch(function(err){
                            console.log('Error while syncing data ',err)
                        })                
                      }
            })
        )
    }
    })
    
self.addEventListener('notificationclick',function(event){
    var notification=event.notification;
    var action=event.action;

    console.log(notification)

    if(action==='confirm'){
        console.log('user confirms notification')
        notification.close();
    }else{
        event.waitUntil(
            clients.matchAll()
            .then(function(cls){
                var client=cls.find(function(cl){
                    return cl.visibilityState ==='visible'
                })

                if(client!== undefined){
                    /*You can avoid hardcoding this url and send it from the server in the notification
                    then after listening to the notification add the url information to the data property of the notification options and then read it here in the click listener .
                    */
                    client.navigate('http://localhost:9000')
                    client.focus()
                }else{
                    client.openWindow('http://localhost:9000')
                }
                notification.close();

            })
        )
    }
})

//listening to the close event (swipping out the notification in android for example)

self.addEventListener('notificationclose',function(event){
    //in practice you can inform your server and search after that why your user didn't interact with it
console.log('notification was closed ',event.notification)
})

/* reacting to incoming messages from the server (messages sended to this service worker of this browser of this device)
*/
self.addEventListener('push', function(event) {
console.log('Push Notification received', event);

var data = {title: 'New!', content: 'Something new happened!'};

if (event.data) {
  data = JSON.parse(event.data.text());
}

var options = {
  body: data.content,
  icon: '/src/images/icons/app-icon-96x96.png',
  badge: '/src/images/icons/app-icon-96x96.png'
};

event.waitUntil(
  self.registration.showNotification(data.title, options)
);
});

