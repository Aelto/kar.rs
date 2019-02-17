#include <vector>
#include <variant>

#include "../tokenizer/token.h"

namespace parser {
  namespace result {
    struct ParsingResult;

    struct Container {
      std::vector<ParsingResult> children;

      Container() {};
      ~Container() {};
    };

    struct ParsingResult {
      int pos;

      union {
        Container container;
        Token * token;
      };

      bool is_container;

      ParsingResult()
        : pos(0), container(), is_container(true) {};

      ParsingResult(int pos, Token * token)
        : pos(pos), token(token), is_container(false) {};

      ParsingResult(int pos)
        : pos(pos), container(), is_container(true) {};

      ~ParsingResult() {
        if (is_container) {
          container.~Container();
        }
      };
    };
    
    ParsingResult new_container(int pos) {
      return ParsingResult(pos);
    };

    ParsingResult new_token(int pos, Token * token) {
      return ParsingResult(pos, token);
    };

    ParsingResult failure(int pos) {
      return ParsingResult(pos, nullptr);
    };

    int add_results(ParsingResult & result, std::vector<ParsingResult> & result_list) {
      if (!result.is_container) {
        return result.pos;
      }
      else {
        result.container.children.insert(result.container.children.end(), result_list.begin(), result_list.end());
        result.pos = result_list.back().pos;

        return result.pos;
      }
    }
  }
}

