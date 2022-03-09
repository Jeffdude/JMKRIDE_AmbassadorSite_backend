const { controller_run } = require('../modules/templates');

const notificationModel = require('./model');

exports.getLatestNotifications = (req, res) =>
  controller_run(req, res)(
    () => notificationModel.getLatestNotifications(req.jwt.userId),
    (result) => res.status(200).send({result})
  );

exports.readNotification = (req, res) =>
  controller_run(req, res)(
    () => notificationModel.markNotificationRead(req.params.notificationId),
    () => res.status(201).send({result: true})
  );

exports.readAllNotifications = (req, res) =>
  controller_run(req, res)(
    () => notificationModel.markAllNotificationsRead(req.jwt.userId),
    () => res.status(201).send({result: true})
  );