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
      'click': 'createChannel'
    };

    UserView.prototype.render = function() {
      return $(this.el).html(this.template(this.model.toJSON()));
    };

    UserView.prototype.createChannel = function() {
      return new Channel(this.model.get('name'));
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
      this.close = __bind(this.close, this);
      this.sendMessage = __bind(this.sendMessage, this);
      this.addMessage = __bind(this.addMessage, this);
      ChatView.__super__.constructor.apply(this, arguments);
    }

    ChatView.prototype.tagName = 'li';

    ChatView.prototype.className = 'pane chat-window';

    ChatView.prototype.template = _.template($('#chat').html());

    ChatView.prototype.initialize = function() {
      this.collection.bind('add', this.addMessage);
      return $('.chat-windows').append($(this.el).html(this.template({
        title: 'General'
      })));
    };

    ChatView.prototype.events = {
      'submit form': 'sendMessage',
      'click .close': 'close'
    };

    ChatView.prototype.addMessage = function(msg) {
      return $(this.el).find('.messages > ul').append((new MessageView({
        model: msg
      })).render()).parent().scrollTop(99999);
    };

    ChatView.prototype.sendMessage = function(e) {
      var input;
      input = $(this.el).find('.prompt').val();
      if (input) {
        app.socket.send(JSON.stringify({
          username: localStorage['name'],
          msg: input
        }));
        this.collection.add({
          username: localStorage['name'],
          msg: input
        });
      }
      $(this.el).find('.prompt').val('');
      return false;
    };

    ChatView.prototype.close = function() {
      return $(this.el).hide();
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
      offset = $(this.el).hasClass('active') ? 0 : -220;
      $('.chatapp').animate({
        right: offset
      });
      $('.chat-windows').animate({
        right: offset + 220
      });
      return false;
    };

    return ChatMenuView;

  })(Backbone.View);

  Channel = (function() {

    function Channel(user) {
      this.removeUser = __bind(this.removeUser, this);
      this.addUser = __bind(this.addUser, this);
      this.addMessage = __bind(this.addMessage, this);      this.messages = new Backbone.Collection;
      this.users = new Backbone.Collection([localStorage['name'], user]);
      this.chatView = new ChatView({
        collection: this.messages,
        users: this.users
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
      this.socket.on("close", function() {
        return alert('Connection lost');
      });
      this.socket.on("message", function(data) {
        return _this.channels['general'].addMessage(JSON.parse(data['msg']));
      });
    }

    ChatApp.prototype.channels = {
      general: new Channel('general')
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
