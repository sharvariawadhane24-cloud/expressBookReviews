
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

const BASE_URL =
    process.env.BOOKS_API_BASE_URL || 'http://localhost:5000';

// Internal data endpoint used by the Axios requests
public_users.get('/internal/books-data', (req, res) => {
    return res.json(books);
});

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'Username already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User successfully registered'
    });
});

// Task 10: Retrieve all books using Axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error retrieving all books:', error.message);

        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Task 11: Retrieve a book by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        const book = response.data[req.params.isbn];

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('Error retrieving book by ISBN:', error.message);

        return res.status(500).json({
            message: 'Unable to retrieve book by ISBN'
        });
    }
});

// Task 12: Retrieve books by author using Axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        const requestedAuthor = decodeURIComponent(
            req.params.author
        ).toLowerCase();

        const matchingBooks = Object.values(response.data).filter(
            book =>
                book.author &&
                book.author.toLowerCase() === requestedAuthor
        );

        if (matchingBooks.length === 0) {
            return res.status(404).json({
                message: 'No books found for this author'
            });
        }

        return res.status(200).json(matchingBooks);
    } catch (error) {
        console.error('Error retrieving books by author:', error.message);

        return res.status(500).json({
            message: 'Unable to retrieve books by author'
        });
    }
});

// Task 13: Retrieve books by title using Axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        const requestedTitle = decodeURIComponent(
            req.params.title
        ).toLowerCase();

        const matchingBooks = Object.values(response.data).filter(
            book =>
                book.title &&
                book.title.toLowerCase() === requestedTitle
        );

        if (matchingBooks.length === 0) {
            return res.status(404).json({
                message: 'No books found with this title'
            });
        }

        return res.status(200).json(matchingBooks);
    } catch (error) {
        console.error('Error retrieving books by title:', error.message);

        return res.status(500).json({
            message: 'Unable to retrieve books by title'
        });
    }
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
