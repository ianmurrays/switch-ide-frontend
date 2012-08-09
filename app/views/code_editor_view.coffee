File = require 'models/file'

module.exports = class CodeEditorView extends Backbone.View
  # template: require './templates/code_editor'
  className: 'code-editor'

  initialize: ->
    @model ||= new File()

  setFile: (file) ->
    @model.off 'change:content', this
    @model = file
    @model.on 'change:content', @updateContent, this

  updateContent: ->
    @codemirror.setValue @model.get('content')
    @codemirror.setOption "mode", @model.codeMode()

  render: ->
    @$el.html @template
    @codemirror = CodeMirror @$el[0], 
      value: @model.get('content'), 
      lineNumbers: true
    this