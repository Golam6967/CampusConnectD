const prisma = require('../src/config/prisma');



exports.registerDonor = async (req, res) => {
    const userId = req.verifiedUser.user_id;
    
    const { blood_group, location, phone_number, last_donated } = req.body; 
    
    let donationDate = null;
    if (last_donated) {
        const parsedDate = new Date(last_donated);
        if (!isNaN(parsedDate)) {
            donationDate = parsedDate;
        }
    }

    if (!blood_group || !location || !phone_number) {
        return res.status(400).json({
            message: 'Missing required fields: blood group, location, and phone number are necessary.'
        });
    }

    try {
        const result = await prisma.$transaction(async (prisma) => {

            const currentUser = await prisma.users.findUnique({
                where: { users_id: userId },
                select: { phone_number: true }
            });

            let phoneMessage = 'No changes to user profile.';

            if (!currentUser.phone_number) {
                await prisma.users.update({
                    where: { users_id: userId },
                    data: {
                        phone_number: phone_number,
                    },
                });
                phoneMessage = 'Phone number saved to user profile.';
            }

            const existingDonor = await prisma.donorRecord.findUnique({
                where: { userId: userId },
                select: { donor_id: true, isActive: true } 
            });

            let donorRecord;
            let actionType;

            if (existingDonor) {
                if (existingDonor.isActive === true) {
                    throw new Error('Donor already active.');
                }
                
                // FIX 3: Include donationDate in the UPDATE operation
                donorRecord = await prisma.donorRecord.update({
                    where: { userId: userId },
                    data: {
                        blood_group: blood_group,
                        location: location,
                        last_donated: donationDate,
                        isActive: true, 
                    },
                });
                actionType = 'reactivated';
                
            } else {
                donorRecord = await prisma.donorRecord.create({
                    data: {
                        userId: userId,
                        blood_group: blood_group,
                        location: location,
                        last_donated: donationDate, // <-- ADDED
                        isActive: true,
                    },
                });
                actionType = 'created';
            }
           

            return {
                donor: donorRecord,
                phoneMessage: phoneMessage,
                actionType: actionType
            };
        });

        res.status(201).json({
            message: `Donor registration successful (${result.actionType}). ${result.phoneMessage}`,
            donor: result.donor
        });

    } catch (error) {
        if (error.message === 'Donor already active.') {
            return res.status(409).json({
                message: 'You are already registered as an active donor. Please use the Deactivate feature if necessary.'
            });
        }
        res.status(500).json({
            message: 'Could not process donor registration due to a server error.'
        });
    }
};


exports.toggleDonorStatus = async (req, res) => {
    const userId = req.verifiedUser.user_id; 

    try {
        const existingDonor = await prisma.donorRecord.findUnique({
            where: { userId: userId },
          
            select: { donor_id: true, isActive: true } 
        });

        if (!existingDonor) {
            return res.status(404).json({
                message: 'Donor record not found. Please register first.'
            });
        }
        
        const newStatus = !existingDonor.isActive;
        const statusMessage = newStatus ? 'activated' : 'deactivated';

        await prisma.donorRecord.update({
            where: {
                userId: userId 
            },
            data: {
                isActive: newStatus,
            },
        });

        res.status(200).json({
            message: `Donor status successfully ${statusMessage}. You are now marked as ${newStatus ? 'active' : 'inactive'}.`,
            isActive: newStatus
        });

    } catch (error) {
        console.error('Error toggling donor status:', error); 
        res.status(500).json({ 
            message: 'Could not process request to toggle donor status due to a server error.' 
        });
    }
};

exports.getAllDonors = async (req, res) => {
    const currentUserId = req.verifiedUser.user_id; 

    try {
  
        let donors = await prisma.donorRecord.findMany({
            where: {
                isActive: true, 
            },
            include: {
                user: {
                    select: {
                        users_id: true,
                        user_name: true,
                        phone_number: true, 
                        email: true,
                    },
                },
            },
        });


        const currentUserDonorRecord = await prisma.donorRecord.findUnique({
            where: { userId: currentUserId },
            include: {
                user: {
                    select: {
                        users_id: true,
                        user_name: true,
                        phone_number: true, 
                        email: true,
                    },
                },
            },
        });
        
        if (currentUserDonorRecord) {
            
          
            const isCurrentUserActive = donors.some(d => d.userId === currentUserId);

            if (!isCurrentUserActive) {
                donors.push(currentUserDonorRecord);
            }
     
        }

        // 4. Format the final list
        const formattedDonors = donors.map(donor => ({
            donor_id: donor.donor_id,
            blood_group: donor.blood_group,
            location: donor.location,
            last_donated: donor.last_donated,
            isActive: donor.isActive,
            
            
                user_name: donor.user.user_name,
                phone_number: donor.user.phone_number, 
                email: donor.user.email,
            
        }));
        
        res.status(200).json({
            success: true,
            count: formattedDonors.length,
            donors: formattedDonors
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Could not retrieve donor list due to a server error.'
        });
    }
};
exports.updateDonorInfo = async (req, res) => {
    const userId = req.verifiedUser.user_id;
    const { blood_group, location, phone_number, last_donated } = req.body;
    let donationDate = null;
    if (last_donated) {
        const parsedDate = new Date(last_donated);
        if (!isNaN(parsedDate)) {
            donationDate = parsedDate;
        }
    }
    try {
        const existingDonor = await prisma.donorRecord.findUnique({
            where: { userId: userId },
        });
        if (!existingDonor) {
            return res.status(404).json({
                message: 'Donor record not found. Please register first.'
            });
        }   
        await prisma.donorRecord.update({
            where: { userId: userId },
            data: {
                blood_group: blood_group || existingDonor.blood_group,
                location: location || existingDonor.location,
                last_donated: donationDate || existingDonor.last_donated,
            },
        });
        if (phone_number) { 
            await prisma.users.update({
                where: { users_id: userId },
                data: {
                    phone_number: phone_number,
                },
            });
        }
        res.status(200).json({
            message: 'Donor information successfully updated.'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Could not update donor information due to a server error.'
        });
    }
};