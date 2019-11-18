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
	// Topics API.
	//////////////////////////////////////////////////

	getTopics() {
		const sql = "SELECT id, name, "
			+ "(SELECT COUNT(*) FROM card WHERE card.topic_id = topic.id) num_cards "
			+ "FROM topic";
		return this.db.allAsync(sql, []);
	}

	addTopic(topic) {
		// TODO: Can't we just let the database do the validation?
		if ("name" in topic) {
			const sql = "INSERT INTO topic (name) VALUES (?)";
			return this.db.insertAsync(sql, [topic.name]);
		} else {
			return Promise.reject({message: "invalid topic-data passed to addTopic"});
		}
	}

	deleteTopic(topic_id) {
		const sql = "DELETE FROM topic WHERE id = ?";
		return this.db.deleteAsync(sql, topic_id);
	}


	//////////////////////////////////////////////////
	// Cards API.
	//////////////////////////////////////////////////

	getCards(topic_id) {
		const sql = "SELECT id, title FROM card WHERE topic_id = ?";
		return this.db.allAsync(sql, [topic_id]);
	}

	getCard(card_id) {
		const sql = "SELECT * FROM card WHERE id = ?";
		return this.db.getAsync(sql, [card_id]);
	}

	addCard(card) {
		// The database does the validation.
		const sql = "INSERT INTO card (title, question, answer, topic_id)"
		   + " VALUES (?, ?, ?, ?)";
		return this.db.insertAsync(sql,
				[card.title, card.question, card.answer, card.topic_id]);
	}

	updateCard(card_id, card) {
		// The database does the validation.
		const sql = "UPDATE card SET title=?, question=?, answer=?, topic_id=? "
			+ "WHERE id=?";
		return this.db.updateAsync(sql,
				[card.title, card.question, card.answer, card.topic_id, card_id]);
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
