;; Keywords
[
  "fun"
  "cfun"
  "set"
  "rewrite"
  "static"
  "class"
  "struct"
  "cstruct"
  "interface"
  "enum"
  "type"
  "get"
  "define"
  "public"
  "locked"
  "operator"
  "externc"
  "alias"
  "as"
  "is"
  "extends"
  "with"
  "ref"
] @keyword

"init" @keyword

;; Control Flow
[
  "if"
  "elif"
  "else"
  "switch"
  "while"
  "for"
  "in"
  "loop"
  "break"
  "continue"
  "return"
  "recur"
  "sus"
  "catch"
  "finally"
  "defer"
  "space"
  "region"
] @keyword

;; Constants & Literals
[
  (true)
  (false)
] @boolean

(null) @constant.builtin

[
  (this)
  (super)
] @variable.special

;; Built-in Primitive Types
(primitive_type) @type.builtin

;; Declarations
(function_declaration name: (identifier) @function)
(cfun_declaration name: (identifier) @function)
(method_declaration name: (identifier) @function)
(method_signature name: (identifier) @function)
(operator_declaration name: (operator_symbol) @operator)
(operator_symbol) @operator
(type_parameters (identifier) @type)
(type_parameters ["<" ">"] @punctuation.bracket)
(class_heritage (user_type (identifier) @type))
(class_heritage
  (user_type
    (scoped_identifier
      (identifier) @type .)))
(alias_declaration name: (identifier) @variable)
(alias_declaration "#" @punctuation.delimiter)
(tuple_pattern (identifier) @variable)
(sus_statement error: (identifier) @variable)
(break_statement label: (identifier) @label)
(continue_statement label: (identifier) @label)
(loop_statement label: (identifier) @label)
(for_statement label: (identifier) @label)
(while_statement label: (identifier) @label)
(scoped_identifier
  (identifier) @type)
(macro_declaration name: (identifier) @preproc)
(class_declaration name: (identifier) @type)
(struct_declaration name: (identifier) @type)
(interface_declaration name: (identifier) @type)
(enum_declaration name: (identifier) @type)
(type_alias_declaration name: (identifier) @type)
(enum_variant name: (identifier) @variant)
(user_type (identifier) @type)
(user_type
  (scoped_identifier
    (identifier) @type .))
(user_type ["<" ">"] @punctuation.bracket)
(init_expression ["<" ">"] @punctuation.bracket)
((user_type (identifier) @type.builtin)
 (#any-of? @type.builtin "ptr" "map"))
(field_declaration name: (identifier) @property)
(enum_variant_parameter name: (identifier) @variable.parameter)
(property_declaration name: (identifier) @property)
(parameter name: (identifier) @variable.parameter)
(variable_declaration name: (identifier) @variable)
(for_statement item: (identifier) @variable)
(for_statement index: (identifier) @variable)

;; Imports
"load" @keyword
(relative_prefix) @punctuation.delimiter
(import_path prefix: (identifier) @type)
(import_segment (import_pattern (identifier) @type))
(import_segment "!" @punctuation.delimiter)
(import_pattern "*" @operator)

;; Switch patterns and literals
(switch_arm pattern: (identifier) @variable)
(pattern_tuple (identifier) @variable)
(variant_payload (identifier) @variable)
(struct_pattern_field value: (identifier) @variable)
(import_symbols_clause (import_pattern (identifier) @variable))
(import_symbols_clause (identifier) @variable)
(import_symbols_clause "as" @keyword)
(variant_pattern enum: (identifier) @type)
(variant_pattern variant: (identifier) @variant)
(struct_pattern name: (identifier) @type)
(struct_pattern_field name: (identifier) @property)
(map_entry key: (identifier) @property)
(struct_expression name: (identifier) @type)
(struct_expression
  name: (scoped_identifier
    (identifier) @type .))
(init_expression class: (identifier) @type)
(init_expression
  class: (scoped_identifier
    (identifier) @type .))
(struct_field_initializer name: (identifier) @property)
(named_argument name: (identifier) @variable.parameter)
(named_argument "=" @operator)
(macro_call_expression
  macro: (scoped_identifier
    (identifier) @preproc .))
((macro_call_expression macro: (identifier) @preproc)
 (#any-of? @preproc "file" "line" "col" "hostenv" "get_target" "get_yukic_version" "yukienv" "get_profileconfig" "get_features" "is_lib_connected" "include_str" "include_strings" "include_bytes" "compile_error" "cfg" "compile_print"))
(macro_call_expression "!" @operator)

;; Lambdas & Closures
(lambda_expression "fun" @keyword)
(lambda_expression "=>" @operator)
(arrow_function "=>" @operator)
(arrow_function parameters: (parenthesized_expression (identifier) @variable.parameter))

;; Expressions & Calls
(ternary_expression
  "?" @operator
  ":" @operator)

;; Field access placed before method calls for Zed precedence resolution.
(field_expression field: (identifier) @variable)

(call_expression function: (identifier) @function)
(call_expression
  function: (scoped_identifier
    (identifier) @function .))
(call_expression function: (field_expression field: (identifier) @function))
(macro_call_expression macro: (identifier) @preproc)

;; Comments
(line_comment) @comment
(block_comment) @comment

;; Strings & Numbers
(string) @string
(char) @constant
[
  (number)
  (integer)
  (float)
] @number
(escape_sequence) @string.escape

;; Attributes
(module_attribute) @attribute
(attribute) @attribute
(attribute_item name: (identifier) @attribute)
(attribute_item
  name: (scoped_identifier
    (identifier) @attribute))
(attribute_item "!" @operator)
(c_attribute_item name: (identifier) @attribute)
(c_attribute_item "=" @operator)
(attribute_named_arg name: (identifier) @property)
(attribute_named_arg "=" @operator)

;; Operators and Punctuation
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
  "="
  "+="
  "-="
  "*="
  "**="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "~"
  "&"
  "|"
  "^"
  "<<"
  ">>"
  "->"
  "=>"
  "::"
  "?"
  "??"
  ".."
  "..="
  "?."
  "..."
  "[]"
  "[]="
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

;; String interpolation with special punctuation braces.
(interpolation
  "${" @punctuation.special
  (_) @embedded
  "}" @punctuation.special) @embedded

[
  ","
  ":"
  ";"
  "."
] @punctuation.delimiter

;; Attribute delimiters
(module_attribute
  ["#![" "!#["] @punctuation.bracket)
(module_attribute
  "]" @punctuation.bracket)
(attribute
  ["#[" "|"] @punctuation.bracket)
(attribute
  ["]" "|"] @punctuation.bracket)
