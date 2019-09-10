var addToScreenPromt;
var enableNotificationsButtons=document.querySelectorAll('.enable-notifications'); 
if(!window.Promise){
     window.Promise=Promise;
}
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(){
        console.log('Service Worker successfully registered')
    })
}

window.addEventListener('beforeinstallprompt',function(event){
console.log('prompt event fired ');
addToScreenPromt=event;
return false;
})


//Display Notification for confirmation permission
 function displaySubscriptionConfirmation(){
    if('serviceWorker' in navigator){
        navigator.serviceWorker.ready
        .then(function(swregistration){
            swregistration.showNotification('Successfully Subscribed',
            {
                body:'You are now subscribed to our Notification service !',
                icon:'/src/images/icons/app-icon-96x96.png',
                image:'https://176g4u2eqkgm30b0371yje33-wpengine.netdna-ssl.com/wp-content/uploads/2018/04/image-11.png',
                dir:'ltr',
                lang:'en-US',
                badge:'/src/images/icons/app-icon-96x96.png',
                vibrate:[100,50,200],
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

//configuring subscriptions
function configurePushSubscriptions(){
    if(!('serviceWorker' in navigator)){
        return;
    }
    var registration;
    navigator.serviceWorker.ready
        .then(function(swregistration){
            registration=swregistration;
            return swregistration.pushManager.getSubscription()
        })
        .then(function(sub){
            if(sub===null){
                //create a new subscription and secure it via vapid keys
                var vapidPublicKey=
                "BJIRbjVjjHlREP3m7owq6q-s3OQD4J6_N6CcMKZcUS8hYUwLHm31NSWRBEjRI_KLUEdLoBhopGseoUW8DXvtYN4" ;
                var convertedPublicKey=urlBase64ToUint8Array(vapidPublicKey);
                return registration.pushManager.subscribe({
                    userVisibleOnly:true,
                    applicationServerKey:convertedPublicKey
                })
            }else{

            }
        })
        .then(function(newSub){
            return fetch('https://pwagram-9f355.firebaseio.com/subscriptions.json',
            {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body:JSON.stringify(newSub)
                            })
        })
        .then(function(response){
            if(response.ok){
                displaySubscriptionConfirmation();
            }
        })
        .catch(function(err){
            console.log(err)
        }) 

}


function askForNotificationsPermissions(){
Notification.requestPermission(function(choice){
if(choice !== 'granted'){
console.log('User blocked notifications')
}else{
    configurePushSubscriptions();
}
})
}


if('Notification' in window && 'serviceWorker' in navigator){
    for (let index = 0; index < enableNotificationsButtons.length; index++) {
         enableNotificationsButtons[index].style.display='inline-block';
         enableNotificationsButtons[index].addEventListener('click',askForNotificationsPermissions)
        
    }
}