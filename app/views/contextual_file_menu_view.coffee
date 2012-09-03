module.exports = class ContextualFileMenuView extends Backbone.View
  template: require './templates/contextual_file_menu'
  tagName: "div"
  className: "dropdown contextual-menu"

  events:
    "click .rename-file": "rename"

  initialize: ->
    @render() # This doesn't show anything, but it binds the events.

  show: (model, position) ->
    @model = model

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