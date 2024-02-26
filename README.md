# memory-scanner
A simple memory scanning library for javascript

```javascript
var scanner = new memoryscanner()
// ...

// filter out data that
// has increased by 10
scanner.filter_inc(10)

// filter out data that
// does not change
scanner.filter_unchanged()

// filter out data that
// is not an integer 
scanner.filter_int()

// print remaining addresses
console.log(scanner.memory)
```

# Installation

```html
<script src="https://crestatic.vercel.app/creuserr/memory-scanner/memory-scanner.js"></script>
```

# Documentation

## Properties

```javascript
{
  memory: Array<Object> [{
    addr: String,
    bef: Number,
    aft: Number
  }],
  version: Number,
  blocked: Array<Number>,
  rules: Object<Function>,
  should_override: Boolean(true),
  should_block: Boolean(true),
  _backup: Array<Number>
}
```

**CAUTION:** Do not modify the `memory` directly, please only use `push` or `patch` to prevent scanning error.

## Pushing an address

To add an address, you need to call `push`.

```javascript
scanner.push(address, value)
// returns boolean
```

If an error occurred (such as the address cannot be added due to being blocked), it will return false.

**REMINDER:** Do not add addresses that have already been added.

## Patching an address

To modify a value by address, you need to call `patch`.

```javascript
scanner.patch(address, value)
```

If an error occurred (such as the address cannot be found), it will return false.

## Overriding

If `should_override` is true, filtered memory will override the actual memory.

You can avoid this by using:
```javascript
scanner.should_override = false
```

## Blocking

If `should_block` is true, filtered out addresses are added to the blacklist (named `blocked`), which disallows them from being added (blocked on `push` and `patch`).

You can avoid this by using:
```javascript
scanner.should_block = false
```

## Built-in filters

### Initial value
```javascript
filter_init(value)
```

This filters out data that does not match the given initial value.

```javascript
scanner.push(0x1, 5)
scanner.push(0x2, 10)

// filters out address 0x2
// because its value is not 5
scanner.filter_init(5)
```

### Unchanged value
```javascript
filter_unchanged()
```

This filters out data that has been *patched*/changed.

```javascript
scanner.push(0x1, 5)
scanner.push(0x2, 5)
scanner.patch(0x2, 10)

// filters out address 0x2
// because it has been patched
scanner.filter_unchanged()
```

### Changed value
```javascript
filter_changed()
```

This filters out data that **hasn't** been *patched*/changed.

```javascript
scanner.push(0x1, 5)
scanner.push(0x2, 5)
scanner.patch(0x2, 10)

// filters out address 0x1
// because it hasn't been patched
scanner.filter_changed()
```

### Decreased value
```javascript
filter_dec(by?)
```

This filters out data that doesn't decrease its value.

When the parameter `by` is defined, it is determined by the formula `b - by == a`, where *b* is the previous value and *a* is the latest value.

```javascript
scanner.push(0x1, 5)
scanner.push(0x2, 10)
scanner.patch(0x2, 5)

// filters out address 0x1
// because it doesn't
// decrease by 5
scanner.filter_dec(5)
```

### Increased value
```javascript
filter_inc(by?)
```

This filters out data that doesn't increase its value.

When the parameter `by` is defined, it is determined by the formula `b - by == a`, where *b* is the previous value and *a* is the latest value.

```javascript
scanner.push(0x1, 5)
scanner.push(0x2, 10)
scanner.patch(0x2, 15)

// filters out address 0x1
// because it doesn't increase
scanner.filter_inc()
```

### Integer value
```javascript
filter_int()
```

This filters out data that isn't an integer.

```javascript
scanner.push(0x1, 5.9)
scanner.push(0x2, 10)

// filters out address 0x1
// because its value is not an integer
scanner.filter_int()
```

### Float value
```javascript
filter_float()
```

This filters out data that isn't a float.

```javascript
scanner.push(0x1, 5.9)
scanner.push(0x2, 10)

// filters out address 0x2
// because its value is not a float
scanner.filter_float()
```

### Negative value
```javascript
filter_neg()
```

This filters out data that isn't a negative number.

```javascript
scanner.push(0x1, -5)
scanner.push(0x2, 10)

// filters out address 0x2
// because its value is not negative
scanner.filter_neg()
```

### Positive value
```javascript
filter_pos()
```

This filters out data that isn't a positive number.

```javascript
scanner.push(0x1, -5)
scanner.push(0x2, 10)

// filters out address 0x1
// because its value is not positive
scanner.filter_pos()
```

### Value a byte can carry
```javascript
filter_byte(byte)
```

This filters out data that exceeds the value that a given byte size can carry.

It is determined by the formula `256 ** byte < a`, where *a* is the latest value.

```javascript
scanner.push(0x1, 10);
scanner.push(0x2, 300);

// filters out address 0x2
// because a 1-byte number cannot
// carry 300
scanner.filter_byte(1);
```

## Custom filter

To set up a custom filter, define it with the property `rules`.

```javascript
scanner.rules.even = (bef, aft) => {
  return aft % 2 == 0;
}
```

*__bef__ is the previous value, and __aft__ is the latest value.*

After setting it up, you can use it with `filter_rule(name)`.

```javascript
scanner.push(0x1, 2);
scanner.push(0x2, 3);

// filters out address 0x2
// because its value is not an even number
scanner.filter_rule("even");
```

## Manual blocking
If you want to manually block filtered addresses, you can call `block_filtered`.

This method will search for filtered out addresses and add them to the blacklist..
