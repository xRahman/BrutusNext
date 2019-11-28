module.exports =
{
  "env":
  {
    "browser": true,
    "es6": true
  },
  "parser": "@typescript-eslint/parser",
  // "parserOptions":
  // {
  //   "project": "./Src/Server/tsconfig.json",
  //   // "tsconfigRootDir": __dirname,
  //   "sourceType": "module"
  // },
  "plugins":
  [
    "@typescript-eslint",
    "@typescript-eslint/eslint-plugin"
  ],
  "rules":
  {
      // Require that member overloads be consecutive.
      // (Not sure what this does.)
      "@typescript-eslint/adjacent-overload-signatures": "error",
      // Requires using either T[] or Array<T> for arrays.
      // (I like to use both so turn this off.)
      "@typescript-eslint/array-type": "off",
      // Disallows awaiting a value that is not a Thenable.
      // (Sounds reasonable.)
      "@typescript-eslint/await-thenable": "error",
      // Bans “// @ts-ignore” comments from being used.
      // (We certainly don't want to hide errors so turn this on.)
      "@typescript-eslint/ban-ts-ignore": "error",
      // Bans specific types from being used.
      "@typescript-eslint/ban-types":
      [
        "error",
        {
          "types":
          {
            "Object":
            {
              "message": "Avoid using the `Object` type. Did you mean `object`?",
              "fixWith": "object"
            },
            "Boolean":
            {
              "message": "Avoid using the `Boolean` type. Did you mean `boolean`?",
              "fixWith": "boolean"
            },
            "Function": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`.",
            "Number":
            {
              "message": "Avoid using the `Number` type. Did you mean `number`?",
              "fixWith": "number"
            },
            "String":
            {
              "message": "Avoid using the `String` type. Did you mean `string`?",
              "fixWith": "string"
            },
            "Symbol":
            {
              "message": "Avoid using the `Symbol` type. Did you mean `symbol`?",
              "fixWith": "symbol"
            }
          }
        }
      ],
      // Disable the base rule as it can report incorrect errors.
      "brace-style": "off",
      // Enforce consistent brace style for blocks.
      // (This is not exactly what I want, some cases should not be allowed.)
      "@typescript-eslint/brace-style":
      [
        "error",
        "allman",
        {
          // Allow single-line functions like getBox() { return this.box; }. 
          "allowSingleLine": true
        }
      ],
      // Disable the base rule as it can report incorrect errors.
      "camelcase": "off",
      // Enforce camelCase naming convention.
      "@typescript-eslint/camelcase":
      [
        "error",
        {
          "properties": "always",
          "genericType": "always"
        }
      ],
      "@typescript-eslint/class-name-casing": "error",
      "@typescript-eslint/consistent-type-assertions":
      [
        "error",
        {
          "assertionStyle": "as",
          "objectLiteralTypeAssertions": "never"
        }
      ],
      // Consistent with type definition either 'interface' or 'type'.
      // (Both have their uses so turn this off.)
      "@typescript-eslint/consistent-type-definitions": "off",
      // Disable the rule for all files. If will be enabled specifically
      // for typescript files in "overrides" section.
      "@typescript-eslint/explicit-function-return-type": "off",
      // Disable the rule for all files. If will be enabled specifically
      // for typescript files in "overrides" section.
      "@typescript-eslint/explicit-member-accessibility": "off",
      // Disable the base rule as it can report incorrect errors.
      "func-call-spacing": "off",
      // Require or disallow spacing between function identifiers and
      // their invocations.
      // (This rule doesn't allow opening brace on new line, which
      //  is used to call functions with long parameter list, so we
      //  can't use it.)
      "@typescript-eslint/func-call-spacing": "off",
      // Enforces naming of generic type variables.
      // (We don't enforce prefix for type variables so leave this off.)
      "@typescript-eslint/generic-type-naming": "off",
      // Enforce consistent indentation.
      "@typescript-eslint/indent":
      [
        "error",
        // Always indent with 2 spaces.
        2,
        {
          // Enforces indentation level for case clauses in switch statements.
          "SwitchCase": 1,
          // Enforces indentation level for 'var', 'let' and 'const'
          // declarators.
          // (Each variable needs to have it's own declarator so indenting
          //  is not allowed.)
          "VariableDeclarator": "off",
          // Enforces indentation level for file-level IIFEs.
          "outerIIFEBody": 1,
          // Enforces indentation level for multi-line property chains.
          "MemberExpression": 1,
          // Enforces indentation level for arguments in a call expression.
          // Enforces indentation level for parameters in a function
          // declaration.
          "FunctionDeclaration":
          {
            // All arguments of the expression must be aligned with the
            // first argument.
            "parameters": "first"
          },
          // Enforces indentation level for parameters in a function
          // expression.
          "FunctionExpression":
          {
            // All arguments of the expression must be aligned with the
            // first argument.
            "parameters": "first"
          },
          "CallExpression":
          {
            // All arguments of the expression must be aligned with the
            // first argument.
            "arguments": "first"
          },
          // Enforces indentation level for elements in arrays.
          // (All arguments of the expression must be aligned with the
          //  first argument.)
          "ArrayExpression": "first",
          // Enforces indentation level for properties in objects.
          // (All arguments of the expression must be aligned with the
          //  first argument.)
          "ObjectExpression": "first",
          // Enforces indentation level for import statements.
          // (All imported members from a module should be aligned
          //  with the first member in the list.)
          "ImportDeclaration": "first"
        }
      ],
      // "@typescript-eslint/interface-name-prefix": "off",
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
      // "@typescript-eslint/member-ordering": "error",
      // "@typescript-eslint/no-empty-function": "error",
      // "@typescript-eslint/no-empty-interface": "off",
      // "@typescript-eslint/no-explicit-any": "off",
      // "@typescript-eslint/no-extraneous-class": "error",
      // "@typescript-eslint/no-floating-promises": "error",
      // "@typescript-eslint/no-for-in-array": "error",
      // "@typescript-eslint/no-inferrable-types": "error",
      // "@typescript-eslint/no-misused-new": "error",
      // "@typescript-eslint/no-namespace": "off",
      // "@typescript-eslint/no-non-null-assertion": "error",
      // "@typescript-eslint/no-param-reassign": "error",
      // "@typescript-eslint/no-parameter-properties": "off",
      // "@typescript-eslint/no-require-imports": "off",
      // "@typescript-eslint/no-this-alias": "error",
      // "@typescript-eslint/no-unnecessary-qualifier": "error",
      // "@typescript-eslint/no-unnecessary-type-arguments": "error",
      // "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // "@typescript-eslint/no-use-before-declare": "error",
      // "@typescript-eslint/no-var-requires": "error",
      // "@typescript-eslint/prefer-for-of": "error",
      // "@typescript-eslint/prefer-function-type": "error",
      // "@typescript-eslint/prefer-namespace-keyword": "error",
      // "@typescript-eslint/promise-function-async": "error",
      // "@typescript-eslint/quotes": [
      //     "error",
      //     "double"
      // ],
      // "@typescript-eslint/require-await": "error",
      // "@typescript-eslint/restrict-plus-operands": "error",
      // "@typescript-eslint/semi": [
      //     "error",
      //     "always"
      // ],
      // "@typescript-eslint/space-within-parens": [
      //     "error",
      //     "always"
      // ],
      // "@typescript-eslint/strict-boolean-expressions": "off",
      // "@typescript-eslint/triple-slash-reference": "error",
      // "@typescript-eslint/type-annotation-spacing": "error",
      // "@typescript-eslint/unbound-method": "error",
      // "@typescript-eslint/unified-signatures": "error",
      "arrow-body-style": "off",
      "arrow-parens": [
          "error",
          "as-needed"
      ],
      // "capitalized-comments": "error",
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
      // "import/no-default-export": "error",
      // "import/no-deprecated": "error",
      // "import/no-extraneous-dependencies": "error",
      // "import/no-internal-modules": "error",
      // "import/no-unassigned-import": "off",
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
      // "no-null/no-null": "error",
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
      // "prefer-arrow/prefer-arrow-functions": "error",
      "prefer-const": "error",
      "prefer-object-spread": "error",
      // "prefer-readonly": "error",
      "prefer-template": "error",
      "quote-props": [
          "error",
          "consistent-as-needed"
      ],
      "radix": "error",
      "space-before-function-paren": "off",
      // "spaced-comment": "error",
      // "unicorn/filename-case": "error",
      "use-isnan": "error",
      "yoda": "off"//,
      // "@typescript-eslint/tslint/config":
      // [
      //     "error",
      //     {
      //         "rules": {
      //             "brace-style": [
      //                 true,
      //                 "allman",
      //                 {
      //                     "allowSingleLine": true
      //                 }
      //             ],
      //             "comment-type": [
      //                 true,
      //                 "singleline",
      //                 "multiline",
      //                 "doc",
      //                 "directive"
      //             ],
      //             "encoding": true,
      //             "invalid-void": true,
      //             "jsdoc-format": [
      //                 true,
      //                 "check-multiline-start"
      //             ],
      //             "match-default-export-name": true,
      //             "no-boolean-literal-compare": true,
      //             "no-default-import": true,
      //             "no-dynamic-delete": true,
      //             "no-inferred-empty-object-type": true,
      //             "no-mergeable-namespace": true,
      //             "no-null-undefined-union": true,
      //             "no-promise-as-boolean": true,
      //             "no-redundant-jsdoc": true,
      //             "no-reference-import": true,
      //             "no-restricted-globals": true,
      //             "no-tautology-expression": true,
      //             "no-unnecessary-callback-wrapper": true,
      //             "number-literal-format": true,
      //             "prefer-method-signature": true,
      //             "prefer-switch": true,
      //             "prefer-while": true,
      //             "return-undefined": true,
      //             "static-this": true,
      //             "strict-comparisons": true,
      //             "strict-string-expressions": true,
      //             "switch-final-break": [
      //                 true,
      //                 "always"
      //             ],
      //             "typedef": [
      //                 true,
      //                 "property-declaration",
      //                 "object-destructuring",
      //                 "array-destructuring"
      //             ],
      //             "unnecessary-else": true,
      //             "whitespace": [
      //                 true,
      //                 "check-branch",
      //                 "check-operator",
      //                 "check-module",
      //                 "check-separator",
      //                 "check-rest-spread",
      //                 "check-type",
      //                 "check-typecast"
      //             ]
      //         }
      //     }
      // ]
  },
  "overrides":
  [
    {
      // Enable following rule specifically for TypeScript files
      "files": ["*.ts", "*.tsx"],
      "rules":
      {
        // Require explicit return types on functions and class methods.
        "@typescript-eslint/explicit-function-return-type":
        [
          "error",
          {
            "allowExpressions": true,
            "allowTypedFunctionExpressions": true,
            "allowHigherOrderFunctions": true
          }
        ],
        // Require explicit accessibility modifiers on class properties
        // and methods.
        "@typescript-eslint/explicit-member-accessibility": "error"
      }
    }
  ]
};
