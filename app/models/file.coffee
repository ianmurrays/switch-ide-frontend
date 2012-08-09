Model = require './model'

module.exports = class File extends Model
  isDirectory: -> @get('type') == 'directory'
  isView: -> @get('name').match /\.eco$/

  # Returns the code editor mode to run
  codeMode: ->
    if @get('name')
      if @get('name').match /\.coffee$/
        "coffeescript"
      else if @get('name').match /\.js$/
        "javascript"
      else if @get('name').match /\.s?css$/
        "css"
      else if @get('name').match /\.(md|markdown|mdown)$/
        "markdown"
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
