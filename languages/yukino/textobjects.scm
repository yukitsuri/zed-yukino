; functions and methods
(function_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

(cfun_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

(lambda_expression
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

(method_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

(operator_declaration
  body: (block
    "{"
    (_)* @function.inside
    "}")) @function.around

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

; comments
(line_comment)+ @comment.around

(block_comment) @comment.around
