const path = require('path');
const fs = require('fs').promises;

const filePathBooks = path.join(__dirname, '../data/books.json');
const filePathMembers = path.join(__dirname, '../data/members.json');
const filePathBorrowings = path.join(__dirname, '../data/borrowings.json');

// Read from books json file
async function readBooks() {
    try {
        const data = await fs.readFile(filePathBooks, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Read from members json file
async function readMembers() {
    try {
        const data = await fs.readFile(filePathMembers, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Read from borrowings json file
async function readBorrowings() {
    try {
        const data = await fs.readFile(filePathBorrowings, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Write to the books json file
async function writeBooks(books) {
    try {
        await fs.writeFile(filePathBooks, JSON.stringify(books, null, 2));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Write to the members json file
async function writeMembers(members) {
    try {
        await fs.writeFile(filePathMembers, JSON.stringify(members, null, 2));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Write to the borrowings json file
async function writeBorrowings(borrowings) {
    try {
        await fs.writeFile(filePathBorrowings, JSON.stringify(borrowings, null, 2));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    readBooks,
    readMembers,
    readBorrowings,
    writeBooks,
    writeMembers,
    writeBorrowings
};