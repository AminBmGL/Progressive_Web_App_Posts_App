var CACHE_STATIC_VERSION='app-shellv8';
var CACHE_DYNAMIC_VERSION='dynamic';
var STATIC_ASSETS=[
    '/',
    '/index.html',
    '/offline.html',
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
  ];

self.addEventListener('install',function(event){
console.log('From Service worker : Installing the service worker ...',event)
event.waitUntil(
    caches.open(CACHE_STATIC_VERSION)
    .then(function(cache){
        console.log('From Service worker :Precaching App shell ...')
        cache.addAll(STATIC_ASSETS);

    },function(err){
        console.log(err)
    })
)
}) 

self.addEventListener('activate',function(event){
    console.log('From Service worker : Activating the service worker ...',event);
    event.waitUntil(
        caches.keys()
        .then(function(keyList){
            return Promise.all(
                keyList.map(function(key){
                    if(key!==CACHE_STATIC_VERSION && key!==CACHE_DYNAMIC_VERSION){
                        console.log('From Service worker : Removing old cache ...',key);
                        return caches.delete(key);

                    }
            }))
        })
    )
    return self.clients.claim();
    })

    //cache with network fallback staregy

/* self.addEventListener('fetch',function(event){
    event.respondWith(async function(){
        const cachedResponse = await caches.match(event.request);
            if(cachedResponse) return cachedResponse;

            //if not present in the cache
             return fetch(event.request)
             .then(function(res){
                return caches.open(CACHE_DYNAMIC_VERSION)
                    .then(function(cache){
                        cache.put(event.request.url,res.clone());
                        return res;
                    })
             })
             .catch(function(err){
                return caches.open(CACHE_STATIC_VERSION)
                    .then(function(cache){
                       return cache.match('/offline.html')
                })
             })
            }();

    })    
 */

 /*cache then network strategy with dynamic caching for just the request sent from the 
 feed.js part to get the card data , and for the other request we use cahe first then network fallback to keep providing offline support*/

    self.addEventListener('fetch',function(event){
        var url ='https://httpbin.org/get';
        if(event.request.url.indexOf(url)> -1){
            event.respondWith(
                caches.open(CACHE_DYNAMIC_VERSION)
                 .then(function(cache){
                    return fetch(event.request)
                    .then(function(response){
                        cache.put(event.request,response.clone())
                        return response;
                    })
                })        
                 );
                 /* we will implement cache only strategy for just the the static assets (the precached items)*/ 
        }else if(new RegExp('\\b'+STATIC_ASSETS.join('\\b|\\b')+'\\b').test(event.request.url)){
            event.respondWith(
                caches.match(event.request)
            )
        }else{
            //cache with network fallback strategy for the other urls
            event.respondWith(async function(){
                const cachedResponse = await caches.match(event.request);
                    if(cachedResponse) return cachedResponse;
        
                    //if not present in the cache
                     return fetch(event.request)
                     .then(function(res){
                        return caches.open(CACHE_DYNAMIC_VERSION)
                            .then(function(cache){
                                cache.put(event.request.url,res.clone());
                                return res;
                            })
                     })
                     .catch(function(err){
                        return caches.open(CACHE_STATIC_VERSION)
                            .then(function(cache){

                /* it dosen't make sens to remplace a css file (for example) that is not found  by the offline.html !
                    we return this page onlyif a principal page is missing (help or root pages )
                */
                                if(event.request.url.indexOf('/help')){
                                    return cache.match('/offline.html')
                                }
                        })
                     })
                    }());  
        }
       
        })    

    //  cache only strategy 
    
    /* self.addEventListener('fetch',function(event){
        event.respondWith(
            caches.match(event.request)
        )
        })   */

        
    //  network only strategy 
    
    /* self.addEventListener('fetch',function(event){
        event.respondWith(
        fetch(event.request)        
        )
        })   */


        //network first than cache strategy 
        /* self.addEventListener('fetch',function(event){
            event.respondWith( 
               fetch(event.request)
               .catch(function(err){
               return caches.match(event.request)
               })
            ) 
        })    */