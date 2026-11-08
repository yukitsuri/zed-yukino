;; Directives & Keywords
[
  "app"
  "version"
  "author"
  "about"
  "default_flags"
  "config"
  "define"
  "uncommon"
  "param"
  "or"
  "and"
  "enum"
  "env"
  "requires"
  "conflicts"
  "error"
  "range"
  "pattern"
  "min_len"
  "max_len"
  "one_of"
  "exists"
  "parent_exists"
] @keyword

;; Commands & Groups
(clarity_command name: (identifier) @function)
(clarity_group name: (identifier) @type)
(clarity_param name: (identifier) @variable.parameter)

;; Flags
(clarity_flag_long) @variable.parameter
(clarity_flag_short) @variable.parameter

;; Types
(clarity_primitive_type) @type.builtin
(clarity_enum_type (identifier) @variant)
(clarity_param type: (identifier) @type)
(clarity_flag type: (identifier) @type)
(clarity_array_type (identifier) @type)

;; Default values
(clarity_flag default: (identifier) @constant)
(clarity_param default: (identifier) @constant)

;; Modifiers
(clarity_modifier env_var: (identifier) @constant)
(clarity_modifier config_key: (identifier) @property)
(clarity_modifier config_key: (clarity_dotted_identifier) @property)
(clarity_modifier config_key: (scoped_identifier) @property)
(clarity_modifier requires: (identifier) @variable.parameter)
(clarity_modifier conflicts: (identifier) @variable.parameter)

;; Validators
(clarity_validator pattern: (string) @string.regex)

;; Literals & Constants
(string) @string
(escape_sequence) @string.escape
(number) @number
[(true) (false)] @boolean
(null) @constant.builtin

;; Comments
(line_comment) @comment
(block_comment) @comment

;; Punctuation & Delimiters
[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

[
  ","
  ";"
  ":"
] @punctuation.delimiter

[
  "="
  "?"
  "*"
  "-"
] @operator
