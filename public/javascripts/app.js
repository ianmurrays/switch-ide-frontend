(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  var Application, CodeEditor, Filebrowser, Logger, Navbar, Projects, Router;

  Router = require('routers/router');

  Navbar = require('views/navbar_view');

  Filebrowser = require('views/filebrowser_view');

  CodeEditor = require('views/code_editor_view');

  Projects = require('models/projects');

  Logger = require('logger');

  module.exports = Application = (function() {

    Application.prototype.baseUrl = 'http://localhost:3000';

    function Application() {
      var _this = this;
      $(function() {
        _this.initialize();
        return Backbone.history.start({
          pushState: false
        });
      });
    }

    Application.prototype.initialize = function() {
      var _this = this;
      this.router = new Router;
      this.logger = new Logger;
      this.logger.logging = true;
      this.renderEssentialComponents();
      this.setupShortcuts();
      return $(window).resize(function() {
        return _this.resizeComponents();
      });
    };

    Application.prototype.setupShortcuts = function() {};

    Application.prototype.renderEssentialComponents = function() {
      var navbar;
      navbar = new Navbar();
      $('header').html(navbar.render().el);
      this.filebrowser = new Filebrowser();
      $('#filebrowser').html(this.filebrowser.render().el);
      this.code_editor = new CodeEditor();
      $('#center_container').html(this.code_editor.render().el);
      return this.resizeComponents();
    };

    Application.prototype.resizeComponents = function() {
      var code_editor_width, filebrowser_width;
      filebrowser_width = $('#filebrowser').width();
      $('#filebrowser').height($(window).height() - 40);
      $('#filebrowser').css('top', 40);
      code_editor_width = $('.code-editor').width();
      $('.code-editor, .CodeMirror-scroll').height($(window).height() - 40);
      $('.code-editor').width($(window).width() - filebrowser_width - 5);
      return $('.code-editor').css('top', 40);
    };

    return Application;

  })();

  window.app = new Application;
  
}});

window.require.define({"logger": function(exports, require, module) {
  var Logger;

  module.exports = Logger = (function() {

    function Logger() {}

    Logger.prototype.logging = false;

    Logger.prototype.log = function() {
      var args;
      if (this.logging) {
        args = _.map(arguments, function(arg) {
          return arg;
        });
        return console.log("[SwitchIDE] " + args.join(" "));
      }
    };

    return Logger;

  })();
  
}});

window.require.define({"models/collection": function(exports, require, module) {
  var Collection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.url = function() {
      return "" + app.baseUrl + "/" + this.apiPath;
    };

    Collection.prototype.model = require('./model');

    return Collection;

  })(Backbone.Collection);
  
}});

