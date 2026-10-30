(if_statement) @start.if
(elif_clause) @start.elif
(else_clause) @start.else
(sus_statement) @start.sus

(_
  "{"
  "}" @end) @indent

(_
  "["
  "]" @end) @indent

(_
  "("
  ")" @end) @indent

[
  (call_expression)
  (field_expression)
  (assignment_statement)
  (variable_declaration)
  (return_statement)
] @indent

(switch_arm) @indent
