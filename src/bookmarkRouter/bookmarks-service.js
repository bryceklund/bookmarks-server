const BookmarksService = {
    getAllBoomarks(knex) {
        return knex.select('*').from('bookmarks');
    },
    getById(knex, id) {
        return knex.select('*').from('bookmarks').where('id', id).first();
    },
    addBookmark(knex, bookmark) {
        return knex.into('bookmarks')
                .insert(bookmark)
                .returning('*')
                .then(rows => {
                    return rows[0]
                });
    },
    deleteBookmark(knex, id) {
        return knex('bookmarks').where('id', id).delete();
    }
}

module.exports = BookmarksService;