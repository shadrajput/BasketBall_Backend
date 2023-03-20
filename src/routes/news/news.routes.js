const express = require('express');
const { addnews,allNews,oneNewsDetails,updateNewsDetails,deleteNewsDetails } = require('./news.controller')
const router = express.Router()

router.post('/add', addnews)
router.get('/', allNews)
router.get('/:id', oneNewsDetails)
router.put('/update/:id', updateNewsDetails)
router.delete('/delete/:id', deleteNewsDetails)

module.exports = router