const express = require("express");
const path = require("path");

const Database = require("./database.js");

const app = express();


//////////////////////////////////////////////////
// Set up global variables.
//////////////////////////////////////////////////
var database = new Database();

//////////////////////////////////////////////////
// Set up middleware.
//////////////////////////////////////////////////

app.use(express.json());
app.use(express.static(path.join(__dirname, "/../public")));


//////////////////////////////////////////////////
// Set up topics api routes.
//////////////////////////////////////////////////

app.get("/api1/topics", function(req, res) {
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

app.post("/api1/topics", function(req, res) {
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

app.delete("/api1/topics/:id", function(req, res) {
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


//////////////////////////////////////////////////
// Set up cards api routes.
//////////////////////////////////////////////////

app.get("/api1/cards", function(req, res) {
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

app.get("/api1/cards/:id", function(req, res) {
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

app.post("/api1/cards", function(req, res) {
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

app.put("/api1/cards/:id", function(req, res) {
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

app.delete("/api1/cards/:id", function(req, res) {
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


//////////////////////////////////////////////////
// Listen to requests.
//////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
});
