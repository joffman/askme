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

router.post("/", async function(req, res) {
	if ("name" in req.body) {
		const collection = { name: req.body.name };
		try {
			var collection_id = await database.addCollection(collection);
			res.json({success: true, id: collection_id});
		} catch (err) {
			console.log("Error:", err);
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		}
	} else {
		console.log("Invalid collection. Sending 400.");
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: "name-parameter missing in request-body"
		});
	}
});

router.delete("/:id", async function(req, res) {
	try {
		var changes = await database.deleteCollection(req.params.id);
		if (changes === 1)
			res.json({success: true});
		else
			res.json({
				success: false,
				error_msg: `collection with id ${id} does not exist`
			});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			error_msg: err.message
		});
	}
});

module.exports = router;
