let db;

const request = indexedDB.open("libraryDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    let store = db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
    store.createIndex("book_name", "book_name", { unique: false });
    store.createIndex("author", "author", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadBooks();
};
