#pragma once

#include "../debug.h"

#include <unordered_map>
#include <string>
#include <vector>

#include "../tokenizer/print_token.h"
#include "../tokenizer/token.h"
#include "../result.h"
#include "parsing_result.h"
#include "create_grammar.h"
#include "parser_node.h"

using result::Result, result::Ok, result::Err;
using std::vector;
using std::string;

namespace parser {

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
        auto current_output = new_container(tokens_i, G_None);

        if (parser_node->or_list.empty()) {
          LOG(" no_or_list ");
          bool do_match = token_match(token, parser_node);

          if (!do_match) {
            LOG(" no_match ");
            return Err<vector<ParsingResult>>(tokens_i);
          }

          output.push_back(new_token(tokens_i + 1, token));
          
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
              tokens_i = add_results(current_output, parsing_results);

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
              output.push_back(new_token(tokens_i + 1, token));

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
        auto current_output = new_container(tokens_i, G_None);

        if (parser_node->or_list.empty()) {
          auto * referenced_parser_node = &parser_node->store->at(parser_node->ref_to);

          auto result = match_parser_node(tokens, tokens_i, referenced_parser_node);

          if (result.is_error) {
            return Err<vector<ParsingResult>>(tokens_i);
          }

          auto parsing_result = result.unwrap_or({});
          tokens_i = add_results(current_output, parsing_result);
          output.push_back(current_output);
        }
        else {
          if (or_index >= 0 && or_index < parser_node->or_list.size()) {
            ParserNode * used_parser_node = parser_node;
            used_parser_node = &parser_node->or_list[or_index];

            auto result = match_parser_node(tokens, tokens_i, used_parser_node);

            if (result.is_error) {
              ++or_index;
            }
            else {
              auto parsing_result = result.unwrap_or({});

              or_index = -1;
              tokens_i = add_results(current_output, parsing_result);

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
              tokens_i = add_results(current_output, parsing_result);

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
        auto current_output = new_container(tokens_i, parser_node->grammar_type);

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
              tokens_i = add_results(current_output, parsing_result);

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
              final_tokens_i = add_results(current_output, parsing_result);
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

  void recursive_parsing_result_lookup(ParsingResult * parsing_result, unsigned int depth = 0) {
    LOG(string(depth, ' ') << parsing_result->grammar_type << "\n");

    for (auto & child : parsing_result->children) {
      recursive_parsing_result_lookup(&child, depth + 1);
    }
  }

  void parser(std::vector<Token> & tokens) {
    std::unordered_map<GrammarType, ParserNode> grammar_store;
    create_grammar(grammar_store);

    auto * current_parser_node = &grammar_store[G_program];
    int tokens_i = 0;

    ParsingResult * program_parsing_result = new ParsingResult(0, G_program);

    while (true) {
      if (tokens_i >= tokens.size()) {
        LOG("\nparsing success\n");
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

    recursive_parsing_result_lookup(program_parsing_result);
  }
};