window.require.define({"models/file": function(exports, require, module) {
  var File, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('./model');

  module.exports = File = (function(_super) {

    __extends(File, _super);

    function File() {
      return File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.isDirectory = function() {
      return this.get('type') === 'directory';
    };

    File.prototype.isView = function() {
      return this.get('name').match(/\.eco$/);
    };

    File.prototype.codeMode = function() {
      if (this.get('name')) {
        if (this.get('name').match(/\.coffee$/)) {
          return "coffeescript";
        } else if (this.get('name').match(/\.js$/)) {
          return "javascript";
        } else if (this.get('name').match(/\.json/)) {
          return {
            name: "javascript",
            json: true
          };
        } else if (this.get('name').match(/\.s?css$/)) {
          return "css";
        } else if (this.get('name').match(/\.(md|markdown|mdown)$/)) {
          return "markdown";
        } else if (this.get('name').match(/\.html?$/)) {
          return {
            name: "xml",
            htmlMode: true
          };
        }
      } else {
        return "text";
      }
    };

    File.prototype.fullPath = function() {
      return "" + (this.get('parent')) + "/" + (this.get('name'));
    };

    File.prototype.railsPath = function(method) {
      var path;
      path = [app.baseUrl, "projects", this.project.get('id'), "files", method].join("/");
      return path += "?path=" + ([this.get('parent'), this.get('name')].join("/"));
    };

    File.prototype.fetchContent = function() {
      var _this = this;
      if (this.isDirectory()) {
        return;
      }
      return $.getJSON(this.railsPath('get_content'), function(data) {
        _this.set('content', data.content, {
          silent: true
        });
        return _this.trigger('change:content');
      });
    };

    File.prototype.updateContent = function(callback) {
      var _this = this;
      if (this.isDirectory()) {
        return;
      }
      Backbone.Mediator.pub("status:set", "Saving " + (this.get('name')) + " ...");
      return $.ajax({
        url: this.railsPath('save_content'),
        type: 'PUT',
        data: {
          content: this.get('content')
        },
        success: function(data) {
          _this.set('content', data.content, {
            silent: true
          });
          _this.trigger('change:content');
          Backbone.Mediator.pub("status:set", "Saved " + (_this.get('name')));
          return typeof callback === "function" ? callback(data) : void 0;
        }
      });
    };

    return File;

  })(Model);
  
}});

window.require.define({"models/files": function(exports, require, module) {
  var Collection, File, FilesCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('./collection');

  File = require('./file');

  module.exports = FilesCollection = (function(_super) {

    __extends(FilesCollection, _super);

    function FilesCollection() {
      return FilesCollection.__super__.constructor.apply(this, arguments);
    }

    FilesCollection.prototype.model = File;

    FilesCollection.prototype.initialize = function(attr, options) {
      if (options) {
        this.path = options.path;
        this.project = options.project;
        this.url = [app.baseUrl, "projects", this.project.get('id'), "files"].join("/");
        this.url += "?path=" + this.path;
      }
      this.bind('reset', this.sort, this);
      return this.bind('reset', this.applyProjectToFile, this);
    };

    FilesCollection.prototype.sort = function() {
      var grouped;
      grouped = this.groupBy(function(file) {
        return file.get('type');
      });
      if (grouped.directory && grouped.file) {
        return this.reset(_.union(grouped.directory, grouped.file), {
          silent: true
        });
      }
    };

    FilesCollection.prototype.applyProjectToFile = function() {
      var _this = this;
      return this.each(function(file) {
        return file.project = _this.project;
      });
    };

    return FilesCollection;

  })(Collection);
  
}});

window.require.define({"models/model": function(exports, require, module) {
  var Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.urlRoot = function() {
      return "" + app.baseUrl + "/" + this.apiPath;
    };

    return Model;

  })(Backbone.Model);
  
}});

window.require.define({"models/project": function(exports, require, module) {
  var Files, Model, Project,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('./model');

  Files = require('./files');

  module.exports = Project = (function(_super) {

    __extends(Project, _super);

    function Project() {
      return Project.__super__.constructor.apply(this, arguments);
    }

    Project.prototype.apiPath = 'projects';

    Project.prototype.toJSON = function() {
      return {
        "project": _.pick(_.clone(this.attributes), 'name')
      };
    };

    Project.prototype.initialize = function() {
      return this.rootFolder = new Files;
    };

    Project.prototype.fetchRootFolder = function() {
      if (this.get('id')) {
        this.rootFolder = new Files(null, {
          path: "/",
          project: this
        });
        return this.rootFolder.fetch();
      }
    };

    Project.prototype.railsPath = function(method) {
      var path;
      return path = [app.baseUrl, "projects", this.get('id'), method].join("/");
    };

    Project.prototype.runProject = function(callback) {
      Backbone.Mediator.pub("status:set", "Starting server...");
      return $.ajax({
        url: this.railsPath("run"),
        type: "POST",
        success: function(response) {
          if (!response.result) {
            setTimeout(function() {
              return window.open("http://localhost:8888");
            }, 1500);
            Backbone.Mediator.pub("status:set", "Running", {
              sticky: true
            });
            return typeof callback === "function" ? callback() : void 0;
          } else {
            return Backbone.Mediator.pub("status:set", "Failed to start server");
          }
        }
      });
    };

    Project.prototype.buildAndRun = function() {
      var _this = this;
      return this.buildProject(function() {
        app.logger.log("Now calling attempting to run");
        return _this.runProject();
      });
    };

    Project.prototype.buildProject = function(callback) {
      Backbone.Mediator.pub("status:set", "Building...");
      return $.ajax({
        url: this.railsPath("build"),
        type: "POST",
        success: function(response) {
          var modal;
          if (response.result) {
            Backbone.Mediator.pub("status:set", "Build failed");
            modal = "<div class=\"modal hide fade\" id=\"myModal\">\n  <div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n    <h3 class=\"build-error\">Build Failed</h3>\n  </div>\n  <div class=\"modal-body\">\n    <p>Build failed. Here's the output of the build process:</p>\n    <pre style=\"overflow: auto;\">" + response.output + "</pre>\n  </div>\n  <div class=\"modal-footer\">\n    <a href=\"javascript:;\" class=\"btn\" data-dismiss=\"modal\">Close</a>\n  </div>\n</div>";
            return $(modal).appendTo('body').modal("show");
          } else {
            Backbone.Mediator.pub("status:set", "Build successful");
            return typeof callback === "function" ? callback() : void 0;
          }
        }
      });
    };

    return Project;

  })(Model);
  
}});

