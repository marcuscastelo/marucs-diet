---
applyTo: "**"
---
# General Code Generation Instructions

- Under no circumstances add explanatory comments in the code.  
  Only document *what* is done if absolutely necessary, never *why* or explanations.

- Never generate identifiers, variables, functions, or comments in Portuguese.  
  Only UI text may be in English or pt-BR as required.

- Always wait for the end of any requested command/process before responding.  
  Redirect stdout and stderr to `/tmp/copilot-terminal-[N]` using `<command> 2>&1 | tee /tmp/copilot-terminal-[N] 2>&1`.  
  After the command, display `cat /tmp/copilot-terminal-[N]`.  
  Never repeat commands. Never use `&&`, `||` or `;` to combine commands.
