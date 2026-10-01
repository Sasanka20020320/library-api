function validateBook(book) {
    // Required fields validation
    if (book.isbn === undefined ||
        book.title === undefined ||
        book.author === undefined ||
        book.category === undefined ||
        book.publishedYear === undefined ||
        book.totalCopies === undefined ||
        book.availableCopies === undefined
    ) {
        throw new Error("Missing required book fields");
    }

    // ISBN validation
    if (typeof book.isbn !== 'string' || !book.isbn.trim()) {
        throw new Error("Invalid ISBN, must be a non-empty string");
    }

    // Title validation
    if (book.title.length < 3 || book.title.length > 100) {
        throw new Error("Invalid book title, must be between 3 and 100 characters");
    }

    // Author validation
    if (book.author.length < 3 || book.author.length > 100) {
        throw new Error("Invalid author name, must be between 3 and 100 characters");
    }

    // Category validation
    const validCategories = ['Programming', 'Science', 'Business', 'History', 'Psychology', 'Finance'];

    if (!validCategories.includes(book.category)) {
        throw new Error(`Invalid category, must be one of: ${validCategories.join(', ')}`);
    }

    // Year validation
    if (
        typeof book.publishedYear !== 'number' ||
        !Number.isInteger(book.publishedYear) ||
        book.publishedYear < 1000 ||
        book.publishedYear > new Date().getFullYear()
    ) {
        throw new Error("Invalid year, must be a 4-digit integer between 1000 and the current year");
    }

    // Total copies and Available copies validation
    if (
        typeof book.totalCopies !== 'number' ||
        !Number.isInteger(book.totalCopies) ||
        book.totalCopies < 0
    ) {
        throw new Error("Invalid total copies, must be a non-negative integer");
    }

    if (
        typeof book.availableCopies !== 'number' ||
        !Number.isInteger(book.availableCopies) ||
        book.availableCopies < 0
    ) {
        throw new Error("Invalid available copies, must be a non-negative integer");
    }

    if (book.availableCopies > book.totalCopies) {
        throw new Error("Available copies cannot exceed total copies");
    }
}

module.exports = validateBook;