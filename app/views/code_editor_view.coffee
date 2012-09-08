File = require 'models/file'

module.exports = class CodeEditorView extends Backbone.View
  # template: require './templates/code_editor'
  className: 'code-editor'

  placeholderModel: yes # By default, we start with no real file

  initialize: ->
    @model ||= new File

    Mousetrap.bind ['ctrl+s', 'command+s'], (e) =>
      e.preventDefault()

      # Update the content and save
      @updateAndSave()

  updateAndSave: (callback) ->
    return no if @placeholderModel
    @model.set 'content', @codemirror.getValue()
    @model.updateContent(callback)

  setFile: (file) ->
    # Unsubscribe from the file and save it
    @updateAndSave()
    @model.off 'change:content', @updateContent, this

    # Set the new file and subscribe!
    @model = file
    @model.on 'change:content', @updateContent, this

    @placeholderModel = no

  clearEditor: (options = {save: yes}) ->
    @model.off 'change:content', @updateContent, this

    callback = =>
      @codemirror.setValue('')
      @model = new File
      @placeholderModel = yes 

    if (options.save)
      @updateAndSave(callback)
    else
      callback()
      

  updateContent: ->
    @codemirror.setValue @model.get('content')
    @codemirror.setOption "mode", @model.codeMode()

  render: ->
    @$el.html @template
    @codemirror = CodeMirror @$el[0], 
      value: @model.get('content'), 
      lineNumbers: true
      onCursorActivity: => @codemirror.matchHighlight("CodeMirror-matchhighlight")

    @$('textarea').addClass "mousetrap"
    this