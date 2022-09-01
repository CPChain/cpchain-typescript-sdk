
all: publish

build:
	@yarn compile

publish: build
	@cp README.md dist/
	@cd dist && npm publish --public

cloc:
	@gocloc --not-match-d="node_modules|dist|public|example|fixtures" .
