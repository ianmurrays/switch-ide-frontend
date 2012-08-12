module.exports = class ProjectsView extends Backbone.View
  className: 'modal hide fade' # Hidden modal by default
  id: "projects_modal"
  template: require './templates/projects'

  subscriptions:
    "modal:hide": "destroy"

  initialize: ->
    @collection.on 'all', @render, this

  render: ->
    @$el.html @template(collection: @collection.toArray())
    this

  destroy: ->
    $("##{@id}").modal('hide')
    @remove()