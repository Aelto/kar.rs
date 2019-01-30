#pragma once

#include "../debug.h"

#include "../tokenizer/token.h"
#include "node.h"
#include <vector>
#include <unordered_map>

/**
 * a list of all grammar types
 **/
enum GrammarType {
  /**
   * default type pointing to no ParserNode
   **/
  G_None,

  G_program,
  G_moduleImport
};

/**
 * a ParserNode can act as 3 different things:
 *  - a match token with a TokenType (the simplest form for a ParserNode)
 *  - a reference to another ParserNode using a custom identifier
 *  - a container of the 3 types (match, ref, container)
 **/
enum ParserNodeType {
  match,
  reference,
  container,
  none
};

/**
 * a ParserNode has 3 types, as stated above.
 * there are also a few options to change how the parser works with the ParserNode:
 *  - optional: when set to true the parser does not stop the parsing process
 *    for the container holding the current ParserNode 
 *    when the matching fails for the current ParserNode.
 *  - repeat: as long as the current ParserNode matches with the tokens met
 *    during the parsing process, the parser will continue using the current
 *    ParserNode until matching failure.
 *  - case/or: the ParserNode accepts a list of other ParserNode.
 *    if the matching fails for the current ParserNode, the parser will try with
 *    the elements of that list (in the same order as they were inserted) until a match succeed
 **/
struct ParserNode {
  ParserNodeType type = none;

  /**
   * type of the matching token
   * note: only used if `ParserNodeType == match`
   **/
  TokenType match_token;

  /**
   * pointer to a map which stores a list of ParserNodes
   * keyed by custom names so a ParserNode can just be a
   * reference to an already declared complex ParserNode tree
   * note: only used if `ParserNodeType == reference`
   **/
  std::unordered_map<GrammarType, ParserNode> * store;

  /**
   * note: only used if `ParserNodeType == container`
   **/
  std::vector<ParserNode> group_list;

  /**
   * when set to true the parser does not stop the parsing process
   * for the container holding the current ParserNode 
   * when the matching fails for the current ParserNode.
   **/
  bool is_optional = false;

  /**
   * as long as the current ParserNode matches with the tokens met
   * during the parsing process, the parser will continue using the current
   * ParserNode until matching failure.
   **/
  bool is_repeatable = false;

  /**
   * the ParserNode accepts a list of other ParserNode.
   * if the matching fails for the current ParserNode, the parser will try with
   * the elements of that list (in the same order as they were inserted) until a match succeed
   **/
  std::vector<ParserNode> or_list;

  /**
   * if set to something else than GrammarType::None, the parser will use
   * the ParserNode linked to the GrammarType stored in this->store
   **/
  GrammarType ref_to = GrammarType::G_None;

  /**
   * when called, sets the current ParserNode as optional
   **/
  ParserNode & optional() {
    is_optional = true;

    return *this;
  };

  /**
   * when called, sets the current ParserNode as repeatable
   **/
  ParserNode & repeat() {
    is_repeatable = true;

    return *this;
  };

  /**
   * when called, add a ParserNode the parser will use i
   **/
  ParserNode & or(ParserNode & parsernode) {
    this->or_list.push_back(parsernode);

    return *this;
  };

  ParserNode & match(TokenType token) {
    this->match_token = token;

    return *this;
  }

  ParserNode & group(std::vector<ParserNode> & group) {
    this->group_list = group;

    return *this;
  };

  ParserNode & ref(GrammarType grammar_type) {
    this->ref_to = grammar_type;

    return *this;
  };

  ParserNode(ParserNodeType type = none, std::unordered_map<GrammarType, ParserNode> * store = nullptr)
    : type(type), store(store) {};
};

ParserNode token(TokenType type) {
  return ParserNode(ParserNodeType::match, nullptr).match(type);
}

bool token_match(Token * token, ParserNode * parser_node) {
  return parser_node->match_token == token->type;
}

int match_parser_node(std::vector<Token> & tokens, int tokens_i, ParserNode * parser_node) {
  
  switch (parser_node->type)
  {
    case match:
      {
        auto * token = &tokens[tokens_i];

        do {
          bool do_match = token_match(token, parser_node);

          // token did not match
          if (!do_match) {
            // return unchanged position
            return tokens_i;
          }

          // move forward by 1 token
          ++tokens_i;
        } while (parser_node->is_repeatable);
      }
      break;

    case reference:
      {
        auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

        do {
          int new_tokens_i = match_parser_node(tokens, tokens_i, referenced_parser_node);

          // same position as before, it means it did not match.
          if (new_tokens_i == tokens_i) {
            return tokens_i;
          }

          tokens_i = new_tokens_i;
        } while (parser_node->is_repeatable);
      }
      break;

    case container:
      do {
        // the variable will be the new position returned if every child matched
        int final_tokens_i = tokens_i;
        for (auto & child_parser_node : parser_node->group_list) {
          int new_tokens_i = match_parser_node(tokens, final_tokens_i, &child_parser_node);

          // did not match
          if (new_tokens_i == final_tokens_i) {
            // and the child was not optional, quick-return
            if (!child_parser_node.is_optional) {
              return tokens_i;
            }

            // the child was optional, the match failing is not a big problem.
            // 'next child.
            continue;
          }

          // move position for the current container loop
          final_tokens_i = new_tokens_i;
        }

        // made it through all the children' matches.
        // save the progress and repeat is the ParserNode is repeatable.
        // in case of fail the value returned will be the value set to tokens_i here
        tokens_i = final_tokens_i;
      } while (parser_node->is_repeatable);
      break;
  }

  // returning the same position as before means there was no match at all
  return tokens_i;
}

void parser(std::vector<Token> & tokens) {
  std::unordered_map<GrammarType, ParserNode> grammar_store;

  grammar_store[G_program] = ParserNode(reference, &grammar_store)
    .or(ParserNode(reference, &grammar_store).ref(G_moduleImport));

  grammar_store[G_moduleImport] = ParserNode(container, &grammar_store)
    .group(std::vector<ParserNode> {
      token(Module),
      token(Identifier)
    });

  auto * current_parser_node = &grammar_store[G_moduleImport];
  int tokens_i = 0;

  while (true) {
    int new_tokens_i = match_parser_node(tokens, tokens_i, current_parser_node);

    LOG(tokens_i);
    LOG(new_tokens_i);

    break;
  }
}