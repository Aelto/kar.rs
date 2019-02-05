# kar.rs
The compiler for the **kar** programming language

# the kar programming language
> a first look at what **kar** should look like once it's done

## files
 - **extension:** the compiler looks for `*.kar` files
 - **entry point:** the default entry point of a program is the `main.kar` file

## variables
declare immutable variables with `const`
```rust
let a: int = 6;
a = 10; // Error
```

declare mutable variables with `let`
```rust
mut a: int = 15;
a = 10; // it works
```

## functions
a function without parameters nor return type
```rust
use std::{println};

fn sayHello() {
 println("hello");
}
```

a function with parameters
```rust
use std::{println};

fn printSum(a: int, b: int) {
  println(a + b);
}
```

a function with a return type
```rust
fn add(a: int, b: int) -> int {
  return a + b;
}
```

## struct
```rust
struct myVector2 {
  x: int,
  y: int,
};

let customVector2 = myVector2 {
  x: 15,
  y: 15,
};
```

## Methods
```rust
struct myVector2 {
  x: int,
  y: int,
};

impl myVector2 {
  static fn new(x: int, y: int) -> myVector2 {
    return myVector2 { x: x, y: y };
  }
  
  fn translate(x: int, y: int) {
    this.x += x;
    this.y += y;
  }
};

let customVector2 = myVector2::new(0, 0);
customVector2.translate(15, 15);
```

## Loops

### for loop
```rust
use std::{println};

for (mut i = 0; i < 10; ++i) {
  println(i);
}
```

### while loop
```rust
use std::{println};

mut i = 15;
while (i >= 0) {
  println(i--);
}

mut j = 15;
do {
 println(j--);
} while (j > 0);
```

## If
### standard
```rust
let choice = false;
if (choice) {

} else if (!choice) {

} else {

}
```

### ternary operator
```rust
let choice = false;
const value = choice
  ? 1
  : 0;
  
// can be written
let valueTwo = choice ? 1 : 0;
```

## Strings
```rust
use std::{println};

let word: string = "Hello";
let phrase = word + " World!";

let changingPhrase = "Hello";
changingPhrase += " World!";

println(word); // > "Hello"
println(phrase); // > "Hello World!"
println(changingPhrase); // > "Hello World!"
```

## Lists
### fixed length
```rust
let words: string[2] = ["Hello", "World!"];
```

### dynamic size
```rust
mut words: vec<string> = [];

words.push("Hello");
words.push("World!");
words.push("Foo");
```

## Map (key/value pair)
```rust
let letterToNumber: map<char, int> {
 'a': 1,
 'b': 2,
 'c': 3,
 'd': 4,
};

letterToNumber.['e'] = 5;
```

## modules
a draft is in progress on this subject at [draft/modules.md](/drafts/modules.md)
