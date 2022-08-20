
build:
	@yarn compile

publish: build
	@cp README.md dist/
	@cd dist && npm publish --public
