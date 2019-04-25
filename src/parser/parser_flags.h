#pragma once

namespace parser {
  enum ParserFlag {
    None,
    ModuleName,
    AdditionLeftMember,
    UseStatementParentNamespace,
    UseStatementChildIdentifier,
  };
}