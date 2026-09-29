const express = require('express');
const router = express.Router();
const {
    createPost,
    getPosts,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost,
    submitPreOrder,
    verifyPreOrder,
    markPreOrderCollected,
    markProductReady,
    togglePreOrder,
    getPreOrders,
    getMyOrders
} = require('../controllers/marketplaceController');
const { verifyToken } = require('../middleware/VerifyToken');

// Apply verifyToken middleware to all routes in this router
router.use(verifyToken);

// /api/marketplace
router.route('/')
    .post(createPost)
    .get(getPosts);

// /api/marketplace/my-posts
router.route('/my-posts')
    .get(getMyPosts);

// /api/marketplace/my-orders
router.route('/my-orders')
    .get(getMyOrders);

// /api/marketplace/:id
router.route('/:id')
    .get(getPostById)
    .put(updatePost)
    .delete(deletePost);

// Pre-order routes
// /api/marketplace/:id/pre-order
router.route('/:id/pre-order')
    .post(submitPreOrder);

// /api/marketplace/:id/pre-orders
router.route('/:id/pre-orders')
    .get(getPreOrders);

// /api/marketplace/:id/pre-order/:preOrderId/verify
router.route('/:id/pre-order/:preOrderId/verify')
    .put(verifyPreOrder);

// /api/marketplace/:id/pre-order/:preOrderId/collect
router.route('/:id/pre-order/:preOrderId/collect')
    .put(markPreOrderCollected);

// /api/marketplace/:id/mark-ready
router.route('/:id/mark-ready')
    .put(markProductReady);

// /api/marketplace/:id/toggle-preorder
router.route('/:id/toggle-preorder')
    .put(togglePreOrder);

module.exports = router;
