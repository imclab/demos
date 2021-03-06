/*global define:true */

define([
  'myclass',
  'app/ui/stage',
  'app/ui/userinterface',
  'app/actor/actorfactory',
  'app/util/util',
  'app/util/customevents',
  'app/util/physics',
  'app/util/registry',
  'app/controller/explosion',
  'app/controller/asteroid',
  'Box2D'
] , function(
  my,
  Stage,
  UserInterface,
  ActorFactory,
  util,
  CustomEvents,
  Physics,
  Registry,
  ExplosionController,
  AsteroidController
) {

  var GameController = my.Class({

    constructor : function() {
      if(!(this instanceof GameController)) {
        return new GameController();
      }

      this.initialize();

    },

    initialize : function() {
    
      // create global registry object
      if(!window.asteroids) {
        window.asteroids = new Registry();
      }

      this.events = window.asteroids.set('events', new CustomEvents());
      window.asteroids.set('ui', new UserInterface());

      window.asteroids.set('actorfactory', new ActorFactory());

      this.physics = window.asteroids.set('physics', new Physics({
        gravity: {x:0,y:0}
        , scale: 10
        // , debug: true
      }));

      this.stage = window.asteroids.set('stage', new Stage());

      this.events.on('game:setup',this.initVAPI,this);
      this.events.on('game:start',this.start,this);
      this.events.on('game:initVAPIComplete',this.initVAPIComplete,this);
      this.events.on('game:veroldAppStartupComplete',this.veroldAppStartupComplete,this);

      this.events.on('game:collision:asteroid-projectile',this.collsionAsteroidProjectile,this);

    },

    setup : function() {
      this.events.trigger('game:setup');
    },

    initVAPIComplete : function() {

      this.asteroidsApp.startup();
    
    },

    veroldAppStartupComplete : function() {

      this.events.trigger('game:start');
    
    },

    start : function(){

      var that = this;

      this.setContactListeners();

      this.explosionController = new ExplosionController();

      this.asteroidController = new AsteroidController();

      var max = 5;
      var count = 0;
      var interval = setInterval($.proxy(function() {
        count++;
        if(count > max) {
          clearInterval(interval);
          return;
        }
        this.asteroidController.sendInAsteroid();
      },this),5000);

      // this.addShip();

      // adding projectiles
      // _.times(4,function() { that.addProjectile(); });

      this.stage.startAnimation();

    },

    setContactListeners : function() {

      this.physics.setContactListeners({
        BeginContact : function(contact) {
          var a = contact.GetFixtureA().GetBody().GetUserData(),
              b = contact.GetFixtureB().GetBody().GetUserData();
              
          a.collision(b);
          b.collision(a);
        }
      });
    },

    initVAPI : function() {

      var that = this;
    
      VAPI.onReady(function(){

        that.veroldApp = window.asteroids.set('veroldApp',new VeroldApp);
        that.asteroidsApp = window.asteroids.set('asteroidsApp',new AsteroidsApp(that.veroldApp));

        that.veroldApp.initialize({
          container: null,
          projectId: '514219ce0b4e5d0200000344',
          enablePostProcess: false,
          enablePicking: false,
          handleInput: false,
          clearColor: 0xff0000,
          success: function() {
            that.events.trigger('game:initVAPIComplete');
          }
        });

      });
    },

    addProjectile : function() {
      var that = this;
      this.asteroidsApp.cloneObjectFromTemplate('projectile',function(model) {
        that.stage.createActor({
          actorType: 'projectile',
          position: new Box2D.Common.Math.b2Vec2(0,0),
          angle: 0,
          radius: 0.5,
          active: false,
          model: model
        });
      });
    },

    addShip : function() {
      var that = this;
      this.asteroidsApp.cloneObjectFromTemplate('ship',function(model) {
        that.stage.createActor({
          actorType: 'ship',
          position: new Box2D.Common.Math.b2Vec2(0,0),
          angle: 0,
          radius: 5,
          model: model,
          modelScale: 5
        });
      });
    },

    collsionAsteroidProjectile : function(position) {
      this.explosionController.explode({position:position});
    }

  });

  return GameController;

});
