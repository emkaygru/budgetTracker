let db;
// create a new db request for the budget database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;

  // check to see if app is online before reading from db

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (e) => {
  console.log("error! ", +e.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending DB with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add the record to your store with the add method
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending DB
  const transaction = db.transaction(["pending"], "readwrite");
  //access pending object store
  const store = transaction.objectStore("pending");
  // get all records from the store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: POST,
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful open a transaction on your pending DB
          const transaction = db.transaction(["pending"], "readwrite");

          // access your pending object store
          const store = transaction.objectStore("pending");

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for when app comes back online

window.addEventListener("online", checkDatabase);
