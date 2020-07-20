module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly",

		// Global Alchemy variables
		"__"         : "readonly",
		"__d"        : "readonly",
		"alchemy"    : "readonly",
		"hawkejs"    : "readonly",
		"Blast"      : "readonly",
		"Classes"    : "readonly",
		"Controller" : "readonly",
		"Model"      : "readonly",
		"Router"     : "readonly",
		"Pledge"     : "readonly",
	},
	"parserOptions": {
		"ecmaVersion": 11
	},
	"rules": {
		"no-mixed-spaces-and-tabs": [1, "smart-tabs"],
		"no-unused-vars": [2, {args: "none"}],
	}
};