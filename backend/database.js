const sqlite3 = require("sqlite3").verbose();

// TODO Rework error handling.

class Database {
	constructor() {
		this.db = new sqlite3.Database("askme.db");

		this.db.run("PRAGMA foreign_keys = ON", [], function(err) {
			if (err)
				throw err;
		});

		//////////////////////////////////////////////////
		// Define async functions.
		//////////////////////////////////////////////////

		this.db.getAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.get(sql, params, function(err, row) {
					if (err)
						reject(err);
					else
						resolve(row);
				});
			});
		};

		this.db.runAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.run(sql, params, function(err) {
					if (err)
						reject(err);
					else
						resolve();
				});
			});
		};

		this.db.allAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.all(sql, params, function(err, rows) {
					if (err)
						reject(err);
					else
						resolve(rows);
				});
			});
		};

		this.db.deleteAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.run(sql, params, function(err) {
					if (err)
						reject(err);
					else
						resolve(this.changes);
				});
			});
		};

		this.db.updateAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.run(sql, params, function(err) {
					if (err)
						reject(err);
					else
						resolve(this.changes);
				});
			});
		};

		this.db.insertAsync = function(sql, params) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.run(sql, params, function(err) {
					if (err)
						reject(err);
					else
						resolve(this.lastID);
				});
			});
		};
	}

	//////////////////////////////////////////////////
	// Categories API.
	//////////////////////////////////////////////////

	getCategories() {
		const sql = "SELECT * FROM category";
		return this.db.allAsync(sql, []);
	}

	addCategory(category) {
		// TODO: Can't we just let the database do the validation?
		if ("name" in category) {
			const sql = "INSERT INTO category (name) VALUES (?)";
			return this.db.insertAsync(sql, [category.name]);
		} else {
			return Promise.reject({message: "invalid category-data passed to addCategory"});
		}
	}

	deleteCategory(category_id) {
		const sql = "DELETE FROM category WHERE id = ?";
		return this.db.deleteAsync(sql, category_id);
	}


	//////////////////////////////////////////////////
	// Collections API.
	//////////////////////////////////////////////////

	getCollections() {
		const sql = "SELECT id, name, "
			+ "(SELECT COUNT(*) FROM card WHERE card.collection_id = collection.id) num_cards "
			+ "FROM collection";
		return this.db.allAsync(sql, []);
	}

	addCollection(collection) {
		// TODO: Can't we just let the database do the validation?
		if ("name" in collection) {
			const sql = "INSERT INTO collection (name) VALUES (?)";
			return this.db.insertAsync(sql, [collection.name]);
		} else {
			return Promise.reject({message: "invalid collection-data passed to addCollection"});
		}
	}

	deleteCollection(collection_id) {
		const sql = "DELETE FROM collection WHERE id = ?";
		return this.db.deleteAsync(sql, collection_id);
	}


	//////////////////////////////////////////////////
	// Cards API.
	//////////////////////////////////////////////////

	getCards(collection_id) {
		const sql = "SELECT id, title FROM card WHERE collection_id = ?";
		return this.db.allAsync(sql, [collection_id]);
	}

	getCard(card_id) {
		const sql = "SELECT * FROM card WHERE id = ?";
		return this.db.getAsync(sql, [card_id]);
	}

	addCard(card) {
		// The database does the validation.
		const sql = "INSERT INTO card (title, question, answer, collection_id)"
		   + " VALUES (?, ?, ?, ?)";
		return this.db.insertAsync(sql,
				[card.title, card.question, card.answer, card.collection_id]);
	}

	updateCard(card_id, card) {
		// The database does the validation.
		const sql = "UPDATE card SET title=?, question=?, answer=?, collection_id=? "
			+ "WHERE id=?";
		return this.db.updateAsync(sql,
				[card.title, card.question, card.answer, card.collection_id, card_id]);
	}

	deleteCard(card_id) {
		const sql = "DELETE FROM card WHERE id = ?";
		return this.db.deleteAsync(sql, [card_id]);
	}


	//////////////////////////////////////////////////
	// Attachments API.
	//////////////////////////////////////////////////

	getAttachment(attachment_id) {
		const sql = "SELECT * FROM attachment WHERE id = ?";
		return this.db.getAsync(sql, [attachment_id]);
	}

	getAttachments(card_id) {
		const sql = "SELECT * FROM attachment WHERE card_id = ?";
		return this.db.allAsync(sql, [card_id]);
	}

	addAttachment(url_path, card_id, belongs_to) {
		const sql = "INSERT INTO attachment (path, card_id, belongs_to)"
			+ " VALUES (?, ?, ?)";
		return this.db.insertAsync(sql, [url_path, card_id, belongs_to]);
	}

	deleteAttachment(attachment_id) {
		const sql = "DELETE FROM attachment WHERE id = ?";
		return this.db.deleteAsync(sql, [attachment_id]);
	}

	deleteAttachments(card_id) {
		const sql = "DELETE FROM attachment WHERE card_id = ?";
		return this.db.deleteAsync(sql, [card_id]);
	}

	// todo: where to call db.close()?
}

module.exports = Database;
