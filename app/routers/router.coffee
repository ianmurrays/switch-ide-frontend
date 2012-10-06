Project = require 'models/project'
Projects = require 'models/projects'
ProjectsView = require 'views/projects_view'

module.exports = class Router extends Backbone.Router

  routes:
    '': 'index'
    'projects/:id': 'project'
    '*all': 'redirect'

  index: ->
    app.logger.log "Router#index"
    # We load projects and show them on a modal window
    projects = new Projects()
    
    projectsView = new ProjectsView(collection: projects)
    $('body').append projectsView.render().el
    $("##{projectsView.id}").modal
      backdrop: 'static'
      keyboard: false

    projects.fetch()

  project: (id) ->
    app.logger.log "Router#project"
    app.project = new Project(id: id)
    app.project.fetch
      success: =>
        app.filebrowser.setModel app.project
        Backbone.Mediator.pub 'status:set', "Project Loaded"

    Backbone.Mediator.pub 'modal:hide'

  redirect: -> 
    app.logger.log "Router#redirect"
    @navigate ''