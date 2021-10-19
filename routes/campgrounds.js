const { Router } = require('express')
const express = require('express')
const router = express.Router()
const campgrounds = require('../controllers/campgrounds')

const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

// create campground object
router.route('/')
    // campground index
    .get(catchAsync(campgrounds.index))
    // submit form / new campground 
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    

// new campground
router.get('/new', isLoggedIn, campgrounds.renderNewFrom)

router.route('/:id')
    // show page
    .get(catchAsync(campgrounds.showCampground))
    // put route
    .put(isLoggedIn , isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // delete 
    .delete(isLoggedIn, isAuthor ,catchAsync(campgrounds.deleteCampground))


// edit page
router.get('/:id/edit', isLoggedIn, isAuthor ,catchAsync(campgrounds.renderEditForm))


module.exports = router;
