Router = require 'routers/router'
Navbar = require 'views/navbar_view'
Filebrowser = require 'views/filebrowser_view'
CodeEditor = require 'views/code_editor_view'
Projects = require 'models/projects'
Logger = require 'logger'

module.exports = class Application
  baseUrl: 'http://localhost:3000'

  constructor: ->
    $ =>
      @initialize()
      Backbone.history.start pushState:false

  initialize: ->
    @router = new Router
    @logger = new Logger
    @logger.logging = on # Disable in production

    @renderEssentialComponents()
    @setupShortcuts()

    # Need to do this everytime the window is resized.
    $(window).resize => @resizeComponents()

  # Setup global shortcuts, other components should setup their
  # own shortcuts
  setupShortcuts: ->
    # Mousetrap.bind ['command+s', 'ctrl+s'], (e) => 
    #   e.preventDefault()
    #   @logger.log "Shortcut CMD+S trapped"

  renderEssentialComponents: ->
    # Navbar
    navbar = new Navbar()
    $('header').html navbar.render().el

    # File Browser
    # File browser is public so we can manipulate it.
    @filebrowser = new Filebrowser()
    $('#filebrowser').html @filebrowser.render().el

    # Code Editor
    @code_editor = new CodeEditor()
    $('#center_container').html @code_editor.render().el

    @resizeComponents()

  # Since everything on the app is fixed, to correctly size everything we need some JS
  resizeComponents: ->
    # Resize the file browser
    filebrowser_width = $('#filebrowser').width()
    $('#filebrowser').height $(window).height() - 40 # 40 is the size of the navbar
    $('#filebrowser').css('top', 40)

    # Code editor
    code_editor_width = $('.code-editor').width()
    $('.code-editor, .CodeMirror-scroll').height $(window).height() - 40 # 40 is the size of the navbar
    $('.code-editor').width $(window).width() - filebrowser_width - 5
    $('.code-editor').css('top', 40)

window.app = new Application
