var addToScreenPromt;
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then(function(){
        console.log('Service Worker successfully registered')
    })
}

window.addEventListener('beforeinstallprompt',function(event){
console.log('prompt event fired ');
addToScreenPromt=event;
return false;
})