const express = require("express");
const router = express.Router();

const Database = require("../../database.js");

var database = new Database();

router.get("/", async function(req, res) {
    try {
        // Fetch and return users.
        var usersData = await database.getUsers();
        return res.json({ success: true, users: usersData });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

router.get("/me", async function(req, res) {
    try {
        // Get session-user from database.
        var userData = await database.getUserFromId(req.user.id);
        delete userData.password;
        return res.json({ success: true, user: userData });
    } catch (err) {
        res.statusCode = 500;
        res.json({
            success: false,
            errorMsg: err.message
        });
    }
});

module.exports = router;
