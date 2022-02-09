const ValidationMiddleware = require('../middleware/validation.js');

const NotificationsController = require('./controller.js');


exports.configRoutes = (app) => {
  app.get('/api/v1/notifications', [
    ValidationMiddleware.validJWTNeeded,
    NotificationsController.getLatestNotifications
  ]);
  app.post('/api/v1/notifications/read/id/:notificationId', [
    ValidationMiddleware.validJWTNeeded,
    NotificationsController.readNotification
  ]);
  app.post('/api/v1/notifications/read/all', [
    ValidationMiddleware.validJWTNeeded,
    NotificationsController.readAllNotifications
  ]);
}