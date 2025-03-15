const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const getBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books); // If books data is available, resolve the Promise
    } else {
      reject("Error retrieving books");
    }
  });

  // Handle the Promise
  getBooks
    .then((bookList) => {
      return res.status(200).json({
        message: "Books retrieved successfully",
        books: JSON.stringify(bookList, null, 2),
      });
    })
    .catch((error) => {
      return res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const { isbn } = req.params;

  // Wrap book retrieval in a Promise
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]); // Resolve with book details if found
    } else {
      reject("Book not found"); // Reject with an error message if not found
    }
  });

  // Handle the Promise
  getBookByISBN
    .then((bookDetails) => {
      return res.status(200).json({
        message: "Book details retrieved successfully",
        book: bookDetails,
      });
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
 });
  
// Get book details based on author
const { author } = req.params;

// Wrap book retrieval in a Promise
const getBooksByAuthor = new Promise((resolve, reject) => {
  const matchingBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );

  // Resolve if books are found, reject if not
  matchingBooks.length > 0
    ? resolve(matchingBooks)
    : reject(`No books found by author "${author}"`);
});

// Handle the Promise
getBooksByAuthor
  .then((booksByAuthor) => {
    return res.status(200).json({
      message: `Books by author "${author}" retrieved successfully`,
      books: booksByAuthor,
    });
  })
  .catch((error) => {
    return res.status(404).json({ message: error });
  });


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const { title } = req.params;

  // Wrap book retrieval in a Promise
  const getBooksByTitle = new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );

    // Resolve if books are found, reject if not
    matchingBooks.length > 0
      ? resolve(matchingBooks)
      : reject(`No books found with title "${title}"`);
  });

  // Handle the Promise
  getBooksByTitle
    .then((booksByTitle) => {
      return res.status(200).json({
        message: `Books with title "${title}" retrieved successfully`,
        books: booksByTitle,
      });
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const { isbn } = req.params;

  // Check if the book exists
  if (books[isbn]) {
    const bookReviews = books[isbn].reviews;

    return res.status(200).json({
      message: `Reviews for book with ISBN "${isbn}" retrieved successfully`,
      reviews: bookReviews || "No reviews yet",
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
