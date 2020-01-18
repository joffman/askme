const express = require("express");
const router = express.Router();

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
        console.log(
            "Got request for collection-ratings with collection-id:",
            collectionId
        );
        if (isNaN(collectionId))
            return invalidInput(res, "Invalid or missing collectionId filter.");

        // Fetch and return ratings.
        const ratingsData = await database.getCollectionRatings(collectionId);
        return res.json({ success: true, ratings: ratingsData });
    } catch (err) {
        return serverError(res, err.message);
    }
});

router.post("/", async function(req, res) {
    console.log("Received post to collectionRatings...");
    console.log("Body:", req.body);
    const rating = req.body.rating;
    const collectionId = parseInt(req.body.collectionId);
    const userId = req.user.id;
    if (isNaN(collectionId))
        return invalidInput(
            res,
            "Missing or invalid collectionId field in body."
        );
    try {
        var findResult = await database.findCollectionRating(
            collectionId,
            userId
        );
        console.log("Result of findRating:", findResult);
        if (findResult.found) {
            console.log("Rating already exists. Updating rating...");
            var ret = await database.updateCollectionRating(
                rating,
                collectionId,
                userId
            );
            console.log("Return value:", ret);
        } else {
            console.log("Rating does not exist. Creating new rating...");
            var ratingId = await database.addCollectionRating(
                rating,
                collectionId,
                userId
            );
            console.log("Return value (id):", ratingId);
        }
        res.json({ success: true });
    } catch (err) {
        // TODO: Send 400 for invalid inputs (e.g. collection does not exist).
        return serverError(res, err.message);
    }
});

module.exports = router;
