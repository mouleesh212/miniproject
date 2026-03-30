let currentUser = "";
let currentRole = "";
let editIndex = -1;

document.addEventListener("DOMContentLoaded", showBooks);

const PASSWORDS = {
  user: "moulii",    // password for normal user
  admin: "code@06"   // password for admin
};

function login(){
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  if(!username) return alert("Enter your name");

  // Check password
  if(password !== PASSWORDS[role]){
    return alert("Incorrect password!");
  }

  // Password correct → show app
  currentUser = username;
  currentRole = role;
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("currentUserName").innerText = currentUser;
  document.getElementById("currentUserRole").innerText = currentRole;

  if(currentRole !== "admin") document.getElementById("bookForm").style.display = "none";

  showBooks();
}

function logout(){
  document.getElementById("app").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

// Storage
function getBooks(){ return JSON.parse(localStorage.getItem("books")) || []; }
function saveBooks(books){ localStorage.setItem("books", JSON.stringify(books)); }

// Add / Edit Book
function addBook(){
  let title = document.getElementById("title").value.trim();
  let author = document.getElementById("author").value.trim();
  if(!title || !author) return alert("Fill all fields");

  let books = getBooks();
  if(editIndex === -1){
    books.push({title, author, status:"Available", user:"", issueDate:"", returnDate:""});
  } else {
    books[editIndex].title = title;
    books[editIndex].author = author;
    editIndex = -1;
  }

  saveBooks(books);
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  showBooks();
}

// Display books
function showBooks(filtered=null){
  let books = filtered || getBooks();
  let list = document.getElementById("bookList");
  list.innerHTML = "";

  document.getElementById("total").innerText = books.length;
  let issued = books.filter(b => b.status==="Issued").length;
  document.getElementById("issued").innerText = issued;
  document.getElementById("available").innerText = books.length - issued;

  books.forEach((book,index)=>{
    let fine = calculateFine(book.issueDate,book.returnDate);
    let actions = "";
    if(currentRole==="admin"){
      actions += `<button class="edit-btn" onclick="editBook(${index})">Edit</button> `;
      actions += `<button class="delete-btn" onclick="deleteBook(${index})">Delete</button> `;
    }
    if(book.status==="Available"){
      actions += `<button class="issue-btn" onclick="issueBook(${index})">Issue</button>`;
    } else {
      actions += `<button class="return-btn" onclick="returnBook(${index})">Return</button>`;
    }

    list.innerHTML += `
      <tr>
        <td>${index+1}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.status}</td>
        <td>${book.user || "-"}</td>
        <td>${formatDate(book.issueDate)}</td>
        <td>${formatDate(book.returnDate)}</td>
        <td>${fine}</td>
        <td>${actions}</td>
      </tr>
    `;
  });
}

// Edit / Delete
function editBook(index){
  let books = getBooks();
  document.getElementById("title").value = books[index].title;
  document.getElementById("author").value = books[index].author;
  editIndex = index;
}
function deleteBook(index){
  let books = getBooks();
  books.splice(index,1);
  saveBooks(books);
  showBooks();
}

// Issue / Return
function issueBook(index){
  let books = getBooks();
  books[index].status = "Issued";
  books[index].user = currentUser;
  books[index].issueDate = new Date().toISOString();
  books[index].returnDate = " 22-05-2026";
  saveBooks(books);
  showBooks();
}
function returnBook(index){
  let books = getBooks();
  books[index].status = "Available";
  books[index].returnDate = new Date().toISOString();
  saveBooks(books);
  showBooks();
}

// Search
function searchBooks(){
  let q = document.getElementById("search").value.toLowerCase();
  let books = getBooks();
  let filtered = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  showBooks(filtered);
}

// Fine calculation
function calculateFine(issue,ret){
  if(!issue || !ret) return 0;
  let days = (new Date(ret) - new Date(issue)) / (1000*60*60*24);
  return days>7 ? Math.floor(days-7)*5 : 0;
}

function formatDate(date){
  return date ? new Date(date).toLocaleDateString() : "-";
}