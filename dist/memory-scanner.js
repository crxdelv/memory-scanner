class memoryscanner {
  version = 1
  memory = []
  blocked = []
  rules = {}
  should_override = true
  should_block = true
  _backup = []
  push(addr, val) {
    if(this.blocked.includes(addr)) return false
    this.memory.push({
      addr,
      bef: val,
      aft: val
    })
    if(!this._backup.includes(addr)) this._backup.push(addr)
    return true
  }
  patch(addr, val) {
    if(this.blocked.includes(addr)) return false
    for(var i = 0; i < this.memory.length; i++) {
      var m = this.memory[i]
      if(m.addr == addr) {
        m.bef = m.aft
        m.aft = val
        return true
      }
    }
    return false
  }
  filter_changed() {
    var f = this.memory.filter(i => {
      return i.bef != i.aft
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_unchanged() {
    var f = this.memory.filter(i => {
      return i.bef == i.aft
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_inc(n) {
    var f = this.memory.filter(i => {
      if(n != null) return i.bef + n == i.aft
      else return i.bef < i.aft
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_dec(n) {
    var f = this.memory.filter(i => {
      if(n != null) return i.bef - n == i.aft
      else return i.bef > i.aft
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_neg() {
    var f = this.memory.filter(i => {
      return i.aft < 0
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_pos() {
    var f = this.memory.filter(i => {
      return i.aft >= 0
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_int() {
    var f = this.memory.filter(i => {
      return Math.floor(i.aft) - i.aft == 0
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_float() {
    var f = this.memory.filter(i => {
      return Math.floor(i.aft) - i.aft != 0
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_byte(b) {
    var f = this.memory.filter(i => {
      return Math.pow(256, b) - 1 > i.aft
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_eq(v) {
    var f = this.memory.filter(i => {
      return i.aft == v
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_init = this.filter_eq
  filter_noteq(v) {
    var f = this.memory.filter(i => {
      return i.aft != v
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  filter_rule(k) {
    var r = this.rules[k]
    if(r == null) return false
    var f = this.memory.filter(i => {
      return r(i.bef, i.aft) == true
    })
    if(this.should_override) this.memory = f
    if(this.should_block) this.block_filtered()
    return f
  }
  block_filtered() {
    var x = []
    var m = this.memory.map(i => {
      return i.addr
    })
    this._backup.forEach(i => {
      if(!m.includes(i)) x.push(i)
    })
    this.blocked = x
    this._backup = m
  }
}
