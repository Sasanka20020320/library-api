const express = require('express');
const router = express.Router();

const {
    getBorrowings,
    getBorrowingByID,
    createBorrowing,
    updateBorrowing,
    returnBook
} = require('../controller/borrowingController');

// GET route to fetch borrowings
router.get('/', getBorrowings);

// GET route to fetch a borrowing by ID
router.get('/:id', getBorrowingByID);

// POST route to create a borrowing
router.post('/', createBorrowing);

// PUT route to update a borrowing
router.put('/:id', updateBorrowing);

// PATCH route to Return a book
router.patch('/:id', returnBook);

module.exports = router;