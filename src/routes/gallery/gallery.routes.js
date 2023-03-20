const express = require('express');
const { addgallery,allGellery,oneGalleryDetails,updateGalleryDetails,deleteGalleryDetails } = require('./gallery.controller')
const router = express.Router()

router.post('/add', addgallery)
router.get('/', allGellery)
router.get('/:id', oneGalleryDetails)
router.put('/update/:id', updateGalleryDetails)
router.delete('/delete/:id', deleteGalleryDetails)

module.exports = router