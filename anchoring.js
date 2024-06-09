const HederaService = require('./hederaService');

const debug = require('debug')('blockchain-4:anchoring');
const crypto = require('crypto');
const mongoose = require('mongoose');
const documentModel = require('./models');
const { timeStamp } = require('console');

//Retrieving configuration info from .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;
const mongoAddr = process.env.MONGO_DB_ADDR;
const anchorTopicID = process.env.ANCHOR_TOPIC_ID;
const revokeTopicID= process.env.REVOKE_TOPIC_ID;

//Check required enviroment variables exist
let errorString = '';
errorString += myAccountId === undefined ? 'MY_ACCOUNT_ID ' : '';
errorString += myPrivateKey === undefined ? 'MY_PRIVATE_KEY ' : '';
errorString += mongoAddr === undefined ? 'MONGO_DB_ADDR ' : '';
if (errorString)
{
    throw new Error(`Environment variable(s) ${errorString}must be present`);
}

//Connect to our MongoDB database
mongoose.connect(mongoAddr);
//Error checking
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function ()
{
    debug('Mongoose Connected successfully');
});

/**
 * Retreives the list of all documents which have been uploaded
 * @returns Array of all known documents
 */
async function getAllDocuments()
{
    //Query MongoDB for all stored documents
    const documents = await documentModel.find({}, { documentName: 1 });
    debug(`Found ${documents.length} documents in database`);
    return documents;
}

/**
 * Saves a document into the datastore
 * @param {string} hash The hash to be stored
 * @returns The generated ID of the document
 */
async function saveAnchoredDocument(hash)
{
    //Submit hash to Hedera
    const anchorSequenceNumber = await HederaService.submitDocumentHedera(hash,anchorTopicID);
    debug(`Hash ${hash} sent to Hedera, topicID ${anchorTopicID}`);
    //Add the document to the datastore
    let document = new  documentModel({
        topicId: anchorTopicID,
        
        anchorSequenceNumber:anchorSequenceNumber,
        //timeStamp: (await HederaService.retrieveHashHedera(anchorTopicID,anchorSequenceNumber)).timestamp,
        
        documentHash: hash}
    );
    await document.save();	//Mongo query
    debug(`Document stored in database, ID ${document._id}`);
    //Return the generated ID
    return document._id;
}

async function saveRevokedDocument(hash)
{
    //Submit hash to Hedera
    const revokeTopicSequenceNumber = await HederaService.submitDocumentHedera(hash,revokeTopicID);
    debug(`Hash ${hash} sent to Hedera, topicID ${revokeTopicID}`);
    //Add the document to the datastore
    let document = new  documentModel({
        topicId: revokeTopicID,
        //timeStamp: (await HederaService.retrieveHashHedera(revokeTopicID,revokeTopicSequenceNumber)).timestamp,
        revokeSequenceNumber:revokeTopicSequenceNumber,
        documentHash: hash}
    );
    await document.save();	//Mongo query
    debug(`Document stored in database, ID ${document._id}`);
    //Return the generated ID
    return document._id;
}

/**
 * Submits a document into the blockchain
 * @param {string} hash The hash to be submitted, name of document
 * @returns The topicID of the transaction
 */

/**
/**
 * Retrieves document information from the datastore.
 * @param {string} hash - The ID of the document to search for.
 * @returns {Promise<string|null>} - The retrieved hash if found, else null.
 * @throws {Error} - Throws an error if the hash is invalid or other issues occur.
 */
async function findDocument(hash) {
    try {
        if (!hash || typeof hash !== 'string') {
            throw new Error('Invalid hash: hash must be a non-empty string');
        }

        const document = await documentModel.findOne({ documentHash: hash }, { topicId: 1, anchorSequenceNumber: 1 });

        if (!document) {
            console.debug(`No document found with Hash: ${hash}`);
            return null;
        }

        console.debug(`Document found with Hash: ${hash}, Hedera Topic ID: ${document.topicId}, Sequence Number: ${document.anchorSequenceNumber}`);

        if (!document.topicId || !document.anchorSequenceNumber) {
            throw new Error('Document is missing topicId or sequenceNumber');
        }

        // Appeler HederaService.retrieveHashHedera et destructurer pour obtenir retrievedHash
        const { hash: retrievedHash } = await HederaService.retrieveHashHedera(document.topicId, document.anchorSequenceNumber);
        console.debug(`Retrieved Hash for topicId ${document.topicId} and sequenceNumber ${document.anchorSequenceNumber}: ${retrievedHash}`);

        if (typeof retrievedHash !== 'string') {
            throw new Error('Retrieved hash is not a string');
        }

        return retrievedHash;
    } catch (error) {
        console.debug('Error retrieving document:', error.message);
        return null;
    }
}

async function isDocumentRevoke(hash) {
    try {
        if (!hash || typeof hash !== 'string') {
            throw new Error('Invalid hash: hash must be a non-empty string');
        }

        const document = await documentModel.findOne({ documentHash: hash }, { topicId: 1, revokeSequenceNumber: 1 });

        if (!document) {
            return false; // Aucun document trouvé, donc non révoqué
        }
        
        if (!document.topicId || !document.revokeSequenceNumber) {
            return false;
        }
        

        // Appeler HederaService.retrieveHashHedera et destructurer pour obtenir retrievedHash
        const { hash: retrievedHash } = await HederaService.retrieveHashHedera(document.topicId, document.revokeSequenceNumber);

        if (typeof retrievedHash !== 'string') {
            throw new Error('Retrieved hash is not a string');
        }

        const isRevoked = retrievedHash === hash;

        console.debug(`Document is revoked: ${isRevoked}`);

        return isRevoked;
    } catch (error) {
        console.error('Error retrieving document:', error.message);
        return false; // Erreur ou document non révoqué
    }
}



/**
 * Delete user document using _id
 * @param {string} id The ID of the document to be deleted
 * @returns The number of deleted documents
 *          1 is successful
 *          0 is unsuccessful
 */

async function deleteDocument(id) 
{
    //Search database
    const document = await documentModel.deleteOne({ _id: id });
    return document.deletedCount;
}

/**
 * retrieves the hash of a document from the blockchain
 * @param {string} topic id of the document
 * @returns The topicID of the transaction
 */

/**
 * Hashes a file
 * @param {Buffer} file The file to be hashed
 * @returns Hex representation of file hash
 */
function hashFile(file) {
    if (!file) {
        throw new Error('Invalid file buffer');
    }
    // Create hashing object -> Add the file to be hashed -> Get hex representation
    return crypto.createHash('sha256').update(file).digest('hex');
}

//module.exports is available in other files using require(...)
module.exports = {
    getAllDocuments: getAllDocuments,
    findDocument: findDocument,
    saveAnchoredDocument: saveAnchoredDocument,
    saveRevokedDocument : saveRevokedDocument,
    isDocumentRevoke : isDocumentRevoke,
    hashFile: hashFile,
    deleteDocument: deleteDocument
};

const hash = 'f24968f8832933681380bb5f6712ccaa544ad38933e450eefea2bec83e0a9cf1';
(async () => {
    try {
        await isDocumentRevoke(hash);
    } catch (error) {
        console.error('Error:', error);
    }
})();
