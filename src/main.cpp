#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <ctype.h>

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
  RightCaret,
  RightCaretEqual,
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
  Import,
  Extern,
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

void print_token(Token & token) {
  switch (token.type)
  {
    case TokenType::LeftParen:
      std::cout << "left-paren"; 
      break;

    case TokenType::RightParen:
      std::cout << "right-paren"; 
      break;

    case TokenType::Minus:
      std::cout << "minus";
      break;
    
    case TokenType::DoubleMinus:
      std::cout << "double-minus";
      break;
    
    case TokenType::MinusEqual:
      std::cout << "minus-equal";
      break;

    case TokenType::RightArrow:
      std::cout << "right-arrow";
      break;

    case TokenType::LeftBrace:
      std::cout << "left-brace";
      break;

    case TokenType::RightBrace:
      std::cout << "right-brace";
      break;

    case TokenType::Semicolon:
      std::cout << "semicolon";
      break;

    case TokenType::DoubleEqual:
      std::cout << "double-equal";
      break;

    case TokenType::Equal:
      std::cout << "equal";
      break;

    case TokenType::Number:
      std::cout << "number(" << *token.value << ")";
      break;

    case TokenType::NumberFloat:
      std::cout << "number-float(" << *token.value << ")";
      break;

    case TokenType::Function:
      std::cout << "fn"; 
      break;

    case TokenType::Let:
      std::cout << "let"; 
      break;

    case TokenType::Const:
      std::cout << "const"; 
      break;

    case TokenType::Identifier:
      std::cout << "ident(" << *token.value << ")";
      break;
  
    default:
      break;
  }
}

int main(int argc, char * argv[]) {
  if (argc < 2) {
    std::cout << "usage: karc <entry-file>" << std::endl;

    return 0;
  }

  auto line = std::string();
  auto file = std::ifstream(argv[1]);

  if (!file.is_open()) {
    std::cout << "unable to open file " << argv[1] << std::endl;

    return 1;
  }

  auto tokens = std::vector<Token>();
  unsigned int global_pos = 0;
  unsigned int pos_y = 0;

  while (std::getline(file, line)) {
    unsigned int pos = 0;
    pos_y += 1;

    while (pos < line.length()) {
      auto c = line[pos];

      switch (c)
      {
        case '(':
          tokens.emplace_back(TokenType::LeftParen, global_pos);
          
          pos += 1;
          global_pos += 1;
          break;

        case ')':
          tokens.emplace_back(TokenType::RightParen, global_pos);

          pos += 1;
          global_pos += 1;
          break;

        case '-':
          if (line.find("->", pos) == pos) {
            tokens.emplace_back(TokenType::RightArrow, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (line.find("--", pos) == pos) {
            tokens.emplace_back(TokenType::DoubleMinus, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (line.find("-=", pos) == pos) {
            tokens.emplace_back(TokenType::MinusEqual, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else {
            tokens.emplace_back(TokenType::Minus, global_pos);

            pos += 1;
            global_pos += 1;
          }
          break;

        case '=':
          if (line.find("==", pos) == pos) {
            tokens.emplace_back(TokenType::DoubleAmpersand, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else {
            tokens.emplace_back(TokenType::Equal, global_pos);

            pos += 1;
            global_pos += 1;
          }
          break;

        case '{':
          tokens.emplace_back(TokenType::LeftBrace, global_pos);

          pos += 1;
          global_pos += 1;
          break;

        case '}':
          tokens.emplace_back(TokenType::RightBrace, global_pos);

          pos += 1;
          global_pos += 1;
          break;

        case ';':
          tokens.emplace_back(TokenType::Semicolon, global_pos);

          pos += 1;
          global_pos += 1;
          break;

        case ' ':
        case '\r':
          pos += 1;
          global_pos += 1;
          break;

        default:
          if (isdigit(c)) {
            auto * number = new std::string();
            auto is_float = false;
            auto in_error = false;
            unsigned int i = 0;

            do {
              auto cc = line[pos + i];

              if (cc == '.') {
                if (is_float) {
                  std::cout << "unexpected character . in decimal part of a number-float" << std::endl;
                  in_error = true;

                  i += 1;
                  break;
                }
                else {
                  number->push_back(cc);
                
                  is_float = true;
                  i += 1;
                  continue;
                }
              }

              if (!isdigit(cc)) {
                break;
              }

              number->push_back(cc);

              i += 1;
            } while (pos + i < line.length() && !in_error);

            if (!in_error) {
              if (is_float) {
                tokens.emplace_back(TokenType::NumberFloat, global_pos, number);
              }
              else {
                tokens.emplace_back(TokenType::Number, global_pos, number);
              }
            }
            
            pos += i;
            global_pos += i;
          }

          //#region keywords 
          else if (c == 'f' && line.find("fn", pos) == pos) {
            tokens.emplace_back(TokenType::Function, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (c == 'l' && line.find("let", pos) == pos) {
            tokens.emplace_back(TokenType::Let, global_pos);

            pos += 3;
            global_pos += 3;
          }
          //#endregion

          else if (isalpha(c)) {
            unsigned int i = 0;
            auto * ident = new std::string();

            while (pos + i < line.length()) {
              auto cc = line[pos + i];

              if (!isalnum(cc)) {
                break;
              }

              ident->push_back(cc);

              i += 1;
            }

            tokens.emplace_back(TokenType::Identifier, global_pos, ident);
            
            pos += i;
            global_pos += i;
          }

          else {
            std::cout << "unrecognized character at " << pos_y << ":" << pos << '\n';

            pos += 1;
            global_pos += 1;
          }

          break;
      }
    }
  }

  for (auto & token : tokens) {
    print_token(token);
    std::cout << '\n';

    if (token.value != nullptr) {
      delete token.value;
    }
  }

  file.close();

  return 0;
}