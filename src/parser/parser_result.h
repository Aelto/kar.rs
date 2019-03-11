#pragma once

#include <vector>

#include "../tokenizer/token.h"
#include "parser_node.h"

namespace parser {
  struct ParserResult {
    int pos;

    std::vector<ParserResult> children;

    Token * token;

    bool is_container;

    GrammarType grammar_type = G_None;

    ParserResult()
      : pos(0), children(), is_container(true) {};

    ParserResult(int pos, Token * token)
      : pos(pos), token(token), is_container(false) {};

    ParserResult(int pos, GrammarType grammar_type)
      : pos(pos), children(), is_container(true), grammar_type(grammar_type) {};
  };
  
  ParserResult new_container(int pos, GrammarType grammar_type) {
    return ParserResult(pos, grammar_type);
  };

  ParserResult new_token(int pos, Token * token) {
    return ParserResult(pos, token);
  };

  int add_results(ParserResult & result, std::vector<ParserResult> & result_list) {
    if (!result.is_container || result_list.empty()) {
      return result.pos;
    }
    else {
      result.children.insert(result.children.end(), result_list.begin(), result_list.end());
      result.pos = result_list.back().pos;

      return result.pos;
    }
  }
}

