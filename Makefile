
.DEFAULT_GOAL := help

serve: ## Runs Rust file and serves using local server
	cargo run
	live-server output --no-browser 


publish: ## Updates Demeter, alongside any other changes you made.
	@git remote show upstream || (echo "remote 'upstream' not present, setting 'upstream'" && git remote add upstream https://github.com/EddieTheEd/demeter.git)
	@git fetch upstream
	@echo -e "\033[1mNOTE: Press 'q' to escape the log, once you've looked over(or can't be bothered to read) the commits.\033[0m"
	@git log --oneline --decorate --graph ..upstream/main
	@git checkout -p upstream/main -- main/ assets/ .github/ Cargo.toml .gitignore Makefile  ## Remove "Makefile" if you have customised your Makefile!
	@git pull
	@git add .
	@git commit -m "Update Demeter"
	@git push

help: ## Lists available commands 
	@echo -e "NOTE: This has only been tested on Unix!(maybe mac soon)\n\nThese are all the available functions:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {gsub(/lhelp/, "help"); printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' 
