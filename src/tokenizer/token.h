#pragma once

enum TokenType {
  LeftParen,
  RightParen,
  LeftBrace,
  RightBrace,
  Comma,
  Dot,
  Semicolon,
  Colon,
  DoubleColon,
  Ampersand,
  DoubleAmpersand,
  Pipe,
  DoublePipe,
  Plus,
  DoublePlus,
  PlusEqual,
  Minus,
  DoubleMinus,
  MinusEqual,
  Star,
  StarEqual,
  Slash,
  SlashEqual,
  Equal,
  DoubleEqual,
  LeftCaret,
  LeftCaretEqual,
  DoubleLeftCaret,
  RightCaret,
  RightCaretEqual,
  DoubleRightCaret,
  LeftArrow,
  RightArrow,
  String,
  Char,
  Number,
  NumberFloat,

  Identifier,

  // keywords
  Function,
  Class,
  If,
  Else,
  True,
  False,
  Null,
  Const,
  Let,
  For,
  Do,
  While,
  Return,
  Module,
  Use,
  And,
  Or
};

struct Token {
  TokenType type;
  unsigned int pos;
  std::string * value;

  Token(TokenType type, unsigned int pos, std::string * value = nullptr)
    : type(type), pos(pos), value(value) {};
};