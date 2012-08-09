module.exports = class Collection extends Backbone.Collection
  url: -> "#{app.baseUrl}/#{@apiPath}"
  model: require './model'
  