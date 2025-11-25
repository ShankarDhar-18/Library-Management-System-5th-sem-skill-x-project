function addBook() {
  const book = {
    book_name: document.getElementById("bookName").value,
    author: document.getElementById("authorName").value,
    pages: document.getElementById("pages").value,
    price: document.getElementById("price").value,
  };

  if (!book.book_name || !book.author) {
    alert("Enter all details");
    return;
  }

  const tx = db.transaction("books", "readwrite");
  tx.objectStore("books").add(book);

  tx.oncomplete = () => {
    clearForm();
    loadBooks();
    alert("Book added");
  };
}

function loadBooks() {
  const store = db.transaction("books").objectStore("books");
  const table = document.getElementById("bookTable");
  table.innerHTML = "";

  store.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const b = cursor.value;
      table.innerHTML += `
                <tr>
                    <td>${b.book_name}</td>
                    <td>${b.author}</td>
                    <td>${b.pages}</td>
                    <td>${b.price}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editBook(${b.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteBook(${b.id})">Delete</button>
                    </td>
                </tr>
            `;
      cursor.continue();
    }
  };
}

function deleteBook(id) {
  const tx = db.transaction("books", "readwrite");
  tx.objectStore("books").delete(id);

  tx.oncomplete = () => loadBooks();
}

function editBook(id) {
  const tx = db.transaction("books", "readonly");
  const req = tx.objectStore("books").get(id);

  req.onsuccess = () => {
    const b = req.result;

    document.getElementById("editId").value = id;
    document.getElementById("bookName").value = b.book_name;
    document.getElementById("authorName").value = b.author;
    document.getElementById("pages").value = b.pages;
    document.getElementById("price").value = b.price;

    document.getElementById("addBtn").classList.add("hidden");
    document.getElementById("updateBtn").classList.remove("hidden");
  };
}

function updateBook() {
  const id = Number(document.getElementById("editId").value);

  const updatedBook = {
    id: id,
    book_name: document.getElementById("bookName").value,
    author: document.getElementById("authorName").value,
    pages: document.getElementById("pages").value,
    price: document.getElementById("price").value,
  };

  const tx = db.transaction("books", "readwrite");
  tx.objectStore("books").put(updatedBook);

  tx.oncomplete = () => {
    clearForm();
    loadBooks();
    document.getElementById("addBtn").classList.remove("hidden");
    document.getElementById("updateBtn").classList.add("hidden");
    alert("Book updated");
  };
}

function searchBooks() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const store = db.transaction("books").objectStore("books");
  const table = document.getElementById("bookTable");
  table.innerHTML = "";

  store.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const b = cursor.value;
      if (
        b.book_name.toLowerCase().includes(keyword) ||
        b.author.toLowerCase().includes(keyword)
      ) {
        table.innerHTML += `
                    <tr>
                        <td>${b.book_name}</td>
                        <td>${b.author}</td>
                        <td>${b.pages}</td>
                        <td>${b.price}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editBook(${b.id})">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteBook(${b.id})">Delete</button>
                        </td>
                    </tr>
                `;
      }
      cursor.continue();
    }
  };
}

function clearForm() {
  document.getElementById("editId").value = "";
  document.getElementById("bookName").value = "";
  document.getElementById("authorName").value = "";
  document.getElementById("pages").value = "";
  document.getElementById("price").value = "";
}
