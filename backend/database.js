const sqlite3 = require("sqlite3").verbose();

// TODO Rework error handling.

class Database {
    constructor() {
        this.db = new sqlite3.Database("askme.db", sqlite3.OPEN_READWRITE);

        this.db.run("PRAGMA foreign_keys = ON", [], function(err) {
            if (err) throw err;
        });

        //////////////////////////////////////////////////
        // Define async functions.
        //////////////////////////////////////////////////

        this.db.getAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.get(sql, params, function(err, row) {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        };

        this.db.runAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        };

        this.db.allAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.all(sql, params, function(err, rows) {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        };

        this.db.deleteAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        };

        this.db.updateAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        };

        this.db.insertAsync = function(sql, params) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        };
    }

    //////////////////////////////////////////////////
    // Users API.
    //////////////////////////////////////////////////

    // Return all users.
    getUsers() {
        const sql = "SELECT id, username, email, isAdmin FROM user";
        return this.db.allAsync(sql, []);
    }

    getUserFromId(userid) {
        const sql = "SELECT * FROM user WHERE id = ?";
        return this.db.getAsync(sql, [userid]);
    }

    getUserFromUsername(username) {
        const sql = "SELECT * FROM user WHERE username = ?";
        return this.db.getAsync(sql, [username]);
    }

    addUser(user) {
        const sql =
            "INSERT INTO user (username, email, password, isAdmin) VALUES (?, ?, ?, ?)";
        return this.db.insertAsync(sql, [
            user.username,
            user.email,
            user.password,
            user.isAdmin
        ]);
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
            return Promise.reject({
                message: "invalid category-data passed to addCategory"
            });
        }
    }

    deleteCategory(categoryId) {
        // TODO Make sure that deletion is not possible if collectionCategory table
        //   contains corresponding entries.
        const sql = "DELETE FROM category WHERE id = ?";
        return this.db.deleteAsync(sql, categoryId);
    }

    //////////////////////////////////////////////////
    // Collections API.
    //////////////////////////////////////////////////

    getCollections(filter) {
        // todo: Create temporary table for namedCollectionCategories
        // to improve readability.
        var sql =
            "SELECT *, " +
            "(SELECT user.username FROM user WHERE user.id = collection.userId) username, " +
            "(SELECT group_concat(namedCollectionCategories.name, ',') categoryNames " +
            "FROM (SELECT collectionCategory.collectionId, category.name from collectionCategory INNER JOIN category ON collectionCategory.categoryId = category.id) " +
            "AS namedCollectionCategories WHERE namedCollectionCategories.collectionId = collection.id) categoryNames, " +
            "(SELECT COUNT(*) FROM card WHERE card.collectionId = collection.id) numCards " +
            "FROM collection";
        var values = [];
        if (filter) {
            sql += " WHERE";
            const validKeys = ["userId", "public"];
            var first = true;
            for (var key in filter) {
                if (!validKeys.includes(key))
                    throw Error("Invalid filter key: " + key);
                if (!first) sql += " AND";
                sql += " " + key + " = ?";
                values.push(filter[key]);
                first = false;
            }
        }
        return this.db.allAsync(sql, values);
    }

    getCollection(id) {
        // Get collection-promise.
        const collSql = "SELECT * FROM collection WHERE id = ?";
        var collProm = this.db.getAsync(collSql, [id]);

        // Get category-ids-promise.
        const catSql =
            "SELECT categoryId FROM collectionCategory " +
            "WHERE collectionId = ?";
        var catProm = this.db.allAsync(catSql, [id]);

        return Promise.all([collProm, catProm]).then(values => {
            var coll = values[0];
            if (!coll) return null;

            // Merge collection and categories.
            var cats = values[1];
            coll.categoryIds = cats.map(elem => {
                return elem.categoryId;
            });
            return coll;
        });
    }

    async addCollection(collection, userId) {
        console.log("addCollection entered.");
        try {
            await this.db.runAsync("BEGIN TRANSACTION");

            // Insert collection.
            console.log("Inserting collection.");
            const collSql =
                "INSERT INTO collection (name, description, userId, public) VALUES (?, ?, ?, ?)";
            const collId = await this.db.insertAsync(collSql, [
                collection.name,
                collection.description,
                userId,
                0
            ]);

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
                const collCatSql =
                    "INSERT INTO collectionCategory " +
                    "(collectionId, categoryId) VALUES (?, ?)";
                collCatPromises.push(
                    this.db.insertAsync(collCatSql, [collId, catId])
                );
            }
            return Promise.all(collCatPromises)
                .then(async values => {
                    // We successfully inserted the collection and all
                    // collection-categories.
                    // Commit the transaction and return the ID of the new collection.
                    console.log("Committing...");
                    await this.db.runAsync("COMMIT");
                    return collId;
                })
                .catch(async err => {
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

    async publishCollection(collId, userId) {
        console.log("publishCollection entered.");

        // Only the owner of a collection is allowed to publish it.
        const userSql = "SELECT userId FROM collection WHERE id = ?";
        const userResult = await this.db.getAsync(userSql, [collId]);
        if (userResult.userId !== userId)
            throw Error(
                "Only the owner of the collection is allowed to " +
                    "publish it."
            );

        // Return promise for publishing the collection.
        const publishSql = "UPDATE collection SET public = 1 WHERE id = ?";
        return this.db.runAsync(publishSql, [collId]);
    }

    async updateCollection(collId, collection, userId) {
        console.log("updateCollection entered.");

        // Only the owner of a collection is allowed to update it.
        const userSql = "SELECT userId FROM collection WHERE id = ?";
        const userResult = await this.db.getAsync(userSql, [collId]);
        if (userResult.userId !== userId)
            throw Error(
                "Only the owner of the collection is allowed to " + "update it."
            );
        try {
            // Start updating the database.
            await this.db.runAsync("BEGIN TRANSACTION");

            // Create update-collection promise.
            const collSql =
                "UPDATE collection SET name = ?, description = ? WHERE id = ?";
            var collProm = this.db
                .updateAsync(collSql, [
                    collection.name,
                    collection.description,
                    collId
                ])
                .then(changes => {
                    if (changes == 0)
                        return Promise.reject(
                            Error(`No collection with given id ${collId}.`)
                        );
                    else return changes;
                });

            // Remove all categories from this collection.
            const deleteCollCatsSql =
                "DELETE FROM collectionCategory WHERE collectionId = ?";
            await this.db.deleteAsync(deleteCollCatsSql, [collId]);

            // Create promises to insert categories for this collection.
            var promises = [];
            if (collection.categoryIds) {
                for (var catId of collection.categoryIds) {
                    // TODO Create function for insert into collectionCategory.
                    const sql =
                        "INSERT INTO collectionCategory " +
                        "(collectionId, categoryId) VALUES (?, ?)";
                    promises.push(this.db.insertAsync(sql, [collId, catId]));
                }
            }

            // Collect all promises and check their outcome.
            promises.push(collProm);
            return Promise.all(promises)
                .then(values => {
                    console.log("Committing.");
                    return this.db.runAsync("COMMIT");
                })
                .catch(err => {
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

    deleteCollection(collectionId) {
        const sql = "DELETE FROM collection WHERE id = ?";
        return this.db.deleteAsync(sql, collectionId);
    }

    //////////////////////////////////////////////////
    // Cards API.
    //////////////////////////////////////////////////

    getUserCards(collectionId, userId) {
        const sql =
            "SELECT id, title FROM card" +
            " WHERE collectionId = ? AND userId = ?";
        return this.db.allAsync(sql, [collectionId, userId]);
    }

    getCard(cardId) {
        const sql = "SELECT * FROM card WHERE id = ?";
        return this.db.getAsync(sql, [cardId]);
    }

    addCard(card, userId) {
        // The database does the validation.
        const sql =
            "INSERT INTO card (title, question, answer, collectionId, userId)" +
            " VALUES (?, ?, ?, ?, ?)";
        return this.db.insertAsync(sql, [
            card.title,
            card.question,
            card.answer,
            card.collectionId,
            userId
        ]);
    }

    updateCard(cardId, card) {
        // The database does the validation.
        const sql =
            "UPDATE card SET title=?, question=?, answer=?, collectionId=? " +
            "WHERE id=?";
        return this.db.updateAsync(sql, [
            card.title,
            card.question,
            card.answer,
            card.collectionId,
            cardId
        ]);
    }

    deleteCard(cardId) {
        const sql = "DELETE FROM card WHERE id = ?";
        return this.db.deleteAsync(sql, [cardId]);
    }

    //////////////////////////////////////////////////
    // Attachments API.
    //////////////////////////////////////////////////

    getAttachment(attachmentId) {
        const sql = "SELECT * FROM attachment WHERE id = ?";
        return this.db.getAsync(sql, [attachmentId]);
    }

    getAttachments(cardId) {
        const sql = "SELECT * FROM attachment WHERE cardId = ?";
        return this.db.allAsync(sql, [cardId]);
    }

    addAttachment(urlPath, cardId, belongsTo) {
        const sql =
            "INSERT INTO attachment (path, cardId, belongsTo)" +
            " VALUES (?, ?, ?)";
        return this.db.insertAsync(sql, [urlPath, cardId, belongsTo]);
    }

    deleteAttachment(attachmentId) {
        const sql = "DELETE FROM attachment WHERE id = ?";
        return this.db.deleteAsync(sql, [attachmentId]);
    }

    // TODO Can't we just use ON DELETE CASCADE?
    deleteAttachments(cardId) {
        const sql = "DELETE FROM attachment WHERE cardId = ?";
        return this.db.deleteAsync(sql, [cardId]);
    }

    //////////////////////////////////////////////////
    // Collection-Ratings API.
    //////////////////////////////////////////////////

    getCollectionRatings(collectionId) {
        const sql = "SELECT * FROM collectionRating WHERE collectionId = ?";
        return this.db.allAsync(sql, [collectionId]);
    }

    findCollectionRating(collectionId, userId) {
        const sql =
            "SELECT COUNT(*) > 0 as found FROM collectionRating WHERE collectionId = ? AND userId = ?";
        return this.db.getAsync(sql, [collectionId, userId]);
    }

    addCollectionRating(rating, collectionId, userId) {
        // The owner of the collection is not allowed to rate the collection.
        const collSql = "SELECT userId FROM collection WHERE id = ?";
        return this.db.getAsync(collSql, [collectionId]).then(collUserIdRes => {
            if (collUserIdRes.userId == userId)
                throw Error("Owner is not allowed to rate his own collection.");

            const ratingSql =
                "INSERT INTO collectionRating (rating, comment, timestamp, collectionId, userId)" +
                " VALUES (?, ?, strftime('%s', 'now'), ?, ?)";
            return this.db.insertAsync(ratingSql, [
                rating.rating,
                rating.comment,
                collectionId,
                userId
            ]);
        });
    }

    updateCollectionRating(rating, collectionId, userId) {
        const sql =
            "UPDATE collectionRating SET rating = ?, comment = ?, timestamp = strftime('%s', 'now')" +
            " WHERE collectionId = ? AND userId = ?";
        return this.db.updateAsync(sql, [
            rating.rating,
            rating.comment,
            collectionId,
            userId
        ]);
    }

    // todo: where to call db.close()?
}

module.exports = Database;
