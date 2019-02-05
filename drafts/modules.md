# kar modules draft
## introduction
The draft talks about modules and how they should be imported and added to the global namespace in the kar language.

Imagine a module file exporting a function `sayHello`:
```rust
export fn sayHello() {
  // ignore the use of the non imported function println,
  println("Hello, world!");
}
```

Now imagine the entry point of a program where access to `sayHello()` is required:
```rust
fn main() -> int {
  sayHello();

  return 0;
}
```
How should the function be imported added and eventually added to the global namespace so that writing `module::sayHello()` is not required?

## solution 1
solution à-la rust, a single syntax is offered to import modules and add them to the global namespace.
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

## solution 2
More like the C++ way, provide a way to create custom namespaces.
Importing and adding elements to the global namespace are two separate things.


`mymod/sayHello.kar`
```rust
namespace myNamespace {
  export sayHello() {
    println("Hello, world!");
  }
};
```

`main.kar`
```rust
include std::io;
include mymod::sayHello.kar;

use std::{println};
use myNamespace::{sayHello};

fn main() -> int {
  sayHello();

  return 0;
}
```