const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", async function(req, res) {
	try {
		// Get collections from database and add number of cards to it.
		var collections_data = await database.getCollections();
		res.json({success: true, collections: collections_data});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false, 
			error_msg: err.message
		});
	}
});

router.get("/:id", async function(req, res) {
	try {
		var collection_data = await database.getCollection(req.params.id);
		if (collection_data) {
			res.json({success: true, collection: collection_data});
		} else {
			res.statusCode = 400;
			res.json({
				success: false, 
				error_msg: "No collection with given id."
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

router.post("/", async function(req, res) {
	const collection = req.body;
	try {
		var collection_id = await database.addCollection(collection);
		res.json({success: true, id: collection_id});
	} catch (err) {
		// TODO Check for invalid input and send 400.
		console.log("Error:", err);
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: err.message
		});
	}
});

router.put("/:id", async function(req, res) {
	const collection = req.body;
	const coll_id = req.params.id;
	try {
		var changes = await database.updateCollection(coll_id, collection);
		res.json({success: true});
	} catch (err) {
		// todo: Check for invalid input and send 400.
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: err.message
		});
	}

});

router.delete("/:id", async function(req, res) {
	try {
		var changes = await database.deleteCollection(req.params.id);
		if (changes === 1)
			res.json({success: true});
		else
			res.statusCode = 400;
			res.json({
				success: false,
				error_msg: `Collection with id ${id} does not exist.`
			});
	} catch (err) {
		if (err.code == "SQLITE_CONSTRAINT") {
			res.statusCode = 400;
			res.json({
				success: false,
				error_msg: "SQL constraint failed."
					+ " You can only delete a collection, when it does"
					+ " not contain any cards."
			});
		} else {
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		}
	}
});

module.exports = router;
