const mongoose = require('mongoose');

mongoose.set('strictPopulate', false);

const connectDb = async (req, res) => {
    try {
        await mongoose
            .connect(process.env.MONGODB_PATH || "mongodb+srv://mehulkalathiyainfotech:euMEtsN4B8ZfmXCk@cluster0.lhctupx.mongodb.net/school-management")
            .then(() => console.log('DB Is Connected...'))
    } catch (error) { 
        console.log(error);
        return res.json({ status: 500, message: error.message });
    }
}
 
module.exports = connectDb;