const app = require('../src/app');
const testData = require('../src/store');
const knex = require('knex');
const { expect } = require('chai');
const supertest = require('supertest');


describe.only('Bookmarks endpoints', () => {
    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db)
    });
    before('clean the table', () => db('bookmarks').truncate())
    after('disconnect from the db', () => db.destroy());
    
    context('given there are bookmarks in the database', () => {
        beforeEach('insert articles', () => {
            return db.into('bookmarks').insert(testData);
        });
        afterEach('clean tables', () => db('bookmarks').truncate());
        it('GET /bookmarks returns 200 and all bookmarks', () => {
            return supertest(app).get('/bookmarks')
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .expect(200, testData)
        })
        it('GET /bookmarks/:bookmarkId returns 200 and the specified bookmark', () => {
            const bookmarkId = 3;
            const testBookmark = testData.find(bookmark => bookmark.id === bookmarkId);
            return supertest(app).get(`/bookmarks/${bookmarkId}`)
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .expect(200, testBookmark)
        })
    })

    context('given no bookmarks', () => {
        it('GET /bookmarks should return 200 and an empty array', () => {
            return supertest(app).get('/bookmarks')
                                    .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                                    .expect(200, '[]');
        })
    })
});