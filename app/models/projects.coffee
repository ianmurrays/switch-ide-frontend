Collection = require './collection'
Project = require './project'

module.exports = class ProjectsCollection extends Collection
  apiPath: 'projects'
  model: Project