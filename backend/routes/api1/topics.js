const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", function(req, res) {
	// Get topics from database and add number of cards to it.
	database.getTopics(function(err, topics_data) {
		if (err) {
			res.statusCode = 500;
			res.json({
				success: false, 
				error_msg: err.message
			});
		} else {
			res.json({success: true, topics: topics_data});
		}
	});
});

router.post("/", function(req, res) {
	if ("name" in req.body) {
		const topic = { name: req.body.name };
		database.addTopic(topic, function(err, topic_id) {
			if (err) {
				console.log("Error:", err);
				res.json({
					success: false,
					error_msg: err.message
				});
			} else {
				res.json({success: true, id: topic_id});
			}
		});
	} else {
		res.json({
			success: false,
			error_msg: "name missing in request-body"
		});
	}
});

router.delete("/:id", function(req, res) {
	database.deleteTopic(req.params.id, function(err, topic_id) {
		if (err) {
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		} else if (topic_id) {
			res.json({success: true});
		} else {
			res.json({
				success: false,
				error_msg: `Topic with id ${id} does not exist.`
			});
		}
	});
});

module.exports = router;
