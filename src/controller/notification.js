import Notification from "../database/models/notification.js";

export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll();
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
        await notification.update(updates);
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
        await notification.destroy();
        return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
