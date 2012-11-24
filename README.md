# Switch IDE

Switch IDE is an integrated development environment to create Backbone.js applications using CoffeeScript and Twitter Bootstrap.
The beautiful thing is that you can edit your templates visually (think Xcode or Visual Studio).

# Installation

You need:

- Ruby 1.9.3
- Node (tested with v0.6.14)
- Forever (forever from nodejitsu)
- Brunch (brunch.io)
- MongoDB

Install ruby, node and brunch, then download [switch-ide-backend](https://github.com/switch-ide/switch-ide-backend), run `bundle install`. Make sure mongod is running and run `rake bootstrap`. Then run `rake server`.
Go to switch-ide-frontend's directory and run `brunch w --server`.

Point your browser to localhost:3333 and you should be good to go!.
