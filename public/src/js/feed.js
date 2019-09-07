var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form =document.querySelector('form');
var postTitle=document.querySelector('#title');
var postLocation=document.querySelector('#location');

var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var pictureFile;
function initializeMedia() {
if(!('mediaDevices' in navigator)){
  navigator.mediaDevices={}
}

if(!('getUserMedia' in navigator.mediaDevices)){
 navigator.mediaDevices.getUserMedia=function(constraints){
  var getUserMedia=navigator.webKitGetUserMedia || navigator.mozGetUserMedia;
  
  if(!getUserMedia){
    return Promise.reject(new Error("getUser Media is not supported or implemented in your browser"))
  }

  return new Promise(function(resolve,reject){
    getUserMedia.call(navigator,constraints,resolve,reject)
  })
 }
}

navigator.mediaDevices.getUserMedia({
  video:true
  //audio:true
})
.then(function(stream){
  videoPlayer.srcObject=stream;
  videoPlayer.style.display="block"
})
.catch(function(error){
  imagePickerArea.style.display="block";
})
}

captureButton.addEventListener('click', function(event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
    track.stop();
  });
  pictureFile=dataURItoBlob(canvasElement.toDataURL());
});

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(function(){
    createPostArea.style.transform='translateY(0)'
    initializeMedia();
  },1)
  if(addToScreenPromt){
    addToScreenPromt.prompt();
    addToScreenPromt.userChoice.then(function(choice){
      console.log(choice.outcome);
      if(choice.outcome==='dismissed'){
        console.log("user refused to add the app to the home screen")
      }else{
        console.log("user accepted to add the app to the home screen")
      }
    })
  addToScreenPromt=null;
  }

  //code for getting rid of the service worker  

 /*  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
    .then(function(registrations){
      for (let i = 0; i < registrations.length; i++) {
        registrations[i].unregister();        
      }
    })
  } */

}

function closeCreatePostModal() {
  createPostArea.style.transform='translateY(100vh)';
  videoPlayer.style.display="none";
  imagePickerArea.style.display="none";
  canvasElement.style.display="none";
  //createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


//this is not used now , it permits on demand caching
/* function onSaveButton(event){

if('caches' in window){
caches.open('userSaves')
  .then(function(cache){
    cache.add('https://httpbin.org/get')
    cache.add('/src/images/sf-boat.jpg')
  })
}

} */
function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function updateCardsUi(cards){
  clearCards();
  for (let i = 0; i < cards.length; i++) {
    createCard(cards[i]);
  }
}

function trasformResponseToArray(response){
  var cardsArray=[];
  for(var key in response){
    cardsArray.push(response[key]);
  }
  return cardsArray;
}


function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover'; 
  cardTitle.style.height = '180px'; 
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color='white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
 /*  var cardSaveButton=document.createElement('button');
  cardSaveButton.textContent='Save';
  cardSaveButton.addEventListener('click',onSaveButton)
  cardSupportingText.appendChild(cardSaveButton); */
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function sendDataToBackend(){
  var postData=new FormData();
  var id =new Date().toISOString();
    postData.append('id',id);
    postData.append('title',postTitle.value);
    postData.append('location',postLocation.value);
    postData.append('file',pictureFile,id+'.png');
    fetch('https://us-central1-pwagram-9f355.cloudfunctions.net/storePostData', {
      method: 'POST',
      body: postData
    })
      .then(function(res) {
        console.log('Sent data', res);
        updateCardsUi();
      })
  }
  


//strategy cache then network : this is the  page part  , and there is also the service worker part
//this strategy is just implemented for the request from the feed.js file for the server to get the updated card data

var url ='https://pwagram-9f355.firebaseio.com/posts.json';
var networkDataReceived=false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived=true;
    let cardsArray=trasformResponseToArray(data);
    updateCardsUi(cardsArray);
  });

  if('indexedDB' in window){
    readAllData('posts')
      .then(function(data){
        if(!networkDataReceived){
          updateCardsUi(data);       
         }
      })    
  }

  form.addEventListener('submit',function(event){
    event.preventDefault();
  if(postTitle.value.trim()==='' || postLocation.value.trim()===''){
    alert('Please enter valid data !')
    return;
  }
  closeCreatePostModal();
 if('serviceWorker'  in navigator && 'SyncManager' in window){
   navigator.serviceWorker.ready
   .then(function(sw){

    var post ={
      id:new Date().toISOString(),
      title:postTitle.value,
      location:postLocation.value,
      picture:pictureFile
    };

    writeData('sync-posts',post)
    .then(function(){
      return sw.sync.register('sync-new-post');
    })
    //showing a nice message in the buttom of the page to the user to say that something happened !
    .then(function(){
      var snackbarContainer = document.querySelector('#confirmation-toast');
      var data = {message: 'Your Post was saved for syncing!'};
      snackbarContainer.MaterialSnackbar.showSnackbar(data);
    })
    .catch(function(err) {
      console.log(err);
    });
   })
 }else {
   sendDataToBackend();
 }
   
  })