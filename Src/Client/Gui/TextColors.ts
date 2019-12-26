/*
  Part of BrutusNEXT

  Convert mud colored message (like '&Rhealth&g') to html
  <span> elements.
*/

/// Color test: &kA&KB&rC&RD&gE&GF&yG&YH&bI&BJ&mK&ML&cM&CN&wO&WP
const colors: { [key: string]: string } =
{
  // Also note that "&_" means 'baseColor' which is provided when
  // a message is htmlized (or MudColors.DEFAULT_COLOR is used).
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

export namespace TextColors
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  export const DEFAULT_COLOR = colors["&w"];

  // Color of escaped color codes (like '&&R').
  export const COLOR_CODE_COLOR = "rgb(78,78,0)";

  // Color of user commands reprinted to scrollwindow output.
  export const COMMAND_ECHO_COLOR = "rgb(128,64,64)";

  /// Not used yet.
  // Color of client messages (like 'Attempting to reconnect').
  export const CLIENT_MESSAGE_COLOR = "rgb(0,128,255)";

  /// Not used yet.
  // Color of hypertext links in client messages.
  export const CLIENT_LINK_COLOR = "rgb(0,191,255)";

  // Color of form input problems like "Name is too short".
  export const PROBLEM_COLOR_CODE = "&R";

  // Color of recommendation text (it should really stand out).
  export const RECOMMENDATION_COLOR_CODE = "&Y";

  // • If 'message' contains no color codes no color will be added
  //   to it so it will inherit text color from parent element.
  // • 'baseColor' is used when '&_' is found in 'message'.
  // -> Returns html that creates the spans.
  export function htmlize
  (
    message: string,
    baseColor = DEFAULT_COLOR
  )
  : string
  {
    if (hasNoColors(message))
      return `<span>${encodeURIComponent(message)}</span>`;

    return parseColors(message, baseColor);
  }
}

// ----------------- Auxiliary Functions ---------------------

function peek
(
  message: string,
  baseColor: string
)
: { color?: string, restOfMessage: string, outputCharacter: string }
{
  let restOfMessage = message.substr(2);

  if (message.startsWith("&&"))
    return { restOfMessage, outputCharacter: "&" };

  if (message.startsWith("$_"))
  {
    const color = baseColor;
    const outputCharacter = "";

    return { color, restOfMessage, outputCharacter };
  }

  if (message.startsWith("&"))
  {
    const code = message.substring(0, 2);
    const color = colors[code];

    if (color !== undefined)
      return { color, restOfMessage, outputCharacter: "" };
  }

  restOfMessage = message.substr(1);
  const outputCharacter = message.charAt(0);

  return { restOfMessage, outputCharacter };
}

// Creates a series of colored <span> elements.
function parseRestOfMessage(message: string, baseColor: string): string
{
  if (message.length === 0)
    return "";

  const peekResult = peek(message, baseColor);
  let html = "";

  if (peekResult.color)
  {
    html += "</span>";
    html += `<span style="color: ${peekResult.color}">`;
  }

  html += encodeURIComponent(peekResult.outputCharacter);
  html += parseRestOfMessage(peekResult.restOfMessage, baseColor);

  return html;
}

// Creates a series of colored <span> elements.
function parseColors(message: string, baseColor: string): string
{
  const peekResult = peek(message, baseColor);
  const color = peekResult.color ? peekResult.color : baseColor;

  let html = "";

  html += `<span style="color: ${color}">`;
  html += encodeURIComponent(peekResult.outputCharacter);
  html += parseRestOfMessage(peekResult.restOfMessage, baseColor);
  html += "</span>";

  return html;
}

function hasNoColors(message: string): boolean
{
  return !message.includes("&");
}

// function parseColors()
// {
//   const parser =
//   {
//     // Start with empty string.
//     html: "",
//     spanOpen: false,
//     activeColor: baseColor
//   };

//   let remainingMessage = message;

//   while (remainingMessage.length > 0)
//   {
//     remainingMessage = parseStartOfMessage(parser, message, baseColor);
//   }

//   // for (let i = 0; i < message.length; i++)
//   // {
//   //   // It is possible that more than 1 character is parsed.
//   //   // The extra parsed ones are skipped.
//   //   i += parseCharacter(parser, message, i, baseColor);
//   // }

//   closeSpanIfOpen(parser);

//   return parser.html;
// }

// // -> Returns html rgb code if two characters on 'index'
// //    represent a color code, 'null' otherwise.
// function parseColorCode(colorCode: string, baseColor: string)
// : string | null
// {
//   // '&_' means 'baseColor'
//   // (which is usually the color at the start of the message).
//   if (colorCode === "&_")
//     return baseColor;

//   const htmlColor = colors[colorCode];

//   if (htmlColor === undefined)
//     return null;

//   return htmlColor;
// }

// function closeSpanIfOpen(parser: { html: string, spanOpen: boolean }): void
// {
//   if (parser.spanOpen === true)
//   {
//     parser.html += "</span>";
//     parser.spanOpen = false;
//   }
// }

// // Regularly, 'parser.activeColor' (which is obtained by parsing
// // color codes from in the message) will be used with opening
// // tag. If you provide a 'color' param, it will be used instead
// // (without modifying parser.activeColor value, so the next opened
// // <span> tag will use parser.activeColor again).
// function openSpanIfClosed
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   color: (string | null) = null
// )
// : void
// {
//   const usedColor = color ? color : parser.activeColor;

