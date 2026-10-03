const {
    readBorrowings,
    writeBorrowings,
    readBooks,
    writeBooks,
    readMembers
} = require('../utils/fileManager');

const validateBorrowing = require('../utils/validateBorrowing');

// Fetch Borrowings
const getBorrowings = async (req, res) => {
    const { status } = req.query;

    try {
        // Fetch file data
        let borrowings = await readBorrowings();

        // Filtering
        // Filter by status
        if (status !== undefined) {
            borrowings = borrowings.filter(b => b.status.toLowerCase() === status.toLowerCase().trim());
        }
        
        res.status(200).json(borrowings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch borrowings" });
    }
};

// Fetch a borrowing by ID
const getBorrowingByID = async (req, res) => {
    const id = Number(req.params.id);

    try {
        // Read file data
        const borrowings = await readBorrowings();

        // Find the borrowing
        const borrowing = borrowings.find(b => b.id === id);

        if (!borrowing) {
            return res.status(404).json({ message: "Borrowing not found" });
        }

        res.status(200).json(borrowing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch the borrowing" });
    }
};

// Borrow a book
const createBorrowing = async (req, res) => {
    const borrowing = req.body;

    try {
        // Validate borrowing
        validateBorrowing(borrowing);

        let borrowings = [];

        try {
            // Read file data
            borrowings = await readBorrowings();
        } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
        }

        // Read file data
        const books = await readBooks();
        const members = await readMembers();

        // Check if the book exists
        // const bookExists = books.find(b => b.id === borrowing.bookId);

        // if (!bookExists) {
        //     return res.status(404).json({ message: "Assigned book does not exist" });
        // }

        const bookIndex = books.findIndex(b => b.id === borrowing.bookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: "Assigned book does not exists" });
        }

        // Check if the book have available copies
        if (books[bookIndex].availableCopies <= 0) {
            return res.status(400).json({ message: "Book isn't available right now" });
        }

        // Update the book copies
        books[bookIndex].availableCopies -= 1;

        // Check if the member exists and status is active
        const memberExists = members.find(m => m.id === borrowing.memberId);

        if (!memberExists) {
            return res.status(404).json({ message: "Assigned member does not exist" });
        }

        // Check if the member is inactive
        if (memberExists.status.toLowerCase() !== "active") {
            return res.status(404).json({ message: "Assigned member is inactive" });
        }

        // Find the ID of the last borrowing
        const maxID = borrowings.length ? Math.max(...borrowings.map(b => b.id)) : 0;

        // Create new borrowing object
        const borrowedAt = new Date();

        const newBorrowing = {
            id: maxID + 1,
            bookId: borrowing.bookId,
            memberId: borrowing.memberId,
            borrowedAt: borrowedAt.toISOString(),
            dueDate: new Date(borrowedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            returnedAt: null,
            status: 'Borrowed'
        }

        // Push the new borrowing object to the borrowings array
        borrowings.push(newBorrowing);

        // Write data back to the JSON file
        await writeBooks(books);
        await writeBorrowings(borrowings);

        res.status(201).json({ 
            message: "Book borrowed successfully",
            borrowing: newBorrowing 
        });
    } catch (error) {
        console.error(error);

        if (error.message.startsWith("Missing") ||
            error.message.startsWith("Invalid")
        ) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Failed to create the borrowing" });
    }
};

// Update a borrowing
const updateBorrowing = async (req, res) => {
    const id = Number(req.params.id);
    const borrowing = req.body;

    try {
        // Validate borrowing
        validateBorrowing(borrowing);

        // Read file data
        let borrowings = await readBorrowings();
        const books = await readBooks();
        const members = await readMembers();

        // Find the borrowing index to update
        const borrowingIndex = borrowings.findIndex(b => b.id === id);

        if (borrowingIndex === -1) {
            return res.status(404).json({ message: "Borrowing not found" });
        }

        // Check if the book exists
        const bookExists = books.find(b => b.id === borrowing.bookId);

        if (!bookExists) {
            return res.status(404).json({ message: "Assigned book does not exist" });
        }

        // Check if the member exists
        const memberExists = members.find(m => m.id === borrowing.memberId);

        if (!memberExists) {
            return res.status(404).json({ message: "Assigned member does not exist" });
        }

        // Check if the member is inactive
        if (memberExists.status.toLowerCase() !== "active") {
            return res.status(404).json({ message: "Assigned member is inactive" });
        }

        // Check if the status and returnedAt are valid
        if (borrowings[borrowingIndex].status !== 'Borrowed' || borrowings[borrowingIndex].returnedAt !== null) {
            return res.status(400).json({ message: "Status and Returned date can only be updated by returning the book" });
        }

        // Update the borrowing
        borrowings[borrowingIndex] = {
            ...borrowings[borrowingIndex],
            ...req.body
        }

        // Write data back to the JSON file
        await writeBorrowings(borrowings);

        res.status(200).json({ 
            message: "Borrowing updated successfully",
            borrowing: borrowings[borrowingIndex]
        });
    } catch (error) {
        console.error(error);

        if (error.message.startsWith("Missing") ||
            error.message.startsWith("Invalid")
        ) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Failed to update the borrowing" });
    }
};

// Return a book
const returnBook = async (req, res) => {
    const id = Number(req.params.id);

    try {
        // Read file data
        let borrowings = await readBorrowings();

        // Find the borrowing index to update
        const borrowingIndex = borrowings.findIndex(b => b.id === id);

        // Update the borrowing status and returned date
        borrowings[borrowingIndex].status = "Returned";
        borrowings[borrowingIndex].returnedAt = new Date().toISOString();

        // Update the available copies of the book
        const books = await readBooks();

        const bookIndex = books.findIndex(b => b.id === borrowings[borrowingIndex].bookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        books[bookIndex].availableCopies += 1;

        // Write data back to the JSON file
        await writeBooks(books);
        await writeBorrowings(borrowings);

        res.status(200).json({
            message: "Book returned successfully",
            borrowing: borrowings[borrowingIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to return the book" });
    }
};

module.exports = {
    getBorrowings,
    getBorrowingByID,
    createBorrowing,
    updateBorrowing,
    returnBook
};