Model = require './model'

module.exports = class File extends Model
  # urlRoot: -> 
  #   "#{app.baseUrl}/#{@project.apiPath}/#{@project.get('id')}/files/#{@cwd}"
  isDirectory: -> @get('type') == 'directory'

  # Returns the code editor mode to run
  codeMode: ->
    if @get('name') and @get('name').match /\.coffee$/
      "coffeescript"
    else
      "text"

  fullPath: -> "#{@get('parent')}/#{@get('name')}"

  # Lazy-loads the content, calls the callback with the content when done
  fetchContent: ->
    return if @isDirectory() # Folders don't have any content you silly

    path = [app.baseUrl, "projects", 9, "files", "get_content"].join("/")
    path += "?path=#{[@get('parent'), @get('name')].join "/"}" # Had to do this like this in order to play
                                    # nicely with rails.

    $.getJSON path, (data) => 
      @set 'content', data.content, silent: true

      # Force an update notification
      @trigger 'change:content'
