File = require 'models/file'

module.exports = class ViewEditor extends Backbone.View
  className: 'view-editor'
  id: 'view_editor'
  template: require './templates/view_editor'

  placeholderModel: yes

  # In order to update the preview more frequently, we have
  # to store the last item that was hovered
  lastHoveredDroppable: null

  events:
    # Render some elements useless
    "click a": "dummy"
    "click button": "dummy"
    "click input[type=button]": "dummy"

  initialize: ->
    @model ||= new File

    Backbone.Mediator.sub "view_editor:dropped_component", @makeDroppable, this

    Mousetrap.bind ['ctrl+s', 'command+s'], (e) =>
      e.preventDefault()

      # Update the content and save
      @updateAndSave()

  updateAndSave: (callback) ->
    return no if @placeholderModel
    @model.set 'content', @$('#view_container').html()
    @model.updateContent(callback)

  render: ->
    @$el.html @template(view: @model?.get('content'))

    # Resize it
    $('.view-editor #view_container').width($(window).width() - $('#filebrowser').width() - $('#filebrowser').width() - 15)

    # Make components draggable
    self = this
    @$('div.switch-component').draggable
      revert: "invalid"
      revertDuration: 100
      zIndex: 9999
      appendTo: "#center_container"
      helper: -> 
        $(".payload", this).html()
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

    this

  show: -> @$el.fadeIn()
  hide: -> @$el.fadeOut()

  # Makes elements on the view container droppable.
  #
  # only - a string of selectors that should be made droppable
  makeDroppable: (only) ->
    self = this

    # Unbind all
    @$('#view_container, #view_container *').droppable("destroy")

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
