const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const PORT = process.env.PORT;
const bookmarks = require('../store');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter.route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url,  description, rating } = req.body;
        const id = uuid();

        if (!title) {
            logger.error('Title is required.');
            return res.status(400).send('Invalid data');
        }
        if (!url) {
            logger.error('URL is required');
            return res.status(400).send('Invalid data');
        }

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }
        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`);
        res.status(201).location(`http://localhost:${PORT}/bookmarks/${id}`).json(bookmark)
    })

bookmarksRouter.route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(404).send('Bookmark not found');
        }

        res.json(bookmark);
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