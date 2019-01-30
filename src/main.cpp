#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <ctype.h>

#include "tokenizer/tokenizer.h"
#include "tokenizer/print_token.h"
#include "parser/parser.h"

int main(int argc, char * argv[]) {
  if (argc < 2) {
    std::cout << "usage: karc <entry-file>" << std::endl;

    return 0;
  }

  auto file = std::ifstream(argv[1]);

  if (!file.is_open()) {
    std::cout << "unable to open file " << argv[1] << std::endl;

    return 1;
  }

  auto tokens = tokenizer(file);
  file.close();

  for (auto & token : tokens) {
    print_token(token);
    std::cout << '\n';

    if (token.value != nullptr) {
      delete token.value;
    }
  }

  parser(tokens);

  return 0;
}