window.require.define({"models/projects": function(exports, require, module) {
  var Collection, Project, ProjectsCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('./collection');

  Project = require('./project');

  module.exports = ProjectsCollection = (function(_super) {

    __extends(ProjectsCollection, _super);

    function ProjectsCollection() {
      return ProjectsCollection.__super__.constructor.apply(this, arguments);
    }

    ProjectsCollection.prototype.apiPath = 'projects';

    ProjectsCollection.prototype.model = Project;

    return ProjectsCollection;

  })(Collection);
  
}});

window.require.define({"routers/router": function(exports, require, module) {
  var Project, Projects, ProjectsView, Router,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  Projects = require('models/projects');

  ProjectsView = require('views/projects_view');

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      '': 'index',
      'projects/:id': 'project',
      '*all': 'redirect'
    };

    Router.prototype.index = function() {
      var projects, projectsView;
      app.logger.log("Router#index");
      projects = new Projects();
      projectsView = new ProjectsView({
        collection: projects
      });
      $('body').append(projectsView.render().el);
      $("#" + projectsView.id).modal({
        backdrop: 'static',
        keyboard: false
      });
      return projects.fetch();
    };

    Router.prototype.project = function(id) {
      app.logger.log("Router#project");
      app.project = new Project({
        id: id
      });
      app.filebrowser.setModel(app.project);
      app.project.fetch({
        success: function() {
          return Backbone.Mediator.pub('status:set', "Project Loaded");
        }
      });
      return Backbone.Mediator.pub('modal:hide');
    };

    Router.prototype.redirect = function() {
      app.logger.log("Router#redirect");
      return this.navigate('');
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"views/code_editor_view": function(exports, require, module) {
  var CodeEditorView, File,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  File = require('models/file');

  module.exports = CodeEditorView = (function(_super) {

    __extends(CodeEditorView, _super);

    function CodeEditorView() {
      return CodeEditorView.__super__.constructor.apply(this, arguments);
    }

    CodeEditorView.prototype.className = 'code-editor';

    CodeEditorView.prototype.placeholderModel = true;

    CodeEditorView.prototype.initialize = function() {
      var _this = this;
      this.model || (this.model = new File);
      return Mousetrap.bind(['ctrl+s', 'command+s'], function(e) {
        e.preventDefault();
        return _this.updateAndSave();
      });
    };

    CodeEditorView.prototype.updateAndSave = function(callback) {
      if (this.placeholderModel) {
        return false;
      }
      this.model.set('content', this.codemirror.getValue());
      return this.model.updateContent(callback);
    };

    CodeEditorView.prototype.setFile = function(file) {
      this.updateAndSave();
      this.model.off('change:content', this.updateContent, this);
      this.model = file;
      this.model.on('change:content', this.updateContent, this);
      return this.placeholderModel = false;
    };

    CodeEditorView.prototype.clearEditor = function() {
      var _this = this;
      this.model.off('change:content', this.updateContent, this);
      return this.updateAndSave(function() {
        _this.codemirror.setValue('');
        _this.model = new File;
        return _this.placeholderModel = true;
      });
    };

    CodeEditorView.prototype.updateContent = function() {
      this.codemirror.setValue(this.model.get('content'));
      return this.codemirror.setOption("mode", this.model.codeMode());
    };

    CodeEditorView.prototype.render = function() {
      this.$el.html(this.template);
      this.codemirror = CodeMirror(this.$el[0], {
        value: this.model.get('content'),
        lineNumbers: true
      });
      this.$('textarea').addClass("mousetrap");
      return this;
    };

    return CodeEditorView;

  })(Backbone.View);
  
}});

window.require.define({"views/file_view": function(exports, require, module) {
  var FileView, Files,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Files = require('models/files');

  module.exports = FileView = (function(_super) {

    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.template = require('./templates/file');

    FileView.prototype.tagName = "div";

    FileView.prototype.className = "file-container";

    FileView.prototype.directory = null;

    FileView.prototype.allowClose = false;

    FileView.prototype.events = function() {
      var events;
      events = {};
      events["click a#cid_" + this.model.cid] = "open";
      return events;
    };

    FileView.prototype.initialize = function(attr, options) {
      if (options) {
        if (options.allowClose) {
          this.allowClose = options.allowClose;
        }
      }
      return this.model.on('all', this.render, this);
    };

    FileView.prototype.render = function() {
      var _this = this;
      this.$el.html(this.template({
        file: this.model,
        directory: this.directory
      }));
      this.$el.attr('data-cid', this.model.cid);
      if (this.directory) {
        this.directory.each(function(file) {
          var file_view;
          file_view = new FileView({
            model: file
          });
          return _this.$('.subdirectory').first().append(file_view.render().el);
        });
      }
      return this;
    };

    FileView.prototype.markAsActive = function() {
      return this.$el.addClass('active');
    };

    FileView.prototype.unmarkAsActive = function() {
      return this.$el.removeClass('active');
    };

    FileView.prototype.removeFromList = function() {
      if (!this.allowClose) {
        return;
      }
      this.remove();
      return Backbone.Mediator.pub("filebrowser:close_file", this.model);
    };

    FileView.prototype.open = function(e) {
      if (e != null) {
        e.preventDefault();
      }
      if (this.model.isDirectory()) {
        if (this.directory) {
          app.logger.log("Closing directory " + (this.model.get('name')));
          this.directory.off('all');
          this.directory = null;
          return this.render();
        } else {
          app.logger.log("Opening directory " + (this.model.get('name')));
          this.directory = new Files(null, {
            project: this.model.project,
            path: this.model.fullPath()
          });
          this.directory.on('reset', this.render, this);
          return this.directory.fetch();
        }
      } else {
        app.logger.log("Opening file " + (this.model.get('name')));
        app.code_editor.setFile(this.model);
        this.model.fetchContent();
        return Backbone.Mediator.pub("filebrowser:open_file", this.model);
      }
    };

    return FileView;

  })(Backbone.View);
  
}});

window.require.define({"views/filebrowser_view": function(exports, require, module) {
  var File, FileView, FilebrowserView, Project,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  FileView = require('./file_view');

  File = require('models/file');

  module.exports = FilebrowserView = (function(_super) {

    __extends(FilebrowserView, _super);

    function FilebrowserView() {
      return FilebrowserView.__super__.constructor.apply(this, arguments);
    }

    FilebrowserView.prototype.className = 'filebrowser';

    FilebrowserView.prototype.template = require('./templates/filebrowser');

    FilebrowserView.prototype.openFiles = {};

    FilebrowserView.prototype.openFile = null;

    FilebrowserView.prototype.arrayOpenFiles = [];

    FilebrowserView.prototype.initialize = function() {
      var _this = this;
      this.setModel(this.model || new Project());
      _.each([1, 2, 3, 4, 5, 6, 7, 8, 9], function(number) {
        return Mousetrap.bind(["ctrl+" + number, "command+" + number], function(e) {
          e.preventDefault();
          return _this.openFileAtIndex(number - 1);
        });
      });
      Mousetrap.bind(["ctrl+w", "command+w"], function(e) {
        var _ref;
        e.preventDefault();
        return (_ref = _this.openFiles[_this.openFile]) != null ? _ref.removeFromList() : void 0;
      });
      Backbone.Mediator.sub("filebrowser:open_file", this.addFile, this);
      return Backbone.Mediator.sub("filebrowser:close_file", this.removeFile, this);
    };

    FilebrowserView.prototype.openFileAtIndex = function(index) {
      if (!this.arrayOpenFiles[index]) {
        return;
      }
      return this.openFiles[this.arrayOpenFiles[index]].open();
    };

    FilebrowserView.prototype.setModel = function(model) {
      var _ref;
      if ((_ref = this.model) != null) {
        _ref.off('change', this.render, this);
      }
      this.model = model;
      this.model.on('change', this.render, this);
      return this.model.fetchRootFolder();
    };

    FilebrowserView.prototype.render = function() {
      var _this = this;
      app.logger.log("FilebrowserView#render");
      this.$el.html(this.template);
      this.$('#open_files').sortable({
        stop: function(event, ui) {
          return _.each(_this.arrayOpenFiles, function(fullPath) {
            if (_this.openFiles[fullPath].model.cid === ui.item.attr('data-cid')) {
              _this.arrayOpenFiles.splice(_.indexOf(_this.arrayOpenFiles, fullPath), 1);
              return _this.arrayOpenFiles.splice(ui.item.index(), 0, fullPath);
            }
          });
        }
      });
      this.model.rootFolder.each(function(file) {
        var file_view;
        file_view = new FileView({
          model: file
        });
        return _this.$('#project_files').append(file_view.render().el);
      });
      return this;
    };

    FilebrowserView.prototype.addFile = function(file) {
      if (!_.has(this.openFiles, file.fullPath())) {
        this.openFiles[file.fullPath()] = new FileView({
          model: file
        }, {
          allowClose: true
        });
        this.arrayOpenFiles.push(file.fullPath());
        this.$('#open_files').append(this.openFiles[file.fullPath()].render().el);
      }
      _.each(this.openFiles, function(view) {
        return view.unmarkAsActive();
      });
      this.openFiles[file.fullPath()].markAsActive();
      return this.openFile = file.fullPath();
    };

    FilebrowserView.prototype.removeFile = function(file) {
      if (_.has(this.openFiles, file.fullPath())) {
        delete this.openFiles[file.fullPath()];
        this.arrayOpenFiles.splice(_.indexOf(this.arrayOpenFiles, file.fullPath()), 1);
        this.openFile = null;
        return app.code_editor.clearEditor();
      }
    };

    return FilebrowserView;

  })(Backbone.View);
  
}});

window.require.define({"views/navbar_view": function(exports, require, module) {
  var NavbarView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = NavbarView = (function(_super) {

    __extends(NavbarView, _super);

    function NavbarView() {
      this.hideStatus = __bind(this.hideStatus, this);

      this.showStatus = __bind(this.showStatus, this);
      return NavbarView.__super__.constructor.apply(this, arguments);
    }

    NavbarView.prototype.className = "navbar navbar-fixed-top";

    NavbarView.prototype.template = require('./templates/navbar');

    NavbarView.prototype.statuses = [];

    NavbarView.prototype.showingStatus = false;

    NavbarView.prototype.showProgressTimeout = null;

    NavbarView.prototype.events = {
      "click [data-menu_id=build]": "buildProject",
      "click [data-menu_id=build-run]": "buildAndRun",
      "click [data-menu_id=run]": "runProject"
    };

    NavbarView.prototype.initialize = function() {
      var _this = this;
      Backbone.Mediator.sub('progress:show', this.showProgress, this);
      Backbone.Mediator.sub('progress:hide', this.hideProgress, this);
      Backbone.Mediator.sub('progress:set', this.setProgress, this);
      Backbone.Mediator.sub('status:set', this.showStatus, this);
      this.bindKeys();
      this.loadingCount = 0;
      this.$el.bind('ajaxStart', function() {
        _this.loadingCount += 1;
        if (_this.loadingCount === 1) {
          _this.showProgress();
          return app.logger.log("Syncing started.");
        }
      });
      return this.$el.bind('ajaxStop', function() {
        _this.loadingCount -= 1;
        if (_this.loadingCount === 0) {
          _this.hideProgress();
          return app.logger.log("Syncing ended.");
        }
      });
    };

    NavbarView.prototype.bindKeys = function() {
      var _this = this;
      Mousetrap.bind(["ctrl+r", "command+r"], function(e) {
        e.preventDefault();
        return app.code_editor.updateAndSave(function() {
          return _this.buildAndRun();
        });
      });
      return Mousetrap.bind(["ctrl+b", "command+b"], function(e) {
        e.preventDefault();
        return _this.buildProject();
      });
    };

    NavbarView.prototype.helpers = {
      divider: function() {
        return "<li class=\"divider\"></li>";
      },
      menuItem: function(title, url, options) {
        if (options == null) {
          options = {};
        }
        options = _.defaults(options, {
          icon: "blank",
          shortcut: "",
          menu_id: ""
        });
        return "<li>\n  <a href=\"" + url + "\" data-menu_id=\"" + options.menu_id + "\">\n    <i class=\"icon-" + options.icon + "\"></i>\n    " + title + "\n    <div class=\"pull-right keyboard-shortcut\">" + options.shortcut + "</div>\n  </a>\n</li>";
      }
    };

    NavbarView.prototype.showStatus = function(status, options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        sticky: false
      });
      clearTimeout(this.statusTimeout);
      if (!options.sticky) {
        this.statusTimeout = setTimeout(this.hideStatus, 3000);
      }
      return this.$('.switch-status').fadeOut('fast', function() {
        return _this.$('.switch-status').html(status).fadeIn('fast');
      });
    };

    NavbarView.prototype.hideStatus = function() {
      return this.$('.switch-status').fadeOut('fast');
    };

    NavbarView.prototype.showProgress = function() {
      var _this = this;
      return this.showProgressTimeout = setTimeout(function() {
        _this.$('.progress').css({
          opacity: 0,
          display: "inline",
          width: 0
        });
        _this.$('.progress').animate({
          opacity: 1,
          width: 150
        });
        return _this.showProgressTimeout = null;
      }, 500);
    };

    NavbarView.prototype.hideProgress = function() {
      var _this = this;
      if (this.showProgressTimeout != null) {
        clearTimeout(this.showProgressTimeout);
        return this.showProgressTimeout = null;
      } else {
        return setTimeout(function() {
          return _this.$('.progress').animate({
            opacity: 0,
            width: 0
          });
        }, 800);
      }
    };

    NavbarView.prototype.setProgress = function(progress) {
      return this.$('.progress .bar').css('width', progress);
    };

    NavbarView.prototype.render = function() {
      this.$el.html(this.template({
        helper: this.helpers
      }));
      return this;
    };

    NavbarView.prototype.buildProject = function() {
      return app.project.buildProject();
    };

    NavbarView.prototype.runProject = function() {
      return app.project.runProject();
    };

    NavbarView.prototype.buildAndRun = function() {
      return app.project.buildAndRun();
    };

    return NavbarView;

  })(Backbone.View);
  
}});

