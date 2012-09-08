Project = require 'models/project'
FileView = require './file_view'
File = require 'models/file'

module.exports = class FilebrowserView extends Backbone.View
  className: 'filebrowser'
  template: require './templates/filebrowser'
  openFiles: {} # Holds a list of instances of open files
  openFile: null # Which file is open right now?
  arrayOpenFiles: [] # Keeps order of files, for keyboard shortcuts

  initialize: ->
    @setModel(@model || new Project())

    # Setup keyboard shortcuts to open files
    _.each [1,2,3,4,5,6,7,8,9], (number) =>
      Mousetrap.bind ["ctrl+#{number}", "command+#{number}"], (e) => 
        e.preventDefault()
        @openFileAtIndex(number - 1)

    Mousetrap.bind ["ctrl+w", "command+w"], (e) =>
      e.preventDefault()
      @openFiles[@openFile]?.removeFromList()

    Backbone.Mediator.sub "filebrowser:open_file", @addFile, this
    Backbone.Mediator.sub "filebrowser:close_file", @removeFile, this
    Backbone.Mediator.sub "file:renamed", @renamedFile, this

  openFileAtIndex: (index) ->
    # Skip this if there's no file there, duh
    return unless @arrayOpenFiles[index]

    # Open the file
    @openFiles[@arrayOpenFiles[index]].open()

  setModel: (model) ->
    @model?.off 'change', @render, this
    @model = model
    @model.on 'change', @render, this
    @model.fetchRootFolder() # This loads the files on the root of the project

  render: ->
    app.logger.log "FilebrowserView#render"
    @$el.html @template

    @$('#open_files').sortable
      stop: (event, ui) =>
        # console.log ui.item.attr('data-cid')
        _.each @arrayOpenFiles, (fullPath) =>
          if @openFiles[fullPath].model.cid is ui.item.attr('data-cid')
            # We have to move this one into its new position
            # Remove it first
            @arrayOpenFiles.splice _.indexOf(@arrayOpenFiles, fullPath), 1

            # Add it again!
            @arrayOpenFiles.splice ui.item.index(), 0, fullPath

    @model.rootFolder.each (file) =>
      file_view = new FileView(model: file)
      @$('#project_files').append file_view.render().el

    this

  addFile: (file) ->
    unless _.has(@openFiles, file.fullPath())
      @openFiles[file.fullPath()] = new FileView({model: file}, {allowClose: yes})
      @arrayOpenFiles.push file.fullPath() # To keep order
      @$('#open_files').append @openFiles[file.fullPath()].render().el

    _.each @openFiles, (view) -> view.unmarkAsActive()

    # Mark as active
    @openFiles[file.fullPath()].markAsActive()
    @openFile = file.fullPath()

  removeFile: (file) ->
    if _.has(@openFiles, file.fullPath())
      delete @openFiles[file.fullPath()]
      @arrayOpenFiles.splice _.indexOf(@arrayOpenFiles, file.fullPath()), 1
      @openFile = null

      # Should remove itself form the view, but we should "open" an empty file
      app.code_editor.clearEditor()

  renamedFile: (file, previous) ->
    if _.has(@openFiles, file.fullPathNamed(previous))
      @openFiles[file.fullPath()] = @openFiles[file.fullPathNamed(previous)]
      delete @openFiles[file.fullPathNamed(previous)]

