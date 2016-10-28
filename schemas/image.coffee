mongoose = require 'mongoose'
#
#   创建用户的shcema
#   @type {mongoose}
#
ImageSchema = new mongoose.Schema
  name   : String
  hashCode   : String
  url      : String
  meta       :
    createAt :
      type      : Date
      default   : Date.now()
    updateAt :
      type      : Date,
      default   : Date.now()

#
#   给save方法添加预处理
#
ImageSchema.pre 'save', (next) ->
  if this.isNew
    this.meta.createAt = this.meta.updateAt = Date.now()
  else
    this.meta.updateAt = Date.now()
  next()
  return

#
#   绑定静态方法
#   @type {Object}
#
ImageSchema.statics =
  fetch : (cb) ->
    @.find {}
      .sort 'meta.updateAt'
      .exec cb
  findBy : (id,cb) ->
    #console.log(id);
    @.find
        _id:id
      .sort 'meta.updateAt'
      .exec cb
  findByHashCode : (hashCode,cb) ->
  #console.log(id);
      @.find
        hashCode:hashCode
      .sort 'meta.updateAt'
      .exec cb

module.exports = ImageSchema
