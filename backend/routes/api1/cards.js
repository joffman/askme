const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const fsProm = fs.promises;

const Database = require("../../database.js");

var database = new Database();

////////////////////////////////////////////////////////////////////////////////
// Private functions.
////////////////////////////////////////////////////////////////////////////////

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function parseMultipart(req) {
    var form = new formidable.IncomingForm();
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields: fields, files: files });
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
// Card routes.
////////////////////////////////////////////////////////////////////////////////

router.get("/", async function(req, res) {
    if ("collectionId" in req.query) {
        try {
            var cards = await database.getCards(req.query.collectionId);
            res.json({ success: true, cards: cards });
        } catch (err) {
            res.statusCode = 500;
            res.json({
                success: false,
                errorMsg: err.message
            });
        }
    } else {
        res.statusCode = 400;
        res.json({
            success: false,
            errorMsg: "collectionId parameter is missing"
        });
    }
});

router.get("/:id", async function(req, res) {
    try {
        var cardData = await database.getCard(req.params.id);
        res.json({ success: true, card: cardData });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.post("/", async function(req, res) {
    const card = req.body;
    try {
        var cardId = await database.addCard(card);
        res.json({ success: true, id: cardId });
    } catch (err) {
        console.log("Error:", err);
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.put("/:id", async function(req, res) {
    const card = req.body;
    const cardId = req.params.id;
    try {
        var changes = await database.updateCard(cardId, card);
        if (changes === 1) {
            res.json({ success: true });
        } else {
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `card with ID '${cardId}' does not exist`
            });
        }
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.delete("/:id", async function(req, res) {
    const cardId = req.params.id;
    try {
        // Delete all attachments from filesystem.
        var attachmentDirExists = false;
        const attachmentDir = `../public/uploads/cards/${cardId}`;
        try {
            await fsProm.access(attachmentDir);
            attachmentDirExists = true;
        } catch (err) {}
        if (attachmentDirExists)
            await fsProm.rmdir(attachmentDir, { recursive: true });

        // Delete all attachments from database.
        await database.deleteAttachments(cardId);

        // Delete card from database.
        const changes = await database.deleteCard(cardId);
        if (changes === 1) {
            res.json({ success: true });
        } else {
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `card with ID '${cardId}' does not exist`
            });
        }
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

////////////////////////////////////////////////////////////////////////////////
// Attachment routes.
////////////////////////////////////////////////////////////////////////////////

router.get("/:id/attachments", async function(req, res) {
    var cardId = req.params.id;

    try {
        // todo: Maybe check if a card with the given ID even exists.
        var attachments = await database.getAttachments(cardId);

        res.statusCode = 200;
        res.json({
            success: true,
            attachments: attachments
        });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: `error on fetching attachments of card with ID ${cardId}`
        });
        return;
    }
});

router.post("/:id/attachments", async function(req, res) {
    var cardId = req.params.id;
    console.log(`Attachment posted for card-id '${cardId}'.`);

    // Check that card with given id exists.
    console.log(`Checking that card with ID '${cardId}' exists...`);
    var cardRow;
    try {
        cardRow = await database.getCard(cardId);
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: `error on fetching card with ID ${cardId}`
        });
        return;
    }
    if (!cardRow) {
        res.statusCode = 400;
        res.json({
            success: false,
            errorMsg: `card with ID ${cardId} does not exist`
        });
        return;
    }
    console.log(`Successfully found card with ID '${cardId}'.`);

    // Check if upload folder for this card already exists.
    const uploadDir = `../public/uploads/cards/${cardId}/`;
    var dirExists = true;
    try {
        await fsProm.access(uploadDir, fs.constants.W_OK);
        console.log("Upload-directory already exists.");
    } catch (err) {
        dirExists = false;
        console.log("Upload-directory does not exist; creating it...");
    }

    // Create upload-directory if necessary and move files to it.
    const attachmentFilename = // timestamp + 5 random digits
        Date.now() + "-" + ("00000" + randomInt(99999)).slice(-5);
    const filePath = uploadDir + attachmentFilename;
    var belongsTo;
    try {
        // Create upload-directory if necessary.
        if (!dirExists) await fsProm.mkdir(uploadDir);

        // Parse form.
        console.log(`Moving file to '${filePath}'...`);
        var formData = await parseMultipart(req);
        var files = formData.files;
        var fields = formData.fields;
        belongsTo = fields.belongsTo;

        // Move file to upload-directory.
        var tmppath = files.questionImage.path;
        // TODO Repeat this for answer image.
        await fsProm.rename(tmppath, filePath);
    } catch (err) {
        // We haven't uploaded the file yet, just send error-response.
        // todo: Do we have to remove the temp file?
        console.log("Error caught. Upload failed. Sending 500...");
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: "upload failed: " + err
        });
        return;
    }

    // Add entry in attachment-table.
    var attachmentId;
    try {
        const urlPath = `/uploads/cards/${cardId}/${attachmentFilename}`;
        attachmentId = await database.addAttachment(urlPath, cardId, belongsTo);
    } catch (err) {
        console.log(
            "Adding attachment in attachment-table failed." +
                "Removing attachment from filesystem."
        );
        try {
            await fsProm.unlink(filePath);
        } catch (innerErr) {
            // Ignore errors.
            console.log("Removing attachment failed.");
        }

        console.log(
            "Adding attachment in attachment-table failed. Sending 500..."
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: "upload failed: " + err
        });
        return;
    }

    // We've successfully uploaded the files and updated the database.
    // Send the added record in a success response.
    try {
        console.log("Successfully added attachment. Fetching added record...");
        const attachment = await database.getAttachment(attachmentId);
        console.log("Sending added record in success response:", attachment);
        res.statusCode = 200;
        res.json({
            success: true,
            attachment: attachment
        });
    } catch (err) {
        console.log("Error when fetching added Attachment:", err);
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: "Fetching added attachment failed: " + err
        });
    }
});

router.delete("/:cardId/attachments/:attachmentId", async function(req, res) {
    var attachmentId = req.params.attachmentId;

    try {
        // Find attachment.
        const attachment = await database.getAttachment(attachmentId);
        if (!attachment) {
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `attachment with ID ${attachmentId} does not exist`
            });
            return;
        }

        // Remove attachment from FS.
        const filePath = "../public" + attachment.path;
        await fsProm.unlink(filePath);

        // Remove attachment from database.
        const changes = await database.deleteAttachment(attachmentId);
        if (changes === 1) {
            res.statusCode = 200;
            res.json({ success: true });
            return;
        } else {
            throw Error("deleting attachment from database failed");
        }
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: "deleting attachment failed: " + err
        });
        return;
    }
});

module.exports = router;
