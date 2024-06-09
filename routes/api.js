const debug = require('debug')('blockchain-4:api');
const express = require('express');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const anchor = require('../anchoring');
const { TopicId } = require('@hashgraph/sdk');


const router = express.Router();

/**
 * Route for getting a list of all previously uploaded and anchored documents
 */
router.get('/list/', async function (req, res) 
{
    res.json(await anchor.getAllDocuments());
});

/**
 * Route for uploading a new document, and anchoring it to the blockchain
 */
router.post('/upload/', upload.any(), async function (req, res) 
{
   
    //Hash the file
    let hash = anchor.hashFile(req.files[0].buffer);

    //Save the document in the datastore and keep track of it's ID
    let id = await anchor.saveAnchoredDocument(hash)

    //Send a response back to the client
    res.json({id:id, hash:hash});
    
});

router.post('/revoke/', upload.any(), async function (req, res) 
{
    
    //Hash the file
    let hash = anchor.hashFile(req.files[0].buffer);

    //Check if the document is alreaday anchored to be revoked
    if (anchor.findDocument(hash) == null){
        return res.status(200).json({ error: 'Document is not anchored yet' });
    }
   
    //Save the document in the datastore and keep track of it's ID
    let id = await anchor.saveRevokedDocument(hash);

    //Send a response back to the client
    res.json({id:id, hash:hash});
    
});

/**
 * Route for reuploading a document, and comparing it's fingerprint to the
 * fingerprint of the matching document on the blockchain
 */
router.put('/verify/', upload.any(), async function (req, res) {
    try {
        if (!req.files || req.files.length < 1) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Ensure we have a file buffer
        const fileBuffer = req.files[0].buffer;
        if (!fileBuffer) {
            return res.status(400).json({ error: 'File buffer is empty or invalid' });
        }

        // Hash the file
        const hash = anchor.hashFile(fileBuffer);
        console.log(`File hash: ${hash}`);

        // Check if the document is revoked
        const isRevoked = await anchor.isDocumentRevoke(hash);
        if (isRevoked) {
            return res.status(200).json({ error: 'Document is revoked' });
        }
       

        // Call findDocument with the hash
        const storedHash = await anchor.findDocument(hash);
        if (!storedHash) {
            return res.status(200).json({ error: 'Document is invalid' });
        }

        // Respond with verification results
        res.json({
            verifySuccess: true,
            uploadedHash: hash,
            storedHash: storedHash
        });
    } catch (error) {
        console.error('Error verifying document:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * Route for deleting an anchored document, and comparing it's fingerprint to the
 * The blockchain will remain unchanged
 */
router.delete('/delete/', async function (req, res) 
{   
    //Check for required parameters
    if (!('id' in req.body) || req.body.id.length < 1) 
    {
        return res.sendStatus(400);
    }

    //Find the document in the datastore
    let count = await anchor.deleteDocument(req.body.id);
    count = count.deletedCount;
    debug('count', count);
    if ( count == 1 )
    {
        res.sendStatus(204);
    }
    else
    {
        res.sendStatus(404);
    }
});

module.exports = router;





