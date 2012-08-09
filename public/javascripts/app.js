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
  var Application, CodeEditor, Filebrowser, Navbar, Projects, Router;

  Router = require('routers/router');

  Navbar = require('views/navbar_view');

  Filebrowser = require('views/filebrowser_view');

  CodeEditor = require('views/code_editor_view');

  Projects = require('models/projects');

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
      this.router = new Router;
      return this.renderEssentialComponents();
    };

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
      var code_editor_width, filebrowser_height, filebrowser_width;
      filebrowser_height = $('#filebrowser').height();
      filebrowser_width = $('#filebrowser').width();
      $('#filebrowser').height(filebrowser_height - 40);
      $('#filebrowser').css('top', 40);
      code_editor_width = $('.code-editor').width();
      $('.code-editor, .CodeMirror-scroll').height($(window).height() - 40);
      $('.code-editor').width(code_editor_width - filebrowser_width);
      return $('.code-editor').css('top', 40);
    };

    return Application;

  })();

  window.app = new Application;
  
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

    File.prototype.codeMode = function() {
      if (this.get('name') && this.get('name').match(/\.coffee$/)) {
        return "coffeescript";
      } else {
        return "text";
      }
    };

    File.prototype.fullPath = function() {
      return "" + (this.get('parent')) + "/" + (this.get('name'));
    };

    File.prototype.fetchContent = function() {
      var path,
        _this = this;
      if (this.isDirectory()) {
        return;
      }
      path = [app.baseUrl, "projects", 9, "files", "get_content"].join("/");
      path += "?path=" + ([this.get('parent'), this.get('name')].join("/"));
      return $.getJSON(path, function(data) {
        _this.set('content', data.content, {
          silent: true
        });
        return _this.trigger('change:content');
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
      this.rootFolder = new Files;
      if (this.get('id')) {
        this.rootFolder = new Files(null, {
          path: "/",
          project: this
        });
        this.rootFolder.url = [app.baseUrl, "projects", this.get('id'), "files"].join("/");
        this.rootFolder.url += "?path=/";
        this.rootFolder.on('reset', this.triggerEvents, this);
        return this.rootFolder.fetch();
      }
    };

    Project.prototype.triggerEvents = function() {
      return this.trigger('change');
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
      console.log("Router#index");
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
      var project;
      console.log("Router#project");
      project = new Project({
        id: id
      });
      app.filebrowser.setModel(project);
      project.fetch();
      return Backbone.Mediator.pub('modal:hide');
    };

    Router.prototype.redirect = function() {
      console.log("Router#redirect");
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

    CodeEditorView.prototype.initialize = function() {
      return this.model || (this.model = new File());
    };

    CodeEditorView.prototype.setFile = function(file) {
      this.model.off('change:content', this);
      this.model = file;
      return this.model.on('change:content', this.updateContent, this);
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

    FileView.prototype.events = function() {
      var events;
      events = {};
      events["click a#cid_" + this.model.cid] = "open";
      return events;
    };

    FileView.prototype.initialize = function() {
      return this.model.on('all', this.render, this);
    };

    FileView.prototype.render = function() {
      var _this = this;
      this.$el.html(this.template({
        file: this.model,
        directory: this.directory
      }));
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

    FileView.prototype.open = function(e) {
      e.preventDefault();
      if (this.model.isDirectory()) {
        if (this.directory) {
          console.log("Closing directory " + (this.model.get('name')));
          this.directory.off('all');
          this.directory = null;
          return this.render();
        } else {
          console.log("Opening directory " + (this.model.get('name')));
          this.directory = new Files(null, {
            project: this.model.project,
            path: this.model.fullPath()
          });
          this.directory.on('reset', this.render, this);
          return this.directory.fetch();
        }
      } else {
        console.log("Opening file " + (this.model.get('name')));
        app.code_editor.setFile(this.model);
        return this.model.fetchContent();
      }
    };

    return FileView;

  })(Backbone.View);
  
}});

