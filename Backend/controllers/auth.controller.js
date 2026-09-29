const bcrypt = require('bcrypt');
const prisma = require('../src/config/prisma.js')
const generateJWT = require('../middleware/auth.middleware.js');
const adminAuth = require('../firebase.js'); // imported correctly
const e = require('express');

exports.googleSignin = async (req, res) => {
    const firebaseIdToken = req.body.token;
    const REQUIRED_DOMAIN = 'iut-dhaka.edu';

    if (!firebaseIdToken) {
        return res.status(400).json({ error: 'Token is missing.' });
    }

    try {
        // VALIDATED UNDER NEW SDK
        const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);

        const userEmail = decodedToken.email;
        const firebaseUID = decodedToken.uid;

        const domain = userEmail.split('@').pop();

        // if (domain !== REQUIRED_DOMAIN) {
        //     await adminAuth.revokeRefreshTokens(firebaseUID);
        //     return res.status(403).json({
        //         error: 'Unauthorized Domain',
        //         message: `Only @${REQUIRED_DOMAIN} email allowed.`,
        //     });
        // }

        const token = await generateJWT.generate(decodedToken, res);
        console.log("Generated JWT:", token);
        const user = await prisma.users.upsert({
            where: { email: userEmail },

            update: {
            },

            create: {
                user_name: decodedToken.name || userEmail.split('@')[0],
                email: userEmail
            },

            select: {
                users_id: true,
                email: true,
                user_name: true,
                phone_number: true,
                image: true,
                gender: true,
                dept: true,
                batch: true,
                student_id: true
            }
        });

        user.token = token;
        console.log('this is the user', user)

        res.status(200).json({
            message: "Google Login Successful", user
        });

    } catch (error) {
        console.error("Authentication Error:", error);
        res.status(401).json({
            error: "Invalid Firebase token",
            message: "There was some Error",
        });
    }
};

exports.logout = async (req, res) => {
    try {
        req.cookies['token'] = '';
        console.log('done')
        res.status(200).json({ success: true, message: "Successfully logged out" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error while logging out" })

    }



}
exports.getMe = async (req, res) => {
    try {
        const userId = req.verifiedUser.user_id;
        const user = await prisma.users.findUnique({
            where: { users_id: userId },
            select: {
                users_id: true,
                user_name: true,
                email: true,
                phone_number: true,
                image: true,
                gender: true,
                dept: true,
                batch: true,
                student_id: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Server error while fetching user data" });
    }
};
exports.updateUserProfile = async (req, res) => {
    try {
        const { user_name, phone_number, image, gender, dept, batch, student_id } = req.body;
        const userId = req.verifiedUser.user_id;

        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found in session." });
        }

        const updatedUser = await prisma.users.update({
            where: {
                users_id: userId
            },
            data: {
                ...(user_name && { user_name }),
                ...(phone_number && { phone_number }),
                ...(image && { image }),
                ...(gender && { gender }),
                ...(dept && { dept }),
                ...(batch && { batch }),
                ...(student_id && { student_id })
            },
            select: {
                users_id: true,
                user_name: true,
                email: true,
                phone_number: true,
                gender: true,
                image: true,
                dept: true,
                batch: true,
                student_id: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
// exports.updateUserProfile = async (req, res) => {

//     try {
//         // 1. Destructure 'image' from the request body
//         const { user_name, phone_number, image } = req.body;
//         const userId = req.verifiedUser.user_id;
//         if (!userId) {
//             return res.status(404).json({ success: false, message: "User ID not found in session." });
//         }

//         const updatedUser = await prisma.users.update({
//             where: {
//                 users_id: userId
//             },
//             data: {
//                 ...(user_name && { user_name }),
//                 ...(phone_number && { phone_number }),
//                 // 2. Add the image to the update data
//                 ...(image && { image })
//             },
//             select: {
//                 users_id: true,
//                 user_name: true,
//                 email: true,
//                 phone_number: true,
//                 gender: true,
//                 image: true
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             user: updatedUser
//         });

//     } catch (error) {
//         console.error("UPDATE ERROR:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         });
//     }
// };