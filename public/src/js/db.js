var indexDbPromise=idb.open('posts-store',1,function(db){
    if(!db.objectStoreNames.contains('posts')){
      db.createObjectStore('posts',{keyPath:'id'})
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