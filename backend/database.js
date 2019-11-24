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
		// TODO Make sure that deletion is cascaded to collection_category table.
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

	getCollection(id) {
		// Get collection-promise.
		const collSql = "SELECT id, name "
			+ "FROM collection WHERE id = ?";
		var collProm = this.db.getAsync(collSql, [id]);

		// Get category-ids-promise.
		const catSql = "SELECT category_id FROM collection_category "
			+ "WHERE collection_id = ?";
		var catProm = this.db.allAsync(catSql, [id]);

		return Promise.all([collProm, catProm]).then((values) => {
			var coll = values[0];
			if (!coll)
				return null;

			// Merge collection and categories.
			var cats = values[1];
			coll.categoryIds = cats.map((elem) => { return elem.category_id; });
			return coll;
		});
	}

	async addCollection(collection) {
		console.log("addCollection entered.");
		try {
			await this.db.runAsync("BEGIN TRANSACTION");

			// Insert collection.
			console.log("Inserting collection.");
			const collSql = "INSERT INTO collection (name) VALUES (?)";
			const collId = await this.db.insertAsync(collSql, [collection.name]);

			if (!collection.categoryIds || collection.categoryIds.length == 0) {
				console.log("No categories given. Committing.");
				return this.db.runAsync("COMMIT").then(() => {
					return collId;
				});
			}

			// Create promises for inserting the collection-categories.
			var collCatPromises = [];
			console.log("Creating collection-category-promises.");
			for (var catId of collection.categoryIds) {
				const collCatSql = "INSERT INTO collection_category "
					+ "(collection_id, category_id) VALUES (?, ?)";
				collCatPromises.push(this.db.insertAsync(collCatSql,
							[collId, catId]));
			}
			return Promise.all(collCatPromises).then(async (values) => {
				// We successfully inserted the collection and all
				// collection-categories.
				// Commit the transaction and return the ID of the new collection.
				console.log("Committing...");
				await this.db.runAsync("COMMIT");
				return collId;
			}).catch(async (err) => {
				console.log("Error:", err);
				console.log("Rolling back.");
				await this.db.runAsync("ROLLBACK");
				return Promise.reject(err);
			});
		} catch (err) {
			console.log("Error on async operation:", err);
			console.log("Rolling back...");
			await this.db.runAsync("ROLLBACK");
			return Promise.reject(err);
		}
	}

	async updateCollection(collId, collection) {
		console.log("updateCollection entered.");
		try {
			await this.db.runAsync("BEGIN TRANSACTION");

			// Create update-collection promise.
			const collSql = "UPDATE collection SET name = ? WHERE id = ?";
			var collProm = this.db.updateAsync(collSql,
					[collection.name, collId]).then((changes) => {
				if (changes == 0)
					return Promise.reject(Error(`No collection with given id ${collId}.`));
				else
					return changes;
			});

			// Remove all categories from this collection.
			const deleteCollCatsSql =
				"DELETE FROM collection_category WHERE collection_id = ?";
			await this.db.deleteAsync(deleteCollCatsSql, [collId]);

			// Create promises to insert categories for this collection.
			var promises = [];
			if (collection.categoryIds) {
				for (var catId of collection.categoryIds) {
					// TODO Create function for insert into collection_category.
					const sql = "INSERT INTO collection_category "
						+ "(collection_id, category_id) VALUES (?, ?)";
					promises.push(this.db.insertAsync(sql, [collId, catId]));
				}
			}

			// Collect all promises and check their outcome.
			promises.push(collProm);
			return Promise.all(promises).then((values) => {
				console.log("Committing.");
				return this.db.runAsync("COMMIT");
			}).catch((err) => {
				console.log("Error:", err);
				console.log("Rolling back.");
				return this.db.runAsync("ROLLBACK").then(() => {
					return Promise.reject(err);
				});
			});
		} catch (err) {
			console.log("Error on async operation:", err);
			console.log("Rolling back.");
			await this.db.runAsync("ROLLBACK");
			return Promise.reject(err);
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
