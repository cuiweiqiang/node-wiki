mongoose = require 'mongoose'

ImageSchema = require '../schemas/image'

Image = mongoose.model 'Image',ImageSchema

module.exports = Image
