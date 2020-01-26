const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const fsProm = fs.promises;

const winston_logger = require("../../config/winston.js");
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
            var cards = await database.getUserCards(
                req.query.collectionId,
                req.user.id
            );
            res.json({ success: true, cards: cards });
        } catch (err) {
            winston_logger.warn("CardRoutes.getCards: Error: %o", err);
            res.statusCode = 500;
            res.json({
                success: false,
                errorMsg: err.message
            });
        }
    } else {
        winston_logger.warn("CardRoutes.getCards: Missing collectionId.");
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
        winston_logger.warn(
            `CardRoutes.getCard (card-id: ${req.params.id}): Error: %o`,
            err
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.post("/", async function(req, res) {
    const card = req.body;
    const userId = req.user.id;
    try {
        var cardId = await database.addCard(card, userId);
        res.json({ success: true, id: cardId });
    } catch (err) {
        winston_logger.warn("CardRoutes.postCard: Error: %o", err);
        res.statusCode = 500;
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
            winston_logger.warn(
                `CardRoutes.updateCard (card-id: ${cardId}): Card does not exist.`
            );
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `card with ID '${cardId}' does not exist`
            });
        }
    } catch (err) {
        winston_logger.warn(
            `CardRoutes.updateCard (card-id: ${cardId}): Update failed. Error: %o`,
            err
        );
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
        const attachmentDir = `../apps/userApp/uploads/cards/${cardId}`;
        try {
            await fsProm.access(attachmentDir);
            attachmentDirExists = true;
        } catch (err) {
            // attachmentDir does not exist.
        }
        if (attachmentDirExists) {
            winston_logger.debug(
                `CardRoutes.deleteCard (card-id: ${cardId}): Removing attachment directory ${attachmentDir}...`
            );
            await fsProm.rmdir(attachmentDir, { recursive: true });
        }

        // Delete all attachments from database.
        await database.deleteAttachments(cardId);

        // Delete card from database.
        const changes = await database.deleteCard(cardId);
        if (changes === 1) {
            res.json({ success: true });
        } else {
            winston_logger.warn(
                `CardRoutes.deleteCard (card-id: ${cardId}): Removing card from database failed. Card-id does not exist.`
            );
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `card with ID '${cardId}' does not exist`
            });
        }
    } catch (err) {
        winston_logger.warn(
            `CardRoutes.deleteCard (card-id: ${cardId}): Error: %o`,
            err
        );
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
        winston_logger.warn(
            `AttachmentRoutes.getAttachment (card-id: ${cardId}): Error: %o`,
            err
        );
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

    // Check that card with given id exists.
    winston_logger.debug(
        `AttachmentRoutes.addAttachment (card-id: ${cardId}): Checking that card-id exists...`
    );
    var cardRow;
    try {
        cardRow = await database.getCard(cardId);
    } catch (err) {
        winston_logger.warn(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Error on fetching card: %o`,
            err
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: `error on fetching card with ID ${cardId}`
        });
        return;
    }
    if (!cardRow) {
        winston_logger.warn(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Card does not exist.`
        );
        res.statusCode = 400;
        res.json({
            success: false,
            errorMsg: `card with ID ${cardId} does not exist`
        });
        return;
    }

    // Check if upload folder for this card already exists.
    const uploadDir = `../apps/userApp/uploads/cards/${cardId}/`;
    var dirExists = true;
    winston_logger.debug(
        `AttachmentRoutes.addAttachment (card-id: ${cardId}): Checking that uploadDir ${uploadDir} exists...`
    );
    try {
        await fsProm.access(uploadDir, fs.constants.W_OK);
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): ... uploadDir ${uploadDir} exists.`
        );
    } catch (err) {
        dirExists = false;
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): ... uploadDir ${uploadDir} does not exist. Creating it...`
        );
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
        var formData = await parseMultipart(req);
        var files = formData.files;
        var fields = formData.fields;
        belongsTo = fields.belongsTo;

        // Move file to upload-directory.
        var tmppath = files.questionImage.path;
        // TODO Repeat this for answer image.
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Moving upload-file from temp-path ${tmppath} to path ${filePath}...`
        );
        await fsProm.rename(tmppath, filePath);
    } catch (err) {
        // We haven't uploaded the file yet, just send error-response.
        // todo: Do we have to remove the temp file?
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Error: %o`,
            err
        );
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
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Adding attachment to database...`
        );
        const urlPath = `/userApp/uploads/cards/${cardId}/${attachmentFilename}`;
        attachmentId = await database.addAttachment(urlPath, cardId, belongsTo);
    } catch (err) {
        winston_logger.warn(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Adding attachment to database failed. Removing attachment from filesystem...`
        );
        try {
            await fsProm.unlink(filePath);
        } catch (innerErr) {
            // Ignore errors.
            winston_logger.error(
                `AttachmentRoutes.addAttachment (card-id: ${cardId}): Removing attachment from filesystem failed. Error: %o`,
                innerErr
            );
        }

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
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Successfully added attachment. Fetching added record...`
        );
        const attachment = await database.getAttachment(attachmentId);
        winston_logger.debug(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Sending added attachment-record in success-response...`
        );
        res.statusCode = 200;
        res.json({
            success: true,
            attachment: attachment
        });
    } catch (err) {
        winston_logger.error(
            `AttachmentRoutes.addAttachment (card-id: ${cardId}): Error when fetching added attachment-record: %o`,
            err
        );
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
        winston_logger.debug(
            `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Fetching attachment...`
        );
        const attachment = await database.getAttachment(attachmentId);
        if (!attachment) {
            winston_logger.warn(
                `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Attachment does not exist.`
            );
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `attachment with ID ${attachmentId} does not exist`
            });
            return;
        }

        // Remove attachment from FS.
        const filePath = "../apps" + attachment.path;
        winston_logger.warn(
            `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Removing file ${filePath} from filesystem...`
        );
        await fsProm.unlink(filePath);

        // Remove attachment from database.
        winston_logger.debug(
            `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Removing attachment from database...`
        );
        const changes = await database.deleteAttachment(attachmentId);
        if (changes === 1) {
            res.statusCode = 200;
            res.json({ success: true });
            return;
        } else {
            winston_logger.error(
                `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Removing attachment from database failed.`
            );
        }
    } catch (err) {
        winston_logger.warn(
            `AttachmentRoutes.deleteAttachment (attachment-id: ${attachmentId}): Error: %o`,
            err
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: "deleting attachment failed: " + err
        });
        return;
    }
});

module.exports = router;
