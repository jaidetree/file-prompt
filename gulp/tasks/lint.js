/* eslint quote-props: [0, "consistent-as-needed"] */
/**
 * Lint
 * Lints our js
 */
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

// Other modules
import minimist from 'minimist';

// Libraries
import log from 'gutil-waterlog';
import tap from '../lib/tap';

// Config
import paths from '../config/paths';

let config = {
      parser: 'babel-eslint',
      env: {
        browser: true,
        es6: true,
        node: true
      },
      globals: {
        require: true,
        DataBootstrap: true,
        CKEDITOR: true,
        Backbone: true,
        React: true,
        Braintree: true,
        google: true,
        Raven: true,
        mixpanel: true
      },
      ecmaFeatures: {
        arrowFunctions: true,
        binaryLiterals: true,
        blockBindings: true,
        classes: true,
        defaultParams: true,
        destructuring: true,
        forOf: true,
        generators: true,
        modules: true,
        objectLiteralComputedProperties: true,
        objectLiteralDuplicateProperties: true,
        objectLiteralShorthandMethods: true,
        objectLiteralShorthandProperties: true,
        octalLiterals: true,
        regexUFlag: true,
        regexYFlag: true,
        restParams: true,
        spread: true,
        superInFunctions: true,
        templateStrings: true,
        unicodeCodePointEscapes: true,
        globalReturn: false,
        jsx: true,
        experimentalObjectRestSpread: true
      },

      rules: {
        // ---------- Possible Errors ----------

        'comma-dangle': 2,               // disallow trailing commas in object literals
        'no-cond-assign': 2,             // disallow assignment in conditional expressions
        'no-console': 2,                 // disallow use of console (off by default in the node environment)
        'no-constant-condition': 2,      // disallow use of constant expressions in conditions
        'no-control-regex': 2,           // disallow control characters in regular expressions
        'no-debugger': 2,                // disallow use of debugger
        'no-dupe-keys': 2,               // disallow duplicate keys when creating object literals
        'no-empty': 2,                   // disallow empty statements
        'no-empty-character-class': 2,   // disallow the use of empty character classes in regular expressions
        'no-ex-assign': 2,               // disallow assigning to the exception in a catch block
        'no-extra-boolean-cast': 2,      // disallow double-negation boolean casts in a boolean context
        'no-extra-parens': 2,            // disallow unnecessary parentheses (off by default)
        'no-extra-semi': 2,              // disallow unnecessary semicolons
        'no-func-assign': 2,             // disallow overwriting functions written as function declarations
        'no-inner-declarations': 2,      // disallow function or variable declarations in nested blocks
        'no-invalid-regexp': 2,          // disallow invalid regular expression strings in the RegExp constructor
        'no-irregular-whitespace': 2,    // disallow irregular whitespace outside of strings and comments
        'no-negated-in-lhs': 2,          // disallow negation of the left operand of an in expression
        'no-obj-calls': 2,               // disallow the use of object properties of the global object (Math and JSON) as functions
        'no-regex-spaces': 2,            // disallow multiple spaces in a regular expression literal
        'no-sparse-arrays': 2,           // disallow sparse arrays
        'no-unreachable': 2,             // disallow unreachable statements after a return, throw, continue, or break statement
        'use-isnan': 2,                  // disallow comparisons with the value NaN
        'valid-jsdoc': [2, {             // Ensure JSDoc comments are valid (off by default)
          'requireReturn': false
        }],
        'valid-typeof': 2,               // Ensure that the results of typeof are compared against a valid string

        // ---------- Best Practices ----------

        'block-scoped-var': 1,      // treat var statements as if they were block scoped (off by default)
        'complexity': 1,            // specify the maximum cyclomatic complexity allowed in a program (off by default)
        'consistent-return': 1,     // require return statements to either always or never specify values
        'curly': 1,                 // specify curly brace conventions for all control statements
        'default-case': 1,          // require default case in switch statements (off by default)
        'dot-notation': 1,          // encourages use of dot notation whenever possible
        'eqeqeq': 1,                // require the use of === and !==
        'guard-for-in': 1,          // make sure for-in loops have an if statement (off by default)
        'no-alert': 1,              // disallow the use of alert, confirm, and prompt
        'no-caller': 1,             // disallow use of arguments.caller or arguments.callee
        'no-div-regex': 1,          // disallow division operators explicitly at beginning of regular expression (off by default)
        'no-else-return': 1,        // disallow else after a return in an if (off by default)
        'no-empty-label': 1,        // disallow use of labels for anything other then loops and switches
        'no-eq-null': 1,            // disallow comparisons to null without a type-checking operator (off by default)
        'no-eval': 1,               // disallow use of eval()
        'no-extend-native': 1,      // disallow adding to native types
        'no-extra-bind': 1,         // disallow unnecessary function binding
        'no-fallthrough': 1,        // disallow fallthrough of case statements
        'no-floating-decimal': 1,   // disallow the use of leading or trailing decimal points in numeric literals (off by default)
        'no-implied-eval': 1,       // disallow use of eval()-like methods
        'no-iterator': 1,           // disallow usage of __iterator__ property
        'no-labels': 1,             // disallow use of labeled statements
        'no-lone-blocks': 1,        // disallow unnecessary nested blocks
        'no-loop-func': 1,          // disallow creation of functions within loops
        'no-multi-spaces': 1,       // disallow use of multiple spaces
        'no-multi-str': 1,          // disallow use of multiline strings
        'no-native-reassign': 1,    // disallow reassignments of native objects
        'no-new': 1,                // disallow use of new operator when not part of the assignment or comparison
        'no-new-func': 1,           // disallow use of new operator for Function object
        'no-new-wrappers': 1,       // disallows creating new instances of String, Number, and Boolean
        'no-octal': 1,              // disallow use of octal literals
        'no-octal-escape': 1,       // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
        'no-process-env': 1,        // disallow use of process.env (off by default)
        'no-proto': 1,              // disallow usage of __proto__ property
        'no-redeclare': 1,          // disallow declaring the same variable more then once
        'no-return-assign': 1,      // disallow use of assignment in return statement
        'no-script-url': 1,         // disallow use of javascript: urls.
        'no-self-compare': 1,       // disallow comparisons where both sides are exactly the same (off by default)
        'no-sequences': 1,          // disallow use of comma operator
        'no-unused-expressions': 1, // disallow usage of expressions in statement position
        'no-void': 1,               // disallow use of void operator (off by default)
        'no-warning-comments': 1,   // disallow usage of configurable warning terms in comments, e.g. TODO or FIXME (off by default)
        'no-with': 1,               // disallow use of the with statement
        'radix': 1,                 // require use of the second argument for parseInt() (off by default)
        'vars-on-top': 1,           // requires to declare all vars on top of their containing scope (off by default)
        'wrap-iife': 1,             // require immediate function invocation to be wrapped in parentheses (off by default)
        'yoda': 1,                  // require or disallow Yoda conditions

        // ---------- Variables ----------

        'no-catch-shadow': 1,             // disallow the catch clause parameter name being the same as a variable in the outer scope (off by default in the node environment)
        'no-delete-var': 1,               // disallow deletion of variables
        'no-label-var': 1,                // disallow labels that share a name with a variable
        'no-shadow': 1,                   // disallow declaration of variables already declared in the outer scope
        'no-shadow-restricted-names': 1,  // disallow shadowing of names such as arguments
        'no-undef': 1,                    // disallow use of undeclared variables unless mentioned in a /*global */ block
        'no-undef-init': 1,               // disallow use of undefined when initializing variables
        'no-undefined': 1,                // disallow use of undefined variable (off by default)
        'no-unused-vars': 1,              // disallow declaration of variables that are not used in the code
        'no-use-before-define': 1,        // disallow use of variables before they are defined

        // ---------- Stylistic Issues ----------

        'array-bracket-spacing': [1, 'never'],         // enforce bracket spacing
        'brace-style': 1,                              // enforce one true brace style (off by default)
        'camelcase': 1,                                // require camel case names
        'comma-spacing': 1,                            // enforce spacing before and after comma
        'comma-style': 1,                              // enforce one true comma style (off by default)
        'computed-property-spacing': [2, 'never'],     // enforce consistent spacing between computer properties in inline object creation
        'consistent-this': 1,                          // enforces consistent naming when capturing the current execution context (off by default)
        'eol-last': 1,                                 // enforce newline at the end of file, with no multiple empty lines
        'func-names': 0,                               // require function expressions to have a name (off by default)
        'func-style': [1, 'declaration', {             // enforces use of function declarations or expressions (off by default)
          'allowArrowFunctions': true
        }],
        'key-spacing': 1,                              // enforces spacing between keys and values in object literal properties
        'max-nested-callbacks': 1,                     // specify the maximum depth callbacks can be nested (off by default)
        'new-cap': 1,                                  // require a capital letter for constructors
        'new-parens': 1,                               // disallow the omission of parentheses when invoking a constructor with no arguments
        'no-array-constructor': 1,                     // disallow use of the Array constructor
        'no-inline-comments': 0,                       // disallow comments inline after code (off by default)
        'no-lonely-if': 1,                             // disallow if as the only statement in an else block (off by default)
        'no-mixed-spaces-and-tabs': 1,                 // disallow mixed spaces and tabs for indentation
        'no-multiple-empty-lines': 1,                  // disallow multiple empty lines (off by default)
        'no-nested-ternary': 1,                        // disallow nested ternary expressions (off by default)
        'no-new-object': 1,                            // disallow use of the Object constructor
        'no-spaced-func': 1,                           // disallow space between function identifier and application
        'no-ternary': 0,                               // disallow the use of ternary operators (off by default)
        'no-trailing-spaces': 1,                       // disallow trailing whitespace at the end of lines
        'no-underscore-dangle': 1,                     // disallow dangling underscores in identifiers
        'one-var': 1,                                  // allow just one var statement per function (off by default)
        'operator-assignment': 1,                      // require assignment operator shorthand where possible or prohibit it entirely (off by default)
        'padded-blocks': [1, 'never'],                 // enforce padding within blocks (off by default)
        'quote-props': [1, 'consistent-as-needed'],    // require quotes around object literal property names (off by default)
        'quotes': [1, 'single'],                       // specify whether double or single quotes should be used
        'semi': 1,                                     // require or disallow use of semicolons instead of ASI
        'semi-spacing': 1,                             // disallow space before semicolon
        'sort-vars': 0,                                // sort variables within the same declaration block (off by default)
        'space-before-function-paren': 1,              // require a space after function names (off by default)
        'space-after-keywords': 1,                     // require a space after certain keywords (off by default)
        'space-before-blocks': 1,                      // require or disallow space before blocks (off by default)
        'object-curly-spacing': [2, 'always'],         // require or disallow spaces inside curly braces (off by default)
        'space-in-parens': 1,                          // require or disallow spaces inside parentheses (off by default)
        'space-infix-ops': 1,                          // require spaces around operators
        'space-return-throw-case': 1,                  // require a space after return, throw, and case
        'space-unary-ops': 1,                          // Require or disallow spaces before/after unary operators (words on by default, nonwords off by default)
        'spaced-comment': 1,                           // require or disallow a space immediately following the // in a line comment (off by default)
        'wrap-regex': 1,                               // require regex literals to be wrapped in parentheses (off by default)

        // ---------- ECMAScript 6 ----------

        'no-var': 0,          // require let or const instead of var (off by default)
        'generator-star': 0  // enforce the position of the * in generator functions (off by default)
      }
    };

