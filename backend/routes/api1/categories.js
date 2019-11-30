const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();


router.get("/", async function(req, res) {
	try {
		// Get categories from database and add number of cards to it.
		var categoriesData = await database.getCategories();
		res.json({success: true, categories: categoriesData});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false, 
			errorMsg: err.message
		});
	}
});

router.post("/", async function(req, res) {
	if ("name" in req.body) {
		const category = { name: req.body.name };
		try {
			var categoryId = await database.addCategory(category);
			res.json({success: true, id: categoryId});
		} catch (err) {
			console.log("Error:", err);
			res.statusCode = 500;
			res.json({
				success: false,
				errorMsg: err.message
			});
		}
	} else {
		console.log("Invalid category. Sending 400.");
		res.statusCode = 400;
		res.json({
			success: false,
			errorMsg: "name-parameter missing in request-body"
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
				errorMsg: `category with id ${id} does not exist`
			});
	} catch (err) {
		res.statusCode = 500;
		res.json({
			success: false,
			errorMsg: err.message
		});
	}
});

module.exports = router;
