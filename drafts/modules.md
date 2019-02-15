# kar modules draft

## example
a rust-like syntax, a single syntax is offered to import modules and add them to the global namespace.
this syntax forces a naming convention for the files, namespaces represent filesystem hierarchy. Each new folder is a new namespace, folders can also be nested which will result in nested namespaces.

`mymod/mod.kar`
```rust
export fn sayHello() {
  // ignore the use of the non imported function println,
  println("Hello, world!");
}
```

`main.kar`
```rust
// import from the standard library
use std::{println};

// import from a user exported module file in `/mymod/mod.kar`
use mymod::{sayHello};

fn main() -> int {
  sayHello();
  
  return 0;
}
```