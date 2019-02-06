#pragma once

#include "../debug.h"

#include "../tokenizer/token.h"
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
  G_moduleImport,
  G_addition,
  G_useStatement,
  G_function,
  G_commaSeparatedIdentifiers,
  G_commaSeparatedTypedIdentifiers,
  G_functionCall,
  G_immutableVariable,
  G_returnStatement
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
  LOG("-" << tokens_i);

  switch (parser_node->type)
  {
    case match:
      {
        auto * token = &tokens[tokens_i];
        int or_index = -1;

        do {
          if (parser_node->or_list.empty()) {
            bool do_match = token_match(token, parser_node);

            // token did not match
            if (!do_match) {
              // return unchanged position
                return tokens_i;
            }
            
            // move forward by 1 token
            ++tokens_i;
          }
          else {
            ParserNode * used_parser_node = parser_node;

            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              used_parser_node = &parser_node->or_list[or_index];

              int new_tokens_i = match_parser_node(tokens, tokens_i, used_parser_node);

              if (new_tokens_i > tokens_i) {
                tokens_i = new_tokens_i;
                or_index = -1;
              }
              else {
                ++or_index;
              }
            }
            else {
              bool do_match = token_match(token, parser_node);

              if (!do_match) {
                // return unchanged position
                  ++or_index;
              }
              else {
                // move forward by 1 token
                ++tokens_i;
              }
            }
          }
        } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());
      }
      break;

    case reference:
      {
        int or_index = -1;

        do {
          if (parser_node->or_list.empty()) {
            auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

            int new_tokens_i = match_parser_node(tokens, tokens_i, referenced_parser_node);

            // same position as before, it means it did not match.
            if (new_tokens_i == tokens_i) {
              return tokens_i;
            }

            tokens_i = new_tokens_i;
          }
          else {

            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              ParserNode * used_parser_node = parser_node;
              used_parser_node = &parser_node->or_list[or_index];

              int new_tokens_i = match_parser_node(tokens, tokens_i, used_parser_node);

              if (new_tokens_i > tokens_i) {
                tokens_i = new_tokens_i;
                or_index = -1;
              }
              else {
                ++or_index;
              }
            }
            else {
              auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

              int new_tokens_i = match_parser_node(tokens, tokens_i, referenced_parser_node);

              // same position as before, it means it did not match.
              if (new_tokens_i == tokens_i) {
                // moving or_index forward means all ParserNodes before did not match
                ++or_index;
              }
              else {
                tokens_i = new_tokens_i;
                or_index = -1;
              }
            }
          }

          if (or_index >= 0 && or_index > parser_node->or_list.size()) {
            break;
          }
        } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());
      }
      break;

    case container:
      {
        int or_index = -1;

        do {
          if (parser_node->or_list.empty()) {
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
          }
          else {
            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              ParserNode * used_parser_node = &parser_node->or_list[or_index];

              int new_tokens_i = match_parser_node(tokens, tokens_i, used_parser_node);

              if (new_tokens_i > tokens_i) {
                tokens_i = new_tokens_i;
                or_index = -1;
              }
              else {
                ++or_index;
              }
            }
            else {
              // it is almost the same logic as above when `or_list->empty()`
              // except when one of the children does not match we do not return
              // but move the or_index forward by one.
              bool success = true;
              int final_tokens_i = tokens_i;

              for (auto & child_parser_node : parser_node->group_list) {
                int new_tokens_i = match_parser_node(tokens, final_tokens_i, &child_parser_node);

                // did not match
                if (new_tokens_i == final_tokens_i) {
                  // and the child was not optional,
                  // tell there was a failure and move or_index forward
                  if (!child_parser_node.is_optional) {
                    ++or_index;
                    success = false;
                    break;
                  }

                  // the child was optional, the match failing is not a big problem.
                  // 'next child.
                  continue;
                }

                // move position for the current container loop
                final_tokens_i = new_tokens_i;
              }

              if (success) {
                tokens_i = final_tokens_i;
                or_index = -1;
              }
            }
          }
        } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());
      }
      break;
  }

  // returning the same position as before means there was no match at all
  return tokens_i;
}

