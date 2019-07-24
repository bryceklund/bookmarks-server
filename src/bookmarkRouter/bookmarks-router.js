const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const PORT = process.env.PORT;
const bookmarks = require('../store');
const BookmarksService = require('./bookmarks-service');
const xss = require('xss');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter.route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBoomarks(knexInstance)
            .then(bookmarks => bookmarks.forEach(bookmark => {
                res.json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url),
                    description: xss(bookmark.description),
                    rating: bookmark.rating
                })
            }))
            .catch(next);
    })
    .post(bodyParser, (req, res) => {
        const knexInstance = req.app.get('db');
        const { title, url,  description, rating } = req.body;

        if (!title) {
            logger.error('Title is required.');
            return res.status(400).send('Invalid data');
        }
        if (!url) {
            logger.error('URL is required');
            return res.status(400).send('Invalid data');
        }
        if (!(1 <= rating <= 5)) {
            logger.error('Rating must be between 1 and 5');
            return res.status(400).send('Invalid rating');
        }

        const bookmark = {
            title,
            url,
            description,
            rating
        }
        BookmarksService.addBookmark(knexInstance, bookmark)
            .then(result => {
                res.status(201).location(`/bookmarks/${result.id}`).json(result)
            })

        logger.info(`Bookmark with id ${id} created`);
        res.status(201).location(`http://localhost:${PORT}/bookmarks/${id}`).json(bookmark)
    })

bookmarksRouter.route('/bookmarks/:id')
    .get((req, res, next) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db');
        BookmarksService.getById(knexInstance, id) //bookmarks.find(b => b.id == id);
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} not found`);
                    res.status(404).send('Bookmark not found');
                }
                res.json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url),
                    description: xss(bookmark.description),
                    rating: bookmark.rating
                })
            })
            .catch(next);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const index = bookmarks.findIndex(b => b.id == id)
        
        if (index === -1) {
            logger.error(`A bookmark with id ${id} was not found`);
            res.status(404).send('Bookmark not found');
        }
        
        bookmarks.splice(index, 1)
        logger.info(`Bookmark with id ${id} deleted.`)
        res.send(204).end();
    })

module.exports = bookmarksRouter;