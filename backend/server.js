const express = require("express");
const path = require("path");

const app = express();


//////////////////////////////////////////////////
// Model.
// TODO: Get this from database.
//////////////////////////////////////////////////

var topics_data = [
{
	id: 1,
	name: "C++",
	num_cards: 6
},
{
	id: 2,
	name: "Web Development",
	num_cards: 7
}];

var id = 3;


//////////////////////////////////////////////////
// Set up middleware.
//////////////////////////////////////////////////

app.use(express.json());
app.use(express.static(path.join(__dirname, "/../public")));


//////////////////////////////////////////////////
// Set up topics api routes.
//////////////////////////////////////////////////

app.get("/api1/topics", function(req, res) {
	res.json({success: true, topics: topics_data});
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
