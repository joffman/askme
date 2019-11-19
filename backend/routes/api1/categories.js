const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", async function(req, res) {
	try {
		// Get categories from database and add number of cards to it.
		var categories_data = await database.getCategories();
		res.json({success: true, categories: categories_data});
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
		const category = { name: req.body.name };
		try {
			var category_id = await database.addCategory(category);
			res.json({success: true, id: category_id});
		} catch (err) {
			console.log("Error:", err);
			res.statusCode = 500;
			res.json({
				success: false,
				error_msg: err.message
			});
		}
	} else {
		console.log("Invalid category. Sending 400.");
		res.statusCode = 400;
		res.json({
			success: false,
			error_msg: "name-parameter missing in request-body"
		});
	}
});

router.delete("/:id", async function(req, res) {
	try {
		var changes = await database.deleteCategory(req.params.id);
		if (changes === 1)
			res.json({success: true});
		else
			res.json({
				success: false,
				error_msg: `category with id ${id} does not exist`
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
