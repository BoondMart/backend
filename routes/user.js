// const express = require('express');
// const asyncHandler = require('express-async-handler');
// const router = express.Router();
// const User = require('../model/user');

// // Get all users
// router.get('/', asyncHandler(async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json({ success: true, message: "Users retrieved successfully.", data: users });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // login
// router.post('/login', async (req, res) => {
//     const { name, password } = req.body;

//     try {
//         // Check if the user exists
//         const user = await User.findOne({ name });


//         if (!user) {
//             return res.status(401).json({ success: false, message: "Invalid name or password." });
//         }
//         // Check if the password is correct
//         if (user.password !== password) {
//             return res.status(401).json({ success: false, message: "Invalid name or password." });
//         }

//         // Authentication successful
//         res.status(200).json({ success: true, message: "Login successful.",data: user });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// });


// // Get a user by ID
// router.get('/:id', asyncHandler(async (req, res) => {
//     try {
//         const userID = req.params.id;
//         const user = await User.findById(userID);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }
//         res.json({ success: true, message: "User retrieved successfully.", data: user });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Create a new user
// router.post('/register', asyncHandler(async (req, res) => {
//     const { name, password } = req.body;
//     if (!name || !password) {
//         return res.status(400).json({ success: false, message: "Name, and password are required." });
//     }

//     try {
//         const user = new User({ name, password });
//         const newUser = await user.save();
//         res.json({ success: true, message: "User created successfully.", data: newUser });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Update a user
// router.put('/:id', asyncHandler(async (req, res) => {
//     try {
//         const userID = req.params.id;
//         const { name, password } = req.body;
//         if (!name || !password) {
//             return res.status(400).json({ success: false, message: "Name,  and password are required." });
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             userID,
//             { name, password },
//             { new: true }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }

//         res.json({ success: true, message: "User updated successfully.", data: updatedUser });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Delete a user
// router.delete('/:id', asyncHandler(async (req, res) => {
//     try {
//         const userID = req.params.id;
//         const deletedUser = await User.findByIdAndDelete(userID);
//         if (!deletedUser) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }
//         res.json({ success: true, message: "User deleted successfully." });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// module.exports = router;


const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Get all users
router.get('/', asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.json({ success: true, message: "Users retrieved successfully.", data: users });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Email and password are required." 
        });
    }

    // Include password in this query explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid email or password." 
        });
    }

    // Use the comparePassword method we defined in the schema
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid email or password." 
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    // Remove password from response
    const userObject = user.toJSON();

    res.status(200).json({
        success: true,
        message: "Login successful.",
        data: { user: userObject, token }
    });
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('orders')
        .populate('reviews');

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: "User not found." 
        });
    }

    res.json({ 
        success: true, 
        message: "User retrieved successfully.", 
        data: user 
    });
}));

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        phone,
        password,
        dateOfBirth,
        gender,
        image,
        addresses
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !phone || !addresses || !addresses.length) {
        return res.status(400).json({
            success: false,
            message: "Required fields missing. Need fullName, email, password, phone, and at least one address."
        });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already registered."
        });
    }

    const user = new User({
        fullName,
        email,
        phone,
        password,
        dateOfBirth,
        gender,
        image,
        addresses
    });

    const newUser = await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: { user: newUser, token }
    });
}));

// Update user
router.put('/:id', asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        dateOfBirth,
        gender,
        image,
        addresses
    } = req.body;

    // Prevent email updates for security
    if (req.body.email) {
        return res.status(400).json({
            success: false,
            message: "Email cannot be updated."
        });
    }

    const updates = {
        fullName,
        phone,
        dateOfBirth,
        gender,
        image,
        addresses
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
        updates[key] === undefined && delete updates[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    res.json({
        success: true,
        message: "User updated successfully.",
        data: updatedUser
    });
}));

// Update password
router.put('/:id/password', asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Current password is incorrect."
        });
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: "Password updated successfully."
    });
}));

// Add new address
router.post('/:id/addresses', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    user.addresses.push(req.body);
    await user.save();

    res.json({
        success: true,
        message: "Address added successfully.",
        data: user
    });
}));

// Delete user
router.delete('/:id', asyncHandler(async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    res.json({
        success: true,
        message: "User deleted successfully."
    });
}));

module.exports = router;