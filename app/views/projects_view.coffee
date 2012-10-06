Project = require 'models/project'

module.exports = class ProjectsView extends Backbone.View
  className: 'modal hide fade' # Hidden modal by default
  id: "projects_modal"
  template: require './templates/projects'

  events:
    "submit form": "createProject"

  subscriptions:
    "modal:hide": "destroy"

  initialize: ->
    @collection.on 'all', @render, this

  render: ->
    @projects = @collection.map (project) ->
      {id: project.get('id'), name: project.get('name'), created_at: project.get('created_at')}

    @$el.html @template.render(projects: @projects)
    this

  destroy: ->
    $("##{@id}").modal('hide')
    @remove()

  createProject: (e) ->
    e.preventDefault()

    # Disable the button
    @$('button').attr('disabled', true).html('Wait...')
    @$('#project_name').attr('disabled', true)

    project = new Project(name:@$('#project_name').val())
    project.create =>
      @collection.add project
      app.router.navigate "#/projects/#{project.get('id')}"