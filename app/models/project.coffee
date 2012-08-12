Model = require './model'
Files = require './files'

module.exports = class Project extends Model
  apiPath: 'projects'
  toJSON: -> "project": _.pick(_.clone(@attributes), 'name')

  initialize: ->
    @rootFolder = new Files

  fetchRootFolder: ->
    if @get('id')
      @rootFolder = new Files null, path: "/", project: this
      @rootFolder.fetch()

  railsPath: (method) -> path = [app.baseUrl, "projects", @get('id'), method].join("/")

  runProject: (callback) ->
    Backbone.Mediator.pub "status:set", "Starting server..."
    $.ajax
      url: @railsPath("run")
      type: "POST"
      success: (response) ->
        unless response.result
          setTimeout ->
            window.open "http://localhost:8888" # SUPER HARD CODED DAFUQ?
          , 1500 # Wait a little, otherwise it won't work :D
          
          Backbone.Mediator.pub "status:set", "Running", sticky: yes
          
          callback?()
        else
          Backbone.Mediator.pub "status:set", "Failed to start server"

  buildAndRun: ->
    @buildProject =>
      app.logger.log "Now calling attempting to run"
      @runProject()

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