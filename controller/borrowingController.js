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
            return res.status(404).json({ message: "Assigned book does not exist" });
        }

        // Check if the member exists 
        const memberExists = members.find(m => m.id === borrowing.memberId);

        if (!memberExists) {
            return res.status(404).json({ message: "Assigned member does not exist" });
        }

        // Check if the member is active
        if (memberExists.status.toLowerCase() !== "active") {
            return res.status(404).json({ message: "Assigned member is inactive" });
        }

        // Check if the book have available copies
        if (books[bookIndex].availableCopies <= 0) {
            return res.status(400).json({ message: "Book isn't available right now" });
        }

        // Update the book copies
        books[bookIndex].availableCopies -= 1;

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

// Return a book
const returnBook = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid borrowing ID" });
    }

    try {
        // Read file data
        let borrowings = await readBorrowings();

        // Find the borrowing index to update
        const borrowingIndex = borrowings.findIndex(b => b.id === id);

        if (borrowingIndex === -1) {
            return res.status(404).json({ message: "Borrowing not found" });
        }

        // Prevent returning the same borrowing twice
        if (borrowings[borrowingIndex].status === "Returned") {
            return res.status(400).json({ message: "This book has already been returned" });
        }

        // Update the borrowing status and returned date
        borrowings[borrowingIndex].status = "Returned";
        borrowings[borrowingIndex].returnedAt = new Date().toISOString();

        // Update the available copies of the book
        const books = await readBooks();

        const bookIndex = books.findIndex(b => b.id === borrowings[borrowingIndex].bookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (books[bookIndex].availableCopies >= books[bookIndex].totalCopies) {
            return res.status(400).json({ message: "Book already has all copies available" });
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

// Reports
// Total borrowings report
const totalBorrowingsReport = async (req, res) => {
    try {
        // Read file data
        const borrowings = await readBorrowings();

        res.status(200).json({ totalBorrowings: borrowings.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate the total borrowings report" });
    }
};

// Currently borrowed books report
const borrowedReport = async (req, res) => {
    try {
        // Read file data
        const borrowings = await readBorrowings();
        const books = await readBooks();
        const members = await readMembers();

        const borrowedBooks = borrowings.reduce((result, borrowing) => {
            if (borrowing.status === "Borrowed") {
                const book = books.find(b => b.id === borrowing.bookId);
                const member = members.find(m => m.id === borrowing.memberId);

                if (book && member) {
                    result.push({
                        borrowingId: borrowing.id,
                        bookId: book.id,
                        bookName: book.title,
                        memberId: member.id,
                        memberName: member.name,
                        borrowedAt: borrowing.borrowedAt,
                        dueDate: borrowing.dueDate
                    });
                }
            }

            return result;
        }, []);

        res.status(200).json(borrowedBooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate the borrowed books report" });
    }
};

// Overdue books report
const overdueReport = async (req, res) => {
    try {
        // Read file data
        const borrowings = await readBorrowings();
        const books = await readBooks();
        const members = await readMembers();

        const overdueBooks = borrowings.reduce((result, borrowing) => {
            if (borrowing.status === "Borrowed" && borrowing.dueDate < new Date().toISOString()) {
                const book = books.find(b => b.id === borrowing.bookId);
                const member = members.find(m => m.id === borrowing.memberId);

                if (book && member) {
                    result.push({
                        borrowingId: borrowing.id,
                        bookId: book.id,
                        bookName: book.title,
                        memberId: member.id,
                        memberName: member.name,
                        dueDate: borrowing.dueDate
                    });
                }
            }

            return result;
        }, []);

        res.status(200).json(overdueBooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate the overdue books report" });
    }
};

// Popular books report
const popularBooksReport = async (req, res) => {
    try {
        // Read file data
        const borrowings = await readBorrowings();
        const books = await readBooks();

        // Count the borrowed count for each book
        const popularBooks = borrowings.reduce((acc, borrowing) => {
            acc[borrowing.bookId] = (acc[borrowing.bookId] || 0) + 1;

            return acc;
        }, {});

        // Conver the counts into a report
        const sortedBorrowings = Object.entries(popularBooks).map(([bookId, borrowCount]) => {
            const book = books.find(b => b.id === Number(bookId));

            if (!book) {
                return null;
            }

            return {
                bookId: Number(bookId),
                bookName: book.title,
                borrowCount
            };
        }).sort((a, b) => b.borrowCount - a.borrowCount);

        res.status(200).json(sortedBorrowings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate the popular books report" });
    }
};

// Member borrowing report
const memberBorrowingReport = async (req, res) => {
    try {
        const borrowings = await readBorrowings();
        const members = await readMembers();

        const memberCounts = borrowings.reduce((acc, borrowing) => {
            acc[borrowing.memberId] =
                (acc[borrowing.memberId] || 0) + 1;

            return acc;
        }, {});

        const report = Object.entries(memberCounts)
            .map(([memberId, borrowCount]) => {
                const member = members.find(
                    m => m.id === Number(memberId)
                );

                if (!member) {
                    return null;
                }

                return {
                    memberId: Number(memberId),
                    memberName: member.name,
                    borrowCount
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.borrowCount - a.borrowCount);

        res.status(200).json(report);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to generate member borrowing report"
        });
    }
};

module.exports = {
    getBorrowings,
    getBorrowingByID,
    createBorrowing,
    returnBook,
    totalBorrowingsReport,
    borrowedReport,
    overdueReport,
    popularBooksReport,
    memberBorrowingReport
};