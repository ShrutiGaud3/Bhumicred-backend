import Notification from '../models/Notification.js';
import SupportTicket from '../models/SupportTicket.js';

class NotificationService {
  /**
   * Seed default notifications if user/role has no active notifications (No-op in production/clean state)
   */
  async seedDefaultNotificationsIfEmpty(userId, role) {
    // Clean dynamic notifications only - no mock seeding
    return;
  }

  /**
   * Get all notifications for a specific user and role
   */
  async getUserNotifications(userId, role = 'FARMER', filter = 'ALL') {

    const query = {
      $or: [
        ...(userId ? [{ userId }] : []),
        { targetRole: { $in: [role, 'ALL', ...(role === 'SUPER_ADMIN' ? ['GOVERNMENT', 'PARTNER', 'FARMER', 'ADMIN_STAFF'] : [])] } },
      ],
    };

    const rawNotifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();

    const formatted = rawNotifications.map((notif) => {
      let isRead = false;
      if (notif.userId && userId && notif.userId.toString() === userId.toString()) {
        isRead = !!notif.isRead;
      } else if (userId && Array.isArray(notif.readBy)) {
        isRead = notif.readBy.some((r) => r.userId && r.userId.toString() === userId.toString());
      }

      return {
        ...notif,
        id: notif._id.toString(),
        read: isRead,
      };
    });

    if (filter === 'UNREAD') {
      return formatted.filter((n) => !n.read);
    }
    if (filter === 'PRIORITY') {
      return formatted.filter((n) => n.priority === 'HIGH' || n.priority === 'URGENT');
    }

    return formatted;
  }

  /**
   * Get total unread count
   */
  async getUnreadCount(userId, role = 'FARMER') {
    const list = await this.getUserNotifications(userId, role, 'ALL');
    return list.filter((n) => !n.read).length;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notif = await Notification.findById(notificationId);
    if (!notif) throw new Error('Notification not found');

    if (notif.userId && userId && notif.userId.toString() === userId.toString()) {
      notif.isRead = true;
    } else if (userId) {
      const alreadyRead = notif.readBy.some((r) => r.userId && r.userId.toString() === userId.toString());
      if (!alreadyRead) {
        notif.readBy.push({ userId, readAt: new Date() });
      }
    } else {
      notif.isRead = true;
    }

    await notif.save();
    return { success: true, notificationId };
  }

  /**
   * Mark all notifications for the user as read
   */
  async markAllAsRead(userId, role = 'FARMER') {
    if (!userId) return { success: true, count: 0 };

    // 1. Direct user notifications
    await Notification.updateMany({ userId }, { $set: { isRead: true } });

    // 2. Broadcast notifications
    const broadcastNotifs = await Notification.find({
      userId: null,
      targetRole: { $in: [role, 'ALL', ...(role === 'SUPER_ADMIN' ? ['GOVERNMENT', 'PARTNER', 'FARMER', 'ADMIN_STAFF'] : [])] },
      'readBy.userId': { $ne: userId },
    });

    for (const notif of broadcastNotifs) {
      notif.readBy.push({ userId, readAt: new Date() });
      await notif.save();
    }

    return { success: true, count: broadcastNotifs.length };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    await Notification.findByIdAndDelete(notificationId);
    return { success: true, notificationId };
  }

  /**
   * Create a new notification (internal trigger or admin broadcast)
   */
  async createNotification(data) {
    const newNotif = await Notification.create(data);
    return newNotif;
  }

  /**
   * Support Tickets: Create ticket
   */
  async createSupportTicket(ticketData) {
    const ticketCount = await SupportTicket.countDocuments();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-BC-${new Date().getFullYear()}-${String(ticketCount + 1).padStart(4, '0')}${randomSuffix}`;

    const ticket = await SupportTicket.create({
      ...ticketData,
      ticketId,
    });

    // Also trigger an automated notification for admin
    await Notification.create({
      targetRole: 'SUPER_ADMIN',
      title: `New Support Grievance #${ticketId}`,
      message: `${ticket.name} (${ticket.category}): "${ticket.subject || ticket.message.slice(0, 60)}..."`,
      category: 'SUPPORT',
      priority: ticket.priority || 'HIGH',
      link: '/support',
      metadata: { ticketId: ticket.ticketId },
    });

    return ticket;
  }

  /**
   * Support Tickets: Get user tickets
   */
  async getUserTickets(userId, mobile = '') {
    const query = {
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    };

    if (query.$or.length === 0) return [];

    return await SupportTicket.find(query).sort({ createdAt: -1 });
  }

  /**
   * Support Tickets: Get all tickets (Admin)
   */
  async getAllTickets(filter = {}) {
    const query = {};
    if (filter.status && filter.status !== 'ALL') {
      query.status = filter.status;
    }
    if (filter.category && filter.category !== 'ALL') {
      query.category = filter.category;
    }
    return await SupportTicket.find(query).sort({ createdAt: -1 });
  }

  /**
   * Support Tickets: Update ticket status
   */
  async updateTicketStatus(ticketId, { status, resolutionNotes, assignedTo }) {
    const update = {};
    if (status) update.status = status;
    if (resolutionNotes) update.resolutionNotes = resolutionNotes;
    if (assignedTo) update.assignedTo = assignedTo;

    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketId },
      { $set: update },
      { new: true }
    );

    if (!ticket) throw new Error('Support ticket not found');

    // Notify user if ticket has a linked userId
    if (ticket.userId) {
      await Notification.create({
        userId: ticket.userId,
        title: `Grievance #${ticket.ticketId} Updated`,
        message: `Status updated to ${ticket.status}. ${resolutionNotes ? `Note: ${resolutionNotes}` : ''}`,
        category: 'SUPPORT',
        priority: 'NORMAL',
        link: '/support',
        metadata: { ticketId: ticket.ticketId },
      });
    }

    return ticket;
  }

  /**
   * Support Tickets: Add response
   */
  async addTicketResponse(ticketId, { senderId, senderName, senderRole, message }) {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) throw new Error('Support ticket not found');

    ticket.responses.push({
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: new Date(),
    });

    if (senderRole === 'SUPER_ADMIN' || senderRole === 'ADMIN_STAFF') {
      ticket.status = 'IN_REVIEW';
    }

    await ticket.save();
    return ticket;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
