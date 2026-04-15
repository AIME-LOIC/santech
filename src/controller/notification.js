import Notification from "../database/models/notification.js";

export const getAllNotifications = async (req, res) => {
    try {
        const where = req.user?.role === "admin" ? {} : { userId: req.user?.id };
        const notifications = await Notification.findAll({
            where,
            order: [["createdAt", "DESC"]],
        });
        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getNotificationById = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        if (req.user?.role !== "admin" && notification.userId !== req.user?.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return res.status(200).json(notification);
    } catch (error) {
        console.error("Error fetching notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createNotification = async (req, res) => {
    const { userId, message, isRead } = req.body;
    try {
        const notification = await Notification.create({
            userId,
            message,
            isRead,
        });
        return res.status(201).json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateNotification = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    try {
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        const isAdmin = req.user?.role === "admin";
        const isOwner = notification.userId === req.user?.id;
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Non-admin users can only mark notifications as read/unread
        if (!isAdmin && typeof updates.isRead !== "boolean") {
            return res.status(400).json({ error: "Only isRead (boolean) can be updated" });
        }
        const safeUpdates = isAdmin ? updates : { isRead: updates.isRead };
        await notification.update(safeUpdates);
        return res.status(200).json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        if (req.user?.role !== "admin" && notification.userId !== req.user?.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        await notification.destroy();
        return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
