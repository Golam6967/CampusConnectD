const prisma = require('../src/config/prisma');
const { createNotification } = require('../utils/notificationHelper');

exports.createLostItem = async (req, res) => {
    try {
        const { name, description, date, location, phone_number, image, whatsappAvailable } = req.body;

        // Logging for debugging
        console.log("Request Body:", req.body);
        console.log("Verified User from Middleware:", req.verifiedUser);

        // Validation
        if (!name || !description || !date || !location || !phone_number) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, description, date, location, and phone_number are required"
            });
        }

        // 1. Get the user_id from req.verifiedUser (set in your middleware)
        const owner_id = req.verifiedUser.user_id;

        // 2. Format the date safely
        const formattedDate = date ? new Date(date) : new Date();

        // 3. Create the record in the database
        const newItem = await prisma.lostItem.create({
            data: {
                name,
                description,
                date: formattedDate,
                location,
                // We use the phone_number from body, or fallback to an empty string 
                // (Note: Your middleware doesn't currently attach the full user object, 
                // just the decoded token + user_id)
                phone_number: phone_number || "",
                image: image || null, // Allow null images
                whatsappAvailable: whatsappAvailable || false,
                ownerId: owner_id
            }
        });

        res.status(201).json({
            success: true,
            message: "Lost item reported successfully",
            item: newItem
        });

        // Broadcast notification to all users (except the creator)
        await createNotification(
            'lost_found',
            'New Lost Item Posted',
            `A new lost item "${name}" was posted. Location: ${location || 'N/A'}.`,
            'all',
            { itemId: newItem.item_id },
            owner_id  // Exclude the creator from notification
        );

    } catch (error) {
        console.error("CREATE LOST ITEM ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

exports.getAllLostItems = async (req, res) => {
    try {
        const items = await prisma.lostItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: {
                        user_name: true,
                        email: true,
                        phone_number: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            items
        });
    } catch (error) {
        console.error("GET ALL ITEMS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch items"
        });
    }
};
// controllers/lostItem.controller.js

exports.deleteLostItem = async (req, res) => {
    try {
        const { id } = req.params;
        const owner_id = req.verifiedUser.user_id; // From your verifyToken middleware

        // 1. Check if the item exists and belongs to the user
        const item = await prisma.lostItem.findUnique({
            where: { item_id: parseInt(id) }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (item.ownerId !== owner_id) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own items" });
        }

        // 2. Proceed with deletion
        await prisma.lostItem.delete({
            where: { item_id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: "Item deleted successfully from the database"
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};