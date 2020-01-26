const createError = require("http-errors");
const express = require("express");
const flash = require("express-flash");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const morgan = require("morgan");

const winston_logger = require("./config/winston.js");

// Initialize the passport module.
const initializePassport = require("./passport_config.js");
initializePassport(passport);

// Create and init express-app.
const app = express();
app.set("view-engine", "ejs");

// Initialize logging.
app.use(morgan("combined", { stream: winston_logger.stream }));

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
    "/api1/users",
    verifyApiAuthentication,
    require("./routes/api1/users.js")
);
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
    "/api1/collectionRatings",
    verifyApiAuthentication,
    require("./routes/api1/collection_ratings.js")
);
app.use(
    "/api1/cards",
    verifyApiAuthentication,
    require("./routes/api1/cards.js")
);

// TODO Why is this commented out?
//// Protect admin app.
//app.use("/admin", verifyIsAdmin, express.static(path.join(__dirname, "/../admin")));

// Set up static routes.
// All other static files are protected, except CSS-files and favicon.ico.
app.use((req, res, next) => {
    if (
        req.isAuthenticated() ||
        req.path.startsWith("/css/") || // what is with /css/../...? is this safe?
        req.path === "/favicon.ico"
    )
        return next();
    else res.redirect("/login");
});
app.use(express.static(path.join(__dirname, "/../apps")));

// Catch 404 and forward to error handler.
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler.
app.use(function(err, req, res, next) {
    // Log the error.
    const logMsg = `${err.status} - ${err.message} - ${req.method} - ${req.originalUrl} - ${req.ip}`;
    if (err.status == 500) {
        winston_logger.error(logMsg);
    } else {
        winston_logger.error(logMsg);
    }
    next();
});

// Listen to requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    winston_logger.info(`Server listening on port ${PORT}`);
});
