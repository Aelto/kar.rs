#pragma once

#include "../debug.h"

#include <vector>
#include <unordered_map>
#include "../tokenizer/token.h"
#include "node.h"
#include "parsing_result.h"
#include "../result.h"
#include "../tokenizer/print_token.h"
#include <string>

using result::Result, result::Ok, result::Err;

namespace parser {
  using parser::result::ParsingResult;
  using std::vector;
  using std::string;

  bool token_match(Token * token, ParserNode * parser_node) {
    return parser_node->match_token == token->type;
  }

  Result<vector<ParsingResult>, size_t> match_parser_node(vector<Token> & tokens, size_t tokens_i, ParserNode * parser_node) {
    LOG("\n" << tokens_i << "|" << string(tokens_i, ' '));

    if (parser_node->type == match) {
      LOG("expected: ");
      print_token(parser_node->match_token);

      auto * token = &tokens[tokens_i];

      LOG("found: ");
      print_token(token->type);

      int or_index = -1;
      std::vector<ParsingResult> output;

      do {
        auto current_output = result::new_container(tokens_i);

        if (parser_node->or_list.empty()) {
          LOG(" no_or_list ");
          bool do_match = token_match(token, parser_node);

          // token did not match
          if (!do_match) {
            LOG(" no_match ");
            // return unchanged position
            return Err<vector<ParsingResult>>(tokens_i);
          }

          output.push_back(result::new_token(tokens_i + 1, token));
          
          // move forward by 1 token
          ++tokens_i;
        }
        else {
          LOG(" or_list ");
          ParserNode * used_parser_node = parser_node;

          if (or_index >= 0 && or_index < parser_node->or_list.size()) {
            used_parser_node = &parser_node->or_list[or_index];

            auto result = match_parser_node(tokens, tokens_i, used_parser_node);

            if (result.is_error) {
              ++or_index;
            }
            else {
              auto parsing_results = result.unwrap_or({});
              or_index = -1;
              tokens_i = result::add_results(current_output, parsing_results);

              output.push_back(current_output);
            }
          }
          else {
            LOG(" first_match ");
            bool do_match = token_match(token, parser_node);

            if (!do_match) {
              ++or_index;
            }
            else {
              LOG(" match ");
              output.push_back(result::new_token(tokens_i + 1, token));

              // move forward by 1 token
              ++tokens_i;
              
              if (!parser_node->is_repeatable) {
                LOG(" no_repeat_break ");
                break;
              }
            }
          }
        }
      } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());

      LOG("\n" << tokens_i << "|" << string(tokens_i, ' ') << output.size());

      return Ok<size_t>(output);
    }

    else if (parser_node->type == reference) {
      LOG("reference: " << parser_node->ref_to << " ");
      int or_index = -1;
      std::vector<ParsingResult> output;

      do {
        auto current_output = result::new_container(tokens_i);

        if (parser_node->or_list.empty()) {
          auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

          auto result = match_parser_node(tokens, tokens_i, referenced_parser_node);

          // same position as before, it means it did not match.
          if (result.is_error) {
            return Err<vector<ParsingResult>>(tokens_i);
          }

          auto parsing_result = result.unwrap_or({});
          tokens_i = result::add_results(current_output, parsing_result);
          output.push_back(current_output);
        }
        else {
          if (or_index >= 0 && or_index < parser_node->or_list.size()) {
            ParserNode * used_parser_node = parser_node;
            used_parser_node = &parser_node->or_list[or_index];

            auto result = match_parser_node(tokens, tokens_i, used_parser_node);

            // if (result.empty() || result.back().pos > tokens_i) {
            //   tokens_i = result.tokens_i;
            //   or_index = -1;
            // }
            // else {
            //   ++or_index;
            // }

            if (result.is_error) {
              ++or_index;
            }
            else {
              auto parsing_result = result.unwrap_or({});

              or_index = -1;
              tokens_i = result::add_results(current_output, parsing_result);

              output.push_back(current_output);
            }
          }
          else {
            auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

            auto result = match_parser_node(tokens, tokens_i, referenced_parser_node);

            if (result.is_error) {
              ++or_index;
            }
            else {
              auto parsing_result = result.unwrap_or({});
              or_index = -1;
              tokens_i = result::add_results(current_output, parsing_result);

              output.push_back(current_output);
            }
          }
        }

        if (or_index >= 0 && or_index > parser_node->or_list.size()) {
          break;
        }
      } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());

