
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();
const BASE_URL = process.env.BOOKS_API_BASE_URL || 'http://localhost:5000';

// Internal endpoint used by the Axios requests
public_users.get('/internal/books-data', (req, res) => {
    res.json(books);
});

// Task 6: Register a new user
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

// Task 10: Get all books using Axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving books',
            error: error.message
        });
    }
});

// Task 11: Get a book by ISBN using Axios
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
        return res.status(500).json({
            message: 'Error retrieving book',
            error: error.message
        });
    }
});

// Task 12: Get books by author using Axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        const author = req.params.author.toLowerCase();
        const result = Object.values(response.data).filter(book =>
            book.author &&
            book.author.toLowerCase() === author
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving books by author',
            error: error.message
        });
    }
});

// Task 13: Get books by title using Axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/internal/books-data`
        );

        const title = req.params.title.toLowerCase();
        const result = Object.values(response.data).filter(book =>
            book.title &&
            book.title.toLowerCase() === title
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Error retrieving books by title',
            error: error.message
        });
    }
});

// Task 5: Get reviews by ISBN
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
