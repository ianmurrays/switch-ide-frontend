Project = require 'models/project'
FileView = require './file_view'

module.exports = class FilebrowserView extends Backbone.View
  className: 'filebrowser'
  template: require './templates/filebrowser'

  initialize: ->
    @setModel(@model || new Project())

  setModel: (model) ->
    @model = model
    @model.on 'change', @render, this

  render: ->
    console.log "FilebrowserView#render"
    @$el.html @template

    @model.rootFolder.each (file) =>
      file_view = new FileView(model: file)
      @$('#project_files').append file_view.render().el

    this