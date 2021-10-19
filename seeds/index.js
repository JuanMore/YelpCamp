const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

// pass in array and return random el from that array
const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    // start by deleting all
    await Campground.deleteMany({})
    // loop to create 50 random campgrounds
    for(let i = 0; i < 300; i++){
        // then loop 50 times and pick a random number to get a city
        const randCities = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // Your user ID
            author: '613f704e9dbcd304cf83b829',
            // string interpulation - to get city and state name; set to location
            location: `${cities[randCities].city}, ${cities[randCities].state}`,
            // set descriptor and place to title - ex Maple String
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam ea dolorem repellendus totam iure tenetur, esse aut quia perferendis. Reprehenderit a distinctio et soluta rerum voluptate itaque optio possimus dolorum?',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                cities[randCities].longitude,
                cities[randCities].latitude
                ]
            },
            
            images:   [
                {
                  url: 'https://res.cloudinary.com/moreno-cloud/image/upload/v1634268166/YelpCamp/b25jldwfkwzdn6tz3fzt.jpg',
                  filename: 'YelpCamp/bu1mdq6tnzazmgjoi1z8',
                },
                {
                  url: 'https://res.cloudinary.com/moreno-cloud/image/upload/v1634268165/YelpCamp/pxyveqpbtr8yn87wpqke.jpg',
                  filename: 'YelpCamp/rdgx8oolmqcu6dtgq9y8',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})