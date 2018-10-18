
build: src/build.js
	mkdir -p build
	cp index.html build
	cp -r src build

src/build.js: src/app.js
	node_modules/.bin/browserify -o $@ $^

serve: build
	open http://localhost:8000
	cd build && python -m SimpleHTTPServer

publish: build
	ipfs add -r build | tail -n1
