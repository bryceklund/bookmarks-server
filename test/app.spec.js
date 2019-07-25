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
        it(`POST /bookmarks returns 201 and the submitted bookmark`, () => {
            const newBookmark = {
                title: 'test', 
                url: 'test.com', 
                description: 'super fun stuff', 
                rating: 4
            };
            return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(newBookmark.title)
                        expect(res.body.url).to.eql(newBookmark.url)
                        expect(res.body.description).to.eql(newBookmark.description)
                        expect(res.body.rating).to.eql(newBookmark.rating)
                        expect(res.body).to.have.property('id')
                        //expect(res.headers.location).to.eql(`http://localhost:8000/bookmarks/${res.body.id}`)
                    })
        })
        describe(`PATCH /bookmarks/:bookmarkId`, () => {
            it(`given no articles, responds with 404`, () => {
                const bookmarkId = 12345;
                return supertest(app)
                        .patch(`/bookmarks/${bookmarkId}`)
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .expect(404, { error: { message: 'Article not found' } })
            })
            it(`responds with 204 and updates the bookmark`, () => {
                const idToUpdate = 2;
                const updatedBookmark = {
                    title: 'new title',
                    url: 'new.url'
                }
                const expectedBookmark = {
                    ...testData[idToUpdate - 1],
                    ...updatedBookmark
                }
                return supertest(app)
                        .patch(`/bookmarks/${idToUpdate}`)
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .send(updatedBookmark)
                        .expect(204)
                        .then(res => {
                            return supertest(app)
                                    .get(`/bookmarks/${idToUpdate}`)
                                    .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                                    .expect(expectedBookmark)
                        })
            })
            it(`responds with 400 when no required fields are supplied`, () => {
                const idToUpdate = 2;
                return supertest(app)
                        .patch(`/bookmarks/${idToUpdate}`)
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .send({ dummyField: 'blah' })
                        .expect(400, { error: { message: 'Body must contain title, url, description, or rating' } })
            })
            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2;
                const updatedBookmark = { title: 'beep booop' };
                const expectedBookmark = {
                    ...testData[idToUpdate - 1],
                    ...updatedBookmark
                }
                return supertest(app)
                        .patch(`/bookmarks/${idToUpdate}`)
                        .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                        .send({
                            ...updatedArticle,
                            fieldToIgnore: 'this should be ignored'
                        })
                        .expect(204)
                        .then(res => {
                            return supertest(app)
                                    .get(`/bookmarks/${idToUpdate}`)
                                    .set({"Authorization": "Bearer bb10ef2f-fc68-4b42-8960-e3e3d344ae9a"})
                                    .expect(expectedBookmark)
            
                        })
            })
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