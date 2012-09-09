Collection = require './collection'
File = require './file'

module.exports = class FilesCollection extends Collection
  model: File

  initialize: (attr, options) ->
    if options
      @path = options.path
      @project = options.project

      @url = [app.baseUrl, "projects", @project.get('id'), "files"].join "/"
      @url += "?path=#{@path}"

    @bind 'reset', @sort, this
    @bind 'reset', @applyProjectToFiles, this
    @bind 'add', @applyProjectToFile, this

  sort: ->
    grouped = @groupBy (file) -> file.get('type')
    
    if grouped.directory and grouped.file
      @reset _.union(grouped.directory, grouped.file), silent: true # The silent part is important! ∞ loops  

  applyProjectToFiles: ->
    @each (file) => @applyProjectToFile(file)

  applyProjectToFile: (file) -> file.project = @project