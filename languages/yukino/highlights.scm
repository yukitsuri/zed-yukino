; Keywords
[
  "fun"
  "cfun"
  "class"
  "locked"
  "struct"
  "cstruct"
  "interface"
  "enum"
  "type"
  "alias"
  "define"
  "operator"
  "get"
  "init"
] @keyword

[
  "load"
  "public"
] @keyword.control.import

[
  "set"
  "rewrite"
  "static"
] @keyword.storage

[
  "if"
  "elif"
  "else"
  "while"
  "for"
  "loop"
  "in"
  "switch"
  "sus"
  "catch"
  "finally"
  "return"
  "recur"
  "break"
  "continue"
] @keyword.control

[
  "defer"
  "region"
  "ref"
  "externc"
  "as"
  "is"
  "with"
  "extends"
] @keyword.modifier

; Operators
[
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "->"
  "=>"
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "&"
  "|"
  "^"
  "~"
  "<<"
  ">>"
  "??"
  "?"
  ".."
  "..="
] @operator

; Delimiters
[
  "."
  "?."
  ","
  ":"
  ";"
  "::"
] @punctuation.delimiter

; Brackets (placed before interpolation and attributes so specialized delimiters override them)
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Built-in Identifiers & Literals
(this) @variable
(super) @variable.builtin
(null) @constant.builtin
"space" @constant.builtin
(boolean) @boolean
(number) @number
(char) @character

; Comments
(line_comment) @comment
(block_comment) @comment

; Base identifiers (placed before types and functions so specific contexts override)
(identifier) @variable
(parameter name: (identifier) @variable.parameter)
(variable_declaration name: (identifier) @variable)
(catch_clause error: (identifier) @variable)
(catch_clause type: (user_type (identifier) @type))
(catch_clause type: (_) @type)

; Types
(primitive_type) @type.builtin
(user_type (identifier) @type)
(user_type) @type
(struct_expression name: (identifier) @type)
(struct_expression name: (scoped_identifier (identifier) @type))
(type_parameter name: (identifier) @type.parameter)
(enum_variant name: (identifier) @constant)
(variant_pattern variant: (identifier) @constant)

; Return Types
(function_declaration return_type: (_) @type)
(function_declaration return_type: (user_type (identifier) @type))
(method_declaration return_type: (_) @type)
(method_declaration return_type: (user_type (identifier) @type))
(property_declaration return_type: (_) @type)
(property_declaration return_type: (user_type (identifier) @type))
(cfun_declaration return_type: (_) @type)
(cfun_declaration return_type: (user_type (identifier) @type))

; Module and Import paths as Types (placed after base identifier so they override to @type)
(import_path (identifier) @type)
(import_path prefix: (identifier) @type)
(import_path (import_segment (import_pattern (identifier) @type)))
(scoped_identifier (identifier) @function)
(user_type (scoped_identifier (identifier) @type))

; Fields (plain variable color, while method calls are highlighted as @function)
(field_declaration name: (identifier) @variable)
(field_expression field: (identifier) @variable)
(field_expression field: (integer) @number)
(field_initializer name: (identifier) @variable)
(map_entry key: (identifier) @variable)

; Declarations: Functions, Methods, Properties, Operators (all matching @function)
(function_declaration name: (identifier) @function)
(cfun_declaration name: (identifier) @function)
(method_declaration name: (identifier) @function)
(property_declaration name: (identifier) @function)
(operator_declaration name: (operator_symbol) @function)
(macro_declaration name: (identifier) @function.macro)

; Function and Method Calls (all matching @function)
(call_expression
  function: (identifier) @function)
(call_expression
  function: (literal (super) @function))
(call_expression
  function: (literal (this) @function))
(call_expression
  function: (scoped_identifier (identifier) @function))
(call_expression
  function: (field_expression field: (identifier) @function))

; Built-in functions (cast and panic are highlighted as @function)
(cast_expression
  "cast" @function)
(panic_expression
  "panic" @function)
(ERROR
  "cast" @function
  "(")
(ERROR
  "panic" @function
  "(")

; Strings
(string_content) @string
(escape_sequence) @string.escape
(string ["\""] @string)

; String Interpolation (placed after brackets so ${ and } both get @punctuation.special)
(interpolation
  "${" @punctuation.special
  "}" @punctuation.special)

; Attributes & Directives (placed after brackets, non-italic directive styling)
(attribute
  "#[" @keyword.directive
  "]" @keyword.directive)
(module_attribute
  [
    "#!["
    "!#["
  ] @keyword.directive
  "]" @keyword.directive)
(attribute
  "|" @keyword.directive)
(c_attribute_item) @keyword.directive
(attribute_item
  name: (identifier) @keyword.directive)
(attribute_item
  name: (scoped_identifier (identifier) @keyword.directive))
