const express = require("express");
const router = express.Router();

const winston_logger = require("../../config/winston.js");
const Database = require("../../database.js");

var database = new Database();

// TODO These should be general utility functions.
function invalidInput(res, msg) {
    res.statusCode = 400;
    return res.json({
        success: false,
        errorMsg: msg
    });
}

function serverError(res, msg) {
    res.statusCode = 500;
    return res.json({
        success: false,
        errorMsg: msg
    });
}

router.get("/", async function(req, res) {
    try {
        // Get database filter.
        const collectionId = parseInt(req.query.collectionId);
        if (isNaN(collectionId)) {
            winston_logger.warn(
                `CollectionRatingRoutes.getRatings (collection-id: ${collectionId}): Invalid collection-id.`
            );
            return invalidInput(res, "Invalid or missing collectionId filter.");
        }

        // Fetch and return ratings.
        const ratingsData = await database.getCollectionRatings(collectionId);
        return res.json({ success: true, ratings: ratingsData });
    } catch (err) {
        winston_logger.warn(
            `CollectionRatingRoutes.getRatings (collection-id: ${collectionId}): Error: %o`,
            err
        );
        return serverError(res, err.message);
    }
});

router.post("/", async function(req, res) {
    winston_logger.debug(
        "CollectionRatingRoutes.addRating: Entered with request-body: %o",
        req.body
    );
    const rating = req.body.rating;
    const collectionId = parseInt(req.body.collectionId);
    const userId = req.user.id;
    if (isNaN(collectionId))
        winston_logger.warn(
            "CollectionRatingRoutes.addRating: Missing or invalid collectionId field in body."
        );
    return invalidInput(res, "Missing or invalid collectionId field in body.");
    try {
        var findResult = await database.findCollectionRating(
            collectionId,
            userId
        );
        winston_logger.debug(
            "CollectionRatingRoutes.addRating: Result of findRating: %o",
            findResult
        );
        if (findResult.found) {
            var ret = await database.updateCollectionRating(
                rating,
                collectionId,
                userId
            );
        } else {
            var ratingId = await database.addCollectionRating(
                rating,
                collectionId,
                userId
            );
        }
        res.json({ success: true });
    } catch (err) {
        // TODO: Send 400 for invalid inputs (e.g. collection does not exist).
        winston_logger.warn("CollectionRatingRoutes.addRating: Error: %o", err);
        return serverError(res, err.message);
    }
});

module.exports = router;
