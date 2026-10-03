function validateBorrowing(borrowing) {
    // Missing fields validation
    if (borrowing.bookId === undefined ||
        borrowing.memberId === undefined
    ) {
        throw new Error("Missing required borrowing fields");
    }

    // Book ID validation
    if (typeof borrowing.bookId !== 'number') {
        throw new Error("Invalid book id, must be a number");
    }

    // Member ID validation
    if (typeof borrowing.memberId !== 'number') {
        throw new Error("Invalid member id, must be a number");
    }
};

module.exports = validateBorrowing;