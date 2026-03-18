
const express = require('express');
const router = express.Router();

const { upload } = require('../middleware/upload');
const { createUser, login, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');

// auth
router.post('/register', upload.single("photo"), createUser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify', verifyOtp);
router.post('/change-password',changePassword);

router.post('/generatenewtoken',auth,generateNewToken);




// user
router.get('/users',  getAllUsers);
router.get('/users/:id',  getSingleUser);
router.delete('/users/:id', auth, deleteUser);
router.put('/users/:id',  updateUser);

module.exports = router;