const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');

const protectUser = async (req, res, next) => {
    try {
        let token
        console.log("DEBUG1", req.headers.authorization)

        console.log('token')
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            console.log("DEBUG", req.headers)
            token = req.headers.authorization.split(' ')[1]

            if (token === 'undefined' || token === '') {
                res.status(200).send({ message: "Token not available" })

            } else {
                try {
                    console.log("DEBUG2")
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    req.payload = decoded;
                    console.log("Debug:", req.payload)
                    next();
                } catch (err) {
                    if (err.name === 'TokenExpiredError') {
                        res.status(401).send({ message: "Token Expired" });
                    }
                }
            }
        }
    } catch (err) {
        console.log(err.message)
        res.status(500).send(err.message)
    }
}

module.exports = { protectUser }