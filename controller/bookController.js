const {
    readBooks,
    writeBooks
} = require('../utils/fileManager');

const validateBook = require('../utils/validateBook');

// Fetch books
const getBooks = async (req, res) => {
    const { author, category, publishedYear, minYear, maxYear, sort } = req.query;

    try {
        // Read file data
        let books = await readBooks();

        // Filtering
        // Filter by Author
        if (author !== undefined) {
            books = books.filter(b => b.author.toLowerCase().trim().includes(author.toLowerCase().trim()));
        }

        // Filter by Category
        if (category !== undefined) {
            books = books.filter(b => b.category.toLowerCase().trim() === category.toLowerCase().trim());
        }

        // Filter by Published Year
        if (publishedYear !== undefined) {
            const pubYear = Number(publishedYear);

            if (!Number.isNaN(pubYear)) {
                books = books.filter(b => b.publishedYear === pubYear);
            }
        }

        // Filter by Minimum Year
        if (minYear !== undefined) {
            const minimumYear = Number(minYear);

            if (!Number.isNaN(minimumYear)) {
                books = books.filter(b => b.publishedYear >= minimumYear);
            }
        }

        // Filter by Maximum Year
        if (maxYear !== undefined) {
            const maximumYear = Number(maxYear);

            if (!Number.isNaN(maximumYear)) {
                books = books.filter(b => b.publishedYear <= maximumYear);
            }
        }

        // Sorting
        // Sort by title and published year
        if (sort === 'title-asc') {
            books.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'title-desc') {
            books.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sort === 'year-asc') {
            books.sort((a, b) => a.publishedYear - b.publishedYear);
        } else if (sort === 'year-desc') {
            books.sort((a, b) => b.publishedYear - a.publishedYear);
        }

        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch books" });
    }
};

// Fetch a book by ID
const getBookById = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    try {
        // Read file data
        const books = await readBooks();

        // Find the book
        const book = books.find(b => b.id === id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch the book" });
    }
};

// Create a book
const createBook = async (req, res) => {
    const book = req.body;

    try {
        // Validate the book
        validateBook(book);

        let books = [];

        try {
            // Read file data
            books = await readBooks();
        } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
        }

        // Find the ID of the last book
        const maxID = books.length ? Math.max(...books.map(b => b.id)) : 0;

        // Check for duplicate ISBN
        const existingBook = books.find(b => b.isbn.trim() === book.isbn.trim());

        if (existingBook) {
            return res.status(400).json({ message: "A book with this ISBN exists" });
        }

        // Create new book object
        const newBook = {
            id: maxID + 1,
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            category: book.category,
            publishedYear: book.publishedYear,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            createdAt: new Date().toISOString()
        }

        // Push new book to books
        books.push(newBook);

        // Write data back to JSON file
        await writeBooks(books);
        res.status(201).json({
            message: "New book created successfully",
            book: newBook
        });
    } catch (error) {
        console.error(error);

        if (error.message.startsWith("Invalid") ||
            error.message.startsWith("Missing")) {
                return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Failed to create the book" });
    }
};

// Update a book
const updateBook =  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = req.body;

    try {
        // Validate the book
        validateBook(book);

        // Read file data
        let books = await readBooks();

        // Find the book index to update
        const bookIndex = books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check for duplicate ISBN
        const duplicateISBN = books.find(b => b.isbn.trim() === book.isbn.trim() && b.id !== id);

        if (duplicateISBN) {
            return res.status(400).json({ message: "Another book with this ISBN exists" });
        }

        // Update the book
        books[bookIndex] = {
            ...books[bookIndex],
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            category: book.category,
            publishedYear: book.publishedYear,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies
        }

        // Write data back to the JSON file
        await writeBooks(books);
        res.status(200).json({
            message: "Book updated successfully",
            book: books[bookIndex]
        });
    } catch (error) {
        console.error(error);

        if (error.message.startsWith("Invalid") ||
            error.message.startsWith("Missing")) {
                return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Failed to update the book" });
    }
};

// Remove a book
const removeBook = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid book ID" });
    }

    try {
        // Read file data
        let books = await readBooks();

        // Find the book index to remove
        const bookIndex = books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Remove the book
        const removedBook = books.splice(bookIndex, 1)[0];

        // Write data back to the JSON file
        await writeBooks(books);
        res.status(200).json({
            message: "Book removed successfully",
            book: removedBook
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove the book" });
    }
};

// Search a book
const searchBook = async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ message: "Search keyword is required" });
    }

    try {
        // Read file data
        const books = await readBooks();

        // Convert the keyword to lower case
        const searchTerm = keyword.toLowerCase().trim();

        const searchedBook = books.filter(b => {
            const isbnMatch = b.isbn ? b.isbn.trim().includes(searchTerm) : false;
            const titleMatch = b.title ? b.title.toLowerCase().trim().includes(searchTerm) : false;
            const authorMatch = b.author ? b.author.toLowerCase().trim().includes(searchTerm) : false;

            return isbnMatch || titleMatch || authorMatch;
        });

        res.status(200).json(searchedBook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to find the searched book" });
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    removeBook,
    searchBook
};