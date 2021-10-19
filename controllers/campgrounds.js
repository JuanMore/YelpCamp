const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports.index = async(req,res) => {
    // find all campgrounds
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewFrom = (req,res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    // error handling 
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
    
}

module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        //nested populate - populate reviews then populate authors then populate main author
        path:'reviews',
        populate: {
            path: 'author' 
        }
    }).populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error', 'Campground not found: It may have been deleted by user/admin')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Campground not found: It may have been deleted by user/admin')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async(req, res) => {
    // gives us id (destructured)
  const {id} = req.params
  console.log(req.body)
  // use spread operator and spread
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
  campground.images.push(...imgs)
  await campground.save()
  if(req.body.deleteImages){
      for(let filename of req.body.deleteImages) {
          await cloudinary.uploader.destroy(filename)
      }
      await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
  }
  req.flash('success', 'Successfully updated campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted')
    res.redirect('/campgrounds')
}