//   /// Původně tu bylo:
//   // if (color === null)
//   //   color = parser.activeColor;

//   if (parser.spanOpen === false)
//   {
//     parser.html += `<span style="color: ${usedColor}">`;

//     parser.spanOpen = true;
//   }
// }

// // // Adds 'characters' string to resulting html coloured with
// // // 'color' if you provide it or 'parser.activeColor' if you don't.
// // function outputCharacters
// // (
// //   parser: { html: string, spanOpen: boolean, activeColor: string },
// //   characters: string,
// //   color: (string | null) = null
// // )
// // : void
// // {
// //   openSpanIfClosed(parser, color);
// //   parser.html += characters;
// // }

// // -> Returns number of extra parsed characters that need
// //    to be skipped in the main cycle.
// function outputEscapedColorCode
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   colorCode: string
// )
// : number
// {
//   closeSpanIfOpen(parser);

//   // This will also open a <span> tag.
//   outputCharacters
//   (
//     parser,
//     colorCode,
//     // Use special color to distiguish escaped color codes.
//     MudColors.COLOR_CODE_COLOR
//   );

//   closeSpanIfOpen(parser);

//   // Skip parsing of two extra characters because
//   // we have just outputed them in advance.
//   return 2;
// }

// // -> Returns number of extra parsed characters that need
// //    to be skipped in the main cycle.
// function parseEscapedColorCode
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   message: string,
//   index: number,
//   baseColor: string
// )
// : number
// {
//   // Take a peek at the two following characters.
//   const colorCode = message.substr(index + 1, 2);
//   const color = parseColorCode(colorCode, baseColor);

//   if (color === null)
//   {
//     // It there isn't a color code after '&' character
//     // and it isn't part of color code itself, treat
//     // it just like a regular character.
//     outputCharacters(parser, "&");

//     // Don't skip any extra characters.
//     return 0;
//   }

//   // If there is a color code after a '&' (so it's something like '&&r'),
//   // we output it as an unescaped color code ('&r') using special color.
//   return outputEscapedColorCode(parser, colorCode);
// }

// // -> Returns the rest of message that still needs to be parsed.
// function parseAmpersand
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   message: string,
//   baseColor: string
// )
// : string
// {
//   if (message.startsWith("&&"))
//   {
//     // Output one ampersand and following character.

//     return message.substr(3);
//   }

//   if (message.startsWith("&_"))
//   {
//     // Output base color.
//     closeSpanIfOpen(parser);

//     // Update the active color.
//     // (We don't open next <span> tag here, it will be
//     // opened automatically by parsing the next character.
//     parser.activeColor = baseColor;
//     return message.substr(2);
//   }

//   const colorCode = `&${message.charAt(1)}`;
//   const color = colors[colorCode];

//   if (color === undefined)
//   {
//     // Output ampersand and following character.

//     return message.substr(2);
//   }

//   // Update the active color.
//   // (We don't open next <span> tag here, it will be
//   // opened automatically by parsing the next character.
//   parser.activeColor = color;

//   return message.substr(2);
// }

// // -> Returns number of extra parsed characters that need
// //    to be skipped in the main cycle.
// function parseAmpersand
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   message: string,
//   index: number,
//   baseColor: string
// )
// : number
// {
//   // Check if there is a color code at position 'index'.
//   const colorCode = message.substr(index, 2);
//   const color = parseColorCode(colorCode, baseColor);

//   // If there is a color code.
//   if (color !== null)
//   {
//     closeSpanIfOpen(parser);

//     // Update the active color.
//     // (We don't open next <span> tag here, it will be
//     // opened automatically by parsing the next character.
//     parser.activeColor = color;

//     // Skip one extra character
//     // (because we have just parsed a color code which is
//     // two character long).
//     return 1;
//   }

//   return parseEscapedColorCode(parser, message, index, baseColor);
// }

// // -> Returns the rest of message that still needs to be parsed.
// function parseStartOfMessage
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   message: string,
//   baseColor: string
// )
// : string
// {
//   if (message.length === 0)
//     return "";

//   if (message.startsWith("&"))
//     return parseAmpersand(parser, message, baseColor);

//   if (message.startsWith("\n"))
//   {
//     closeSpanIfOpen(parser);
//     parser.html += "<br />";
//   }
//   else
//   {
//     openSpanIfClosed(parser);
//     parser.html += message.charAt(0);
//   }

//   // Return the rest of the message except the one character we have
//   // just parsed.
//   return message.substr(1);
// }

// // -> Returns number of extra parsed characters that need
// //    to be skipped in the main cycle.
// function parseCharacter
// (
//   parser: { html: string, spanOpen: boolean, activeColor: string },
//   message: string,
//   index: number,
//   baseColor: string
// )
// : number
// {
//   const ch = message.substr(index, 1);

//   switch (ch)
//   {
//     case "&":
//       // Return the number of extra parsed characters to be skipped).
//       return parseAmpersand(parser, message, index, baseColor);

//     case "\n":
//       closeSpanIfOpen(parser);
//       parser.html += "<br />";
//       break;

//     default:
//       outputCharacters(parser, ch);
//       break;
//   }

//   // Don't skip any extra characters.
//   return 0;
// }