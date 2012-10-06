File = require 'models/file'

module.exports = class CodeEditorView extends Backbone.View
  # template: require './templates/code_editor'
  className: 'code-editor'

  placeholderModel: yes # By default, we start with no real file

  initialize: ->
    @model ||= new File

    Mousetrap.bind ['ctrl+z', 'command+z'], (e) => 
      e.preventDefault() # Let us handle this okay?

      # Undo the change on the code editor
      @codemirror.undo()

    Mousetrap.bind ['ctrl+shift+z', 'command+shift+z'], (e) =>
      e.preventDefault()

      # Redo the change on the code editor
      @codemirror.redo()

  updateAndSave: (callback) ->
    return no if @placeholderModel
    @model.set 'content', @codemirror.getValue()
    @model.updateContent(callback)

  setFile: (file) ->
    # Store codemirror's history on localStorage
    unless @placeholderModel
      localStorage["switch:codemirror:history:#{app.project.get('id')}:#{@model.fullPath()}"] = JSON.stringify @codemirror.getHistory()

    # Unsubscribe from the file and save it
    @updateAndSave()
    @model.off 'change:content', @updateContent, this

    # Clear the editor's history
    @codemirror.clearHistory()

    # Set the new file and subscribe!
    @model = file
    @model.on 'change:content', @updateContent, this

    @placeholderModel = no

  clearEditor: (options = {save: yes}) ->
    @model.off 'change:content', @updateContent, this

    callback = =>
      @codemirror.setValue('')
      @codemirror.clearHistory()
      @model = new File
      @placeholderModel = yes 

    if (options.save)
      @updateAndSave(callback)
    else
      callback()
      
  updateContent: ->
    @codemirror.setValue @model.get('content')
    @codemirror.setOption "mode", @model.codeMode()
    @codemirror.clearHistory()

    # Load history from localStorage
    if history = localStorage["switch:codemirror:history:#{app.project.get('id')}:#{@model.fullPath()}"]
      @codemirror.setHistory JSON.parse(history)

    @codemirror.focus()

  render: ->
    @$el.html ""
    @codemirror = CodeMirror @$el[0], 
      value: @model.get('content'), 
      lineNumbers: true
      tabSize: 2
      onCursorActivity: => @codemirror.matchHighlight("CodeMirror-matchhighlight")

    @$('textarea').addClass "mousetrap"
    this

  show: -> 
    @$el.show()

    Mousetrap.bind ['ctrl+s', 'command+s'], (e) =>
      e.preventDefault()

      # Update the content and save
      @updateAndSave()

  hide: -> 
    @$el.hide()
    Mousetrap.unbind ['ctrl+s', 'command+s']
