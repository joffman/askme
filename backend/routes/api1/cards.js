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
			if (err)
				reject(err);
			else
				resolve({fields: fields, files: files});
		});
	});
}


////////////////////////////////////////////////////////////////////////////////
// Card routes.
////////////////////////////////////////////////////////////////////////////////

router.get("/", async function(req, res) {
	if (("collection_id" in req.query)) {
		try {
			var cards = await database.getCards(req.query.collection_id);
			res.json({success: true, cards: cards});
		} catch (err) {
			res.statusCode = 500;
			res.json({
				success: false, 
				error_msg: err.message
			});
		}
	} else {
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: "collection_id parameter is missing"
		});
	}
});

router.get("/:id", async function(req, res) {
	try {
		var card_data = await database.getCard(req.params.id);
		res.json({success: true, card: card_data});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false, 
			error_msg: err.message
		});
	}
});

router.post("/", async function(req, res) {
	const card = req.body;
	try {
		var card_id = await database.addCard(card);
		res.json({success: true, id: card_id});
	} catch (err) {
		console.log("Error:", err);
		res.json({
			success: false,
			error_msg: err.message
		});
	}
});

router.put("/:id", async function(req, res) {
	const card = req.body;
	const card_id = req.params.id;
	try {
		var changes = await database.updateCard(card_id, card);
		if (changes === 1 ) {
			res.json({success: true});
		} else {
			res.statusCode = 400;
			res.json({
				success: false,
				error_msg: `card with ID '${card_id}' does not exist`
			});
		}
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: err.message
		});
	}
});

router.delete("/:id", async function(req, res) {
	const card_id = req.params.id;
	try {
		// Delete all attachments from filesystem.
		var attachment_dir_exists = false;
		const attachment_dir = `../public/uploads/cards/${card_id}`;
		try {
			await fsProm.access(attachment_dir);
			attachment_dir_exists = true;
		} catch (err) {
		}
		if (attachment_dir_exists)
			await fsProm.rmdir(attachment_dir, {recursive: true});

		// Delete all attachments from database.
		await database.deleteAttachments(card_id);

		// Delete card from database.
		const changes = await database.deleteCard(card_id);
		if (changes === 1) {
			res.json({success: true});
		} else {
			res.statusCode = 400;
			res.json({
				success: false,
				error_msg: `card with ID '${card_id}' does not exist`
			});
		}
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: err.message
		});
	}
});


////////////////////////////////////////////////////////////////////////////////
// Attachment routes.
////////////////////////////////////////////////////////////////////////////////

router.get("/:id/attachments", async function(req, res) {
	var card_id = req.params.id;

	try {
		// todo: Maybe check if a card with the given ID even exists.
		var attachments = await database.getAttachments(card_id);

		res.statusCode = 200;
		res.json({
			success: true,
			attachments: attachments
		});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: `error on fetching attachments of card with ID ${card_id}`
		});
		return;
	}
});

router.post("/:id/attachments", async function(req, res) {
	var card_id = req.params.id;
	console.log(`Attachment posted for card-id '${card_id}'.`);

	// Check that card with given id exists.
	console.log(`Checking that card with ID '${card_id}' exists...`);
	var card_row;
	try {
		card_row = await database.getCard(card_id);
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: `error on fetching card with ID ${card_id}`
		});
		return;
	}
	if (!card_row) {
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: `card with ID ${card_id} does not exist`
		});
		return;
	}
	console.log(`Successfully found card with ID '${card_id}'.`);

	// Check if upload folder for this card already exists.
	const upload_dir = `../public/uploads/cards/${card_id}/`;
	var dir_exists = true;
	try {
		await fsProm.access(upload_dir, fs.constants.W_OK);
		console.log("Upload-directory already exists.");
	} catch (err) {
		dir_exists = false;
		console.log("Upload-directory does not exist; creating it...");
	}
	
	// Create upload-directory if necessary and move files to it.
	const attachment_filename =	// timestamp + 5 random digits
		Date.now() + "-" + (("00000" + randomInt(99999)).slice(-5));
	const file_path = upload_dir + attachment_filename;
	var belongs_to;
	try {
		// Create upload-directory if necessary.
		if (!dir_exists)
			await fsProm.mkdir(upload_dir);

		// Parse form.
		console.log(`Moving file to '${file_path}'...`);
		var form_data = await parseMultipart(req);
		var files = form_data.files;
		var fields = form_data.fields;
		belongs_to = fields.belongs_to;

		// Move file to upload-directory.
		var tmppath = files.questionImage.path;
		// TODO Repeat this for answer image.
		await fsProm.rename(tmppath, file_path);
	} catch (err) {
		// We haven't uploaded the file yet, just send error-response.
		// todo: Do we have to remove the temp file?
		console.log("Error caught. Upload failed. Sending 500...");
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: "upload failed: " + err
		});
		return;
	}

	// Add entry in attachment-table.
	var attachment_id;
	try {
		const url_path = `/uploads/cards/${card_id}/${attachment_filename}`;
		attachment_id = 
			await database.addAttachment(url_path, card_id, belongs_to);
	} catch (err) {
		console.log("Adding attachment in attachment-table failed."
				+ "Removing attachment from filesystem.");
		try {
			await fsProm.unlink(file_path);
		} catch (inner_err) {
			// Ignore errors.
			console.log("Removing attachment failed.");
		}

		console.log("Adding attachment in attachment-table failed. Sending 500...");
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: "upload failed: " + err
		});
		return;
	}

	// We've successfully uploaded the files and updated the database.
	// Send the added record in a success response.
	try {
		console.log("Successfully added attachment. Fetching added record...");
		const attachment = await database.getAttachment(attachment_id);
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
			error_msg: "Fetching added attachment failed: " + err
		});
	}
});

router.delete("/:card_id/attachments/:attachment_id", async function(req, res) {
	var attachment_id = req.params.attachment_id;
	
	try {
		// Find attachment.
		const attachment = await database.getAttachment(attachment_id);
		if (!attachment) {
			res.statusCode = 400;
			res.json({
				success: false,
				error_msg: `attachment with ID ${attachment_id} does not exist`
			});
			return;
		}

		// Remove attachment from FS.
		const file_path = "../public" + attachment.path;
		await fsProm.unlink(file_path);
		
		// Remove attachment from database.
		const changes = await database.deleteAttachment(attachment_id);
		if (changes === 1) {
			res.statusCode = 200;
			res.json({ success: true });
			return;
		} else {
			throw(Error("deleting attachment from database failed"));
		}
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: "deleting attachment failed: " + err
		});
		return;
	}
});


module.exports = router;