/**
 * Lint
 * Reusble function to apply various plugins to a gulp vinyl file stream.
 *
 * @param {TransformStream} stream - A gulp vinyl transform stream
 * @returns {TransformStream} The resulting stream from the transformations
 */
function lint (stream) {
  return stream
    .pipe(plumber({
      errorHandler: () => {}
    }))
    /** Log that we are linting the file */
    .pipe(tap((file) => {
      log.start('lint')
        .action('Linting file')
        .data(paths.fromJs(file.path))
        .send();
    }))
    /** Lint the file */
    .pipe(eslint(config))
    /** Output the results */
    .pipe(eslint.formatEach())
    .pipe(tap((file) => {
      /** There were some errors so lets not display a success message */
      if (file.eslint.messages.length > 0) {
          return;
      }

      /** We made it through the linter with no errors, good job */
      log.success('lint')
        .action('Cleanly linted')
        .data(paths.fromJs(file.path))
        .send();
    }));
}

/**
 * Task Autolint
 * Runs a watcher on all src js files and lints them when changed.
 */
gulp.task('autolint', () => {
  return watch(paths.get.js.src, (file) => {
    return lint(gulp.src(file.path));
  });
});

/**
 * Task Lint
 * Lints a file or all js src files
 */
gulp.task('lint', () => {
  var opts = minimist(process.argv.slice(2)),
      file = opts.file || opts.f || paths.get.js.src;


  if (file !== paths.get.js.src) {
    file = paths.resolve(paths.get.cwd, file);
  }

  return lint(gulp.src(file));
});
