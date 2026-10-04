# 📚 Library Management API

A RESTful **Library Management API** built with **Node.js and Express.js**.
The API manages books, library members, and borrowing/returning operations using JSON files for data persistence.

This project was developed as **Day 8** of my **30 Days – 30 APIs / Mini Projects** challenge.

---

## 🚀 Features

### 📖 Book Management

* Create a new book
* Get all books
* Get a book by ID
* Update book details
* Delete a book
* Search books by:

  * ISBN
  * Title
  * Author
* Filter books by:

  * Author
  * Category
  * Published year
  * Minimum year
  * Maximum year
* Sort books by:

  * Title A–Z
  * Title Z–A
  * Published year ascending
  * Published year descending
* Prevent duplicate ISBNs
* Validate book information
* Generate total books report
* Prevent deletion of books with active borrowings

### 👥 Member Management

* Create a new member
* Get all members
* Get a member by ID
* Update member details
* Delete a member
* Search members by:

  * Name
  * Email
* Filter members by:

  * Membership type
  * Status
* Prevent duplicate email addresses
* Prevent duplicate phone numbers
* Validate member information
* Generate total members report
* Prevent deletion of members with active borrowings

### 🔄 Borrowing Management

* Borrow a book
* Get all borrowing records
* Get a borrowing by ID
* Filter borrowings by status
* Return a borrowed book
* Automatically decrease available book copies when borrowing
* Automatically increase available book copies when returning
* Automatically generate a 7-day due date
* Prevent borrowing unavailable books
* Prevent inactive members from borrowing
* Prevent returning the same borrowing twice
* Prevent invalid borrowing records

### 📊 Reports

* Total books
* Total members
* Total borrowings
* Currently borrowed books
* Overdue books
* Popular books
* Member borrowing summary

---

## 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **JavaScript**
* **JSON**
* **File System (`fs`)**
* **REST API**

---

## 📁 Project Structure

```text
library-management-api/
│
├── controller/
│   ├── bookController.js
│   ├── memberController.js
│   └── borrowingController.js
│
├── data/
│   ├── books.json
│   ├── members.json
│   └── borrowings.json
│
├── routes/
│   ├── bookRoutes.js
│   ├── memberRoute.js
│   └── borrowingRoutes.js
│
├── utils/
│   ├── fileManager.js
│   ├── validateBook.js
│   ├── validateMember.js
│   └── validateBorrowing.js
│
├── app.js
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Navigate into the project

```bash
cd library-management-api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the server

```bash
node app.js
```

The API will run on:

```text
http://localhost:5000
```

---

# 📖 API Endpoints

## Books

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/books`                    | Get all books             |
| GET    | `/books/search?keyword=...` | Search books              |
| GET    | `/books/:id`                | Get book by ID            |
| POST   | `/books`                    | Create a book             |
| PUT    | `/books/:id`                | Update a book             |
| DELETE | `/books/:id`                | Delete a book             |
| GET    | `/books/reports/total`      | Get total number of books |

### Book Filtering

```text
GET /books?author=Robert
GET /books?category=Psychology
GET /books?publishedYear=2018
GET /books?minYear=2000
GET /books?maxYear=2010
```

### Book Sorting

```text
GET /books?sort=title-asc
GET /books?sort=title-desc
GET /books?sort=year-asc
GET /books?sort=year-desc
```

Filters and sorting can also be combined:

```text
GET /books?category=Psychology&sort=year-desc
```

---

## 👥 Members

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/members`                    | Get all members             |
| GET    | `/members/search?keyword=...` | Search members              |
| GET    | `/members/:id`                | Get member by ID            |
| POST   | `/members`                    | Create a member             |
| PUT    | `/members/:id`                | Update a member             |
| DELETE | `/members/:id`                | Delete a member             |
| GET    | `/members/reports/total`      | Get total number of members |

### Member Filtering

```text
GET /members?membershipType=Premium
GET /members?status=Active
```

Filters can be combined:

```text
GET /members?membershipType=Premium&status=Active
```

---

