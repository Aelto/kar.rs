#pragma once

#include "../tokenizer/token.h"

enum NodeType {
  ModuleImport
};

struct Node {
  NodeType type;
  Token * token;
};