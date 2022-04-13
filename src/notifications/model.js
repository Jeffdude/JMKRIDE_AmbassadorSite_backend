const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;


/* ------------------- Model Definitions ------------------  */

const notificationReason = {
  friendRequestCreated: 'FRIEND_REQUEST_CREATED',
  friendAdded: 'FRIEND_ADDED',
  challengeStatusChanged: 'CHALLENGE_STATUS_CHANGED',
  referralCodeUsed: 'REFERRAL_CODE_USED'
}
exports.notificationReason = notificationReason;

const notificationSchema = new Schema({
  subject: {type: ObjectId, ref: 'user'}, // the receiver of the notification
  actor: {type: ObjectId, ref: 'user'}, // the causer of the notification (optional)
  reason: {type: String, enum: Object.values(notificationReason)},
  seen: Boolean,
  payload: Schema.Types.Mixed,
}, {timestamps: true})

const Notification = mongoose.model('notification', notificationSchema);

/* ------------------- Model Functions ------------------  */

const createNotification = (notificationData) => {
  const notification = new Notification(notificationData);
  return notification.save();
}

exports.markNotificationRead = (notificationId) =>
  Notification.findOneAndUpdate({_id: notificationId}, {seen: true})

exports.markAllNotificationsRead = (userId) =>
  Notification.updateMany({subject: userId, seen: false}, {seen: true})

exports.getLatestNotifications = (userId) =>
  Notification.find({subject: userId, seen: false})
  .then(results => Notification.populate(results, {path: 'actor', select: ['firstName', 'lastName', 'profileIconName']}))

exports.createFriendRequestCreatedNotification = ({fromUserId, toUserId}) =>
  createNotification({
    reason: notificationReason.friendRequestCreated,
    subject: toUserId,
    seen: false,
    actor: fromUserId,
  })

exports.createFriendAddedNotifications = ([user1, user2]) =>
  createNotification({
    reason: notificationReason.friendAdded,
    subject: user1,
    seen: false,
    actor: user2,
  }).then(() => createNotification({
    reason: notificationReason.friendAdded,
    subject: user2,
    seen: false,
    actor: user1,
  }))