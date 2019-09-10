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
  

  
  workbox.precaching.precacheAndRoute([], {});
