module.exports = class NavbarView extends Backbone.View
  className: "navbar navbar-fixed-top"
  template: require './templates/navbar'

  statuses: []

  initialize: ->
    setInterval @cycleStatuses, 3000
    
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

  cycleStatuses: =>
    if @statuses.length is 0
      @$('.switch-status').fadeOut('fast')
    else
      @$('.switch-status').fadeOut 'fast', =>
        @$('.switch-status').html(@statuses.pop().status).fadeIn('fast')

  helpers:
    divider: -> """
      <li class="divider"></li>
    """

    menuItem: (title, url, icon = "blank") -> """
      <li>
        <a href="#{url}">
          <i class="icon-#{icon}"></i>
          #{title}
        </a>
      </li>
    """

  set_status: (status, sticky = no) -> @statuses.push {status: status, sticky: sticky}

  show_progress: -> @$('.progress').fadeIn('fast')

  hide_progress: -> @$('.progress').fadeOut('fast')

  set_progress: (progress) -> @$('.progress .bar').css('width', progress)

  render: ->
    @$el.html @template(helper: @helpers)
    this