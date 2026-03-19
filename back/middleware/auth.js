const User = require("../models/user.model")
const jwt = require('jsonwebtoken')

exports.auth = async(req,res,next)=>{
    try {
        const authHeader = req.header("Authorization")
        if(!authHeader){
            return res.status(401).json({ status: 401, message: "Token Is Required" })
        }
        
        let token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({ status: 401, message: "Token Is Required" })
        }

        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Token invalid"
                });
            }
            
            const USERS = await User.findOne({ _id: decoded.id });
            if (!USERS) {
                return res.status(404).json({
                    success: false,
                    message: "User not found..!!"
                });
            }
            req.user = USERS;
            next();
        });
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

exports.isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Super_Admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Super Admin only." });
    }
};

exports.isSchoolAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'School_Admin' || req.user.role === 'Super_Admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. School Admin or Super Admin only." });
    }
};