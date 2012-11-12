Model = require './model'
Files = require './files'

module.exports = class Project extends Model
  apiPath: 'projects'
  toJSON: -> "project": _.pick(_.clone(@attributes), 'name')

  initialize: ->
    @rootFolder = new Files

  # Had to create this method to create a project, weird but whatevs :S
  create: (callback) ->
    $.ajax
      url: [app.baseUrl, "projects"].join("/")
      type: "POST"
      data: 
        name: @get('name')
      success: (data) => 
        @set 'id', data.id
        @set 'path', data.path
        callback?()


  fetchRootFolder: (callback) ->
    if @get('id')
      @rootFolder = new Files null, path: "/", project: this
      @rootFolder.fetch
        success: -> callback?()

  railsPath: (method) -> path = [app.baseUrl, "projects", @get('id'), method].join("/")

  # Used to create files and folders, depending on options.type
  newFile: (options) ->
    parent = options.model
    fileView = options.fileView
    name = options.name
    type = options.type

    # First, was the clicked parent a file or a directory?
    if parent.isDirectory()
      parentDirectory = parent.fullPath()
      collection = fileView.directory
    else
      parentDirectory = parent.get('parent')
      collection = parent.collection

    console.log collection

    $.ajax
      url: @railsPath("files/new") + "?path=#{parentDirectory}"
      data: 
        name: name
        type: type
      type: "POST"
      success: (response) =>
        if response.result is "exists"
          # The file exists already then
          bootbox.alert "A file or folder named #{name} already exists in that path"
        else
          collection.add response.data if collection

  runProject: (callback) ->
    Backbone.Mediator.pub "status:set", "Starting server..."
    $.ajax
      url: @railsPath("run")
      type: "POST"
      success: (response) ->
        unless response.result
          setTimeout ->
            window.open response.url
          , 1500 # Wait a little, otherwise it won't work :D
          
          Backbone.Mediator.pub "status:set", "Running", sticky: yes
          
          callback?()
        else
          Backbone.Mediator.pub "status:set", "Failed to start server"

  buildAndRun: ->
    @buildProject =>
      app.logger.log "Now calling attempting to run"
      @runProject()

  archiveProject: (callback) ->
    Backbone.Mediator.pub "status:set", "Archiving...", sticky: yes

    $.ajax
      url: @railsPath("archive")
      type: "POST"
      success: (response) =>
        if response.error
          Backbone.Mediator.pub "status:set", "Archive failed"
          bootbox.alert "There was an error archiving your project. Make sure you can Build it first."
        else
          Backbone.Mediator.pub "status:set", "Archive successful"
          callback?(@railsPath("archive"))

  buildProject: (callback) ->
    Backbone.Mediator.pub "status:set", "Building..."

    $.ajax
      url: @railsPath("build")
      type: "POST"
      success: (response) ->
        # console.log response
        if response.result
          # there was an error, show it on a modal
          Backbone.Mediator.pub "status:set", "Build failed"

          modal = """
          <div class="modal hide fade" id="myModal">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">×</button>
              <h3 class="build-error">Build Failed</h3>
            </div>
            <div class="modal-body">
              <p>Build failed. Here's the output of the build process:</p>
              <pre style="overflow: auto;">#{response.output}</pre>
            </div>
            <div class="modal-footer">
              <a href="javascript:;" class="btn" data-dismiss="modal">Close</a>
            </div>
          </div>
          """

          $(modal).appendTo('body').modal("show")
        else
          Backbone.Mediator.pub "status:set", "Build successful"
          callback?()