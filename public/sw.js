self.addEventListener('install',function(event){
console.log('From Service worker : Installing the service woeker ...',event)
})

self.addEventListener('activate',function(event){
    console.log('From Service worker : Activating the service woeker ...',event);
    return self.clients.claim();
    })

    self.addEventListener('fetch',function(event){
        console.log('From Service worker : Fetch event captured ...',event);
        })    