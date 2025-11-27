function addBook() {
  const book = {
    book_name: document.getElementById("bookName").value,
    author: document.getElementById("authorName").value,
    pages: document.getElementById("pages").value,
    price: document.getElementById("price").value,
    category: document.getElementById("category").value,
    isbn: document.getElementById("isbn").value,
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
  const store = db.transaction("books", "readonly").objectStore("books");
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
          <td>${b.category}</td>
          <td>${b.isbn}</td>
          <td>
            <button onclick="editBook(${b.id})">Edit</button>
            <button onclick="deleteBook(${b.id})">Delete</button>
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
    document.getElementById("category").value = b.category;
    document.getElementById("isbn").value = b.isbn;

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
    category: document.getElementById("category").value,
    isbn: document.getElementById("isbn").value,
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
  const store = db.transaction("books", "readonly").objectStore("books");
  const table = document.getElementById("bookTable");
  table.innerHTML = "";

  store.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const b = cursor.value;
      if (
        b.book_name.toLowerCase().includes(keyword) ||
        b.author.toLowerCase().includes(keyword) ||
        b.isbn.toLowerCase().includes(keyword)
      ) {
        table.innerHTML += `
          <tr>
            <td>${b.book_name}</td>
            <td>${b.author}</td>
            <td>${b.pages}</td>
            <td>${b.price}</td>
            <td>${b.category}</td>
            <td>${b.isbn}</td>
            <td>
              <button onclick="editBook(${b.id})">Edit</button>
              <button onclick="deleteBook(${b.id})">Delete</button>
            </td>
          </tr>
        `;
      }
      cursor.continue();
    }
  };
}

function downloadAllBooks() {
  const store = db.transaction("books", "readonly").objectStore("books");
  const books = [];

  store.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      books.push(cursor.value);
      cursor.continue();
    } else {
      if (books.length === 0) {
        alert("No books to download.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const tableData = books.map((b, i) => [
        i + 1,
        b.book_name,
        b.author,
        b.pages,
        b.price,
        b.category,
        b.isbn,
      ]);

      doc.setFontSize(16);
      doc.text("Library Book List", doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      doc.autoTable({
        startY: 25,
        head: [
          [
            "#",
            "Book Name",
            "Author",
            "Pages",
            "Price",
            "Category",
            "ISBN NO.",
          ],
        ],
        body: tableData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 25 },
      });

      doc.save("Library_Book_List.pdf");
    }
  };
}

function clearForm() {
  document.getElementById("editId").value = "";
  document.getElementById("bookName").value = "";
  document.getElementById("authorName").value = "";
  document.getElementById("pages").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
  document.getElementById("isbn").value = "";
}
