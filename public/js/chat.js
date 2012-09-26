(function() {
  var Channel, ChatApp, ChatMenuView, ChatView, MessageView, User, UserView, UsersView,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  User = (function(_super) {

    __extends(User, _super);

    function User() {
      User.__super__.constructor.apply(this, arguments);
    }

    return User;

  })(Backbone.Model);

  UserView = (function(_super) {

    __extends(UserView, _super);

    function UserView() {
      UserView.__super__.constructor.apply(this, arguments);
    }

    UserView.prototype.tagName = 'li';

    UserView.prototype.className = 'user';

    UserView.prototype.template = _.template($('#chat-user').html());

    UserView.prototype.initialize = function() {
      var _this = this;
      this.model.bind('remove', function() {
        return $(_this.el).remove();
      });
      return this.model.bind('change', function() {
        return _this.render();
      });
    };

    UserView.prototype.events = {
      'click': function() {
        return window.app.createChannel(this.model.get('name'));
      }
    };

    UserView.prototype.render = function() {
      return $(this.el).html(this.template(this.model.toJSON()));
    };

    return UserView;

  })(Backbone.View);

  UsersView = (function(_super) {

    __extends(UsersView, _super);

    function UsersView() {
      this.searchclear = __bind(this.searchclear, this);
      this.filter = __bind(this.filter, this);
      this.render = __bind(this.render, this);
      this.addUser = __bind(this.addUser, this);
      UsersView.__super__.constructor.apply(this, arguments);
    }

    UsersView.prototype.className = 'users';

    UsersView.prototype.template = _.template($('#user-list').html());

    UsersView.prototype.initialize = function() {
      this.collection.bind('add', this.addUser);
      this.collection.bind('reset', this.render);
      $('.chatapp').append($(this.el).html(this.template({})));
      return this.render();
    };

    UsersView.prototype.events = {
      'keyup .searchbox': 'filter',
      'click .searchclear': 'searchclear'
    };

    UsersView.prototype.addUser = function(user) {
      return $(this.el).find('> ul').append((new UserView({
        model: user
      })).render());
    };

    UsersView.prototype.render = function() {
      var _this = this;
      $(this.el).find('> ul').empty();
      return this.collection.each(function(user) {
        if (user.get('name') !== localStorage['name']) return _this.addUser(user);
      });
    };

    UsersView.prototype.filter = function() {
      var s, u, _i, _len, _ref;
      s = $('.searchbox').val().toLowerCase();
      if (s) {
        $(this.el).find('> ul').empty();
        _ref = this.collection.filter(function(u) {
          return ~u.get('name').toLowerCase().indexOf(s);
        });
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          u = _ref[_i];
          this.addUser(u);
        }
        return $('.searchclear').fadeIn('fast');
      } else {
        return this.searchclear();
      }
    };

    UsersView.prototype.searchclear = function() {
      $('.searchclear').fadeOut('fast');
      $('.searchbox').val('').focus();
      return this.render();
    };

    return UsersView;

  })(Backbone.View);

  MessageView = (function(_super) {

    __extends(MessageView, _super);

    function MessageView() {
      MessageView.__super__.constructor.apply(this, arguments);
    }

    MessageView.prototype.tagName = 'li';

    MessageView.prototype.className = 'msg';

    MessageView.prototype.template = _.template($('#chat-message').html());

    MessageView.prototype.render = function() {
      return $(this.el).html(this.template(this.model.toJSON()));
    };

    return MessageView;

  })(Backbone.View);

  ChatView = (function(_super) {

    __extends(ChatView, _super);

    function ChatView() {
      this.show = __bind(this.show, this);
      this.sendMessage = __bind(this.sendMessage, this);
      this.addMessage = __bind(this.addMessage, this);
      ChatView.__super__.constructor.apply(this, arguments);
    }

    ChatView.prototype.tagName = 'li';

    ChatView.prototype.className = 'chat-window';

    ChatView.prototype.template = _.template($('#chat').html());

    ChatView.prototype.initialize = function() {
      this.collection.bind('add', this.addMessage);
      $('.chat-windows').append($(this.el).html(this.template({
        title: this.options.dest
      })));
      return $('.prompt').focus();
    };

    ChatView.prototype.events = {
      'submit form': 'sendMessage',
      'click .close': function() {
        return $(this.el).hide();
      }
    };

    ChatView.prototype.addMessage = function(msg) {
      $(this.el).find('.messages > ul').append((new MessageView({
        model: msg
      })).render()).parent().scrollTop(99999);
      return this.show();
    };

    ChatView.prototype.sendMessage = function(e) {
      var input;
      input = $(this.el).find('.prompt').val();
      if (input) {
        app.socket.emit('pm', JSON.stringify({
          from: localStorage['name'],
          to: this.options.dest,
          msg: input
        }));
        this.collection.add({
          from: localStorage['name'],
          msg: input
        });
      }
      $(this.el).find('.prompt').val('');
      return false;
    };

    ChatView.prototype.show = function() {
      return $(this.el).show();
    };

    return ChatView;

  })(Backbone.View);

  ChatMenuView = (function(_super) {

    __extends(ChatMenuView, _super);

    function ChatMenuView() {
      this.toggle = __bind(this.toggle, this);
      this.render = __bind(this.render, this);
      ChatMenuView.__super__.constructor.apply(this, arguments);
    }

    ChatMenuView.prototype.tagName = 'li';

    ChatMenuView.prototype.className = 'active';

    ChatMenuView.prototype.template = _.template($('#chat-menu').html());

    ChatMenuView.prototype.initialize = function() {
      this.collection.bind('all', this.render);
      $('.nav.pull-right').prepend(this.el);
      return this.render();
    };

    ChatMenuView.prototype.events = {
      'click': 'toggle'
    };

    ChatMenuView.prototype.render = function() {
      return $(this.el).html(this.template({
        usercount: (this.collection.filter(function(u) {
          return u.get('online');
        })).length
      }));
    };

    ChatMenuView.prototype.toggle = function() {
      var offset;
      $(this.el).toggleClass('active');
      offset = $(this.el).hasClass('active') ? 0 : -210;
      $('.chatapp').animate({
        right: offset
      });
      $('.chat-windows').animate({
        right: offset + 210
      });
      return false;
    };

    return ChatMenuView;

  })(Backbone.View);

  Channel = (function() {

    function Channel(dest) {
      this.dest = dest;
      this.removeUser = __bind(this.removeUser, this);
      this.addUser = __bind(this.addUser, this);
      this.addMessage = __bind(this.addMessage, this);
      this.messages = new Backbone.Collection;
      this.chatView = new ChatView({
        collection: this.messages,
        dest: this.dest
      });
    }

    Channel.prototype.addMessage = function(msg) {
      return this.messages.add(msg);
    };

    Channel.prototype.addUser = function(username) {
      return this.users.add(new User({
        username: username
      }));
    };

    Channel.prototype.removeUser = function(username) {
      return this.users.each(function(user) {
        if (user.get('username') === username) return user.destroy();
      });
    };

    return Channel;

  })();

  ChatApp = (function() {

    function ChatApp() {
      this.createChannel = __bind(this.createChannel, this);
      var _this = this;
      this.users = new Backbone.Collection;
      this.users.url = '/users';
      this.users.fetch();
      this.usersView = new UsersView({
        collection: this.users
      });
      this.chatmenuView = new ChatMenuView({
        collection: this.users
      });
      this.socket = io.connect('/');
      this.socket.emit("connect", localStorage['name']);
      this.socket.on("connect", function(name) {
        return _this.users.each(function(u) {
          if (u.get('name') === name) return u.set('online', true);
        });
      });
      this.socket.on("disconnect", function(name) {
        return _this.users.each(function(u) {
          if (u.get('name') === name) return u.set('online', false);
        });
      });
      this.socket.on("pm", function(data) {
        if (_this.channels[data.from] == null) _this.createChannel(data.from);
        return _this.channels[data.from].addMessage(data);
      });
    }

    ChatApp.prototype.channels = {};

    ChatApp.prototype.createChannel = function(dest) {
      if (this.channels[dest] != null) {
        return this.channels[dest].chatView.show();
      } else {
        return this.channels[dest] = new Channel(dest);
      }
    };

    ChatApp.prototype.getUsername = function(name) {
      return (this.users.find(function(u) {
        return u.get('name') === name;
      })).get('username');
    };

    return ChatApp;

  })();

  $(function() {
    if (!localStorage['name']) {
      localStorage['name'] = 'Guest ' + Math.floor(Math.random() * 1000);
    }
    $('.user-box').text(localStorage['name']);
    $('#change-name .save').click(function() {
      $('.user-box').text($('#change-name input').val());
      return localStorage['name'] = $('#change-name input').val();
    });
    return window.app = new ChatApp;
  });

}).call(this);
