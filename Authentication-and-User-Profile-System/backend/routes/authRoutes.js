const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    registerValidation, 
    loginValidation 
} = require('../controllers/authController');
const { validateRequest } = require('../middleware/validationMiddleware');

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);

module.exports = router;
