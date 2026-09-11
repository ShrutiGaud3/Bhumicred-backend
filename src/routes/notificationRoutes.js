import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  broadcastNotification,
  createSupportTicket,
  getUserSupportTickets,
  getAllSupportTicketsAdmin,
  updateSupportTicket,
  replyToSupportTicket,
} from '../controllers/notificationController.js';
import { authenticateToken, optionalAuthenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// ================= NOTIFICATION ROUTES ================= //
// Get all notifications (allows optional authentication so public/demo can see role notifications)
router.get('/', optionalAuthenticate, getNotifications);
router.get('/unread-count', optionalAuthenticate, getUnreadCount);
router.patch('/:id/read', optionalAuthenticate, markNotificationRead);
router.post('/mark-all-read', optionalAuthenticate, markAllNotificationsRead);
router.delete('/:id', optionalAuthenticate, deleteNotification);

// Admin Broadcast Notification
router.post(
  '/broadcast',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  broadcastNotification
);

// Support ticket paths mounted on both /api/v1/notifications and /api/v1/support:
router.post('/ticket', optionalAuthenticate, createSupportTicket);
router.post('/tickets', optionalAuthenticate, createSupportTicket);
router.post('/support/ticket', optionalAuthenticate, createSupportTicket);
router.post('/support/tickets', optionalAuthenticate, createSupportTicket);

router.get('/my-tickets', optionalAuthenticate, getUserSupportTickets);
router.get('/tickets/my', optionalAuthenticate, getUserSupportTickets);
router.get('/support/my-tickets', optionalAuthenticate, getUserSupportTickets);

router.get(
  '/admin/all',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  getAllSupportTicketsAdmin
);
router.get(
  '/support/admin/all',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  getAllSupportTicketsAdmin
);

router.patch(
  '/ticket/:id',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  updateSupportTicket
);
router.patch(
  '/support/ticket/:id',
  authenticateToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN_STAFF),
  updateSupportTicket
);

router.post('/ticket/:id/reply', optionalAuthenticate, replyToSupportTicket);
router.post('/support/ticket/:id/reply', optionalAuthenticate, replyToSupportTicket);

export default router;
