module.exports = class Model extends Backbone.Model
  urlRoot: -> "#{app.baseUrl}/#{@apiPath}"
