module.exports = class NavbarView extends Backbone.View
  className: "navbar navbar-fixed-top"
  template: require './templates/navbar'

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

  initialize: ->
    Backbone.Mediator.sub 'progress:show', @show_progress, this
    Backbone.Mediator.sub 'progress:hide', @hide_progress, this
    Backbone.Mediator.sub 'progress:set', @set_progress, this

    @loadingCount = 0; # As to know how many requests are running.
    @$el.bind 'ajaxStart', =>
      @loadingCount += 1
      @show_progress()

    @$el.bind 'ajaxStop', =>
      @loadingCount -= 1

      @hide_progress() if @loadingCount is 0

  show_progress: -> @$('.progress').fadeIn('fast')

  hide_progress: -> @$('.progress').fadeOut('fast')

  set_progress: (progress) -> @$('.progress .bar').css('width', progress)

  render: ->
    @$el.html @template(helper: @helpers)
    this