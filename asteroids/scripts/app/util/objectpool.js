/*global define:true, my:true */

define(['myclass'],
function(my) {

  var ObjectPool = my.Class({

    constructor : function(objConstructor) {
      if(!(this instanceof ObjectPool)) {
        return new ObjectPool(objConstructor);
      }

      this.allocated = [];
      this.pool = [];

      this.objConstructor = objConstructor;

    },

    alloc : function() {

      var instance,
          first = (!!this.pool.length) ? false : true,
          args = Array.prototype.slice.call(arguments,0).concat([first]);

      if(first) {
        instance = new this.objConstructor();
        this.allocated.push(instance);
      } else {
        instance = this.pool.pop();
      }

      instance.initialize.apply(instance,args);

      return instance;
      
    },

    free : function(instance) {
      var i = 0,
          l = this.pool.length,
          needle;

      for(i=0;i<l;i+=1) {
        if(this.pool[i] === instance) { needle = instance; }
      }

      if(!needle) {
        this.pool.push(instance);
      }
    },

    freeAll : function() {
      var i = 0, l = this.allocated.length;
      for(i=0;i<l;i+=1) {
        this.free(this.allocated[i]);
      } 
    },

    collect : function() {
      // empty the pool
      this.pool = [];
    },

    numAllocated : function() {
      return this.allocated.length;
    },

    numFree : function() {
      return this.pool.length;
    },

    getMetrics : function() {
      return {
        free: this.numFree(),
        allocated: this.numAllocated()
      } 
    }

  });

  return ObjectPool;

});
