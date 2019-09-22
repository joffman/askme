const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", function(req, res) {
	if (("topic_id" in req.query)) {
		// Get cards from database.
		database.getCards(req.query.topic_id, function(err, cards_data) {
			if (err) {
				res.statusCode = 500;
				res.json({
					success: false, 
					error_msg: err.message
				});
			} else {
				res.json({success: true, cards: cards_data});
			}
		});
	} else {
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: "topic_id parameter is missing"
		});
	}
});

router.get("/:id", function(req, res) {
	database.getCard(req.params.id, function(err, card_data) {
		if (err) {
			res.statusCode = 500;
			res.json({
				success: false, 
				error_msg: err.message
			});
		} else {
			res.json({success: true, card: card_data});
		}
	});
});

router.post("/", function(req, res) {
	const card = req.body;
	database.addCard(card, function(err, card_id) {
		if (err) {
			console.log("Error:", err);
			res.json({
				success: false,
				error_msg: err.message
			});
		} else {
			res.json({success: true, id: card_id});
		}
	});
});

router.put("/:id", function(req, res) {
	const card = req.body;
	database.updateCard(req.params.id, card, function(err, card_id) {
		if (err) {
			console.log("Error:", err);
			res.json({
				success: false,
				error_msg: err.message
			});
		} else {
			res.json({success: true});
		}
	});
});

router.delete("/:id", function(req, res) {
	database.deleteCard(req.params.id, function(err, card_id) {
		if (err) {
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		} else if (card_id) {
			res.json({success: true});
		} else {
			res.json({
				success: false,
				error_msg: `Card with id ${id} does not exist.`
			});
		}
	});
});

module.exports = router;
