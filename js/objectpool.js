/**
 * @author Jonas Ransjö <ransjo@gmail.com>
 */

/**
 * Object pool using a stack
 * Prevent garbage collection through object reuse
 *
 * @class ObjectPool
 * @param {function} init function that is required to return a new properly initialized object
 * @param {function} clean optional function applied to object after it is returned to the pool
 * @param {number} capacity number of initally allocated objects
 * @param {number} growth the amount the pool grows by when empty
 *
 * @example 
 * var init = function () {return new Vec2(0, 0);};
 * var clean = function (v) {v.init(0, 0);};
 * var vectorPool = new ObjectPool(init, clean, 32, 32);
 * var u = vectorPool.allocate(), v = vectorPool.allocate();
 */
function ObjectPool(init, clean, capacity, growth) {
  this.init = init;
  this.clean = clean || null;

  this.capacity = capacity || 32;
  this.growth = growth;

  this.pool = [];
  this.pool.length = this.capacity;
  for (var i = 0; i < this.capacity; i++) {
    this.pool[i] = this.init();
  }
}

/**
 * Grow the pool by creating new objects
 * @param {number} growth the amount to grow the pool
 */
ObjectPool.prototype.growPool = function () {
  var growth = this.growth || this.capacity;
  var start = this.pool.length, end = start + growth;
  for (var i = start; i < end; i++)
    this.pool[i] = this.init();
  this.capacity += growth;
};

/**
 * Empty the pool, freeing all unused objects to the garbage collector
 * Sets capacity of the pool to the number of objects in use
 */
ObjectPool.prototype.emptyPool = function () {
  // decrease capacity by the number of objects that we drop
  // capacity is now the number of objects currently allocated
  this.capacity -= this.pool.length;
  this.pool = [];
};

/**
 * Allocate an object from the pool
 * If the pool is empty, it is grown by the pools growth-number
 * @returns the new object
 */
ObjectPool.prototype.allocate = function () {
  if (this.pool.length == 0) {
    this.growPool();
  }
  
  return this.pool.pop();
};

/**
 * Release an allocated object back into the pool
 * Make sure not to release an object that is still in use
 * @param object the allocated object
 */
ObjectPool.prototype.release = function (object) {
  if (this.clean)
    this.clean(object);
  this.pool.push(object);  
};

ObjectPool.prototype.free = ObjectPool.prototype.release;

/**
 * @returns {number} the number of currently allocated objects
 */
ObjectPool.prototype.numAllocated = function () {
  return this.capacity - this.pool.length;
};

/**
 * @returns {number} the number of available objects in the pool
 */
ObjectPool.prototype.numAvailable = function () {
  return this.pool.length;
};

ObjectPool.prototype.numFree = ObjectPool.prototype.numAvailable;
