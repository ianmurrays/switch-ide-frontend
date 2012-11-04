File = require 'models/file'

module.exports = class ViewEditor extends Backbone.View
  className: 'view-editor'
  id: 'view_editor'
  template: require './templates/view_editor'

  # Is this the current editor? Assume no
  active: no

  placeholderModel: yes

  # Are we looking at the view or at the html?
  activeView: "view"

  # In order to update the preview more frequently, we have
  # to store the last item that was hovered
  lastHoveredDroppable: null

  # Used when we hold shift, we need to call putComponent again 
  # with this
  draggable: null

  # With this we create a "threshold" to avoid triggering the 
  # drag event all the time
  dragThreshold: 30.0 # 30 pixels of distance
  lastDragPosition:
    x: 0
    y: 0

  # Hold shift to insertBefore
  insertBefore: no

  events:
    # Render some elements useless
    "click #view_container a": "dummy"
    "click #view_container button": "dummy"
    "click #view_container input[type=button]": "dummy"
    "click label": "dummy" # Clicking on labels and being taken to the field is not cool here.

    # Normal actions
    "click #view_editor_header .html-editor-link a": "showHtmlEditor"
    "click #view_editor_header .view-editor-link a": "showViewEditor"

  initialize: ->
    @model ||= new File

    # Binding of the CMD+S key combination happens when showing!

    Mousetrap.bind ['ctrl+alt+up', 'command+option+up', 'ctrl+alt+down', 'command+option+down'], (e) =>
      e.preventDefault()

      if @activeView is 'html'
        @showViewEditor()
      else if @activeView is 'view'
        @showHtmlEditor()

    # This let's us change between inserting before or after when dragging
    Mousetrap.bind ['shift'], (e) =>
      @insertBefore = yes

      # # Update the preview
      # return unless @lastHoveredDroppable and @lastDragPosition and @draggable
      # @putComponent(this, @lastHoveredDroppable, {draggable: @draggable, position: @lastDragPosition}, yes)
    , 'keydown'

    Mousetrap.bind ['shift'], (e) => 
      @insertBefore = no

      # # Update the preview
      # return unless @lastHoveredDroppable and @lastDragPosition and @draggable
      # @putComponent(this, @lastHoveredDroppable, {draggable: @draggable, position: @lastDragPosition}, yes)
    , 'keyup'

    # Undo/Redo
    Mousetrap.bind ['ctrl+z', 'command+z'], (e) => 
      e.preventDefault() # Let us handle this okay?

      # Undo the change on the code editor
      @codemirror.undo()

      # Reflect the change on the view editor if it corresponds
      @loadViewEditor(@codemirror.getValue()) if @activeView is "view"

    Mousetrap.bind ['ctrl+shift+z', 'command+shift+z'], (e) =>
      e.preventDefault()

      # Redo the change on the code editor
      @codemirror.redo()

      # Reflect the change on the view editor if it corresponds
      @loadViewEditor(@codemirror.getValue()) if @activeView is "view"

  updateAndSave: (callback) ->
    return no if @placeholderModel
    @model.set 'content', @getContent()
    @model.updateContent(callback)

  # Cleans the code and returns the correct one depending on what
  # the user is seeing at the moment.
  getContent: ->
    if @activeView is "html"
      html = @codemirror.getValue()
      html

    else if @activeView is "view"
      @unbindDroppables()
      @$('#view_container').find('.ui-droppable').removeClass('ui-droppable')

      html = @$('#view_container').html()
      html = style_html(html, indent_size:2)
      html = html.replace /\s?class=""/g, ""

      html

  showHtmlEditor: (e) -> @loadHtmlEditor()
  showViewEditor: (e) -> @loadViewEditor()

  loadHtmlEditor: (content = null) ->
    @codemirror.setValue(content || @getContent())

    @$('#code_container, #code_container .CodeMirror-scroll').height $(window).height() - 40 - 45
    @$('#code_container').width $(window).width() - $('#filebrowser').width() * 2 - 5

    @$('#view_container').hide()
    @$('#code_container').show()

    @$('.view-editor-link').removeClass('active')
    @$('.html-editor-link').addClass('active')

    @codemirror.refresh()
    @codemirror.focus()

    @activeView = "html"

  loadViewEditor: (content = null) ->
    @$('#view_container').html(content || @getContent())

    $('.view-editor #view_container').height $(window).height() - 40 - 45

    @$('#view_container').show()
    @$('#code_container').hide()

    @$('.view-editor-link').addClass('active')
    @$('.html-editor-link').removeClass('active')

    @activeView = "view"

  render: ->
    @$el.html @template.render(view: @model?.get('content'))

    # Enable codemirror
    @codemirror = CodeMirror @$('#code_container')[0], 
      value: @model.get('content'), 
      lineNumbers: true
      tabSize: 2
      onCursorActivity: => @codemirror.matchHighlight("CodeMirror-matchhighlight")
      mode: 'mustache' # {name: "xml", htmlMode: yes}

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
        if $(this).data('preview')
          $preview = $('.drag-preview', this).clone()
        else
          $preview = $('.payload', this).clone()

        # Set min and max widths if applicable
        $preview.children().first().css('min-width', $(this).data('min-width')) if $(this).data('min-width')
        $preview.children().first().css('max-width', $(this).data('max-width')) if $(this).data('max-width')
        $preview.children().first().css('width', $(this).data('width')) if $(this).data('width')

        $preview.html()
      opacity: 0.7
      cursor: "move"
      start: (event, ui) ->
        only = $(this).data('component-drop-only')
        self.makeDroppable(only)
        self.draggable = $(this)
      drag: (event, ui) ->
        return unless self.lastHoveredDroppable

        # Calculate the distance from the last point
        distance = Math.sqrt(Math.pow(ui.position.left - self.lastDragPosition.x, 2) + Math.pow(ui.position.top - self.lastDragPosition.y, 2))
        return unless distance > self.dragThreshold
        self.lastDragPosition = 
          x: ui.position.left
          y: ui.position.top

        self.putComponent(self, self.lastHoveredDroppable, {draggable: $(this), position: ui.position}, yes)
      stop: ->
        self.removeComponent()
        self.unbindDroppables()
        self.draggable = null

    if @activeView is "html"
      @showHtmlEditor()
    else
      @loadViewEditor(@model.get('content'))

    this

  show: -> 
    @$el.show()

    @active = yes

    Mousetrap.bind ['ctrl+s', 'command+s'], (e) =>
      e.preventDefault()

      # Update the content and save
      @updateAndSave()

  hide: -> 
    @$el.hide()

    @active = no
    
    Mousetrap.unbind ['ctrl+s', 'command+s']

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

    # Hold shift to insertBefore!
    if closest.length is 0
      droppable.append(newComponent)
    else
      if self.insertBefore
        newComponent.insertBefore(closest)
      else
        newComponent.insertAfter(closest)

    if over
      newComponent.css(opacity:0.7)
      newComponent.addClass("preview-component")
    else
      # Update codemirror's code
      @codemirror.setValue self.getContent()

  clear: ->
    # Clears the view in case we load a different one.
    @$('#view_container').html('')
    @codemirror.setValue ''

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
