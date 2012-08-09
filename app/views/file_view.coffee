Files = require 'models/files'

module.exports = class FileView extends Backbone.View
  template: require './templates/file'
  tagName: "div"
  className: "file-container"
  directory: null

  # Since we're embedding views into views,
  # we need to make links unique
  events: ->
    events = {}
    events["click a#cid_#{@model.cid}"] = "open"
    events

  initialize: ->
    @model.on 'all', @render, this

  render: ->
    @$el.html @template(file: @model, directory: @directory)

    if @directory
      @directory.each (file) =>
        file_view = new FileView(model: file)
        @$('.subdirectory').first().append file_view.render().el

    this

  open: (e) ->
    e.preventDefault()

    if @model.isDirectory()
      # Is it open?
      if @directory
        # Close it
        console.log "Closing directory #{@model.get('name')}"
        @directory.off 'all'
        @directory = null
        @render()
      else
        console.log "Opening directory #{@model.get('name')}"
        @directory = new Files null, project: @model.project, path: @model.fullPath()
        @directory.on 'reset', @render, this
        @directory.fetch()
    else
      console.log "Opening file #{@model.get('name')}"
      app.code_editor.setFile @model
      @model.fetchContent()
