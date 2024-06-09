//Creating the schema
const { TopicId } = require('@hashgraph/sdk');
const mongoose = require('mongoose');


const DocumentSchema = new mongoose.Schema({
    // Document Hash done by backend server
    documentHash: {
        type: String,
        required: true
    },
    timeStamp : { 
        type: String,
        required: false
    },
    anchorSequenceNumber : { 
        type: String,
        required: false
    },
    topicId : {
        type: String,
        required: true
    },
    revokeSequenceNumber : {
        type: String,
        required: false
    }

});

//Export the schema using these lines:
const Document = mongoose.model('Document', DocumentSchema);
module.exports = Document;