window.require.define({"views/filebrowser_view": function(exports, require, module) {
  var FileView, FilebrowserView, Project,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Project = require('models/project');

  FileView = require('./file_view');

  module.exports = FilebrowserView = (function(_super) {

    __extends(FilebrowserView, _super);

    function FilebrowserView() {
      return FilebrowserView.__super__.constructor.apply(this, arguments);
    }

    FilebrowserView.prototype.className = 'filebrowser';

    FilebrowserView.prototype.template = require('./templates/filebrowser');

    FilebrowserView.prototype.initialize = function() {
      return this.setModel(this.model || new Project());
    };

    FilebrowserView.prototype.setModel = function(model) {
      this.model = model;
      return this.model.on('change', this.render, this);
    };

    FilebrowserView.prototype.render = function() {
      var _this = this;
      console.log("FilebrowserView#render");
      this.$el.html(this.template);
      this.model.rootFolder.each(function(file) {
        var file_view;
        file_view = new FileView({
          model: file
        });
        return _this.$('#project_files').append(file_view.render().el);
      });
      return this;
    };

    return FilebrowserView;

  })(Backbone.View);
  
}});

window.require.define({"views/navbar_view": function(exports, require, module) {
  var NavbarView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = NavbarView = (function(_super) {

    __extends(NavbarView, _super);

    function NavbarView() {
      return NavbarView.__super__.constructor.apply(this, arguments);
    }

    NavbarView.prototype.className = "navbar navbar-fixed-top";

    NavbarView.prototype.template = require('./templates/navbar');

    NavbarView.prototype.initialize = function() {
      var _this = this;
      Backbone.Mediator.sub('progress:show', this.show_progress, this);
      Backbone.Mediator.sub('progress:hide', this.hide_progress, this);
      Backbone.Mediator.sub('progress:set', this.set_progress, this);
      this.loadingCount = 0;
      this.$el.bind('ajaxStart', function() {
        _this.loadingCount += 1;
        return _this.show_progress();
      });
      return this.$el.bind('ajaxStop', function() {
        _this.loadingCount -= 1;
        if (_this.loadingCount === 0) {
          return _this.hide_progress();
        }
      });
    };

    NavbarView.prototype.show_progress = function() {
      return this.$('.progress').fadeIn('fast');
    };

    NavbarView.prototype.hide_progress = function() {
      return this.$('.progress').fadeOut('fast');
    };

    NavbarView.prototype.set_progress = function(progress) {
      return this.$('.progress .bar').css('width', progress);
    };

    NavbarView.prototype.render = function() {
      this.$el.html(this.template);
      return this;
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

    ProjectsView.prototype.className = 'modal hide';

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
          __out.push('\n      <i class="icon-file"></i> ');
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
      
        __out.push('<ul class="nav nav-list">\n  <li class="nav-header"> Open Files </li>\n</ul>\n<ul class="nav nav-list" id="open_files"></ul>\n\n<ul class="nav nav-list">\n  <li class="nav-header">Project</li>\n</ul>\n<div class="nav nav-list" id="project_files"></div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views/templates/files_view": function(exports, require, module) {
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
      
        __out.push('<div class="navbar-inner">\n  <div class="container">\n    <a class="brand" href="#"><strong>Switch IDE</strong></a>\n\n    <ul class="nav">\n      <li class="dropdown">\n        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\n          File\n          <b class="caret"></b>\n        </a>\n        <ul class="dropdown-menu">\n          <li><a href="#"> <i class="icon-plus"></i> New Project </a></li>\n          <li><a href="#"> <i class="icon-blank"></i> New File </a></li>\n        </ul>\n      </li>\n    </ul>\n\n    <div class="progress progress-striped active pull-right" style="display: none;">\n      <div class="bar" style="width: 100%;"></div>\n    </div>\n  </div>\n</div>');
      
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

