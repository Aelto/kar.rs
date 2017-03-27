const tokenizer = require('./tokenizer.js');

module.exports = (input) => {
  try {

    const tokens = tokenizer(input);
    tokens.forEach(t => console.log(t));
  } catch (e) {

    throw e;
  }
  
}