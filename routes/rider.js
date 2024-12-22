const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const bcrypt = require('bcrypt'); // For password hashing
const Order = require('../model/order');
const Rider = require('../model/my/rider');

// Get All Riders
router.get('/', asyncHandler(async (req, res) => {
    try {
        const riders = await Rider.find()
            .select('-password') // Exclude password field
            .sort({ created_at: -1 });
        res.json({ success: true, message: "All riders retrieved successfully.", data: riders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get Rider by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.id)
            .select('-password')
            .populate('orders');
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }
        res.json({ success: true, message: "Rider retrieved successfully.", data: rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Create a New Rider
router.post('/', asyncHandler(async (req, res) => {
    const {
        name,
        phone_number,
        vehicle_details,
        email,
        password,
        image,
        dateOfBirth,
        gender,
        addresses
    } = req.body;

    // Validate required fields
    if (!name || !phone_number || !vehicle_details || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, phone number, vehicle details, email, and password are required."
        });
    }

    try {
        // Check if phone number or email already exists
        const existingRider = await Rider.findOne({
            $or: [{ phone_number }, { email }]
        });

        if (existingRider) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email already registered."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newRider = new Rider({
            name,
            phone_number,
            vehicle_details,
            email,
            password: hashedPassword,
            image,
            dateOfBirth,
            gender,
            addresses
        });

        await newRider.save();
        
        // Exclude password from response
        const riderResponse = newRider.toObject();
        delete riderResponse.password;
        
        res.json({ success: true, message: "Rider created successfully.", data: riderResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Update Rider by ID

// router.put('/:id', asyncHandler(async (req, res) => {
//     try {
//         const updatedRider = await Rider.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );

//         if (!updatedRider) {
//             return res.status(404).json({ success: false, message: "Rider not found." });
//         }

//         res.json({ success: true, message: "Rider updated successfully.", data: updatedRider });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));


router.put('/:id', asyncHandler(async (req, res) => {
    try {
        const {
            name,
            phone_number,
            vehicle_details,
            email,
            password,
            image,
            dateOfBirth,
            gender,
            addresses,
            current_status  // Add this field
        } = req.body;

        // Find rider first to check if exists
        const existingRider = await Rider.findById(req.params.id);
        if (!existingRider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        // If updating email or phone, check for duplicates
        if (email || phone_number) {
            const duplicateCheck = await Rider.findOne({
                _id: { $ne: req.params.id }, // exclude current rider
                $or: [
                    { email: email || '' },
                    { phone_number: phone_number || '' }
                ]
            });

            if (duplicateCheck) {
                return res.status(400).json({
                    success: false,
                    message: "Email or phone number already exists for another rider."
                });
            }
        }

        // Create update object
        const updateData = {};
        if (name) updateData.name = name;
        if (phone_number) updateData.phone_number = phone_number;
        if (vehicle_details) updateData.vehicle_details = vehicle_details;
        if (email) updateData.email = email;
        if (image) updateData.image = image;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (gender) updateData.gender = gender;
        if (addresses) updateData.addresses = addresses;
        if (current_status) updateData.current_status = current_status; // Add this line

        // Handle password update separately
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedRider = await Rider.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password'); // Exclude password from response

        res.json({
            success: true,
            message: "Rider updated successfully.",
            data: updatedRider
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}));

// Add a separate route specifically for status updates
router.put('/:id/status', asyncHandler(async (req, res) => {
    try {
        const { current_status } = req.body;
        
        if (!current_status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // Validate status value
        const validStatuses = ['Available', 'Busy', 'Inactive'];
        if (!validStatuses.includes(current_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const updatedRider = await Rider.findByIdAndUpdate(
            req.params.id,
            { current_status },
            { new: true }
        ).select('-password');

        if (!updatedRider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found"
            });
        }

        res.json({
            success: true,
            message: "Rider status updated successfully.",
            data: updatedRider
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}));





// Delete Rider by ID
router.delete('/:id', asyncHandler(async (req, res) => {
    try {
        const deletedRider = await Rider.findByIdAndDelete(req.params.id);
        if (!deletedRider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }
        res.json({ success: true, message: "Rider deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Assign an Order to a Rider
router.put('/assignOrder/:orderId', asyncHandler(async (req, res) => {
    const { riderId } = req.body;

    if (!riderId) {
        return res.status(400).json({ success: false, message: "Rider ID is required." });
    }

    try {
        const rider = await Rider.findById(riderId);
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        if (rider.current_status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: "Rider is not available for new orders."
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            {
                rider: riderId,
                status: 'Assigned'
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Update rider's orders array and status
        await Rider.findByIdAndUpdate(riderId, {
            $push: { orders: updatedOrder._id },
            current_status: 'Busy'
        });

        res.json({ success: true, message: "Order assigned to rider successfully.", data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get All Orders for a Specific Rider
router.get('/:id/orders', asyncHandler(async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.id)
            .select('-password')
            .populate('orders');

        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        res.json({ success: true, message: "Rider's orders retrieved successfully.", data: rider.orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Update Order Status by Rider
router.put('/:riderId/updateOrder/:orderId', asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: "Order status is required." });
    }

    try {
        const rider = await Rider.findById(req.params.riderId);
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // If order is completed, update rider status to Available
        if (status === 'Delivered' || status === 'Cancelled') {
            await Rider.findByIdAndUpdate(req.params.riderId, {
                current_status: 'Available'
            });
        }

        res.json({ success: true, message: `Order status updated to '${status}'.`, data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

module.exports = router;