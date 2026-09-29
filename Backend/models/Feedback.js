const mongoose = require("mongoose");

const CATEGORIES = [
    "Teachers",
    "Classrooms",
    "Authority",
    "Accounts Office",
    "Male Residential Hall Rooms",
    "Female Residential Hall Rooms",
    "Male Residential Hall Food",
    "Female Residential Hall Food",
    "Non-Residential Cafeteria Food",
    "Course Outline of a Department",
    "Bus Service",
    "Central Departmental Store",
    "Rocket (Small) Departmental Store",
    "Male Hall Gymnasium",
    "Female Hall Gymnasium",
    "Central Gymnasium",
    "Sports",
    "Others"
];

const commentSchema = new mongoose.Schema(
    {
        author: {
            type: String,
            default: "Anonymous",
            trim: true,
            maxlength: 50
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 500
        },
        likes: {
            type: [String],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: true
    }
);

const feedbackSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: CATEGORIES,
            required: true
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100
        },
        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 5
        },
        likes: {
            type: [String],
            default: []
        },
        comments: {
            type: [commentSchema],
            default: []
        },
        // Optional: set when the submitter is a logged-in user (link to Postgres users_id)
        submitterId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
