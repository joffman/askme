const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const winston_logger = require("../config/winston.js");
const Database = require("../database.js");
var database = new Database();

router.get("/", function(req, res) {
    res.render("../../apps/register.ejs");
});

router.post("/", async (req, res) => {
    // Check inputs.
    // TODO:
    //	- Use function for checking valid email format.
    //	- Redirect to /register with error message.
    //	- Send confirmation mail.
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    winston_logger.info(
        `Got registration-request for user ${username} ` +
            `with email ${email}.`
    );
    if (!username || /^\s*$/.test(username))
        return res.status(400).send("Required username is missing.");
    if (!email || /^\s*$/.test(email))
        return res.status(400).send("Required email-address is missing.");
    if (!password || /^\s*$/.test(password))
        return res.status(400).send("Required password is missing.");

    try {
        // Compute password hash.
        winston_logger.debug(`Computing password-hash for user ${username}...`);
        var hash = await bcrypt.hash(password, 10);

        // Store user in database.
        winston_logger.debug(
            `Trying to store new user ${username} in database...`
        );
        var user = {
            username: username,
            email: email,
            password: hash,
            isAdmin: 0
        };
        const id = await database.addUser(user);

        winston_logger.info(
            `Successfully registered user ${username} in database.`
        );
        res.status(200).render("../../apps/register.ejs", {
            success: true,
            username: username
        });
    } catch (err) {
        winston_logger.warn(`Creating user ${username} failed. Error: %o`, err);
        var errorMsg = "User creation failed.";
        if (err.errno == 19)
            errorMsg = "User with given username or email already exists.";
        res.statusCode = 400;
        res.render("../../apps/register.ejs", {
            error: errorMsg
        });
    }
});

module.exports = router;
