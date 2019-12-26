const express = require("express");
const flash = require("express-flash");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

// Initialize the passport module.
const initializePassport = require("./passport_config.js");
initializePassport(passport);

// Create and init express-app.
const app = express();
app.set("view-engine", "ejs");

// Create authentication middleware functions.
function verifyApiAuthentication(req, res, next) {
    if (req.isAuthenticated()) return next();
    else return res.sendStatus(401);
}

function verifyAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    else return res.redirect("/login");
}

function verifyNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/index.html");
    else return next();
}

// Set up general middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        cookie: { maxAge: 18000000 }, // 5h
        resave: false,
        saveUninitialized: false,
        secret: "this is not secure...", // todo
        store: new MemoryStore({
            checkPeriod: 18000000 // 5h
        })
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Set up register-, login- and logout-routes.
app.use("/register", verifyNotAuthenticated, require("./routes/register.js"));
app.use("/login", verifyNotAuthenticated, require("./routes/login.js"));
app.use("/logout", require("./routes/logout.js"));

// Set up api routes. TODO: Protect them using authentication.
app.use(
    "/api1/categories",
    verifyApiAuthentication,
    require("./routes/api1/categories.js")
);
app.use(
    "/api1/collections",
    verifyApiAuthentication,
    require("./routes/api1/collections.js")
);
app.use(
    "/api1/cards",
    verifyApiAuthentication,
    require("./routes/api1/cards.js")
);

//// Protect admin app.
//app.use("/admin", verifyIsAdmin, express.static(path.join(__dirname, "/../admin")));

// Set up static routes.
// All other static files are protected, except CSS-files and favicon.ico.
app.use((req, res, next) => {
    if (
        req.isAuthenticated() ||
        req.path.startsWith("/css/") ||
        req.path === "/favicon.ico"
    )
        return next();
    else res.redirect("/login");
});
app.use(express.static(path.join(__dirname, "/../apps")));

// Listen to requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
