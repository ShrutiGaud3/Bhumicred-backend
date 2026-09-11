import notificationService from '../services/notificationService.js';

const getUserId = (req) => req.user?._id || req.user?.id || null;

export const getNotifications = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const role = req.user?.role || 'FARMER';
    const filter = req.query.filter || 'ALL';

    const notifications = await notificationService.getUserNotifications(userId, role, filter);
    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const role = req.user?.role || 'FARMER';

    const unreadCount = await notificationService.getUnreadCount(userId, role);
    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const result = await notificationService.markAsRead(id, userId);
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const role = req.user?.role || 'FARMER';

    const result = await notificationService.markAllAsRead(userId, role);
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id);
    res.json({
      success: true,
      message: 'Notification deleted',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastNotification = async (req, res, next) => {
  try {
    const { targetRole, title, message, category, priority, link, metadata } = req.body;

    const notif = await notificationService.createNotification({
      targetRole: targetRole || 'ALL',
      title,
      message,
      category: category || 'SYSTEM',
      priority: priority || 'NORMAL',
      link: link || '',
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Notification broadcasted successfully',
      data: notif,
    });
  } catch (error) {
    next(error);
  }
};

// ================= SUPPORT / GRIEVANCES ================= //

export const createSupportTicket = async (req, res, next) => {
  try {
    const { name, email, mobile, category, subject, message, priority } = req.body;
    const userId = getUserId(req);

    if (!name || !mobile || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number, and message are required fields',
      });
    }

    const ticket = await notificationService.createSupportTicket({
      userId,
      name,
      email: email || '',
      mobile,
      category: category || 'GENERAL',
      subject: subject || 'Grievance / Inquire Request',
      message,
      priority: priority || 'NORMAL',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket registered successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSupportTickets = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const mobile = req.user?.mobile || req.user?.phone || req.query.mobile || '';

    const tickets = await notificationService.getUserTickets(userId, mobile);
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSupportTicketsAdmin = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const tickets = await notificationService.getAllTickets({ status, category });
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const ticket = await notificationService.updateTicketStatus(id, {
      status,
      resolutionNotes,
      assignedTo,
    });

    res.json({
      success: true,
      message: 'Support ticket updated',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const replyToSupportTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const senderId = getUserId(req);
    const senderName = req.user?.name || req.user?.mobile || req.user?.phone || 'Support Staff';
    const senderRole = req.user?.role || 'SUPER_ADMIN';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const ticket = await notificationService.addTicketResponse(id, {
      senderId,
      senderName,
      senderRole,
      message,
    });

    res.json({
      success: true,
      message: 'Response posted successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
