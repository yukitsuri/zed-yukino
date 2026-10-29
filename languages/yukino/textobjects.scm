; functions and methods
(function_declaration) @function.around
(function_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(cfun_declaration) @function.around
(cfun_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(lambda_expression
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

(method_declaration) @function.around
(method_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(method_signature) @function.around
(method_signature
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(property_declaration) @function.around
(property_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(operator_declaration) @function.around
(operator_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

(macro_declaration) @function.around
(macro_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}"))

; parameters
(parameter) @parameter.around
(parameter
  name: (identifier) @parameter.inside)

; classes, structs, interfaces, and enums
(class_declaration
  body: (class_body
    "{"
    (_)* @class.inside
    "}")) @class.around

(struct_declaration
  body: (struct_body
    "{"
    (_)* @class.inside
    "}")) @class.around

(interface_declaration
  body: (interface_body
    "{"
    (_)* @class.inside
    "}")) @class.around

(enum_declaration
  body: (enum_body
    "{"
    (_)* @class.inside
    "}")) @class.around

(externc_block) @class.around
(externc_block
  "{"
  (_)* @class.inside
  "}")

; comments
(line_comment)+ @comment.around

(block_comment) @comment.around
