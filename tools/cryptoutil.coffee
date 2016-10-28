fs = require 'fs'
_ = require 'underscore'
crypto = require 'crypto'
path = require 'path'

hashAlgorithm (algorithm,filename,fun) ->
  txt = fs.ReadStream path.join(__dirname, '../doc/images/' + filename)
  shasum = crypto.createHash algorithm
  txt.on 'data', (d) ->
    shasum.update d

  txt.on 'end',() ->
    d = shasum.digest 'hex'
    fun d
  return

hashAlgorithmMD5(filename,fun) ->
  return hashAlgorithm "md5",filename,fun



cryptoutil =
  md5 : (filepath,fun) ->
    hashAlgorithmMD5  filepath,fun
module.exports = cryptoutil
