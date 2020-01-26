const express = require("express");
const router = express.Router();

const winston_logger = require("../../config/winston.js");
const Database = require("../../database.js");

var database = new Database();

router.get("/", async function(req, res) {
    try {
        // Get categories from database and add number of cards to it.
        var categoriesData = await database.getCategories();
        res.json({ success: true, categories: categoriesData });
    } catch (err) {
        winston_logger.error("CategoryRoutes.getCategories: Error: %o", err);
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
            res.json({ success: true, id: categoryId });
        } catch (err) {
            winston_logger.warn("CategoryRoutes.addCategory: Error: %o", err);
            res.statusCode = 500;
            res.json({
                success: false,
                errorMsg: err.message
            });
        }
    } else {
        winston_logger.warn("CategoryRoutes.addCategory: Name missing.");
        res.statusCode = 400;
        res.json({
            success: false,
            errorMsg: "name-parameter missing in request-body"
        });
    }
});

router.delete("/:id", async function(req, res) {
    const catId = req.params.id;
    try {
        var changes = await database.deleteCategory(catId);
        if (changes === 1) {
            res.json({ success: true });
        } else {
            winston_logger.warn(
                `CategoryRoutes.deleteCategory (category-id: ${catId}): Category does not exist.`
            );
            res.statusCode = 400;
            res.json({
                success: false,
                errorMsg: `category with id ${catId} does not exist`
            });
        }
    } catch (err) {
        winston_logger.error(
            `CategoryRoutes.deleteCategory (category-id: ${catId}): Error: %o.`,
            err
        );
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

module.exports = router;
