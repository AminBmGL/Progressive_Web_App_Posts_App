var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
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