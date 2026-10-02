const {
    readMembers,
    writeMembers
} = require('../utils/fileManager');

const validateMember = require('../utils/validateMember');

// Fetch members
const getMembers = async (req, res) => {
    const { membershipType, status } = req.query;

    try {
        // Read file data
        let members = await readMembers();

        // Filtering
        // Filter by Membership Type
        if (membershipType !== undefined) {
            members = members.filter(m => m.membershipType.toLowerCase().trim() === membershipType.toLowerCase().trim());
        }

        // Filter by status
        if (status !== undefined) {
            members = members.filter(m => m.status.toLowerCase().trim() === status.toLowerCase().trim());
        }
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
        // Validate request body
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        // Validate member data
        validateMember(member);

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
        const duplicateEmail = members.find(m => m.email.toLowerCase().trim() === member.email.toLowerCase().trim());

        if (duplicateEmail) {
            return res.status(400).json({ message: "A member with this email already exists" });
        }

        // Check for duplicate phone number
        const duplicatePhone = members.find(m => m.phone.trim() === member.phone.trim());

        if (duplicatePhone) {
            return res.status(400).json({ message: "A member with this phone number already exists" });
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

        if (error.message.startsWith("Invalid") ||
            error.message.startsWith("Missing")
        ) {
            return res.status(400).json({ message: error.message });
        }

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
        // Validate request body
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        // Validate member data
        validateMember(member);

        // Read file data
        let members = await readMembers();

        // Find the member index to update
        const memberIndex = members.findIndex(m => m.id === id);

        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Check for duplicate email
        const duplicateEmail = members.find(m => m.email.toLowerCase().trim() === member.email.toLowerCase().trim() && m.id !== id);

        if (duplicateEmail) {
            return res.status(400).json({ message: "A member with this email already exists" });
        }

        // Check for duplicate phone number
        const duplicatePhone = members.find(m => m.phone.trim() === member.phone.trim() && m.id !== id);

        if (duplicatePhone) {
            return res.status(400).json({ message: "A member with this phone number already exists" });
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

        if (error.message.startsWith("Invalid") ||
            error.message.startsWith("Missing")
        ) {
            return res.status(400).json({ message: error.message });
        }

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
        const removedMember =members.splice(memberIndex, 1)[0];

        // Write data back to the JSON file
        await writeMembers(members);
        res.status(200).json({ 
            message: "Member removed successfully",
            member: removedMember
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove the member" });
    }
};

// Search member
const searchMember = async (req, res) => {
    const { keyword } = req.query;

    if (typeof keyword !== 'string' || !keyword.trim()) {
        return res.status(400).json({ message: "A non-empty search keyword is required" });
    }

    try {
        // Read file data
        const members = await readMembers();

        const searchedKeyword = keyword.toLowerCase().trim();

        // Search for members by name or email
        const searchedMember = members.filter(m => {
            const nameMatch = m.name ? m.name.toLowerCase().trim().includes(searchedKeyword) : false;
            const emailMatch = m.email ? m.email.toLowerCase().trim().includes(searchedKeyword) : false;

            return nameMatch || emailMatch;
        });

        if (searchedMember.length === 0) {
            return res.status(404).json({ message: "No members found matching the keyword" });
        }

        res.status(200).json(searchedMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to search members" });
    }
}

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    removeMember,
    searchMember
}