# Display this list of available commands
@list:
  just --justfile "{{ justfile() }}" --list

release version *message:
  npm version {{ version }} {{ if message != "" { "--message \"" + message + "\""  } else { "" } }}
  git push --follow-tags
