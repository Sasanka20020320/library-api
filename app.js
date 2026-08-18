const express = require('express');
const app = express();

const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');

const PORT = 5000;

app.use(express.json());

app.use('/books', bookRoutes);
app.use('/members', memberRoutes);
app.use('/borrowings', borrowingRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});