window.require.define({"views/projects_view": function(exports, require, module) {
  var ProjectsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = ProjectsView = (function(_super) {

    __extends(ProjectsView, _super);

    function ProjectsView() {
      return ProjectsView.__super__.constructor.apply(this, arguments);
    }

    ProjectsView.prototype.className = 'modal hide fade';

    ProjectsView.prototype.id = "projects_modal";

    ProjectsView.prototype.template = require('./templates/projects');

    ProjectsView.prototype.subscriptions = {
      "modal:hide": "destroy"
    };

    ProjectsView.prototype.initialize = function() {
      return this.collection.on('all', this.render, this);
    };

    ProjectsView.prototype.render = function() {
      this.$el.html(this.template({
        collection: this.collection.toArray()
      }));
      return this;
    };

    ProjectsView.prototype.destroy = function() {
      $("#" + this.id).modal('hide');
      return this.remove();
    };

    return ProjectsView;

  })(Backbone.View);
  
}});

window.require.define({"views/templates/code_editor": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
      
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views/templates/file": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<div class="file-item">\n  <a href="javascript:;" id="cid_');
      
        __out.push(__sanitize(this.file.cid));
      
        __out.push('">\n    ');
      
        if (this.file.isDirectory()) {
          __out.push('\n      \n      ');
          if (this.directory) {
            __out.push('\n        <i class="icon-folder-open"></i>\n      ');
          } else {
            __out.push('\n        <i class="icon-folder-close"></i>\n      ');
          }
          __out.push('\n\n      ');
          __out.push(__sanitize(this.file.get('name')));
          __out.push('\n\n    ');
        } else {
          __out.push('\n      ');
          if (this.file.isView()) {
            __out.push('\n        <i class="icon-eye-open"></i> \n      ');
          } else {
            __out.push('\n        <i class="icon-file"></i> \n      ');
          }
          __out.push('\n\n      ');
          __out.push(__sanitize(this.file.get('name')));
          __out.push('\n    ');
        }
      
        __out.push('\n  </a>\n</div>\n\n<div class="subdirectory file-item"></div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views/templates/filebrowser": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<ul class="nav nav-list">\n  <li class="nav-header"> Open Files </li>\n</ul>\n<div class="nav nav-list" id="open_files"></div>\n\n<ul class="nav nav-list">\n  <li class="nav-header">Project</li>\n</ul>\n<div class="nav nav-list" id="project_files"></div>\n\n<div class="separator"><!-- separator, keeps the status bar at "bar" ;P --></div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views/templates/navbar": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<div class="navbar-inner">\n  <div class="container">\n    <a class="brand" href="javascript:;"><strong>Switch IDE</strong></a>\n\n    <ul class="nav">\n      <li class="dropdown">\n        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="icon-file"></i>\n          File\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('New Project', 'javascript:;', {
          icon: 'plus',
          shortcut: '⌘⇧N'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('New File', 'javascript:;', {
          shortcut: '⌘N'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Add Files', 'javascript:;', {
          icon: 'upload'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Save', 'javascript:;', {
          icon: 'save',
          shortcut: '⌘S'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Quick Open', 'javascript:;', {
          icon: 'fire',
          shortcut: '⌘T'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.divider())));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Close Project', 'javascript:;', {
          icon: 'remove'
        }))));
      
        __out.push('\n        </ul>\n      </li>\n    </ul>\n\n    <ul class="nav">\n      <li class="dropdown">\n        <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="icon-briefcase"></i>\n          Project\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Build & Run', 'javascript:;', {
          icon: 'legal',
          shortcut: '⌘R',
          menu_id: 'build-run'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Build', 'javascript:;', {
          shortcut: '⌘B',
          menu_id: 'build'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Run', 'javascript:;', {
          icon: 'play',
          menu_id: 'run'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Test', 'javascript:;', {
          icon: 'wrench',
          shortcut: '⌘⇧T'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Archive', 'javascript:;', {
          icon: 'save'
        }))));
      
        __out.push('\n          <!-- ');
      
        __out.push(__sanitize(this.safe(this.helper.divider())));
      
        __out.push(' -->\n        </ul>\n      </li>\n    </ul>\n\n    <ul class="nav">\n      <li class="dropdown">\n        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="icon-github"></i>\n          Git\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Create Repo', 'javascript:;'))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Commit', 'javascript:;', {
          icon: 'ok',
          shortcut: '⌘⌥C'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Push', 'javascript:;', {
          icon: 'upload-alt',
          shortcut: '⌘⌥P'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Pull', 'javascript:;', {
          icon: 'download-alt',
          shortcut: '⌘⌥X'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.divider())));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Switch Branch', 'javascript:;', {
          icon: 'random'
        }))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Merge', 'javascript:;'))));
      
        __out.push('\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Tag', 'javascript:;', {
          icon: 'tag'
        }))));
      
        __out.push('\n        </ul>\n      </li>\n    </ul>\n\n    <ul class="nav">\n      <li class="dropdown">\n        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\n          <i class="icon-th-large"></i>\n          Window\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Close', 'javascript:;', {
          shortcut: '⌃W'
        }))));
      
        __out.push('\n          <!-- ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Cycle Files', 'javascript:;', {
          icon: 'refresh',
          shortcut: '⌘1..9'
        }))));
      
        __out.push(' -->\n        </ul>\n      </li>\n    </ul>\n\n    <div class="btn-group pull-right">\n      <a class="btn btn-success" data-menu_id="build-run">\n        <i class="icon-legal"></i>\n        Build & Run\n      </a>\n      <a class="btn btn-success dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </a>\n      <ul class="dropdown-menu">\n        ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Build', 'javascript:;', {
          shortcut: '⌘B',
          menu_id: 'build'
        }))));
      
        __out.push('\n        ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Run', 'javascript:;', {
          icon: 'play',
          menu_id: 'run'
        }))));
      
        __out.push('\n        ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Test', 'javascript:;', {
          icon: 'wrench',
          shortcut: '⌘⇧T'
        }))));
      
        __out.push('\n        ');
      
        __out.push(__sanitize(this.safe(this.helper.menuItem('Archive', 'javascript:;', {
          icon: 'save'
        }))));
      
        __out.push('\n      </ul>\n    </div>\n\n    <div class="progress progress-striped active pull-right" style="display: none;">\n      <div class="bar" style="width: 100%;"></div>\n    </div>\n\n    <div class="pull-right">\n      <p class="switch-status" style="display: none;"></p>\n    </div>\n  </div>\n</div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views/templates/projects": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        var project, _i, _len, _ref;
      
        __out.push('<div class="modal-header">\n  <h3>Choose a project</h3>\n</div>\n<div class="modal-body">\n  <ul class="unstyled">\n    ');
      
        _ref = this.collection;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          project = _ref[_i];
          __out.push('\n      <li>\n        <a href="#/projects/');
          __out.push(__sanitize(project.get('id')));
          __out.push('"> ');
          __out.push(__sanitize(project.get('name')));
          __out.push(' </a>\n      </li>\n    ');
        }
      
        __out.push('\n  </ul>\n</div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

