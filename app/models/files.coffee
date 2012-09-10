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
    @bind 'add', @sort, this

  sort: ->
    grouped = @groupBy (file) -> file.get('type')

    console.log grouped
    
    if grouped.directory and grouped.file
      directories = _.sortBy grouped.directory, (dir) -> dir.get('name').toLowerCase()
      files = _.sortBy grouped.file, (file) -> file.get('name').toLowerCase()
      @reset _.union(directories, files), silent: true # The silent part is important! ∞ loops  

  applyProjectToFiles: ->
    @each (file) => @applyProjectToFile(file)

  applyProjectToFile: (file) -> file.project = @project