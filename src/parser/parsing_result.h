#include <vector>
#include <variant>

#include "../tokenizer/token.h"

namespace parser {
  namespace result {
    struct ParsingResult;

    struct ParsingResult {
      int pos;

      std::vector<ParsingResult> children;
      Token * token;

      bool is_container;

      ParsingResult()
        : pos(0), children(), is_container(true) {};

      ParsingResult(int pos, Token * token)
        : pos(pos), token(token), is_container(false) {};

      ParsingResult(int pos)
        : pos(pos), children(), is_container(true) {};

      // ParsingResult(const ParsingResult & parsing_result)
      //   : pos(parsing_result.pos), is_container(parsing_result.is_container) {
        
      //   if (parsing_result.is_container) {
      //     std::cout << "[[" << parsing_result.children.size() << std::endl;
      //     children = parsing_result.children;
      //     std::cout << "]]" << std::endl;
      //   }
      //   else {
      //     token = parsing_result.token;
      //   }
      // };

      // ParsingResult & operator=(const ParsingResult & parsing_result) {
      //   std::cout << "ee" << parsing_result.is_container;
      //   this->is_container = parsing_result.is_container;
      //   std::cout << "rr";
        
      //   if (parsing_result.is_container) {
      //     children = parsing_result.children;
      //   }
      //   else {
      //     token = parsing_result.token;
      //   }


      //   return *this;
      // };

      // ~ParsingResult() {
      //   if (is_container) {
      //     children.~vector();
      //   }
      // };
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
      if (!result.is_container || result_list.empty()) {
        return result.pos;
      }
      else {
        result.children.insert(result.children.end(), result_list.begin(), result_list.end());
        result.pos = result_list.back().pos;

        return result.pos;
      }
    }
  }
}

