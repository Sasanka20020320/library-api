const express = require('express');
const router = express.Router();

const {
    getBorrowings,
    getBorrowingByID,
    createBorrowing,
    returnBook,
    totalBorrowingsReport,
    borrowedReport,
    overdueReport,
    popularBooksReport,
    memberBorrowingReport
} = require('../controller/borrowingController');

// GET route to fetch borrowings
router.get('/', getBorrowings);

// GET route to generate the total borrowings report
router.get('/reports/total', totalBorrowingsReport);

// GET route to generate the borrowed report 
router.get('/reports/active', borrowedReport);

// GET route to generate the overdue report
router.get('/reports/overdue', overdueReport);

// GET route to generate the popular books report
router.get('/reports/popular', popularBooksReport);

// GET route to generate the member borrowing report
router.get('/reports/members', memberBorrowingReport);

// GET route to fetch a borrowing by ID
router.get('/:id', getBorrowingByID);

// POST route to create a borrowing
router.post('/', createBorrowing);

// PATCH route to Return a book
router.patch('/:id', returnBook);

module.exports = router;