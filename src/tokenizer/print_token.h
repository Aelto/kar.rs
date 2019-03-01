#pragma once

#include "token.h"

void print_token(TokenType type) {
  switch (type)
  {
    case TokenType::LeftParen:
      LOG("left-paren");
      break;

    case TokenType::RightParen:
      LOG("right-paren");
      break;

    case TokenType::Minus:
      LOG("minus");
      break;
    
    case TokenType::DoubleMinus:
      LOG("double-minus");
      break;
    
    case TokenType::MinusEqual:
      LOG("minus-equal");
      break;

    case TokenType::RightArrow:
      LOG("right-arrow");
      break;

    case TokenType::LeftBrace:
      LOG("left-brace");
      break;

    case TokenType::RightBrace:
      LOG("right-brace");
      break;

    case TokenType::Semicolon:
      LOG("semicolon");
      break;

    case TokenType::DoubleEqual:
      LOG("double-equal");
      break;

    case TokenType::Equal:
      LOG("equal");
      break;

    case TokenType::Number:
      LOG("number()");
      break;

    case TokenType::NumberFloat:
      LOG("number-float()");
      break;

    case TokenType::Function:
      LOG("fn");
      break;

    case TokenType::Let:
      LOG("let");
      break;

    case TokenType::Const:
      LOG("const");
      break;

    case TokenType::Identifier:
      LOG("ident()");
      break;

    case TokenType::String:
      LOG("string()");
      break;

    case TokenType::DoubleLeftCaret:
      LOG("double-left-caret");
      break;

    case TokenType::DoubleRightCaret:
      LOG("double-right-caret");
      break;

    case TokenType::Comma:
      LOG("comma");
      break;

    case TokenType::Colon:
      LOG("colon");
      break;
    
    case TokenType::DoubleColon:
      LOG("double-colon");
      break;

    case TokenType::Plus:
      LOG("plus");
      break;

    case TokenType::DoublePlus:
      LOG("double-plus");
      break;

    case TokenType::PlusEqual:
      LOG("plus-equal");
      break;

    case TokenType::Module:
      LOG("module");
      break;

    case TokenType::Use:
      LOG("use");
      break;

    case TokenType::Return:
      LOG("return");
      break;
  
    default:
      break;
  }
}