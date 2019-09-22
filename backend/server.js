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
		if (err) {	// todo: Send json.
			res.statusCode = 500;
			res.send("Database error");
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
//	topics_data = topics_data.filter(function(elem, index, arr) {
//		return elem.id != req.params.id;
//	});
});


//////////////////////////////////////////////////
// Listen to requests.
//////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
});
