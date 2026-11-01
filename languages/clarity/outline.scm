;; Subcommands (named)
(clarity_command
  name: (identifier) @name) @item

;; Root command with description
(clarity_command
  !name
  about: (string) @name) @item

;; Root command without description
(clarity_command
  !name
  !about
  "define" @name) @item

;; Common flags block
(clarity_common_flags
  "*" @name) @item

;; Option groups
(clarity_group
  name: (identifier) @name) @item
