module.exports = class NavbarView extends Backbone.View
  className: "navbar navbar-fixed-top"
  template: require './templates/navbar'

  statuses: []
  showingStatus: no

  events:
    "click [data-menu_id=build]": "buildProject"
    "click [data-menu_id=build-run]": "buildAndRun"
    "click [data-menu_id=run]": "runProject"

  initialize: ->
    Backbone.Mediator.sub 'progress:show', @showProgress, this
    Backbone.Mediator.sub 'progress:hide', @hideProgress, this
    Backbone.Mediator.sub 'progress:set', @setProgress, this
    Backbone.Mediator.sub 'status:set', @showStatus, this

    @bindKeys()

    @loadingCount = 0; # As to know how many requests are running.
    @$el.bind 'ajaxStart', =>
      @loadingCount += 1

      if @loadingCount is 1
        @showProgress()
        app.logger.log "Syncing started."

    @$el.bind 'ajaxStop', =>
      @loadingCount -= 1

      if @loadingCount is 0
        @hideProgress()
        app.logger.log "Syncing ended."

  # Binds all keys on the menu to their corresponding actions
  bindKeys: ->
    Mousetrap.bind ["ctrl+r", "command+r"], (e) => 
      e.preventDefault()

      # Save first, then run
      app.code_editor.updateAndSave =>
        @buildAndRun()

    Mousetrap.bind ["ctrl+b", "command+b"], (e) => 
      e.preventDefault()
      @buildProject()

  helpers:
    divider: -> """
      <li class="divider"></li>
    """

    menuItem: (title, url, options = {}) -> 
      options = _.defaults options, {icon: "blank", shortcut: "", menu_id: ""}

      """
        <li>
          <a href="#{url}" data-menu_id="#{options.menu_id}">
            <i class="icon-#{options.icon}"></i>
            #{title}
            <div class="pull-right keyboard-shortcut">#{options.shortcut}</div>
          </a>
        </li>
      """

  showStatus: (status, options = {}) =>
    options = _.defaults options, sticky: no

    clearTimeout(@statusTimeout)

    # Set a timer to hide after some seconds
    @statusTimeout = setTimeout @hideStatus, 3000 unless options.sticky

    @$('.switch-status').fadeOut 'fast', =>
      @$('.switch-status').html(status).fadeIn('fast')

  hideStatus: => @$('.switch-status').fadeOut 'fast'

  @showProgressTimeout: null
  showProgress: -> 

    @showProgressTimeout = setTimeout =>
      @$('.progress').css
        opacity: 0
        display: "inline"

      @$('.progress').animate
        opacity: 1
        width: 150

      @showProgressTimeout = null
    , 500

  hideProgress: -> 
    if @showProgressTimeout?
      # Hasn't appeared yet
      clearTimeout(@showProgressTimeout)
      @showProgressTimeout = null
    else
      setTimeout =>
        @$('.progress').animate
          opacity: 0
          width: 0
      , 800

  setProgress: (progress) -> @$('.progress .bar').css('width', progress)

  render: ->
    @$el.html @template(helper: @helpers)
    this

  buildProject: ->
    app.project.buildProject()

  runProject: ->
    app.project.runProject()

  buildAndRun: ->
    app.project.buildAndRun()