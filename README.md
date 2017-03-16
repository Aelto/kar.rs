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
import log

log('Hello World!')
```

## functions
```js
function add(a: int, b: int) int {
  return a + b
}
```

## variables
```js
// immutable variables
const a: int = 15

// mutable variables
let b: int = 15
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
  static function from(x: int, y: int) myVector2 {
    return myVector2 { x: x, y: y }
  }
  
  function translate(x: int, y: int) {
    this.x += x
    this.y += y
  }
}

const customVector2: myVector2 = myVector2::from(0, 0)
customVector2.translate(15, 15)
```

## Loops

### for loop
```js
import log

for (i: int in 0..15) {
  log(i)
}

for (i: int in 15..0)
  log(i)

```

### while loop
```js
import log

let i: int = 15
while (i >= 0) {
  log(i--)
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
const choice: bool = false
const value: int = choice
  ? 1
  : 0
  
// can be written
const valueTwo: int = choice ? 1 : 0
```

## Strings
```
const word: string = "Hello"
const phrase: string = word + " World!"

let changingPhrase: string = "What am i?"
changingPhrase += "You're not the same anymore"

log(word) // > "Hello"
log(phrase) // > "Hello World!"
log(changingPhrase) // > "What am i? You're not the same anymore"
```

## Lists
### fixed length
```js
const words: [2]string = ["Hello", "World!"
```

### dynamic size
```js
const words: [_]string = []
words.push("Hello")
  .push("World!")
  .push("Foo")
```

## Dictionnary (string to any type)
```rust
const letterToNumber: <int>{
 "a": 1,
 "b": 2,
 "c": 3,
 "d": 4,
}

letterToNumber.e = 5

const letter: string = "f"
letterToNumber[f] = 6

log(letterToNumber.a) // > 1
log(letterToNumber.z) // > null
```

## modules
declare what you want to be exported with the `export` keyword

### single function module
```js
export default function add(a: int, b: int) int {
  return a + b
}
```

### multiple functions module
```js

export function add(a: int, b: int) int {
  return a + b
}

export function mul(a: int, b: int) int {
  return a * b
}

```
