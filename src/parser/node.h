#pragma once

#include "../tokenizer/token.h"

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