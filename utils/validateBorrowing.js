function validateBorrowing(borrowing) {
    // Missing fields validation
    if (borrowing.bookId === undefined ||
        borrowing.memberId === undefined
    ) {
        throw new Error("Missing required borrowing fields");
    }

    // Book ID validation
    if (!Number.isInteger(borrowing.bookId) || borrowing.bookId <= 0) {
        throw new Error("Invalid book ID, must be a positive integer");
    }

    // Member ID validation
    if (!Number.isInteger(borrowing.memberId) || borrowing.memberId <= 0) {
        throw new Error("Invalid member id, must be a positive integer");
    }
};

module.exports = validateBorrowing;