#pragma once

#include "debug.h"
#include "token.h"

std::vector<Token> tokenizer(std::ifstream & file) {
  auto tokens = std::vector<Token>();
  unsigned int global_pos = 0;
  unsigned int pos_y = 0;
  auto line = std::string();

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

        case '<':
          if (line.find("<<", pos) == pos) {
            tokens.emplace_back(TokenType::DoubleLeftCaret, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (line.find("<=", pos) == pos) {
            tokens.emplace_back(TokenType::LeftCaretEqual, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else {
            tokens.emplace_back(TokenType::LeftCaret, global_pos);

            pos += 1;
            global_pos += 1;
          }
          break;

        case '>':
          if (line.find(">>", pos) == pos) {
            tokens.emplace_back(TokenType::DoubleRightCaret, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (line.find(">=", pos) == pos) {
            tokens.emplace_back(TokenType::RightCaretEqual, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else {
            tokens.emplace_back(TokenType::RightCaret, global_pos);

            pos += 1;
            global_pos += 1;
          }
          break;

        case '+':
          if (line.find("++") == pos) {
            tokens.emplace_back(TokenType::DoublePlus, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (line.find("+=") == pos) {
            tokens.emplace_back(TokenType::PlusEqual, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else {
            tokens.emplace_back(TokenType::Plus, global_pos);

            pos += 1;
            global_pos += 1;
          }
          break;

        case ':':
            if (line.find("::") == pos) {
              tokens.emplace_back(TokenType::DoubleColon, global_pos);

              pos += 2;
              global_pos += 2;
            }
            else {
              tokens.emplace_back(TokenType::Colon, global_pos);

              pos += 1;
              global_pos += 1;
            }
          break;
        
        case ',':
          tokens.emplace_back(TokenType::Comma, global_pos);

          pos += 1;
          global_pos += 1;
          break;

        case '"':
          {
            auto * str = new std::string();
            unsigned int i = 1;

            do {
              auto cc = line[pos + i];
              i += 1;

              if (cc == '"') {
                break;
              }

              str->push_back(cc);
            } while (pos + i < line.length());

            if (pos + i >= line.length()) {
              std::cout << "unterminated string at " << pos_y << ":" << pos << '\n'; 
            }
            else {
              tokens.emplace_back(TokenType::String, global_pos, str);
            }

            pos += i;
            global_pos += i;
          }
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
          else if (c == 'f' && line.find("fn ", pos) == pos) {
            tokens.emplace_back(TokenType::Function, global_pos);

            pos += 2;
            global_pos += 2;
          }
          else if (c == 'l' && line.find("let ", pos) == pos) {
            tokens.emplace_back(TokenType::Let, global_pos);

            pos += 3;
            global_pos += 3;
          }
          else if (c == 'm' && line.find("module ", pos) == pos) {
            tokens.emplace_back(TokenType::Module, global_pos);

            pos += 6;
            global_pos += 6;
          }
          else if (c == 'u' && line.find("use ", pos) == pos) {
            tokens.emplace_back(TokenType::Use, global_pos);

            pos += 4;
            global_pos += 4;
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

  return tokens;
}