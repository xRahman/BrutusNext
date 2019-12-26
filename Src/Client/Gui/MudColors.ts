/*
  Part of BrutusNEXT

  Convert mud colored message (like '&Rhealth&g') to html
  <span> elements.
*/

/// Color test: &kA&KB&rC&RD&gE&GF&yG&YH&bI&BJ&mK&ML&cM&CN&wO&WP
const colors: { [key: string]: string } =
{
  "&k": "rgb(48,48,48)",    // Black
  "&K": "rgb(102,102,102)", // Bright Black
  "&r": "rgb(158,0,0)",     // Red
  "&R": "rgb(255,30,30)",   // Bright Red
  "&g": "rgb(0,158,0)",     // Green
  "&G": "rgb(30,255,30)",   // Bright Green
  "&y": "rgb(158,158,0)",   // Yellow
  "&Y": "rgb(255,255,30)",  // Bright Yellow
  "&b": "rgb(0,0,158)",     // Blue
  "&B": "rgb(30,30,255)",   // Bright Blue
  "&m": "rgb(158,0,158)",   // Magenta
  "&M": "rgb(255,30,255)",  // Bright Magenta
  "&c": "rgb(0,158,158)",   // Cyan
  "&C": "rgb(30,255,255)",  // Bright Cyan
  "&w": "rgb(188,188,188)", // Off-white
  "&W": "rgb(255,255,255)"  // Bright White
};

export namespace MudColors
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  export const DEFAULT_COLOR = colors["&w"];

  // Color of escaped color codes (like '&&R').
  export const COLOR_CODE_COLOR = "rgb(78,78,0)";

  // Color of user commands reprinted to scrollwindow output.
  export const COMMAND_ECHO_COLOR = "rgb(128,64,64)";
  /*
  // If you send a command, it will be printed to output using this font.
 export const COMMAND_ECHO_FONT() { return "CourierNew";
  */

  /// Not used yet.
  // Color of client messages (like 'Attempting to reconnect').
  export const CLIENT_MESSAGE_COLOR = "rgb(0,128,255)";

  /// Not used yet.
  // Color of hypertext links in client messages.
  export const CLIENT_LINK_COLOR = "rgb(0,191,255)";

  // Color of form input problems like "Name is too short".
  export const PROBLEM_TEXT_COLOR = "&R";

  // Color of recommendation text (it should really stand out).
  export const RECOMMENDATION_TEXT_COLOR = "&Y";

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  // For colorless messages, no color is specified unless 'baseColor' is
  // provided. It means that text color or parent html element is used.
  // -> Returns html that creates the element.
  export function htmlize(message: string, baseColor: (string | null) = null)
  : string
  {
    if (hasNoColors(message))
      return htmlizeColorlessMessage(message, baseColor);

    let baseColorParseResult: { offset: number, baseColor: string };

    // If 'baseColor' isn't provided, read it from
    // the beginning of the message.
    if (baseColor === null)
    {
      baseColorParseResult = parseBaseColor(message);
    }
    else
    {
      baseColorParseResult =
      {
        offset: 0,
        baseColor
      };
    }

    let processedMessage = message;

    // Skip the characters we have already parsed.
    if (baseColorParseResult.offset !== 0)
      processedMessage = message.substr(baseColorParseResult.offset);

    const htmlizedMessage = parseMudColors
    (
      processedMessage,
      baseColorParseResult.baseColor
    );

    // Encapsulate the result in one more <span> element so it
    // behaves as a single html element.
    return `<span>${htmlizedMessage}</span>`;

    // // If 'baseColor' is provided, use it.
    // if (baseColor !== null)
    //   return parseMudColors(message, baseColor);

    // // Otherwise read it from the begenning of the 'message' first.
    // return parseBaseColor(message);
  }
}

// ----------------- Auxiliary Functions ---------------------

// -> Returns html rgb code if two characters on 'index'
//    represent a color code, 'null' otherwise.
function parseColorCode(colorCode: string, baseColor: string)
: string | null
{
  // '&_' means 'baseColor'
  // (which is usually the color at the start of the message).
  if (colorCode === "&_")
    return baseColor;

  const htmlColor = colors[colorCode];

  if (htmlColor === undefined)
    return null;

  return htmlColor;
}

function closeSpanIfOpen(parser: { html: string, spanOpen: boolean })
: void
{
  if (parser.spanOpen === true)
  {
    parser.html += "</span>";
    parser.spanOpen = false;
  }
}

// Regularly, 'parser.activeColor' (which is obtained by parsing
// color codes from in the message) will be used with opening
// tag. If you provide a 'color' param, it will be used instead
// (without modifying parser.activeColor value, so the next opened
// <span> tag will use parser.activeColor again).
function openSpanIfClosed
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  color: (string | null) = null
)
: void
{
  const usedColor = color ? color : parser.activeColor;

  /// Původně tu bylo:
  // if (color === null)
  //   color = parser.activeColor;

  if (parser.spanOpen === false)
  {
    parser.html += `<span style="color: ${usedColor}">`;

    parser.spanOpen = true;
  }
}

