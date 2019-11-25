module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/eslint-plugin"
    ],
    "rules": {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-ts-ignore": "error",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/class-name-casing": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": [
            "error",
            2,
            {
                "CallExpression": {
                    "arguments": "first"
                },
                "ArrayExpression": "first",
                "ObjectExpression": "first",
                "FunctionDeclaration": {
                    "parameters": "first"
                },
                "FunctionExpression": {
                    "parameters": "first"
                }
            }
        ],
        "@typescript-eslint/interface-name-prefix": "off",
        // "@typescript-eslint/member-delimiter-style": [
        //     "error",
        //     "error",
        //     {
        //         "multiline": {
        //             "delimiter": "semi",
        //             "requireLast": true
        //         },
        //         "singleline": {
        //             "delimiter": "semi",
        //             "requireLast": false
        //         }
        //     }
        // ],
        "@typescript-eslint/member-ordering": "error",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-param-reassign": "error",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-use-before-declare": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/quotes": [
            "error",
            "double"
        ],
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/space-within-parens": [
            "error",
            "always"
        ],
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unbound-method": "error",
        "@typescript-eslint/unified-signatures": "error",
        "arrow-body-style": "off",
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "camelcase": "error",
        "capitalized-comments": "error",
        "class-methods-use-this": "off",
        "comma-dangle": "off",
        "complexity": "off",
        "constructor-super": "error",
        "curly": "off",
        "default-case": "off",
        "dot-notation": "error",
        "eol-last": "off",
        "eqeqeq": [
            "error",
            "always"
        ],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/no-default-export": "error",
        "import/no-deprecated": "error",
        "import/no-extraneous-dependencies": "error",
        "import/no-internal-modules": "error",
        "import/no-unassigned-import": "off",
        "import/order": "off",
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-classes-per-file": [
            "error",
            1
        ],
        "max-len": [
            "error",
            {
                "code": 79
            }
        ],
        "max-lines": [
            "error",
            2000
        ],
        "new-parens": "error",
        "newline-per-chained-call": "off",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": "off",
        "no-debugger": "off",
        "no-duplicate-case": "error",
        "no-duplicate-imports": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-extra-bind": "error",
        "no-fallthrough": "error",
        "no-irregular-whitespace": "error",
        "no-magic-numbers": "off",
        "no-multiple-empty-lines": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-null/no-null": "error",
        "no-plusplus": [
            "error",
            {
                "allowForLoopAfterthoughts": true
            }
        ],
        "no-redeclare": "error",
        "no-restricted-syntax": [
            "error",
            "ForInStatement"
        ],
        "no-return-await": "error",
        "no-sequences": "error",
        "no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-useless-constructor": "error",
        "no-var": "error",
        "no-void": "error",
        "object-shorthand": "error",
        "one-var": [
            "error",
            "never"
        ],
        "padding-line-between-statements": [
            "off",
            "error",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "return"
            }
        ],
        "prefer-arrow/prefer-arrow-functions": "error",
        "prefer-const": "error",
        "prefer-object-spread": "error",
        "prefer-readonly": "error",
        "prefer-template": "error",
        "quote-props": [
            "error",
            "consistent-as-needed"
        ],
        "radix": "error",
        "space-before-function-paren": "off",
        "spaced-comment": "error",
        "unicorn/filename-case": "error",
        "use-isnan": "error",
        "yoda": "off",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "brace-style": [
                        true,
                        "allman",
                        {
                            "allowSingleLine": true
                        }
                    ],
                    "comment-type": [
                        true,
                        "singleline",
                        "multiline",
                        "doc",
                        "directive"
                    ],
                    "encoding": true,
                    "invalid-void": true,
                    "jsdoc-format": [
                        true,
                        "check-multiline-start"
                    ],
                    "match-default-export-name": true,
                    "no-boolean-literal-compare": true,
                    "no-default-import": true,
                    "no-dynamic-delete": true,
                    "no-inferred-empty-object-type": true,
                    "no-mergeable-namespace": true,
                    "no-null-undefined-union": true,
                    "no-promise-as-boolean": true,
                    "no-redundant-jsdoc": true,
                    "no-reference-import": true,
                    "no-restricted-globals": true,
                    "no-tautology-expression": true,
                    "no-unnecessary-callback-wrapper": true,
                    "number-literal-format": true,
                    "prefer-method-signature": true,
                    "prefer-switch": true,
                    "prefer-while": true,
                    "return-undefined": true,
                    "static-this": true,
                    "strict-comparisons": true,
                    "strict-string-expressions": true,
                    "switch-final-break": [
                        true,
                        "always"
                    ],
                    "typedef": [
                        true,
                        "property-declaration",
                        "object-destructuring",
                        "array-destructuring"
                    ],
                    "unnecessary-else": true,
                    "whitespace": [
                        true,
                        "check-branch",
                        "check-operator",
                        "check-module",
                        "check-separator",
                        "check-rest-spread",
                        "check-type",
                        "check-typecast"
                    ]
                }
            }
        ]
    }
};
