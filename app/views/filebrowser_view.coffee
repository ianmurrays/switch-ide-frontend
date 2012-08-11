Project = require 'models/project'
FileView = require './file_view'

module.exports = class FilebrowserView extends Backbone.View
  className: 'filebrowser'
  template: require './templates/filebrowser'
  openFiles: {} # Holds a list of instances of open files

  initialize: ->
    @setModel(@model || new Project())

    Backbone.Mediator.sub "filebrowser:open_file", @addFile, this
    Backbone.Mediator.sub "filebrowser:close_file", @removeFile, this

  setModel: (model) ->
    @model = model
    @model.fetchRootFolder() # This loads the files on the root of the project
    @model.on 'change', @render, this

  render: ->
    app.logger.log "FilebrowserView#render"
    @$el.html @template

    @model.rootFolder.each (file) =>
      file_view = new FileView(model: file)
      @$('#project_files').append file_view.render().el

    this

  addFile: (file) ->
    unless _.has(@openFiles, file.fullPath())
      @openFiles[file.fullPath()] = new FileView({model: file}, {allowClose: yes})
      @$('#open_files').append @openFiles[file.fullPath()].render().el

    _.each @openFiles, (view) -> view.unmarkAsActive()

    # Mark as active
    @openFiles[file.fullPath()].markAsActive()

  removeFile: (file) ->
    if _.has(@openFiles, file.fullPath())
      delete @openFiles[file.fullPath()]
      # Should remove itself form the view

