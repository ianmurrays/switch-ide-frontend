File = require 'models/file'

module.exports = class ViewEditor extends Backbone.View
  className: 'view-editor'
  id: 'view_editor'
  template: require './templates/view_editor'

  placeholderModel: yes

  # Are we looking at the view or at the html?
  activeView: "view"

  # In order to update the preview more frequently, we have
  # to store the last item that was hovered
  lastHoveredDroppable: null

  events:
    # Render some elements useless
    "click #view_container a": "dummy"
    "click #view_container button": "dummy"
    "click #view_container input[type=button]": "dummy"

    # Normal actions
    "click #view_editor_header .html-editor-link a": "showHtmlEditor"
    "click #view_editor_header .view-editor-link a": "showViewEditor"

  initialize: ->
    @model ||= new File

    Backbone.Mediator.sub "view_editor:dropped_component", @makeDroppable, this

    Mousetrap.bind ['ctrl+s', 'command+s'], (e) =>
      e.preventDefault()

      # Update the content and save
      @updateAndSave()

  updateAndSave: (callback) ->
    return no if @placeholderModel
    @model.set 'content', @getContent()
    @model.updateContent(callback)

  # Cleans the code and returns the correct one depending on what
  # the user is seeing at the moment.
  getContent: ->
    if @activeView is "html"
      @codemirror.getValue()
    else if @activeView is "view"
      @unbindDroppables()
      @$('#view_container').find('.ui-droppable').removeClass('ui-droppable')
      style_html(@$('#view_container').html(), indent_size:2)

  showHtmlEditor: ->
    @codemirror.setValue @getContent()

    @$('#code_container, #code_container .CodeMirror-scroll').height $(window).height() - 40 - 45

    @$('#view_container').hide()
    @$('#code_container').show()

    @$('.view-editor-link').removeClass('active')
    @$('.html-editor-link').addClass('active')

    @codemirror.refresh()

    @activeView = "html"

  showViewEditor: ->
    @$('#view_container').html @getContent()

    $('.view-editor #view_container').height $(window).height() - 40 - 45

    @$('#view_container').show()
    @$('#code_container').hide()

    @$('.view-editor-link').addClass('active')
    @$('.html-editor-link').removeClass('active')

    @activeView = "view"

  render: ->
    @$el.html @template(view: @model?.get('content'))

    # Enable codemirror
    @codemirror = CodeMirror @$('#code_container')[0], 
      value: @model.get('content'), 
      lineNumbers: true
      onCursorActivity: => @codemirror.matchHighlight("CodeMirror-matchhighlight")
      mode: {name: "xml", htmlMode: yes}

    @$('#code_container textarea').addClass('mousetrap')

    # Resize it
    $('.view-editor #view_container').width($(window).width() - $('#filebrowser').width() * 2 - 15)
    $('.view-editor #view_editor_header').width($(window).width() - $('#filebrowser').width() * 2 - 15)

    # Make components draggable
    self = this
    @$('div.switch-component').draggable
      revert: "invalid"
      revertDuration: 100
      zIndex: 9999
      appendTo: "#center_container"
      helper: -> 
        $preview = $(".payload", this).clone()
        $preview.children().first().css('min-width', $(this).data('min-width')) if $(this).data('min-width')

        $preview.html()
      opacity: 0.7
      cursor: "move"
      start: (event, ui) ->
        only = $(this).data('component-drop-only')
        self.makeDroppable(only)
      drag: (event, ui) ->
        return unless self.lastHoveredDroppable
        self.putComponent(self, self.lastHoveredDroppable, {draggable: $(this), position: ui.position}, yes)
      stop: ->
        self.removeComponent()

    if @activeView is "html"
      @showHtmlEditor()

    this

  show: -> @$el.fadeIn()
  hide: -> @$el.fadeOut()

  unbindDroppables: -> @$('#view_container, #view_container *').droppable("destroy")

  # Makes elements on the view container droppable.
  #
  # only - a string of selectors that should be made droppable
  makeDroppable: (only) ->
    self = this

    # Unbind all
    @unbindDroppables()

    # Bind all again
    exceptions = 'img, button, input, select, option, optgroup'

    if only
      only = "#view_container #{only}"
    else
      only = "#view_container, #view_container *"

    @$(only).not(exceptions).droppable
      hoverClass: "hovering"
      greedy: yes
      drop: (e, u) -> 
        self.putComponent(self, $(this), u, no)
        self.lastHoveredDroppable = null
      over: (e, u) ->
        self.lastHoveredDroppable = $(this)
        self.putComponent(self, $(this), u, yes)
      out: (e, u) -> self.removeComponent()

  removeComponent: -> $('#view_container .preview-component').remove()

  putComponent: (self, droppable, ui, over = no) ->
    self.removeComponent()

    draggable    = ui.draggable
    payload      = $('.payload', draggable).html()
    type         = draggable.data('component-type')
    newComponent = $(payload)
    closest      = $.nearest({x: ui.position.left, y: ui.position.top}, droppable.children()).last()
    
    if closest.length is 0
      droppable.append(newComponent)
    else
      newComponent.insertAfter(closest)

    if over
      newComponent.css(opacity:0.7)
      newComponent.addClass("preview-component")
    else
      Backbone.Mediator.pub "view_editor:dropped_component"

  clear: ->
    # Clears the view in case we load a different one.
    @$('#view_container').html('')

  # hideEditor: -> @$('#view_container').hide()
  # showEditor: -> @$('#view_container').show()

  setFile: (file) ->
    @model?.off 'change:content', @render, this
    @clear()

    @model = file
    @model.on 'change:content', @render, this

    @placeholderModel = no

  # This makes links and buttons (and other elements in the views)
  # do nothing. It would be painful to accidentaly click links.
  dummy: (e) -> e.preventDefault()
