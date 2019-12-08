const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const Database = require("../database.js");
var database = new Database();

router.get("/", function(req, res) {
    res.render("../../public/register.ejs");
});

router.post("/", async (req, res) => {
    // Check inputs.
    // TODO:
    //	- Use function for checking valid email format.
    //	- Redirect to /register with error message.
    const email = req.body.email;
    const password = req.body.password;
    if (!email || /^\s*$/.test(email))
        res.status(400).send("Required email-address is missing.");
    if (!password || /^\s*$/.test(password))
        res.status(400).send("Required password is missing.");

    try {
        // Compute password hash.
        var hash = await bcrypt.hash(password, 10);

        // Store user in database.
        var user = {
            email: email,
            password: hash
        };
        await database.addUser(user);

        res.redirect("/login"); // TODO: pass success message
    } catch (err) {
        console.log("Error:", err);
        var errorMsg = "";
        if (err.errno == 19) {
            // User with given email already exists.
            errorMsg = "User with given email already exists.";
        }
        res.redirect("/register"); // TODO: Pass errorMsg.
    }
});

module.exports = router;