# 🔄 Borrowings

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/borrowings`     | Get all borrowings  |
| GET    | `/borrowings/:id` | Get borrowing by ID |
| POST   | `/borrowings`     | Borrow a book       |
| PATCH  | `/borrowings/:id` | Return a book       |

### Borrowing Filtering

```text
GET /borrowings?status=Borrowed
GET /borrowings?status=Returned
```

---

# 📊 Reports

## Books

```text
GET /books/reports/total
```

Example response:

```json
{
  "totalBooks": 3
}
```

## Members

```text
GET /members/reports/total
```

Example:

```json
{
  "totalMembers": 3
}
```

## Borrowings

```text
GET /borrowings/reports/total
GET /borrowings/reports/borrowed
GET /borrowings/reports/overdue
GET /borrowings/reports/popular
GET /borrowings/reports/members
```

---

# 📝 Example Requests

## Create a Book

```http
POST /books
Content-Type: application/json
```

```json
{
  "isbn": "9781234567890",
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "category": "Programming",
  "publishedYear": 1999,
  "totalCopies": 5,
  "availableCopies": 5
}
```

---

## Create a Member

```http
POST /members
Content-Type: application/json
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "membershipType": "Regular",
  "status": "Active"
}
```

---

## Borrow a Book

```http
POST /borrowings
Content-Type: application/json
```

```json
{
  "bookId": 3,
  "memberId": 2
}
```

The API automatically:

1. Checks whether the book exists
2. Checks whether the member exists
3. Checks whether the member is active
4. Checks whether a copy is available
5. Decreases `availableCopies`
6. Creates the borrowing record
7. Sets the borrowing status to `Borrowed`
8. Generates a 7-day due date

---

## Return a Book

```http
PATCH /borrowings/2
```

The API automatically:

1. Checks whether the borrowing exists
2. Checks whether it has already been returned
3. Sets the status to `Returned`
4. Sets `returnedAt`
5. Increases the book's `availableCopies`

---

# ✅ Validation Rules

### Books

* ISBN must be a non-empty string
* Title must contain 3–100 characters
* Author must contain 3–100 characters
* Category must be a valid category
* Published year must be a valid integer
* Published year cannot be in the future
* Total copies must be a non-negative integer
* Available copies must be a non-negative integer
* Available copies cannot exceed total copies
* ISBN must be unique

### Members

* Name must contain 3–100 characters
* Email must be valid
* Phone number must be a 10-digit string
* Membership type must be `Regular` or `Premium`
* Status must be `Active` or `Inactive`
* Email must be unique
* Phone number must be unique

### Borrowings

* Book ID must be a positive integer
* Member ID must be a positive integer
* Book must exist
* Member must exist
* Member must be active
* Book must have available copies
* A returned borrowing cannot be returned again

---

# 🔐 Business Rules

The API maintains consistency between books, members, and borrowings.

### Borrowing

```text
Available Copies
        ↓
      - 1
        ↓
Book Borrowed
```

### Returning

```text
Available Copies
        ↓
      + 1
        ↓
Book Returned
```

### Deletion Protection

A book or member with an **active borrowing** cannot be deleted.

```text
Book/Member
     │
     ├── Active borrowing → ❌ Cannot delete
     │
     └── No active borrowing → ✅ Can delete
```

Historical `Returned` borrowing records do not prevent deletion.

---

# 💾 Data Persistence

This project uses JSON files instead of a database.

```text
data/
├── books.json
├── members.json
└── borrowings.json
```

The `fileManager.js` utility handles reading and writing the JSON files using Node.js `fs.promises`.

---

# 🧪 Testing

The API can be tested using:

* Postman
* Thunder Client
* Insomnia
* REST Client
* Browser for GET requests

Recommended testing sequence:

```text
1. Create a book
2. Create a member
3. Borrow the book
4. Check available copies
5. Check borrowing record
6. Return the book
7. Check available copies again
8. Try returning it again
9. Try borrowing with an inactive member
10. Try deleting a book with an active borrowing
11. Test search and filtering
12. Test reports
```

---

# 🎯 Learning Outcomes

Through this project, I practiced:

* Express.js routing
* REST API design
* CRUD operations
* Query parameters
* Filtering
* Sorting
* Searching
* Request validation
* HTTP status codes
* Error handling
* JSON file persistence
* Controller/route separation
* Reusable utility functions
* Business logic implementation
* Working with multiple related resources
* Generating API reports
* Maintaining relationships between resources

---

## 📌 Project Status

**Completed ✅**

This project is part of my:

> **30 Days – 30 APIs / Mini Projects Challenge**

**Day 8 — Library Management API**

---

## 👨‍💻 Author

**Sasanka Wishwa**

Built with Node.js + Express.js 🚀