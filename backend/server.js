const express = require("express");
const path = require("path");

const Database = require("./database.js");

const app = express();


//////////////////////////////////////////////////
// Model.
// TODO: Get this from database.
//////////////////////////////////////////////////

//var topics_data = [
//{
//	id: 1,
//	name: "C++",
//	num_cards: 6
//},
//{
//	id: 2,
//	name: "Web Development",
//	num_cards: 7
//}];
//
//var id = 3;


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
	if ("topic_name" in req.body) {
		topics_data.push({
			id: id++,
			name: req.body.topic_name,
			num_cards: 0
		});
		res.json({success: true});
	} else {
		res.json({success: false});
	}
});

app.delete("/api1/topics/:id", function(req, res) {
	topics_data = topics_data.filter(function(elem, index, arr) {
		return elem.id != req.params.id;
	});
	res.json({success: true});
});


//////////////////////////////////////////////////
// Listen to requests.
//////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
});
