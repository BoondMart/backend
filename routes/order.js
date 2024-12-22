// const express = require('express');
// const asyncHandler = require('express-async-handler');
// const router = express.Router();
// const Order = require('../model/order');

// // Get all orders
// router.get('/', asyncHandler(async (req, res) => {
//     try {
//         const orders = await Order.find()
//         .populate('couponCode', 'id couponCode discountType discountAmount')
//         .populate('userID', 'id name').sort({ _id: -1 });
//         res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));


// router.get('/orderByUserId/:userId', asyncHandler(async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const orders = await Order.find({ userID: userId })
//             .populate('couponCode', 'id couponCode discountType discountAmount')
//             .populate('userID', 'id name')
//             .sort({ _id: -1 });
//         res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));


// // Get an order by ID
// router.get('/:id', asyncHandler(async (req, res) => {
//     try {
//         const orderID = req.params.id;
//         const order = await Order.findById(orderID)
//         .populate('couponCode', 'id couponCode discountType discountAmount')
//         .populate('userID', 'id name');
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found." });
//         }
//         res.json({ success: true, message: "Order retrieved successfully.", data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Create a new order
// router.post('/', asyncHandler(async (req, res) => {
//     const { userID,orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl } = req.body;
//     if (!userID || !items || !totalPrice || !shippingAddress || !paymentMethod || !orderTotal) {
//         return res.status(400).json({ success: false, message: "User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required." });
//     }

//     try {
//         const order = new Order({ userID,orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl });
//         const newOrder = await order.save();
//         res.json({ success: true, message: "Order created successfully.", data: null });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Update an order
// router.put('/:id', asyncHandler(async (req, res) => {
//     try {
//         const orderID = req.params.id;
//         const { orderStatus, trackingUrl } = req.body;
//         if (!orderStatus) {
//             return res.status(400).json({ success: false, message: "Order Status required." });
//         }

//         const updatedOrder = await Order.findByIdAndUpdate(
//             orderID,
//             { orderStatus, trackingUrl },
//             { new: true }
//         );

//         if (!updatedOrder) {
//             return res.status(404).json({ success: false, message: "Order not found." });
//         }

//         res.json({ success: true, message: "Order updated successfully.", data: null });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// // Delete an order
// router.delete('/:id', asyncHandler(async (req, res) => {
//     try {
//         const orderID = req.params.id;
//         const deletedOrder = await Order.findByIdAndDelete(orderID);
//         if (!deletedOrder) {
//             return res.status(404).json({ success: false, message: "Order not found." });
//         }
//         res.json({ success: true, message: "Order deleted successfully." });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

// module.exports = router;

const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Order = require('../model/order');
const mongoose = require("mongoose");

// Get all orders
// router.get('/', asyncHandler(async (req, res) => {
//     try {
//         const orders = await Order.find()
//             .populate('couponCode', '_id couponCode discountType discountAmount')
//             .populate('userID', '_id fullName email phone image') // Added more user fields
//             .populate('riderId', '_id name phone') // Optional: Also populate rider details
//             .sort({ _id: -1 });
//         res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }));

router.get('/', asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
           .populate({
                path: 'couponCode',
                model: 'Coupon', // Explicitly specify the model
                select: '_id couponCode discountType discountAmount minimumPurchaseAmount endDate status'
            })
            .populate('userID', '_id fullName email phone image')
            .populate('riderId', '_id name phone')
            .sort({ _id: -1 });

        // Add debug logging
        console.log('Orders with coupons:', orders.map(order => ({
            orderId: order._id,
            couponData: order.couponCode
        })));

        res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}));




// Get orders by user ID
router.get('/orderByUserId/:userId', asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userID: userId })
            .populate('couponCode', 'id couponCode discountType discountAmount')
            .populate('userID', 'id name')
            .sort({ _id: -1 });
        res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get an order by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const orderID = req.params.id;
        const order = await Order.findById(orderID)
            .populate('couponCode', 'id couponCode discountType discountAmount')
            .populate('userID', 'id name');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order retrieved successfully.", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Create a new order
router.post('/', asyncHandler(async (req, res) => {
    const { userID,riderId, orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl } = req.body;
    if (!userID || !riderId || !items || !totalPrice || !couponCode || !shippingAddress || !paymentMethod || !orderTotal) {
        return res.status(400).json({ success: false, message: "User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required." });
    }

    try {
        const order = new Order({ userID,riderId, orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl });
        const newOrder = await order.save();
        res.json({ success: true, message: "Order created successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Update an order
router.put('/:id', asyncHandler(async (req, res) => {
    try {
        const orderID = req.params.id;
        const { orderStatus, trackingUrl } = req.body;
        if (!orderStatus) {
            return res.status(400).json({ success: false, message: "Order Status required." });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderID,
            { orderStatus, trackingUrl },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.json({ success: true, message: "Order updated successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Delete an order
router.delete('/:id', asyncHandler(async (req, res) => {
    try {
        const orderID = req.params.id;
        const deletedOrder = await Order.findByIdAndDelete(orderID);
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Add a review to an order
router.post('/:id/review', asyncHandler(async (req, res) => {
    try {
        const orderID = req.params.id;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }

        const order = await Order.findById(orderID);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({ success: false, message: "Review can only be added for delivered orders." });
        }

        order.review = { rating, comment, reviewedAt: new Date() };
        await order.save();

        res.json({ success: true, message: "Review added successfully.", data: order.review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

module.exports = router;
