#pragma once

#include "../tokenizer/token.h"

struct AstNode {
  /**
   * specifies if the AstNode is of Type unique or container
   **/
  enum AstNodeType {
    /**
     * when of type `unique` it means the AstNode points to a token
     **/
    unique,

    /**
     * when of type `container` it means the AstNode points to a container
     **/
    container
  };

  AstNodeType type = unique;

  /**
   * note: used only when type::unique
   **/
  Token * token = nullptr;

  /**
   * note: used only when type::unique
   **/
  int tokens_i = 0;

  /**
   * note: used only when type::container
   **/
  std::vector<AstNode> children_nodes;

  static AstNode new_container() {
    auto n = AstNode();
    n.type = container;

    return n;
  }

  static AstNode new_unique(Token * token, int tokens_i) {
    auto n = AstNode();
    n.type = unique;
    n.token = token;
    n.tokens_i = tokens_i;

    return n;
  }

  ~AstNode() {
    if (token != nullptr) {
      delete token;
    }
  }
};
