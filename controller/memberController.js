const {
    readMembers,
    writeMembers
} = require('../utils/fileManager');

// Fetch members
const getMembers = async (req, res) => {
    try {
        const members = await readMembers();
        res.status(200).json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch members" });
    }
};

// Fetch a member by ID
const getMemberById = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid member ID" });
    }

    try {
        // Read file data
        const members = await readMembers();

        // Find the member
        const member = members.find(m => m.id === id);

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        res.status(200).json(member);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch the member" });
    }
};

// Create a member
const createMember = async (req, res) => {
    const member = req.body;

    try {
        let members = [];

        try {
            // Read file data
            members = await readMembers();
        } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
        }
        
        // Find the ID of the last member
        const maxID = members.length ? Math.max(...members.map(m => m.id)) : 0;

        // Check for duplicate email
        const existingMember = members.find(m => m.email === member.email);

        if (existingMember) {
            return res.status(400).json({ message: "A member with this email already exists" });
        }

        // Create a new member object
        const newMember = {
            id: maxID + 1,
            name: member.name,
            email: member.email,
            phone: member.phone,
            membershipType: member.membershipType,
            status: member.status,
            createdAt: new Date().toISOString()
        }

        // Push the new member to the members array
        members.push(newMember);

        // Write data back to the JSON file
        await writeMembers(members);
        res.status(201).json({
            message: "New member created successfully",
            member: newMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create member" });
    }
};

// Update a member
const updateMember = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid member ID" });
    }

    const member = req.body;

    try {
        // Read file data
        let members = await readMembers();

        // Find the book index to update
        const memberIndex = members.findIndex(m => m.id === id);

        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Check for duplicate email
        const duplicateEmail = members.find(m => m.email === member.email && m.id !== id);

        if (duplicateEmail) {
            return res.status(400).json({ message: "A member with this email already exists" });
        }

        // Update the member
        members[memberIndex] = {
            ...members[memberIndex],
            ...req.body
        }

        // Write data back to the JSON file
        await writeMembers(members);
        res.status(200).json({
            message: "Member updated successfully",
            member: members[memberIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update the member" });
    }
};

// Remove member
const removeMember = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid member ID" });
    }

    try {
        // Read file data
        let members = await readMembers();

        // Find the member index to remove
        const memberIndex = members.findIndex(m => m.id === id);

        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Remove the member from the array
        members.splice(memberIndex, 1);

        // Write data back to the JSON file
        await writeMembers(members);
        res.status(200).json({ 
            message: "Member removed successfully",
            member: members[memberIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove the member" });
    }
};

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    removeMember
}