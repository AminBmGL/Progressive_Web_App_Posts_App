var indexDbPromise=idb.open('posts-store',1,function(db){
    if(!db.objectStoreNames.contains('posts')){
      db.createObjectStore('posts',{keyPath:'id'})
    }

    if(!db.objectStoreNames.contains('sync-posts')){
        db.createObjectStore('sync-posts',{keyPath:'id'})
      }
})

function writeData(storeName,data){
    return indexDbPromise
         .then(function(db){
             var tx=db.transaction(storeName,'readwrite');
             var store=tx.objectStore(storeName);
              store.put(data);
               return tx.complete;
                })
}

function readAllData(storeName){
    return indexDbPromise
    .then(function(db){
        var tx=db.transaction(storeName,'readonly');
        var store=tx.objectStore(storeName);
          return store.getAll();
           })
}

function deleteAllData(storeName){
    return indexDbPromise
         .then(function(db){
             var tx=db.transaction(storeName,'readwrite');
             var store=tx.objectStore(storeName);
             store.clear();
               return tx.complete;
                })
}

function deleteItemFromStore(storeName,id){
    return indexDbPromise
         .then(function(db){
             var tx=db.transaction(storeName,'readwrite');
             var store=tx.objectStore(storeName);
              store.delete(id);
               return tx.complete;
                })
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }