#pragma once

#include <vector>

#include "../tokenizer/token.h"
#include "parser_node.h"

namespace parser {
  struct ParsingResult {
    int pos;

    std::vector<ParsingResult> children;

    Token * token;

    bool is_container;

    GrammarType grammar_type = G_None;

    ParsingResult()
      : pos(0), children(), is_container(true) {};

    ParsingResult(int pos, Token * token)
      : pos(pos), token(token), is_container(false) {};

    ParsingResult(int pos, GrammarType grammar_type)
      : pos(pos), children(), is_container(true), grammar_type(grammar_type) {};
  };
  
  ParsingResult new_container(int pos, GrammarType grammar_type) {
    return ParsingResult(pos, grammar_type);
  };

  ParsingResult new_token(int pos, Token * token) {
    return ParsingResult(pos, token);
  };

  int add_results(ParsingResult & result, std::vector<ParsingResult> & result_list) {
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