void parser(std::vector<Token> & tokens) {
  std::unordered_map<GrammarType, ParserNode> grammar_store;

  #define CONTAINER(children) ParserNode(container, &grammar_store).group(std::vector<ParserNode> children)
  #define REFERENCE(ref_to) ParserNode(reference, &grammar_store).ref(ref_to)

  grammar_store[G_moduleImport] = CONTAINER(({
    token(Module),
    token(Identifier),
    token(Semicolon)
  }));

  grammar_store[G_addition] = CONTAINER(({
    token(Number)
        .or(token(NumberFloat))
        .or(token(Identifier)),
    token(Plus),
    REFERENCE(G_addition)
      .or(token(Number))
      .or(token(NumberFloat))
      .or(token(Identifier)),
  }));

  grammar_store[G_useStatement] = CONTAINER(({
    token(Use),
    CONTAINER(({
      token(Identifier),
      token(DoubleColon)
    })).repeat(),
    CONTAINER(({
      token(LeftBrace),
      token(Identifier),
      CONTAINER(({
        token(Comma),
        token(Identifier)
      })).repeat().optional(),
      token(RightBrace)
    }))
    .or(token(Identifier)),
    token(Semicolon)
  }));

  grammar_store[G_commaSeparatedIdentifiers] = CONTAINER(({
    REFERENCE(G_addition)
      .or(token(Number))
      .or(token(NumberFloat))
      .or(token(String))
      .or(token(Identifier)),
    CONTAINER(({
      token(Comma),
      REFERENCE(G_commaSeparatedIdentifiers)
    })).optional()
  }));

  grammar_store[G_commaSeparatedTypedIdentifiers] = CONTAINER(({
    token(Identifier)
      .or(token(Number))
      .or(token(NumberFloat)),
    token(Colon),
    token(Identifier),
    CONTAINER(({
      token(Comma),
      REFERENCE(G_commaSeparatedTypedIdentifiers)
    })).optional()
  }));

  grammar_store[G_function] = CONTAINER(({
    token(Function),
    token(Identifier),
    token(LeftParen),
    REFERENCE(G_commaSeparatedTypedIdentifiers)
      .optional(),
    token(RightParen),
    CONTAINER(({
      token(RightArrow),
      token(Identifier)
    })).optional(),
    token(LeftBrace),
    REFERENCE(G_program)
      .optional(),
    token(RightBrace)
  }));

  grammar_store[G_functionCall] = CONTAINER(({
    token(Identifier),
    token(LeftParen),
    REFERENCE(G_commaSeparatedIdentifiers)
      .optional(),
    token(RightParen)
  }));

  grammar_store[G_immutableVariable] = CONTAINER(({
    token(Let),
    token(Identifier),
    token(Equal),
    token(Number)
      .or(token(NumberFloat))
      .or(token(String))
      .or(REFERENCE(G_functionCall))
  }));

  grammar_store[G_returnStatement] = CONTAINER(({
    token(Return),
    token(Number)
      .or(token(NumberFloat))
      .or(token(String))
      .or(REFERENCE(G_functionCall)),
  }));
  

  grammar_store[G_program] = REFERENCE(G_moduleImport)
    .or(REFERENCE(G_addition))
    .or(REFERENCE(G_useStatement))
    .or(REFERENCE(G_function))
    .or(REFERENCE(G_functionCall))
    .or(REFERENCE(G_returnStatement))
    .or(REFERENCE(G_immutableVariable))
    .or(token(Semicolon))
    .repeat();

  auto * current_parser_node = &grammar_store[G_program];
  int tokens_i = 0;

  while (true) {
    int new_tokens_i = match_parser_node(tokens, tokens_i, current_parser_node);

    LOG("before: " << tokens_i << ", after: " << new_tokens_i << '\n');

    if (new_tokens_i == tokens_i) {
      break;
    }
    else {
      tokens_i = new_tokens_i;
    }
  }
}