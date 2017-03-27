# kar.rs
The compiler for the **kar** programming language

# the kar programming language
> a first look at what **kar** should look like once it's done

## files
 - **extension:** the compiler looks for `*.kar` files
 - **entry point:** the default entry point of a program is the `main.kar` file
 
## main program
There is no `main` function to your program, the whole file is treated as the "main function".

A simple hello world looks like:
```js
import log;

log('Hello World!');
```

## variables
declare immutable variables with `const`
```js
const a: int = 15;

a = 10; // Error
```

declare mutable variables with `let`
```js
let b: int = 15;

b = 10; // it works
```

## functions
a function without parameters nor return type
```js
import log;

fn sayHello() {
 log('Hello!');
}
```

a function with parameters
```js
import log;

fn printSum(a: int, b: int) {
  log(a + b);
}
```

a function with a return type
```js
fn add(a: int, b: int) -> int {
  return a + b;
}
```

## struct
```js
struct myVector2 {
  x: int,
  y: int,
}

const customVector2: myVector2 {
  x: 15,
  y: 15,
}
```

## Methods
```rust
struct myVector2 {
  x: int,
  y: int,
}

impl myVector2 {
  static fn from(x: int, y: int) -> myVector2 {
    return myVector2 { x: x, y: y };
  }
  
  fn translate(x: int, y: int) => {
    this.x += x;
    this.y += y;
  }
}

const customVector2: myVector2 = myVector2::from(0, 0)
customVector2.translate(15, 15)
```

## Loops

### for loop
```js
import log;

for (let i: int = 0; i < 10; i += 1) {
  log(i);
}

for (let i: int in 15..0; i -= 1)
  log(i);

```

### while loop
```js
import log

let i: int = 15
while (i >= 0) {
  log(i--);
}

```

## If
### standard
```js
const choice: bool = false
if (choice) {

} else if (false) {

} else {

}

```

### ternary operator
```js
const choice: bool = false;
const value: int = choice
  ? 1
  : 0;
  
// can be written
const valueTwo: int = choice ? 1 : 0;
```

## Strings
```js
const word: string = "Hello";
const phrase: string = word + " World!";

let changingPhrase: string = "What am i?";
changingPhrase += "You're not the same anymore";

log(word); // > "Hello"
log(phrase); // > "Hello World!"
log(changingPhrase); // > "What am i? You're not the same anymore"
```

## Lists
### fixed length
```js
const words: [2]string = ["Hello", "World!"];
```

### dynamic size
```js
const words: []string = [];
words.push("Hello")
  .push("World!")
  .push("Foo");
```

## Dictionnary (string to any type)
```rust
const letterToNumber: <int>{
 "a": 1,
 "b": 2,
 "c": 3,
 "d": 4,
};

letterToNumber.e = 5;

const letter: string = "f";
letterToNumber[f] = 6;

log(letterToNumber.a); // > 1
log(letterToNumber.z); // > null
```

## modules
declare what you want to be exported with the `export` keyword

### single function module
```js
export fn add(a: int, b: int) -> int {
  return a + b;
}
```

### multiple functions module
```js

export myModule {
  fn add(a: int, b: int) -> int {
    return a + b;
  }
  
  fn mul(a: int, b: int) -> int {
    return a * b;
  }
}
```
