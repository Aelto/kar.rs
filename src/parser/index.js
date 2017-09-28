const tokenizer = require("./tokenizer.js")
const { Token, Construct, Option, Result, Either, Not } = require("./grammar")

module.exports = input => {
  const variableDeclBase = [
    new Token("identifier"),
    new Option(
      "type-declaration",
      new Construct("type-decl-construct", [
        new Token("colon"),
        new Token("identifier")
      ])
    ),
    new Token("equal"),
    new Either("number-or-string", [new Token("number"), new Token("string")])
  ]

  const con = new Construct("variable", [
    new Token("let"),
    ...variableDeclBase,
    new Option(
      "multiple-variable-declaration",
      new Construct("multiple-variable-declaration-construct", [
        new Token("comma"),
        ...variableDeclBase
      ])
    ).repeatOneOrMore(),
    new Token("semicolon")
  ])

  test(
    `
  let a: int = 10;
  `,
    con
  )

  test(
    `
  let b = 10,
      c = 15,
      d = 20;
     `,
    con
  )

  test(
    `
  let b = "Hello";
  `,
    con
  )

  // try {
  //   const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

  //   tokens.forEach(t => console.log(t))

  //   console.log("\nparsing\n")

  //   const results = []
  //   con.parse(tokens.slice(3, 9), 0, results)
  //   results.forEach(e => e.print())

  //   const resultsTwo = []
  //   con.parse(tokens.slice(10, 25), 0, resultsTwo)
  //   resultsTwo.forEach(e => e.print())
  // } catch (e) {
  //   throw e
  // }
}

function test(str, construct) {
  try {
    const tokens = tokenizer(str).map(t => new Token(t.type, t.value, t.pos))

    tokens.forEach(t => console.log(t))

    const results = []
    construct.parse(tokens, 0, results)
    results.forEach(e => e.print())
    console.log("")
  } catch (err) {
    throw err
  }
}
