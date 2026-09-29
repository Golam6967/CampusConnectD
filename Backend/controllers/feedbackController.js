const Feedback = require("../models/Feedback");
const { validationResult } = require("express-validator");
const { createNotification } = require('../utils/notificationHelper');

// POST /api/feedback
exports.createFeedback = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { category, title, message } = req.body;
        console.log('[Feedback] Creating:', { category, title, message, userId: req.verifiedUser?.user_id });

        const feedback = await Feedback.create({
            category,
            title,
            message,
            // Store submitterId if user is authenticated (for notifications)
            submitterId: req.verifiedUser?.user_id || null
        });

        // Broadcast a notification to all users about the new feedback post
        await createNotification(
            'feedback',
            'New Anonymous Feedback Posted 📢',
            `A new feedback post was created in the "${category}" category.`,
            'all', // Send to everyone
            { feedbackId: feedback._id.toString(), isNewPostBroadcast: true }
        );

        res.status(201).json(feedback);
    } catch (error) {
        console.error('[Feedback] Create error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getFeedbackByCategory = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({
            category: req.params.category
        }).sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/feedback/:id - Get single feedback with comments
exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json(feedback);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// POST /api/feedback/:id/comments - Add a comment to feedback
exports.addComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { author, message } = req.body;

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const newComment = {
            author: author || "Anonymous",
            message,
            createdAt: new Date()
        };

        feedback.comments.push(newComment);
        await feedback.save();

        // Notify the feedback submitter if they are a known user (not anonymous)
        if (feedback.submitterId) {
            console.log('[Feedback] Sending comment notification:', {
                submitterId: feedback.submitterId,
                commenterId: req.verifiedUser?.user_id,
                willExclude: req.verifiedUser?.user_id === feedback.submitterId
            });
            await createNotification(
                'feedback',
                'New Comment on Your Feedback',
                `Someone commented on your feedback "${feedback.title || feedback.message.slice(0, 40)}...".`,
                feedback.submitterId,
                { feedbackId: feedback._id.toString() },
                req.verifiedUser?.user_id  // Exclude the commenter from notification
            );
        } else {
            console.log('[Feedback] No notification sent - feedback is anonymous (no submitterId)');
        }

        res.status(201).json(feedback);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE /api/feedback/:feedbackId/comments/:commentId - Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { feedbackId, commentId } = req.params;

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const commentIndex = feedback.comments.findIndex(
            comment => comment._id.toString() === commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" });
        }

        feedback.comments.splice(commentIndex, 1);
        await feedback.save();

        res.json({ message: "Comment deleted successfully", feedback });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Invalid ID" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// POST /api/feedback/:id/like - Like a feedback
exports.likeFeedback = async (req, res) => {
    console.log("Like e asche")
    try {
        // Get userId from authenticated user or req.body (backwards compatibility)
        const userId = String(req.verifiedUser?.user_id || req.body.userId);

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "User ID required" });
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Check if user already liked this feedback (normalize to string for type-safe comparison)
        if (feedback.likes.map(String).includes(userId)) {
            return res.status(400).json({ message: "Already liked" });
        }

        feedback.likes.push(userId);
        await feedback.save();

        // Notify the feedback submitter if they are a known user and not the liker
        if (feedback.submitterId && String(feedback.submitterId) !== String(userId)) {
            await createNotification(
                'feedback',
                'Your Feedback Was Liked 👍',
                `Someone liked your feedback "${feedback.title || feedback.message.slice(0, 40)}...".`,
                feedback.submitterId,
                { feedbackId: feedback._id.toString() },
                userId  // Exclude the person who liked it
            );
        }

        res.json(feedback);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Feedback not found" });
        }
        console.error('[Feedback] Like error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

// POST /api/feedback/:id/unlike - Unlike a feedback
exports.unlikeFeedback = async (req, res) => {
    console.log("Unlike feedback")
    try {
        // Get userId from authenticated user or req.body (backwards compatibility)
        const userId = String(req.verifiedUser?.user_id || req.body.userId);
        console.log("Unlike feedback", userId)

        if (!userId || userId === 'undefined') {
            console.log("User ID required")
            return res.status(400).json({ message: "User ID required" });
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            console.log("Feedback not found")
            return res.status(404).json({ message: "Feedback not found" });
        }

        // Remove userId from likes array (normalize to string for type-safe comparison)
        feedback.likes = feedback.likes.map(String).filter(id => id !== userId);
        await feedback.save();

        res.json(feedback);
    } catch (error) {
        console.log('Error in unlike feedback')
        if (error.kind === "ObjectId") {
            console.log("Feedback not found")
            return res.status(404).json({ message: "Feedback not found" });
        }
        console.error('[Feedback] Unlike error:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

// POST /api/feedback/:feedbackId/comments/:commentId/like - Like a comment
exports.likeComment = async (req, res) => {
    try {
        const { feedbackId, commentId } = req.params;
        const userId = String(req.verifiedUser?.user_id || req.body.userId);

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "User ID required" });
        }

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const comment = feedback.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user already liked this comment
        if (comment.likes.includes(userId)) {
            return res.status(400).json({ message: "Already liked" });
        }

        comment.likes.push(userId);
        await feedback.save();

        res.json(feedback);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Invalid ID" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// POST /api/feedback/:feedbackId/comments/:commentId/unlike - Unlike a comment
exports.unlikeComment = async (req, res) => {
    try {
        const { feedbackId, commentId } = req.params;
        const userId = String(req.verifiedUser?.user_id || req.body.userId);

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "User ID required" });
        }

        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const comment = feedback.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Remove userId from comment likes array
        comment.likes = comment.likes.filter(id => id !== userId);
        await feedback.save();

        res.json(feedback);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "Invalid ID" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};
