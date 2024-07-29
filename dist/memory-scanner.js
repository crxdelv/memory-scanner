/**
 * Hashwork v3.0.1
 * https://github.com/creuserr/memory-scanner
 *
 * Released under the CC0-1.0 license
 * https://github.com/creuserr/memory-scanner#license
 *
 * Date: 2024-07-29
 */

(function (global, factory) {
  if(typeof module === "object" && typeof module.exports === "object") {
    // For Node.js or CommonJS
    module.exports = factory();
  } else if(typeof define === "function" && define.amd) {
    // For AMD (Asynchronous Module Definition) like RequireJS
    define(factory);
  } else {
    // For browser global environment
    global.MemoryScanner = factory();
  }
}(typeof window !== "undefined" ? window : this, function() {

class MemoryScanner {
  version = "3.0.1";
  _backup = [];
  /**
   * The object list of addresses. Do not modify memory directly, use patch and push.
   * @type {Array.<Object>}
   * @default []
   */
  memory = [];
  /**
   * The list of blacklisted addresses.
   * @type {Array.<*>}
   * @default []
   */
  blocked = [];
  /**
   * The object where custom filters are located.
   * @type {Object<string, Function>}
   * @default {}
   */
  rules = {};
  /**
   * If true, any usage of filter will automatically override the memory.
   * @type {boolean}
   * @default true
   */
  should_override = true;
  /**
   * If true, any filtered out addressed will be added to the blacklist.
   * @type {boolean}
   * @default true
   */
  should_block = true;
  /**
   * Push an address to the memory.
   *
   * @function push
   * @param {*} addr - Address key.
   * @param {number} addr - Address value.
   * @returns {boolean} Returns true if successful.
   * @example
   * scanner.push(0xFF, 10);
   */
  push(addr, val) {
    if(this.blocked.includes(addr)) return false;
    this.memory.push({
      addr,
      bef: val,
      aft: val
    });
    if(!this._backup.includes(addr)) this._backup.push(addr);
    return true;
  }
  /**
   * Patch an address to the memory.
   *
   * @function patch
   * @param {*} addr - Address key.
   * @param {number} addr - Address value.
   * @returns {boolean} Returns true if successful.
   * @example
   * scanner.patch(0xFF, 5);
   */
  patch(addr, val) {
    if(this.blocked.includes(addr)) return false;
    for(var i = 0; i < this.memory.length; i++) {
      var m = this.memory[i];
      if(m.addr == addr) {
        m.bef = m.aft;
        m.aft = val;
        return true;
      }
    }
    return false;
  }
  /**
   * This filters out data that hasn't been patched/changed.
   *
   * @function filter_changed
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_changed() {
    var f = this.memory.filter(i => {
      return i.bef != i.aft;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that has been patched/changed.
   *
   * @function filter_unchanged
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_unchanged() {
    var f = this.memory.filter(i => {
      return i.bef == i.aft;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that doesn't increase its value.
   *
   * @function filter_inc
   * @param {number} by - When the parameter by is defined, it is determined by the formula b + by == a, where b is the previous value and a is the latest value.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_inc(n) {
    var f = this.memory.filter(i => {
      if(n != null) return i.bef + n == i.aft;
      return i.bef < i.aft;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that doesn't decreases its value.
   *
   * @function filter_dec
   * @param {number} by - When the parameter by is defined, it is determined by the formula b - by == a, where b is the previous value and a is the latest value.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_dec(n) {
    var f = this.memory.filter(i => {
      if(n != null) return i.bef - n == i.aft;
      return i.bef > i.aft;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that isn't a negative number.
   *
   * @function filter_neg
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_neg() {
    var f = this.memory.filter(i => {
      return i.aft < 0;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that isn't a positive number.
   *
   * @function filter_pos
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_pos() {
    var f = this.memory.filter(i => {
      return i.aft >= 0;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that isn't an integer.
   *
   * @function filter_int
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_int() {
    var f = this.memory.filter(i => {
      return Math.floor(i.aft) - i.aft == 0;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that isn't a float.
   *
   * @function filter_float
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_float() {
    var f = this.memory.filter(i => {
      return Math.floor(i.aft) - i.aft != 0;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that exceeds the value that a given byte size can carry.
   *
   * @function filter_byte
   * @param {number} byte - It is determined by the formula 256 ** byte < a, where a is the latest value.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_byte(b) {
    var f = this.memory.filter(i => {
      return Math.pow(256, b) - 1 > i.aft;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that does not match the given value.
   *
   * @function filter_eq
   * @param {number} value - The value to compare.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_eq(v) {
    var f = this.memory.filter(i => {
      return i.aft == v;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This filters out data that matches the given value.
   *
   * @function filter_ineq
   * @param {number} value - The value to compare.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_ineq(v) {
    var f = this.memory.filter(i => {
      return i.aft != v;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * This uses the custom filter from the rules array.
   *
   * @function filter_rule
   * @param {number} k - The name of the custom filter.
   * @param {Array.<*>} args - Additional arguments.
   * @returns {Array.<Object>} Returns the filtered memory.
   */
  filter_rule(k, args) {
    var r = this.rules[k];
    if(r == null) return false;
    var f = this.memory.filter(i => {
      return r(i.bef, i.aft, args) == true;
    });
    if(this.should_override) this.memory = f;
    if(this.should_block) this.block_filtered();
    return f;
  }
  /**
   * Add filtered out addresses to blacklist, which disallows them to push back again.
   *
   * @function block_filtered
   */
  block_filtered() {
    var x = [];
    var m = this.memory.map(i => {
      return i.addr;
    });
    this._backup.forEach(i => {
      if(!m.includes(i)) x.push(i);
    });
    this.blocked = x;
    this._backup = m;
  }
}

return MemoryScanner;

}));