
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

// Check whether a username is already registered
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user =>
            user.username === username &&
            user.password === password
    );
};

// Task 7: Login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const accessToken = jwt.sign(
        { username },
        'access',
        { expiresIn: '1h' }
    );

    // Save the authenticated user in the session
    if (req.session) {
        req.session.authorization = {
            accessToken,
            username
        };
    }

    return res.status(200).json({
        message: 'User successfully logged in',
        accessToken
    });
});

// Task 8: Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({
            message: 'Please log in first'
        });
    }

    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!review || !String(review).trim()) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    const username = req.session.authorization.username;

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = String(review).trim();

    return res.status(200).json({
        message: 'Review added or updated successfully',
        reviews: book.reviews
    });
});

// Task 10: Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({
            message: 'Please log in first'
        });
    }

    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    const username = req.session.authorization.username;

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({
            message: 'Review not found'
        });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: 'Review deleted successfully',
        reviews: book.reviews
    });
});

// Export router and helper functions
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
