const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');
exports.verifyToken = async (req, res, next) => {
    // 1. Extract the Authorization header
    const authHeader = req.headers['authorization'];
    console.log(authHeader)

    // 2. Check if the header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Error: Authorization header missing or incorrectly formatted.");

        return res.status(401).json({
            success: false,
            message: "Authentication required. Please send JWT in the Authorization header."
        });
    }

    // 3. Extract the token string (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    try {

        // 4. Verify the token
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log("TOKEN DECODED:", decode);

        const user = await prisma.users.findUnique({
            where: {
                email: decode.email,
            },
            include: {

            },
        });

        // 5. Attach user data and continue
        decode.user_id = user.users_id
        console.log('ashceh')
        req.verifiedUser = decode
        console.log(decode)
        next()
    }
    catch (error) {
        console.error("Error: Invalid or expired JWT.", error.message);


        return res.status(403).json({
            success: false,
            message: "Invalid token session. Please log in again."
        });
    }

}