module.exports = class ProjectsView extends Backbone.View
  className: 'modal hide fade' # Hidden modal by default
  id: "projects_modal"
  template: require './templates/projects'

  subscriptions:
    "modal:hide": "destroy"

  initialize: ->
    @collection.on 'all', @render, this

  render: ->
    @projects = @collection.map (project) ->
      {id: project.get('id'), name: project.get('name')}

    @$el.html @template.render(projects: @projects)
    this

  destroy: ->
    $("##{@id}").modal('hide')
    @remove()