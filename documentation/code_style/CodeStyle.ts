Indentation
------------
{
  // Use two spaces (don't use tabs)
}

Trailing spaces
----------------------

// Don't leave spaces at the end of lines if possible.
// Don't put spaces on empty lines if possible.

Comments
---------

// Use multiline comments only outside blocks and function bodies, usually
// when you are commenting what a function does.
// This allows commenting-out of whole blocks or functions.

/*
  This is a multiline comment.
  Ident it with two spaces as if it were a block.
  Finish sentences with dots. So it's always clear where the sentence begins
  and where it ends.

  Insert empty line if you are covering more topics.

  We generally only use multiline comments for how-it-works explanations
  placed outside all blocks and functions (usually at the start of each file).
  (this is to allow commenting-out of large chunks of code with multiline
  comments)
*/


// Insert 1 space in between '//' and comment text.
// Start with capital letter, end sentences with dots.
// (additional one-sentence info is best put within paranthesis without
// leading capital letter and finishing dot on the next line, even if it
// splits to multiple lines)
//   Don't put multiple sentences within paranthesis, though. Indent them
// with two spaces like this one instead, if it helps readability.

// You don't need capital letter and dot for non-sentence comments
// like this one:

var color = [0, 255, 0];  // green

// Indent comments on the same line with two spaces after ';'.
// (or more if you can align it with other comments)

var baseColor = [0, 255, 0];    // green
var outlineColor  = [0, 0, 0];  // black

// If you comment a line of code, don't insert an empty line:
var commentedLine;

// So not like this:

var thisVariableWouldLikeToBeCommentedAsWell;

Line width
-----------

// Never exceed 80 characters on a line.
// (good editors can visualise the limit for you if you have wider screen)
// Best practice is to only use maximum of 79 characters so there is at least
// one space left at the end of 80-character line.
// (don't put a ' ' there though, just hit enter)

Function headers:
-----------------

// Don't insert white spaces neither in between function name and '('
// nor in between '(' or ')' and parameter name, but do insert single space
// after ','.

function myHappyFunction(firstParam, secondParam)
{
}

// If you need to split parameter list to multiple lines, put even the
// first one on the next line (so that all parameters align up) and indent
// it with 4 spaces:

function myHappyFunction(
    firstParam,
    secondParam,
    thirdParam,
    fourthParam)
{
  // ..
}

// (4 spaces indentation helps distinguish parameter list from blocks and
// function bodies)

// This also applies when you are calling a function with long parameter list:

{
  myHappyFunction(
      "One hundred and one",
      "One hundred and two",
      "One hundred and three",
      "One hundred and four");
}

Blocks, function bodies, etc.
-----------------------------

// Put opening bracket on the new line.
// If possible align values with the one most to the right.

var person =
{
  firstName: "John",
  lastName:  "Doe",
  age:       50,
  eyeColor:  "blue"
};

// Try to keep blocks and functions as short as possible. More than one page
// (20 lines) is only acceptable if you reduced every subblock to a single
// non-block statement.
//   E.G. switch with only cases like this:

  case 1:
    if (sunIsShining)
      doSomething();
    break;

// or even better:

  case 1:
    doSomething(sunIsShining);
    break;

// but not like this:
// (only if total length of function exceeds one page of course,
// otherwise it's perfectly ok!)

  case 1:
    if (sunIsShining)
    {
      doSomething();
      doSomethingElse();
    }
    break;


Return values of functions
---------------------------

// If you are returning complex expression, put it in a local variable
// and return that variable, so it's clearly readable what is the return
// value.
// (this way the return value is self-documented, you don't need to comment it)

function toCelsius(fahrenheit)
{
  var temperatureInCelsius =
    (5 / 9) * (fahrenheit - 32);

  return temperatureInCelsius;
}

// Remember that in JavaScript you cannot insert newline in between 'return'
// and returned value like this:
{
  return
    false;
}
// This is because of automatic semicolon insertion, it will actually
// get interpreted as: return; false;
// (it is another reason for returning a named variable instead of long
// expression)

Conditions
-----------

// If you are evaluating complex condition, put it in a local variable and
// evaluate that variable. You should also do it to split really crazy
// conditions to more readable ones.

var isValueValid = value >= 0 && value < 100 && value != 13;

if (isValueValid)
{
  // ...
}

// Insert single space in between if and '('.
// Insert single space in between identifiers and operators:

var isInvalid = isNull || isUndefined;

// If you split condition to multiple lines, put opertors at the beginning of
// the next line like this:

var isValueValid =
  value >= 0
  && value < 100
  && value != 13;

// Always put newline after expression:

if (isNight)
  visibility = 0;
  
// not like this: if (isNight) visibility = 0;

Identifiers
------------

// Use camelCase (starting with lowercase letter) for local variables, function
// parameters, object properties and all functions and methods except
// constructors

fistName = "John";

Use PascalCase (starting with uppercase letter) for constructors and TODO

// Always start with a letter (don't start identifiers with '_', '$' etc.).
// (except when using stuff from 3rd party modules of course)


Closures as function params
----------------------------

// 4 space indentation and all params on separate lines rules do apply here.

function doSomething(
    firstParam,
    secondParam = function()
    {
      // ..
    })
{
 // If there is a body, it's formatted as usual.
}

// Yes, this means that round opening bracket can stand at the end of the line.


Variables declaration
----------------------

// Declare each variable with separate 'var' and put it on a separate line.

var variable1 = 1;
var variable2 = 2;
var stringVariable = "It's cold here.";

// Don't declare like this: var varible1, varible2 = 3;


// Declare all variables at the start of the block or function body.
// (this is because unlike in C, variables in JavaScript exist from the
// beginning of the block even before actual declaration)
// And you should write short blocks and function bodies anyways ;-)

// You can also declare variable within cycle header like this:
for (var i = 0; i < myArray.length(); i++)
{
  // ...
}

// If you have a meaningful value for it, initialize variables at declaration.
// Don't initialize at all costs, though, like: var stringVariable = "";
//   This is because uninitialized variable have value of "undefined" so you
// can test it for (not) being initialized like this:

var x;
var txt = "x is initialized";

if (x === undefined)
{
  txt = "x is not initialized";
}

