(clarity_command) @function.around
(clarity_command
  body: (clarity_block
    "{"
    (_)* @function.inside
    "}"))

(clarity_common_flags) @function.around
(clarity_common_flags
  body: (clarity_block
    "{"
    (_)* @function.inside
    "}"))

(clarity_group) @class.around
(clarity_group
  "{"
  (_)* @class.inside
  "}")

(line_comment)+ @comment.around
(block_comment) @comment.around