// Adds 'characters' string to resulting html coloured with
// 'color' if you provide it or 'parser.activeColor' if you don't.
function outputCharacters
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  characters: string,
  color: (string | null) = null
)
: void
{
  openSpanIfClosed(parser, color);
  parser.html += characters;
}

// -> Returns number of extra parsed characters that need
//    to be skipped in the main cycle.
function outputEscapedColorCode
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  colorCode: string
)
: number
{
  closeSpanIfOpen(parser);

  // This will also open a <span> tag.
  outputCharacters
  (
    parser,
    colorCode,
    // Use special color to distiguish escaped color codes.
    MudColors.COLOR_CODE_COLOR
  );

  closeSpanIfOpen(parser);

  // Skip parsing of two extra characters because
  // we have just outputed them in advance.
  return 2;
}

// -> Returns number of extra parsed characters that need
//    to be skipped in the main cycle.
function parseEscapedColorCode
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  message: string,
  index: number,
  baseColor: string
)
: number
{
  // Take a peek at the two following characters.
  const colorCode = message.substr(index + 1, 2);
  const color = parseColorCode(colorCode, baseColor);

  if (color === null)
  {
    // It there isn't a color code after '&' character
    // and it isn't part of color code itself, treat
    // it just like a regular character.
    outputCharacters(parser, "&");

    // Don't skip any extra characters.
    return 0;
  }

  // If there is a color code after a '&' (so it's something like '&&r'),
  // we output it as an unescaped color code ('&r') using special color.
  return outputEscapedColorCode(parser, colorCode);
}

// -> Returns number of extra parsed characters that need
//    to be skipped in the main cycle.
function parseAmpersand
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  message: string,
  index: number,
  baseColor: string
)
: number
{
  // Check if there is a color code at position 'index'.
  const colorCode = message.substr(index, 2);
  const color = parseColorCode(colorCode, baseColor);

  // If there is a color code.
  if (color !== null)
  {
    closeSpanIfOpen(parser);

    // Update the active color.
    // (We don't open next <span> tag here, it will be
    // opened automatically by parsing the next character.
    parser.activeColor = color;

    // Skip one extra character
    // (because we have just parsed a color code which is
    // two character long).
    return 1;
  }

  return parseEscapedColorCode(parser, message, index, baseColor);
}

// -> Returns number of extra parsed characters that need
//    to be skipped in the main cycle.
function parseCharacter
(
  parser: { html: string, spanOpen: boolean, activeColor: string },
  message: string,
  index: number,
  baseColor: string
)
: number
{
  const ch = message.substr(index, 1);

  switch (ch)
  {
    case "&":
      // Return the number of extra parsed characters to be skipped).
      return parseAmpersand(parser, message, index, baseColor);

    case "\n":
      closeSpanIfOpen(parser);
      parser.html += "<br />";
      break;

    default:
      outputCharacters(parser, ch);
      break;
  }

  // Don't skip any extra characters.
  return 0;
}

// Creates a series of colored <span> elements.
function parseMudColors(message: string, baseColor: string): string
{
  if (message.length === 0)
    return "";

  const parser =
  {
    // Start with empty string.
    html: "",
    // Flag to indicate that we have a <span> tag open.
    spanOpen: false,
    // 'baseColor' is the first color used in the string.
    activeColor: baseColor
  };

  for (let i = 0; i < message.length; i++)
  {
    // It is possible that more than 1 character is parsed.
    // The extra parsed ones are skipped.
    i += parseCharacter(parser, message, i, baseColor);
  }

  closeSpanIfOpen(parser);

  return parser.html;
}

// -> Returns htmlized message.
function parseBaseColor(message: string)
: { baseColor: string, offset: number }
{
  let offset = 2;
  // Check the very beginning of the message for a color code.
  const code = message.substr(0, offset);
  // If the message begins with "&_" (which means 'return to base color'),
  // use DEFAULT_COLOR as base color.
  let baseColor = parseColorCode(code, MudColors.DEFAULT_COLOR);

  // If there isn't a color code at the start at the message,
  // use DEFAULT_COLOR as base color.
  if (baseColor === null)
  {
    offset = 0;
    baseColor = MudColors.DEFAULT_COLOR;
  }

  // // If there is a color code, use it. Also skip the first
  // // two characters because we don't have to parse it again.
  // return parseMudColors(message.substr(2), baseColor);

  return { baseColor, offset };
}

function hasNoColors(message: string): boolean
{
  if (!message)
    return true;

  return !message.includes("&");
}

// -> Returns <span> element containing 'message'.
function htmlizeColorlessMessage
(
  message: string,
  baseColor: (string | null) = null
)
: string
{
  let escapedMessage = message;

  // Treat 'undefined' or 'null' value as ""
  // (to prevent outputing words 'undefined' or 'null').
  if (message === null || message === undefined)
    escapedMessage = "";

  if (baseColor)
    return `<span style="color: ${baseColor}">${escapedMessage}</span>`;

  return `<span>${escapedMessage}</span>`;
}