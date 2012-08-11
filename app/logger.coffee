module.exports = class Logger
  logging: off
  log: -> 
    if @logging
      args = _.map arguments, (arg) -> arg
      console.log "[SwitchIDE] " + args.join(" ")