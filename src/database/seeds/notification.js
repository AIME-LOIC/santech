import notifications from '../models/notification.js';
export const seedNotifications = async () => {
    const notificationsData = [
        {
            userId: 'da4209ec-ede5-4d35-8dca-a2b655b36ee8',
            message: 'Your appointment with Dr. Smith is scheduled for tomorrow at 10:00 AM.',
            isRead: false,
        }
    ]
    await notifications.bulkCreate(notificationsData);
}
    