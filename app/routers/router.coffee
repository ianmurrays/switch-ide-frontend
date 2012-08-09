Project = require 'models/project'
Projects = require 'models/projects'
ProjectsView = require 'views/projects_view'

module.exports = class Router extends Backbone.Router

  routes:
    '': 'index'
    'projects/:id': 'project'
    '*all': 'redirect'

  index: ->
    console.log "Router#index"
    # We load projects and show them on a modal window
    projects = new Projects()
    
    projectsView = new ProjectsView(collection: projects)
    $('body').append projectsView.render().el
    $("##{projectsView.id}").modal
      backdrop: 'static'
      keyboard: false

    projects.fetch()

  project: (id) ->
    console.log "Router#project"
    project = new Project(id: id)
    app.filebrowser.setModel project
    project.fetch()

    Backbone.Mediator.pub 'modal:hide'

  redirect: -> 
    console.log "Router#redirect"
    @navigate ''