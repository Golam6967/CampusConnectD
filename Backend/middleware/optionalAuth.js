const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');

/**
 * Optional authentication middleware
 * Captures user info if token is present, but allows anonymous access
 * Sets req.verifiedUser if authenticated, otherwise leaves it undefined
 */
exports.optionalAuth = async (req, res, next) => {
   
    const authHeader = req.headers['authorization'];
    
    // No auth header = anonymous user, continue without error
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.verifiedUser = null;
        console.log("Optional auth: No auth header, treating as anonymous");
        return next();
    }
     

    const token = authHeader.split(' ')[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await prisma.users.findUnique({
            where: { email: decode.email },
            select: { users_id: true, email: true, user_name: true }
        });

        if (user) {
            req.verifiedUser = {
                ...decode,
                user_id: user.users_id,
                user_name: user.user_name
            };
            // console.log(req.verifiedUser)
        } else {
            req.verifiedUser = null;
          
        }
        console.log(user.users_id)
        // console.log("Ettuk to asche")
        return next();

        
        
    } catch (error) {
        // Invalid token = treat as anonymous
        console.log("Ki je Error")
        console.warn("Optional auth: Invalid token, treating as anonymous");
        req.verifiedUser = null;
        next();
    }
};
