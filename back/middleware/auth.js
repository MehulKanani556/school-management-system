const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
exports.auth = async(req,res,next)=>{

    try {

        const authHeader = req.header("Authorization")

        let token = authHeader.split(' ')[1];
        
    
       
         if(!token){
            return res.status(404).json({ status: 404, message: "Token Is Required" })
         }
         jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
            console.log('JWT error:', err);
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