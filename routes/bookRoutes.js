const express = require('express');
const router = express.Router();

const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    removeBook,
    searchBook
} = require('../controller/bookController');

// GET route to fetch books
router.get('/', getBooks);

// GET route to search a book
router.get('/search', searchBook);

// GET route to fetch a book by ID
router.get('/:id', getBookById);

// POST route to create a new book
router.post('/', createBook);

// PUT route to update a book
router.put('/:id', updateBook);

// DELETE route to remove a book
router.delete('/:id', removeBook);

module.exports = router;