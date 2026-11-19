(function_declaration
  name: (identifier) @run
  (#eq? @run "main"))

(function_declaration
  (attribute
    (attribute_item
      name: (identifier) @attr
      (#eq? @attr "test")))
  name: (identifier) @run)
