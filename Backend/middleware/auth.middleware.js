const jwt = require('jsonwebtoken');

exports.generate = async (user, res) => {

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);

    const isDev = process.env.NODE_ENV !== "production";

 

    return token;
};
