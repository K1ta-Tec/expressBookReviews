const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


//  Check if the username is valid
const isValid = (username) => users.some((user) => user.username === username);

// Check if username and password match
const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  // Check if token is provided
  if (!token) return res.status(403).json({ message: "Access denied. No token provided." });

  try {
    // Verify token (handle "Bearer <token>" structure)
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    req.user = decoded; // Store user info in the request object
    next(); // Move to the next route
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// user login route (no middleware needed here)
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate if the username exists
  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Generate JWT token with 1-hour expiration
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  return res.status(200).json({ message: "Login successful", token });
});

//Apply middleware to all routes starting with /auth/
regd_users.use("/auth/*", authenticateToken);

// Add or modify a book review (requires authentication)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.user?.username; // Get username from JWT token payload

  // Ensure user is logged in
  if (!username) return res.status(401).json({ message: "You must be logged in to post a review" });

  // Check if the book exists
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  // Ensure review content is provided
  if (!review) return res.status(400).json({ message: "Review content is required" });

  // Initialize reviews if not present
  if (!books[isbn].reviews) books[isbn].reviews = {};

  // Add or update the user's review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    book: books[isbn],
  });
});

// Delete a book review (requires authentication)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user?.username; // Get username from JWT token payload

  // Ensure user is logged in
  if (!username) return res.status(401).json({ message: "You must be logged in to delete a review" });

  // Check if the book exists
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  // Ensure the book has reviews, and that the user has a review to delete
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found from this user to delete" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully",
    book: books[isbn],
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
