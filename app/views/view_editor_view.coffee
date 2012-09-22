module.exports = class ViewEditor extends Backbone.View
  className: 'view-editor'
  id: 'view_editor'
  template: require './templates/view_editor'

  events:
    # Render some elements useless
    "click a": "dummy"
    "click button": "dummy"
    "click input[type=button]": "dummy"

  initialize: ->
    Backbone.Mediator.sub "view_editor:dropped_component", @makeDroppable, this

  render: ->
    @$el.html @template(view: @model?.get('content'))

    # Resize it
    $('.view-editor #view_container').width($(window).width() - $('#filebrowser').width() - $('#filebrowser').width() - 15)

    # Make components draggable
    @$('div.switch-component').draggable
      revert: "invalid"
      revertDuration: 300
      zIndex: 9999
      appendTo: "#center_container"
      helper: -> 
        $(".payload", this).html()
      opacity: 0.7
      cursor: "move"

    # Make everything on the view droppable
    @makeDroppable()

    this

  show: -> @$el.fadeIn()
  hide: -> @$el.fadeOut()

  makeDroppable: ->
    self = this

    # Unbind all
    @$('#view_container, #view_container *').droppable("destroy")

    # Bind all again
    exceptions = 'img, button, input, select, option, optgroup'
    @$('#view_container, #view_container *').not(exceptions).droppable
      hoverClass: "hovering"
      greedy: yes
      drop: (e, u) -> self.putComponent(self, $(this), u, no)
      over: (e, u) -> self.putComponent(self, $(this), u, yes)
      out: (e, u) -> self.removeComponent()

  removeComponent: -> $('#view_container .preview-component').remove()

  putComponent: (self, droppable, ui, over = no) ->
    self.removeComponent()

    draggable    = ui.draggable
    payload      = $('.payload', draggable).html()
    type         = draggable.data('component-type')
    newComponent = $(payload)
    closest      = $.nearest({x: ui.position.left, y: ui.position.top}, droppable.children()).last()

    console.log closest

    if closest.length is 0
      droppable.append(newComponent)
    else
      newComponent.insertAfter(closest)

    if over
      newComponent.css(opacity:0.7)
      newComponent.addClass("preview-component")
    else
      Backbone.Mediator.pub "view_editor:dropped_component"

  setFile: (file) ->
    @model?.off 'change:content', @render, this

    @model = file
    @model.on 'change:content', @render, this

  # This makes links and buttons (and other elements in the views)
  # do nothing. It would be painful to accidentaly click links.
  dummy: (e) -> e.preventDefault()
