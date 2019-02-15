#pragma once

#include "../debug.h"

#include <vector>
#include <unordered_map>
#include "../tokenizer/token.h"
#include "node.h"
#include "ast_node.h"

bool token_match(Token * token, ParserNode * parser_node) {
  return parser_node->match_token == token->type;
}

std::vector<MatchParsingResult> match_parser_node_old(std::vector<Token> & tokens, int tokens_i, ParserNode * parser_node) {
  LOG("-" << tokens_i);

  std::vector<MatchParsingResult> output;

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
                return MatchParsingResult { tokens_i, nullptr };
            }
            
            // move forward by 1 token
            ++tokens_i;
          }
          else {
            ParserNode * used_parser_node = parser_node;

            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              used_parser_node = &parser_node->or_list[or_index];

              auto result = match_parser_node(tokens, tokens_i, used_parser_node);

              if (result.tokens_i > tokens_i) {
                tokens_i = result.tokens_i;
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

            auto result = match_parser_node(tokens, tokens_i, referenced_parser_node);

            // same position as before, it means it did not match.
            if (result.tokens_i == tokens_i) {
              return MatchParsingResult { tokens_i, nullptr };
            }

            tokens_i = result.tokens_i;
          }
          else {

            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              ParserNode * used_parser_node = parser_node;
              used_parser_node = &parser_node->or_list[or_index];

              auto result = match_parser_node(tokens, tokens_i, used_parser_node);

              if (result.tokens_i > tokens_i) {
                tokens_i = result.tokens_i;
                or_index = -1;
              }
              else {
                ++or_index;
              }
            }
            else {
              auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

              auto result = match_parser_node(tokens, tokens_i, referenced_parser_node);

              // same position as before, it means it did not match.
              if (result.tokens_i == tokens_i) {
                // moving or_index forward means all ParserNodes before did not match
                ++or_index;
              }
              else {
                tokens_i = result.tokens_i;
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
          MatchParsingResult current_output {
            tokens_i,
            AstNode::new_container()
          };

          if (parser_node->or_list.empty()) {
            // the variable will be the new position returned if every child matched
            int final_tokens_i = tokens_i;

            for (auto & child_parser_node : parser_node->group_list) {
              auto result = match_parser_node(tokens, final_tokens_i, &child_parser_node);

              // did not match
              if (result.empty() || result.back().tokens_i == final_tokens_i) {
                // and the child was not optional, quick-return
                if (!child_parser_node.is_optional) {
                  return output;
                }

                // the child was optional, the match failing is not a big problem.
                // 'next child.
                continue;
              }

              // move position for the current container loop
              final_tokens_i = result.back().tokens_i;
            }

            for (int i = output.tokens_i; i < final_tokens_i; i++) {
              output.ast_node->children_nodes.push_back(AstNode::new_unique(&tokens[i], i));
            }
            
            // made it through all the children' matches.
            // save the progress and repeat if the ParserNode is repeatable.
            // in case of fail the value returned will be the value set to tokens_i here
            output.tokens_i = final_tokens_i;
          }
          else {
            if (or_index >= 0 && or_index < parser_node->or_list.size()) {
              ParserNode * used_parser_node = &parser_node->or_list[or_index];

              auto result = match_parser_node(tokens, tokens_i, used_parser_node);

              if (result.tokens_i > tokens_i) {
                tokens_i = result.tokens_i;
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
                auto result = match_parser_node(tokens, final_tokens_i, &child_parser_node);

                // did not match
                if (result.tokens_i == final_tokens_i) {
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
                final_tokens_i = result.tokens_i;
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
  return MatchParsingResult { tokens_i, nullptr };
}

/**
 * everytime the parser meets a ParserNode of type container,
 * it creates a new ParserStateFrame which stores where the parsing process currently is
 * before going deeper into the grammar hierarchy. If the deeply nested matching process
 * fails it has then the possibility to go back to where it was.
 * ParserStateFrames can be seen as nodes of a linked-list, all ParserStateFrame eventually
 * lead to a root ParserStateFrame.
 **/
struct ParserStateFrame {
  ParserStateFrame * parent;

  size_t pos;

  AstNode result;

  /**
   * this bool is set to true when the parser found a match,
   * so whenever the parser needs to go back to the last successful match,
   * it can climb back the ParserStateFrames until the success bool is equal to true
   **/
  bool success;

  ParserStateFrame(ParserStateFrame * parent, size_t pos)
    : parent(parent), pos(pos), result(AstNode::new_container()) {};
};

void parser(std::vector<Token> & tokens) {
  std::unordered_map<GrammarType, ParserNode> grammar_store;

  #pragma region grammar_definition
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
  #pragma endregion

  size_t tokens_i = 0;

  auto * root_state_frame = new ParserStateFrame(nullptr, tokens_i);
  auto * current_frame = root_state_frame;

  while (tokens_i < tokens.size()) {
    auto * parser_node = &grammar_store[G_program];
 
    switch (parser_node->type)
    {
      case match:
        {
          auto * token = &tokens[current_frame->pos];
          size_t or_index = -1;

          do {
            // an empty `or_list` means the parser will not try
            // to match the current token with the current ParserNode
            if (parser_node->or_list.empty()) {

            }
          } while (
            parser_node->is_repeatable
            || !parser_node->or_list.empty()
            && or_index < parser_node->or_list.size()
          );
        }
        break;

      case reference:

        break;

      case container:

        break;
    }
  }
}