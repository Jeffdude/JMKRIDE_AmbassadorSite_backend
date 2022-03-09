const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;
const userModel = require('../users/model.js')

/* ------------------- Model Definitions ------------------  */

const requestStatus = {pending: 'PENDING', rejected: 'REJECTED', accepted: 'ACCEPTED'}
exports.requestStatus = requestStatus

const requestSchema = new Schema({
  from: {type: ObjectId, ref: 'user'},
  to: {type: ObjectId, ref: 'user'},
  memo: String,
  status: {type: String, enum: Object.values(requestStatus)}
}, {timestamps: true})
const Request = mongoose.model('request', requestSchema);

/* ------------------- Model Functions ------------------  */

exports.createRequest = (requestData) => {
  const request = new Request({status: requestStatus.pending, ...requestData});
  return request.save();
}

exports.getRequestById = (requestId) => {
  return Request.findById(requestId);
}

exports.getRequests = ({ status = requestStatus.pending, ...searchData}) => 
  Request.find({status, ...searchData}).then(userModel.populateFriendRequests)

const getOutgoingPendingFriends = ({userId}) =>
  Request.find({status: {$in: [requestStatus.pending, requestStatus.rejected]}, from: userId})
    .then(results => results.map(request => request.to.toString()))

const getIncomingPendingFriends = ({userId}) =>
  Request.find({status: requestStatus.pending, to: userId})
    .then(results => results.map(request => request.from.toString()))

exports.getPendingFriends = ({userId}) =>
  getOutgoingPendingFriends({userId}).then(
    outgoing => getIncomingPendingFriends({userId}).then(
      incoming => ({outgoing, incoming})
    )
  )

exports.patchRequest = (requestId, requestData) =>
  Request.findOneAndUpdate({_id: requestId}, requestData)