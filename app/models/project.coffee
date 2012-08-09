Model = require './model'
Files = require './files'

module.exports = class Project extends Model
  apiPath: 'projects'
  toJSON: -> "project": _.pick(_.clone(@attributes), 'name')

  initialize: ->
    @rootFolder = new Files

    if @get('id')
      @rootFolder = new Files null, path: "/", project: this
      @rootFolder.fetch()
