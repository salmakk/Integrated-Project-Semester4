const {Client, Hbar, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery, TopicId} = require('@hashgraph/sdk');
require('dotenv').config();


//Retrieving configuration info from .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;
const anchorTopicID = process.env.ANCHOR_TOPIC_ID;
const revokeTopicID= process.env.REVOKE_TOPIC_ID;

//Establish Hedera client
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);
client.setMaxTransactionFee(new Hbar(0.1));

const mirrornodeBaseUrl = "https://testnet.mirrornode.hedera.com/api/v1";

const HederaService = {

    async createTopic(){
        let txResponse = await new TopicCreateTransaction().execute(client);
        // Grab the topic ID
        let receipt = await txResponse.getReceipt(client);
        let topicId = receipt.topicId;
        return topicId;
    },


    async submitDocumentHedera(hash,TopicID) {
        try {
            const transaction = new TopicMessageSubmitTransaction({
                topicId: TopicID,
                message: hash
            });

            const response = await transaction.execute(client);
            const receipt = await response.getReceipt(client);

            return receipt.topicSequenceNumber;
        } catch (error) {
            console.error('Error submitting document:', error);
            throw new Error('Failed to submit document to Hedera.');
        }
    },

    async retrieveHashHedera(topicID, topicSequenceNumber) {
        const messageResponse =  await (await fetch(`${mirrornodeBaseUrl}/topics/${topicID}/messages/${topicSequenceNumber}`)).json();
        console.log(JSON.stringify(messageResponse, null, 2));
        const hashBase64 = messageResponse.message;

         // Extract the consensus timestamp
        const consensusTimestampStr = messageResponse.consensus_timestamp;
        const [secondsStr, nanosStr] = consensusTimestampStr.split('.');
        const seconds = parseInt(secondsStr, 10);
        const nanos = parseInt(nanosStr.padEnd(9, '0'), 10); // Ensure nanos are always 9 digits
        const timestampMilliseconds = seconds * 1000 + nanos / 1000000;
        const timestampDate = new Date(timestampMilliseconds);
  
         // Format the date
        const formattedTimestamp = timestampDate.toISOString().replace('T', ' ').replace(/\.\d+/, '').replace('Z', '');
  
      return {
          hash: Buffer.from(hashBase64, 'base64').toString('utf-8'),
          accountId: messageResponse.payer_account_id,
          timestamp: formattedTimestamp
      };

    },

    async revokeDocument(hash, topicSequenceNumber) {
        try {
            // Step 1: Retrieve the hash from the anchored topic
            const retrievedHash = await this.retrieveHashHedera(anchorTopicID, topicSequenceNumber);
            if (retrievedHash.hash !== hash) {
                throw new Error('Hash does not match.');
            }

            // Step 2: Retrieve the account ID that anchored the document
            if (retrievedHash.accountId !== myAccountId) {
                throw new Error('You are not authorized to revoke this document.');
            }

            // Step 3: Submit the hash to the revoke topic
            const revokeSequenceNumber = await this.submitDocumentHedera(hash, revokeTopicID);
            console.log('Document revoked with sequence number:', revokeSequenceNumber);
        } catch (error) {
            console.error('Error revoking document:', error);
            throw new Error('Failed to revoke document on Hedera.');
        }
    }
};

module.exports = HederaService;

//Mock hash
const hash = '6bcbc00517e6d72daf5f69e4b8fc47003a44698b32f9fcf20cdb907c80978ecb';

const topicSequenceNumber = 130;

(async () => {
    try {
        // const sequenceNumber = await HederaService.submitDocumentHedera(hash, anchorTopicID);
        // console.log('Document submitted with sequence number:', sequenceNumber);

        // const retrievedHash = await HederaService.retrieveHashHedera(anchorTopicID, topicSequenceNumber);
        // console.log('timestamp retrieved:', retrievedHash.timestamp);

        // // Test revokeDocument
        //await HederaService.revokeDocument(hash, topicSequenceNumber);
      

    } catch (error) {
        console.error('Error:', error);
    }
})();



