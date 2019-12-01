const express = require("express");
const flash = require("express-flash");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const initializePassport = require("./passport_config.js");
initializePassport(passport);

const app = express();
app.set("view-engine", "ejs");

// Create authentication middleware function.
function verifyAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		return res.redirect("/login");
}

function verifyNotAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return res.redirect("/index.html");
	else
		return next();
}

// Set up middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
	cookie: { maxAge: 18000000 },
	resave: false,
	saveUninitialized: false,
	secret: "this is not secure...",	// todo
	store: new MemoryStore({
		checkPeriod: 18000000
	})
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up routes-middleware.
app.use("/register", verifyNotAuthenticated, require("./routes/register.js"));
app.use("/login", verifyNotAuthenticated, require("./routes/login.js"));
// TODO: Add logout route.

// Set up api routes. todo. Protect them.
app.use("/api1/categories", require("./routes/api1/categories.js"));
app.use("/api1/collections", require("./routes/api1/collections.js"));
app.use("/api1/cards", require("./routes/api1/cards.js"));

// Set up static routes.
// All files in public are protected, except favicon.ico.
app.use((req, res, next) => {
	if (req.path === "/favicon.ico")
		return res.sendFile("/../public/favicon.ico");
	else
		return next();
});
//app.use(verifyAuthenticated, express.static(path.join(__dirname, "/../public")));

// Listen to requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
