
.DEFAULT_GOAL := help

serve: ## Runs Rust file and serves using local server
	cargo run
	live-server output --no-browser 

help: ## Lists available commands 
	@echo -e "NOTE: This has only been tested on Unix!(maybe mac soon)\n\nThese are all the available functions:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {gsub(/lhelp/, "help"); printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' 
