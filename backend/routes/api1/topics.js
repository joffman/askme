const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", async function(req, res) {
	try {
		// Get topics from database and add number of cards to it.
		var topics_data = await database.getTopics();
		res.json({success: true, topics: topics_data});
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
		const topic = { name: req.body.name };
		try {
			var topic_id = await database.addTopic(topic);
			res.json({success: true, id: topic_id});
		} catch (err) {
			console.log("Error:", err);
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		}
	} else {
		console.log("Invalid topic. Sending 400.");
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: "name-parameter missing in request-body"
		});
	}
});

router.delete("/:id", async function(req, res) {
	try {
		var changes = await database.deleteTopic(req.params.id);
		if (changes === 1)
			res.json({success: true});
		else
			res.json({
				success: false,
				error_msg: `topic with id ${id} does not exist`
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
