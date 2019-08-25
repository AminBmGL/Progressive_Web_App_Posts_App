self.addEventListener('install',function(event){
console.log('From Service worker : Installing the service worker ...',event)
event.waitUntil(
    caches.open('app-shell')
    .then(function(cache){
        console.log('From Service worker :Precaching App shell ...')
        cache.addAll([
            '/',
            '/index.html',
            '/src/js/app.js',
            '/src/js/feed.js',
            '/src/js/promise.js',
            '/src/js/fetch.js',
            '/src/js/material.min.js',
            '/src/css/app.css',
            '/src/css/feed.css',
            '/src/images/main-image.jpg',
            'https://fonts.googleapis.com/css?family=Roboto:400,700',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
          ]);
  

    },function(err){
        console.log(err)
    })
)
}) 

self.addEventListener('activate',function(event){
    console.log('From Service worker : Activating the service worker ...',event);
    return self.clients.claim();
    })

    
self.addEventListener('fetch',function(event){
    event.respondWith(async function(){
        const cachedResponse = await caches.match(event.request);
            if(cachedResponse) return cachedResponse;

             return fetch(event.request)
            }());

    })    
    