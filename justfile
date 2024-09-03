# Display this list of available commands
@list:
  just --justfile "{{ justfile() }}" --list

release version message="Bump versions to %s":
  npm version {{ version }} --message "{{ message }}"
  git push --follow-tags
