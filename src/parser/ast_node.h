#pragma once

#include "../tokenizer/token.h"

struct AstNode {
  /**
   * specifies if the AstNode is of Type unique or container
   * TODO: use a union instead
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
   * TODO: use a union instead
   **/
  Token * token = nullptr;

  /**
   * note: used only when type::unique
   * TODO: use a union instead
   **/
  int tokens_i = 0;

  /**
   * note: used only when type::container
   * TODO: use a union instead
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
