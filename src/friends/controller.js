const { controller_run } = require('../modules/templates.js');

const friendsModel = require('./model');
const notificationsModel = require('../notifications/model');
const userModel = require('../users/model');
const { logError } = require('../modules/errors.js');


exports.createRequest = (req, res) => 
  controller_run(req, res)(
    () => userModel.userIsPublic(req.body.toUserId).then(
      targetIsPublic => {
        if(targetIsPublic){
          return userModel.addFriends([req.jwt.userId, req.body.toUserId])
            .then(() => notificationsModel.createFriendAddedNotifications([req.jwt.userId, req.body.toUserId]))
        } else {
          return friendsModel.createRequest({
            from: req.jwt.userId,
            to: req.body.toUserId,
            memo: req.body.memo,
          }).then(() => notificationsModel.createFriendRequestCreatedNotification({
            fromUserId: req.jwt.userId,
            toUserId: req.body.toUserId,
          }))
        }
      }
    ),
    () => res.status(201).send({result: true}),
  )

exports.getIncomingRequests = (req, res) =>
  controller_run(req,res)(
    () => friendsModel.getRequests({
      to: req.jwt.userId,
    }),
    (result) => res.status(200).send({result}),
  )

const modifyRequest = (status, thenFn = (result) => result) => (req, res) => 
  controller_run(req,res)(
    () => friendsModel.getRequestById(req.params.requestId).then(request => {
      if(request.to.toString() !== req.jwt.userId.toString()) {
        logError(
          "[!][403][modifyRequest][" + req.originalUrl + "] Unauthorized: ",
          {to: request.to, requester: req.jwt.userId}
        );
        return false;
      }
      return friendsModel.patchRequest(req.params.requestId, {status}).then(thenFn)
    }),
    (result) => {
      if(!result) return res.status(403).send()
      return res.status(201).send({result: true})
    }
  )

exports.rejectRequest = modifyRequest(friendsModel.requestStatus.rejected);

exports.acceptRequest = (req, res) => modifyRequest(
  friendsModel.requestStatus.accepted,
  (result) => userModel.addFriends([req.jwt.userId, result.from]).then(
    () => notificationsModel.createFriendAddedNotifications([req.jwt.userId, result.from])
  )
)(req, res)