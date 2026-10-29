(function_declaration
  name: (identifier) @name) @definition.function

(cfun_declaration
  name: (identifier) @name) @definition.function

(method_declaration
  name: (identifier) @name) @definition.method

(method_signature
  name: (identifier) @name) @definition.method

(property_declaration
  name: (identifier) @name) @definition.property

(operator_declaration
  name: (operator_symbol) @name) @definition.method

(class_declaration
  name: (identifier) @name) @definition.class

(struct_declaration
  name: (identifier) @name) @definition.struct

(interface_declaration
  name: (identifier) @name) @definition.interface

(enum_declaration
  name: (identifier) @name) @definition.enum

(enum_variant
  name: (identifier) @name) @definition.variant

(type_alias_declaration
  name: (identifier) @name) @definition.type

(alias_declaration
  name: (identifier) @name) @definition.type

(macro_declaration
  name: (identifier) @name) @definition.macro

(field_declaration
  name: (identifier) @name) @definition.field

(variable_declaration
  name: (identifier) @name) @definition.variable

;; References
(call_expression
  function: (identifier) @name) @reference.call

(call_expression
  function: (field_expression
    field: (identifier) @name)) @reference.call

(user_type
  (identifier) @name) @reference.type

(init_expression
  class: (identifier) @name) @reference.type
