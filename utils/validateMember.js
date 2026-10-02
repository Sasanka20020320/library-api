function validateMember(member) {
    // Missing fields validation
    if (member.name === undefined ||
        member.email === undefined ||
        member.phone === undefined ||
        member.membershipType === undefined ||
        member.status === undefined
    ) {
        throw new Error("Missing required member fields");
    }

    // Name validation
    if (typeof member.name !== 'string' || 
        member.name.trim().length < 3 || member.name.trim().length > 100
    ) {
        throw new Error("Invalid name, must be a string between 3 and 100 characters");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof member.email !== 'string' || !emailRegex.test(member.email)) {
        throw new Error("Invalid email format");
    }

    // Phone validation
    if (typeof member.phone !== 'string' || member.phone.length !== 10) {
        throw new Error("Invalid phone number, must be a 10-digit string");
    }

    // Membership type validation
    const validMembershipTypes = ['Regular', 'Premium'];

    if (!validMembershipTypes.includes(member.membershipType)) {
        throw new Error(`Invalid membership type, must be one of: ${validMembershipTypes.join(', ')}`);
    }

    // Status validation
    const validStatuses = ['Active', 'Inactive'];

    if (!validStatuses.includes(member.status)) {
        throw new Error(`Invalid status, must be one of: ${validStatuses.join(', ')}`);
    }
};

module.exports = validateMember;