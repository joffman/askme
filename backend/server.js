const express = require("express");
const path = require("path");

const app = express();

// Set up handling of static files.
app.use(express.static(path.join(__dirname, "/../public")));

// Listen to requests.
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
});
