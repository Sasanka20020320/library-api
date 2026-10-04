const express = require('express');
const router = express.Router();

const {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    removeMember,
    searchMember,
    totalMembersReport
} = require('../controller/memberController');

// GET route to fetch all members
router.get('/', getMembers);

// GET route to fetch a searched member
router.get('/search', searchMember);

// GET route to generate the total members report
router.get('/reports/total', totalMembersReport);

// GET route to fetch a member by ID
router.get('/:id', getMemberById);

// POST route to create a new member
router.post('/', createMember);

// PUT route to update a member by ID
router.put('/:id', updateMember);

// DELETE route to remove a member by ID
router.delete('/:id', removeMember);

module.exports = router;