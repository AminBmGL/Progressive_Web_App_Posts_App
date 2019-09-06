var addToScreenPromt;
var enableNotificationsButtons=document.querySelectorAll('.enable-notifications'); 
if(!window.Promise){
     window.Promise=Promise;
}
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


function askForNotificationsPermissions(){
Notification.requestPermission(function(choice){
if(choice !== 'granted'){
console.log('User blocked notifications')
}else{
//Display Notification for confirmation permission
if('serviceWorker' in navigator){
    navigator.serviceWorker.ready
    .then(function(swregistration){
        swregistration.showNotification('Successfully Subscribed From the service worker !',
        {
            body:'You are now subscribed to our Notification service !',
            icon:'/src/images/icons/app-icon-96x96.png',
            image:'https://176g4u2eqkgm30b0371yje33-wpengine.netdna-ssl.com/wp-content/uploads/2018/04/image-11.png',
            dir:'ltr',
            lang:'en-US',
            badge:'/src/images/icons/app-icon-96x96.png',
            tag:'confirm-notification',
            renotify:true,
            actions:[
                {action:'confirm',title:'Ok',icon:'https://images-na.ssl-images-amazon.com/images/I/41j6yIwUtzL._SX425_.jpg'},
                {action:'cancel',title:'reject',icon:'https://previews.123rf.com/images/yakovenkonataliia/yakovenkonataliia1806/yakovenkonataliia180600019/102927679-cross-red-sign-isolated-mark-on-white-background-red-symbol-wrong-negative-marks-reject-picture-whit.jpg'}
            ]
        })
    })
}

}
})
}


if('Notification' in window){
    for (let index = 0; index < enableNotificationsButtons.length; index++) {
         enableNotificationsButtons[index].style.display='inline-block';
         enableNotificationsButtons[index].addEventListener('click',askForNotificationsPermissions)
        
    }
}