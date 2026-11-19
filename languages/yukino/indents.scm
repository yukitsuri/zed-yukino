(_ "{" "}" @end) @indent
(_ "[" "]" @end) @indent
(_ "(" ")" @end) @indent

(switch_arm "->" @start) @indent

[
  "elif"
  "else"
  "catch"
  "finally"
] @outdent
