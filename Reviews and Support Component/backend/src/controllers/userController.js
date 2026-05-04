const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        
        if (role) {
            query.role = role;
        }
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        const users = await User.find(query).select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
