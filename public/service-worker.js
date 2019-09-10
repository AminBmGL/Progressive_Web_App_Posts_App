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
  

  
  workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "7f461d305a66b2dd395be0f044f1feda"
  },
  {
    "url": "manifest.json",
    "revision": "8652bdc02e95d06fd78fa618db1ed40b"
  },
  {
    "url": "offline.html",
    "revision": "258dda0b318884443fc23984d6fb8aff"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "2266f37f6becd819ccd607e0ebaeaf32"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "8efe063b3b8eabb781978d62a5efd52a"
  },
  {
    "url": "src/js/feed.js",
    "revision": "e92bb6bdc000b5f820fb71d18b042d87"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utilities.js",
    "revision": "ea8ca2585161857f80207201119a801a"
  },
  {
    "url": "sw-base.js",
    "revision": "00fdffd27e630d5134e71f7238c25a78"
  },
  {
    "url": "sw.js",
    "revision": "625946117e1477d538bb39fcd4976122"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
], {});
