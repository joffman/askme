const express = require("express");
const router = express.Router();

const winston_logger = require("../../config/winston.js");
const Database = require("../../database.js");

var database = new Database();

//TODO: Check that collections and cards can only
//	be updated & deleted by their authors/owners.

router.get("/", async function(req, res) {
    try {
        // Set database filter.
        const filterStr = req.query.filter;
        var filter = null;
        if (filterStr == "me") {
            filter = { userId: req.user.id };
        } else if (filterStr == "public") {
            filter = { public: 1 };
        } else {
            winston_logger.warn(
                `CollectionRoutes.getCollections: Invalid filter parameter: ${filterStr}`
            );
            throw Error("Invalid or missing 'filter' query-parameter.");
        }

        // Fetch and return collections.
        var collectionsData = await database.getCollections(filter);
        for (var i = 0; i < collectionsData.length; ++i) {
            // Replace (comma-separated) categoryNames string with array of strings.
            if (collectionsData[i].categoryNames)
                collectionsData[i].categoryNames = collectionsData[
                    i
                ].categoryNames.split(",");
            else collectionsData[i].categoryNames = [];
        }
        return res.json({ success: true, collections: collectionsData });
    } catch (err) {
        winston_logger.warn("CollectionRoutes.getCollections: Error: %o", err);
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.get("/:id", async function(req, res) {
    const collId = req.params.id;
    try {
        var collectionData = await database.getCollection(req.params.id);
        if (collectionData) {
            res.json({ success: true, collection: collectionData });
        } else {
            winston_logger.warn(
                `CollectionRoutes.getCollection (id: ${collId}): No collection with given id.`
            );
            res.statusCode = 400;
            return res.json({
                success: false,
                errorMsg: "No collection with given id."
            });
        }
    } catch (err) {
        winston_logger.error(
            `CollectionRoutes.getCollection (id: ${collId}): Error: %o`,
            err
        );
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.post("/", async function(req, res) {
    const collection = req.body;
    const userId = req.user.id;
    winston_logger.debug(
        `CollectionRoutes.addCollection: Entered with user-id ${userId} and body: %o`,
        req.body
    );
    try {
        var collectionId = await database.addCollection(collection, userId);
        return res.json({ success: true, id: collectionId });
    } catch (err) {
        // TODO Check for invalid input and send 400.
        winston_logger.warn(`CollectionRoutes.addCollection: Error: %o`, err);
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

// todo: Use POST /:id for updating and publishing
//	a collection. Then build the sql dynamically from
//	the POST-/Request-body.
router.post("/:id/publish", async function(req, res) {
    const collectionId = req.params.id;
    const userId = req.user.id;
    try {
        await database.publishCollection(collectionId, userId);
        return res.json({ success: true });
    } catch (err) {
        // TODO Check for invalid input and send 400.
        winston_logger.warn(
            `CollectionRoutes.publishCollection (collection-id: ${collectionId}): Error: %o`,
            err
        );
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.put("/:id", async function(req, res) {
    const collection = req.body;
    const collId = req.params.id;
    const userId = req.user.id;
    winston_logger.debug(
        `CollectionRoutes.updateCollection (collection-id: ${collId}): Entered with body: %o`,
        req.body
    );
    try {
        var changes = await database.updateCollection(
            collId,
            collection,
            userId
        );
        return res.json({ success: true });
    } catch (err) {
        // todo: Check for invalid input and send 400.
        winston_logger.warn(
            `CollectionRoutes.updateCollection (collection-id: ${collId}): Error: %o`,
            err
        );
        res.statusCode = 500;
        return res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.delete("/:id", async function(req, res) {
    const collId = req.params.id;
    try {
        var changes = await database.deleteCollection(collId);
        if (changes === 1) {
            return res.json({ success: true });
        } else {
            winston_logger.warn(
                `CollectionRoutes.deleteCollection (collection-id: ${collId}): Collection does not exist.`
            );
            res.statusCode = 400;
            return res.json({
                success: false,
                errorMsg: `Collection with id ${id} does not exist.`
            });
        }
    } catch (err) {
        winston_logger.warn(
            `CollectionRoutes.deleteCollection (collection-id: ${collId}): Error: %o`,
            err
        );
        if (err.code == "SQLITE_CONSTRAINT") {
            res.statusCode = 400;
            return res.json({
                success: false,
                errorMsg:
                    "SQL constraint failed." +
                    " You can only delete a collection, when it does" +
                    " not contain any cards."
            });
        } else {
            res.statusCode = 500;
            return res.json({
                success: false,
                errorMsg: err.message
            });
        }
    }
});

module.exports = router;