      LOG("\n" << tokens_i << "|" << string(tokens_i, ' ') << "output-size: " << output.size() << " reference");

      return Ok<size_t>(output);
    }

    else if (parser_node->type == container) {
      LOG("container");
      int or_index = -1;

      std::vector<ParsingResult> output;

      do {
        auto current_output = result::new_container(tokens_i);

        if (parser_node->or_list.empty()) {
          // the variable will be the new position returned if every child matched
          int final_tokens_i = tokens_i;

          for (auto & child_parser_node : parser_node->group_list) {
            auto result = match_parser_node(tokens, final_tokens_i, &child_parser_node);

            // did not match
            if (result.is_error) {
              // and the child was not optional, quick-return
              if (!child_parser_node.is_optional) {
                if (output.empty()) {
                  return Err<vector<ParsingResult>>(tokens_i);
                }
                else {
                  return Ok<size_t>(output);
                }
              }

              // the child was optional, the match failing is not a big problem.
              // next child.
              continue;
            }


            auto parsing_result = result.unwrap_or({});

            LOG(" " << final_tokens_i);
            // move position for the current container loop
            final_tokens_i = add_results(current_output, parsing_result);
            LOG(" " << final_tokens_i);
          }

          // made it through all the children' matches.
          // save the progress and repeat if the ParserNode is repeatable.
          // in case of a fail during the parsing of one of the children
          // only the ones pushed here will be returned
          output.push_back(current_output);
          tokens_i = final_tokens_i;

        }
        else {
          if (or_index >= 0 && or_index < parser_node->or_list.size()) {
            ParserNode * used_parser_node = &parser_node->or_list[or_index];

            auto result = match_parser_node(tokens, tokens_i, used_parser_node);

            if (result.is_error) {
              LOG("####" << result.err);
              ++or_index;
            }
            else {
              auto parsing_result = result.unwrap_or({});
              or_index = -1;
              tokens_i = result::add_results(current_output, parsing_result);

              output.push_back(current_output);
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
              if (result.is_error) {
                // and the child was not optional,
                // tell there was a failure and move or_index forward
                if (!child_parser_node.is_optional) {
                  LOG("####" << result.err);
                  ++or_index;
                  success = false;
                  break;
                }

                // the child was optional, the match failing is not a big problem.
                // 'next child.
                continue;
              }

              auto parsing_result = result.unwrap_or({});

              // move position for the current container loop
              final_tokens_i = result::add_results(current_output, parsing_result);
            }

            if (success) {
              tokens_i = final_tokens_i;
              or_index = -1;

              output.push_back(current_output);
            }
          }
        }
      } while (parser_node->is_repeatable || !parser_node->or_list.empty() && or_index < parser_node->or_list.size());

      LOG("\n" << tokens_i << "|" << string(tokens_i, ' ') << "output-size: " << output.size());

      return Ok<size_t>(output);
    }

    // returning the same position as before means there was no match at all
    return Err<vector<ParsingResult>>(tokens_i);
  }

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
        .or(REFERENCE(G_functionCall)),
      token(Semicolon)
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

    auto * current_parser_node = &grammar_store[G_program];
    int tokens_i = 0;

    ParsingResult * program_parsing_result = new ParsingResult(0);

    while (true) {
      if (tokens_i >= tokens.size()) {
        LOG("\nparsing success");
        break;
      }

      Result<vector<ParsingResult>, size_t> results = match_parser_node(tokens, tokens_i, current_parser_node);

      if (results.is_error) {
        LOG("parsing stopped at" << results.err);
        break;
      }

      auto parsing_results = results.unwrap_or({});

      if (parsing_results.empty()) {
        LOG("parsing success but no result");
        break;
      }

      program_parsing_result->children.insert(program_parsing_result->children.end(), parsing_results.begin(), parsing_results.end());
      program_parsing_result->pos = parsing_results.back().pos;

      LOG("\nbefore: " << tokens_i << ", after: " << parsing_results.back().pos << '\n');
      tokens_i = parsing_results.back().pos;
    }
  }
};