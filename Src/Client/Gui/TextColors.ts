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
      return `<span>${escape(message)}</span>`;

    return parseColors(message, baseColor);
  }
}

// ----------------- Auxiliary Functions ---------------------

// Escepe function is used to prevent injecting html elements
// to text.
function escape(message: string): string
{
  return message
    // Escaping quotes doesn't work but they probably
    // won't do much harm by themselves.
    // .split(`"`).join("&quot;")
    .split("&").join("&amp;")
    .split("'").join("&#39;")
    .split("<").join("&lt;")
    .split(">").join("&gt;");
}

function openSpan(color: string): string
{
  return `<span style="color: ${color}">`;
}

function closeSpan(): string
{
  return "</span>";
}

function peek
(
  message: string,
  baseColor: string
)
: { color?: string, restOfMessage: string, output: string }
{
  if (message.startsWith("&&"))
    return { restOfMessage: message.substr(2), output: "&" };

  if (message.startsWith("&_"))
    return { color: baseColor, restOfMessage: message.substr(2), output: "" };

  if (message.startsWith("&"))
  {
    const code = message.substring(0, 2);
    const color = colors[code];

    if (color !== undefined)
      return { color, restOfMessage: message.substr(2), output: "" };
  }

  return { restOfMessage: message.substr(1), output: message.charAt(0) };
}

// Creates a series of colored <span> elements.
function parseColors(message: string, baseColor: string): string
{
  const peekResult = peek(message, baseColor);
  const color = peekResult.color ? peekResult.color : baseColor;

  let html = "";

  html += openSpan(color);
  html += escape(peekResult.output);
  html += parseRestOfMessage(peekResult.restOfMessage, baseColor);
  html += closeSpan();

  return html;
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
    html += closeSpan();
    html += openSpan(peekResult.color);
  }

  html += escape(peekResult.output);
  html += parseRestOfMessage(peekResult.restOfMessage, baseColor);

  return html;
}

function hasNoColors(message: string): boolean
{
  return !message.includes("&");
}