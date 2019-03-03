#pragma once
#include <unordered_map>
#include "parsing_result.h"
#include "parser_node.h"


#define CONTAINER(grammar_type, children) ParserNode(container, &store, grammar_type).group(std::vector<ParserNode> children)
#define REFERENCE(ref_to) ParserNode(reference, &store).ref(ref_to)

namespace parser {
  void create_grammar(std::unordered_map<GrammarType, ParserNode> & store) {
    store[G_moduleImport] = CONTAINER(G_moduleImport, ({
      token(Module),
      token(Identifier),
      token(Semicolon)
    }));

    store[G_addition] = CONTAINER(G_addition, ({
      token(Number)
          .or(token(NumberFloat))
          .or(token(Identifier)),
      token(Plus),
      REFERENCE(G_addition)
        .or(token(Number))
        .or(token(NumberFloat))
        .or(token(Identifier)),
    }));

    store[G_useStatement] = CONTAINER(G_useStatement, ({
      token(Use),
      CONTAINER(G_None, ({
        token(Identifier),
        token(DoubleColon)
      })).repeat(),
      CONTAINER(G_None, ({
        token(LeftBrace),
        token(Identifier),
        CONTAINER(G_None, ({
          token(Comma),
          token(Identifier)
        })).repeat().optional(),
        token(RightBrace)
      }))
      .or(token(Identifier)),
      token(Semicolon)
    }));

    store[G_commaSeparatedIdentifiers] = CONTAINER(G_commaSeparatedIdentifiers, ({
      REFERENCE(G_addition)
        .or(token(Number))
        .or(token(NumberFloat))
        .or(token(String))
        .or(token(Identifier)),
      CONTAINER(G_None, ({
        token(Comma),
        REFERENCE(G_commaSeparatedIdentifiers)
      })).optional()
    }));

    store[G_commaSeparatedTypedIdentifiers] = CONTAINER(G_commaSeparatedTypedIdentifiers, ({
      token(Identifier)
        .or(token(Number))
        .or(token(NumberFloat)),
      token(Colon),
      token(Identifier),
      CONTAINER(G_None, ({
        token(Comma),
        REFERENCE(G_commaSeparatedTypedIdentifiers)
      })).optional()
    }));

    store[G_function] = CONTAINER(G_function, ({
      token(Function),
      token(Identifier),
      token(LeftParen),
      REFERENCE(G_commaSeparatedTypedIdentifiers)
        .optional(),
      token(RightParen),
      CONTAINER(G_None, ({
        token(RightArrow),
        token(Identifier)
      })).optional(),
      token(LeftBrace),
      REFERENCE(G_program)
        .optional(),
      token(RightBrace)
    }));

    store[G_functionCall] = CONTAINER(G_functionCall, ({
      token(Identifier),
      token(LeftParen),
      REFERENCE(G_commaSeparatedIdentifiers)
        .optional(),
      token(RightParen)
    }));

    store[G_immutableVariable] = CONTAINER(G_immutableVariable, ({
      token(Let),
      token(Identifier),
      token(Equal),
      token(Number)
        .or(token(NumberFloat))
        .or(token(String))
        .or(REFERENCE(G_functionCall)),
      token(Semicolon)
    }));

    store[G_returnStatement] = CONTAINER(G_returnStatement, ({
      token(Return),
      token(Number)
        .or(token(NumberFloat))
        .or(token(String))
        .or(REFERENCE(G_functionCall)),
    }));

    store[G_program] = REFERENCE(G_moduleImport)
      .or(REFERENCE(G_addition))
      .or(REFERENCE(G_useStatement))
      .or(REFERENCE(G_function))
      .or(REFERENCE(G_functionCall))
      .or(REFERENCE(G_returnStatement))
      .or(REFERENCE(G_immutableVariable))
      .or(token(Semicolon))
      .repeat();
  }
}

