module.exports = class NavbarView extends Backbone.View
  className: "navbar navbar-fixed-top"
  template: require './templates/navbar'

  statuses: []

  initialize: ->
    Backbone.Mediator.sub 'progress:show', @show_progress, this
    Backbone.Mediator.sub 'progress:hide', @hide_progress, this
    Backbone.Mediator.sub 'progress:set', @set_progress, this
    Backbone.Mediator.sub 'status:set', @set_status, this

    @loadingCount = 0; # As to know how many requests are running.
    @$el.bind 'ajaxStart', =>
      @loadingCount += 1

      if @loadingCount is 1
        @show_progress()
        app.logger.log "Syncing started."

    @$el.bind 'ajaxStop', =>
      @loadingCount -= 1

      if @loadingCount is 0
        @hide_progress()
        app.logger.log "Syncing ended."

  showingStatus: no
  cycleStatuses: =>
    if @statuses.length is 0
      @$('.switch-status').fadeOut('fast')

      @showingStatus = no
    else
      @$('.switch-status').fadeOut 'fast', =>
        @$('.switch-status').html(@statuses.pop().status).fadeIn('fast')

        @showingStatus = yes

        # Set a timer to show the next item in the list or 
        # hide the current one
        @statusTimeout = setTimeout @cycleStatuses, 3000

  helpers:
    divider: -> """
      <li class="divider"></li>
    """

    menuItem: (title, url, options = {}) -> 
      options = _.defaults options, {icon: "blank", shortcut: ""}

      """
        <li>
          <a href="#{url}">
            <i class="icon-#{options.icon}"></i>
            #{title}
            <div class="pull-right keyboard-shortcut">#{options.shortcut}</div>
          </a>
        </li>
      """

  set_status: (status, sticky = no) -> 
    @statuses.push {status: status, sticky: sticky}

    # If we're showing a status, then don't force-change the
    # one being displayed.
    @cycleStatuses() unless @showingStatus

  show_progress: -> 
    @$('.progress').css
      opacity: 0
      display: "inline"

    @$('.progress').animate
      opacity: 1
      width: 200

  hide_progress: -> 
    setTimeout =>
      @$('.progress').animate
        opacity: 0
        width: 0
    , 800

  set_progress: (progress) -> @$('.progress .bar').css('width', progress)

  render: ->
    @$el.html @template(helper: @helpers)
    this