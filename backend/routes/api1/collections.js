const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();

//TODO: Check that collections and cards can only
//	be updated & deleted by their authors.

router.get("/", async function(req, res) {
    try {
		// Set database filter.
		const filterStr = req.query.filter;
		var filter = null;
		if (filterStr == "me")
			filter = { userId: req.user.id };
		else if (filterStr == "public")
			filter = { public: 1 };
		else 
			throw Error("Invalid or missing 'filter' query-parameter.");

		// Fetch and return collections.
		var collectionsData = await database.getCollections(filter);
		for (var i = 0; i < collectionsData.length; ++i) {
			// Replace (comma-separated) categoryNames string with array of strings.
			if (collectionsData[i].categoryNames)
				collectionsData[i].categoryNames = collectionsData[i].categoryNames.split(",");
			else
				collectionsData[i].categoryNames = [];
		}
        res.json({ success: true, collections: collectionsData });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.get("/:id", async function(req, res) {
    try {
        var collectionData = await database.getCollection(req.params.id);
        if (collectionData) {
            res.json({ success: true, collection: collectionData });
        } else {
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: "No collection with given id."
            });
        }
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.post("/", async function(req, res) {
    const collection = req.body;
    const userId = req.user.id;
    try {
        var collectionId = await database.addCollection(collection, userId);
        res.json({ success: true, id: collectionId });
    } catch (err) {
        // TODO Check for invalid input and send 400.
        console.log("Error:", err);
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.put("/:id", async function(req, res) {
    const collection = req.body;
    const collId = req.params.id;
    const userId = req.user.id;
    try {
        var changes = await database.updateCollection(collId, collection, userId);
        res.json({ success: true });
    } catch (err) {
        // todo: Check for invalid input and send 400.
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.delete("/:id", async function(req, res) {
    try {
        var changes = await database.deleteCollection(req.params.id);
        if (changes === 1) res.json({ success: true });
        else res.statusCode = 400;
        res.json({
            success: false,
            errorMsg: `Collection with id ${id} does not exist.`
        });
    } catch (err) {
        if (err.code == "SQLITE_CONSTRAINT") {
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg:
                    "SQL constraint failed." +
                    " You can only delete a collection, when it does" +
                    " not contain any cards."
            });
        } else {
            res.statusCode = 500;
            res.json({
                success: false,
                errorMsg: err.message
            });
        }
    }
});

module.exports = router;
