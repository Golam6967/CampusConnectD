const prisma = require('../src/config/prisma');
const { createNotification } = require('../utils/notificationHelper');

exports.createListing = async (req, res) => {
    try {
        const { area, fullAddress, floor, currentStudents, studentsInfo, rent, facilities, phone_number, isGirlsOnly, whatsappAvailable } = req.body;
        const userId = req.verifiedUser.user_id;

        const newListing = await prisma.roommateListing.create({
            data: {
                area,
                fullAddress,
                floor,
                currentStudents: parseInt(currentStudents),
                studentsInfo,
                rent: parseInt(rent),
                facilities,
                phone_number,
                isGirlsOnly: Boolean(isGirlsOnly),
                whatsappAvailable: Boolean(whatsappAvailable),
                postedBy: userId
            }
        });

        res.status(201).json({ success: true, listing: newListing });

        // Broadcast notification to all users
        await createNotification(
            'roommate',
            'New Roommate Wanted Ad',
            `A new roommate ad was posted for area: ${area}. Rent: ${rent} BDT/month.`,
            'all',
            { listingId: newListing.id },
            userId  // Exclude the poster from receiving notification about their own ad
        );
    } catch (error) {
        console.error("CREATE ERROR:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getAllListings = async (req, res) => {
    try {
        const listings = await prisma.roommateListing.findMany({
            include: {
                user: {
                    select: { user_name: true }
                }
            },
            orderBy: { postedDate: 'desc' }
        });


        const formatted = listings.map(listing => ({
            ...listing,
            userName: listing.user.user_name
        }));

        res.status(200).json({ success: true, listings: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching listings" });
    }
};
exports.updateListing = async (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const userId = req.verifiedUser.user_id;
        const { area, fullAddress, floor, currentStudents, studentsInfo, rent, facilities, phone_number, isGirlsOnly, whatsappAvailable } = req.body;

        const listing = await prisma.roommateListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        if (listing.postedBy !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this ad" });
        }

        const updatedListing = await prisma.roommateListing.update({
            where: { id: listingId },
            data: {
                area,
                fullAddress,
                floor,
                currentStudents: parseInt(currentStudents),
                studentsInfo,
                rent: parseInt(rent),
                facilities,
                phone_number,
                isGirlsOnly: Boolean(isGirlsOnly),
                whatsappAvailable: Boolean(whatsappAvailable)
            }
        });

        res.status(200).json({ success: true, listing: updatedListing, message: "Listing updated successfully" });
    } catch (error) {
        console.error("UPDATE ERROR:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const listingId = parseInt(req.params.id);
        const userId = req.verifiedUser.user_id;

        const listing = await prisma.roommateListing.findUnique({
            where: { id: listingId }
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        if (listing.postedBy !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this ad" });
        }

        await prisma.roommateListing.delete({
            where: { id: listingId }
        });

        res.status(200).json({ success: true, message: "Listing cancelled successfully" });
    } catch (error) {
        console.error("DELETE ERROR:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};