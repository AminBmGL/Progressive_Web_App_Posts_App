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
function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px'; 
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color='white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
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

var url ='https://httpbin.org/get';
var networkDataReceived=false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived=true;
    clearCards();
    createCard();
  });

  if('caches' in window){
    caches.match(url)
      .then(function(response){
        if(response){
          return response.json()
        }
      })
      .then(function(data){
        if(!networkDataReceived){
          clearCards();
          createCard();
        }
      })    
  }