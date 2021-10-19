const Review = require('../models/review')
const Campground = require('../models/campground')


module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    req.flash('success', 'New review created')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req, res) => {
    //    operator pull to remove an object from an exisiting array
        const {id, reviewId} = req.params
        // takes reviewId, from reviews array and deletes it
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) 
        await Review.findByIdAndDelete(reviewId)
        req.flash('success', 'Successfully deleted review')
        res.redirect(`/campgrounds/${id}`)
    }