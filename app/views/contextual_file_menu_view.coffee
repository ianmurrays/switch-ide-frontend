module.exports = class ContextualFileMenuView extends Backbone.View
  template: require './templates/contextual_file_menu'
  tagName: "div"
  className: "dropdown contextual-menu"
  fileView: null

  events:
    "click .rename-file": "rename"
    "click .delete-file": "delete"
    "click .new-file": "newFile"
    "click .new-folder": "newFolder"

  initialize: ->
    @render() # This doesn't show anything, but it binds the events.

  show: (model, fileView, position) ->
    @model = model
    @fileView = fileView

    @$el.css(left: position.x, top: position.y)
    
    @$('.dropdown-menu').show()
    @$el.show()

  hide: -> @$el.hide()

  render: ->
    @$el.html @template()

    @$el.appendTo('body')
        
  rename: ->
    @hide()

    @model.set('isRenaming', yes)

  delete: ->
    @hide()

    bootbox.confirm "Are you sure you want to delete #{@model.get('name')}? This cannot be undone.", (result) =>
      @model.delete() if (result)

  newFile: ->
    @hide()

    bootbox.prompt "New File", (name) =>
      unless name is null or name is ""
        app.project.newFile
          model: @model
          fileView: @fileView
          name: name
          type: "file"

  newFolder: ->
    @hide()

    bootbox.prompt "New Folder", (name) =>
      unless name is null or name is ""
        app.project.newFile
          model: @model
          fileView: @fileView
          name: name
          type: "folder"
