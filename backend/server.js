const express = require("express");
const path = require("path");

const app = express();

// Set up middleware.
app.use(express.json());
app.use(express.static(path.join(__dirname, "/../public")));
app.use("/api1/categories", require("./routes/api1/categories.js"));
app.use("/api1/collections", require("./routes/api1/collections.js"));
app.use("/api1/cards", require("./routes/api1/cards.js"));

// Listen to requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
