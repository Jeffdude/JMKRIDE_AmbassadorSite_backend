const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

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

exports.getRequests = ({ status = requestStatus.pending, ...searchData}) => 
  Request.find({status, ...searchData})

exports.getPendingFriends = ({userId}) =>
  Request.find({status: requestStatus.pending, from: userId})
    .then(results => results.map(request => request.to))