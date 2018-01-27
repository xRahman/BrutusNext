/*
  Part of BrutusNEXT

  Implements ability to convert mud colored message (like '&Rhealth&g')
  to respective html (using <span> elements).
*/

'use strict';

/// Color test: &kA&KB&rC&RD&gE&GF&yG&YH&bI&BJ&mK&ML&cM&CN&wO&WP
const Colors =
{
  '&k': 'rgb(48,48,48)',	  // black
  '&K':	'rgb(102,102,102)', // bright black
  '&r':	'rgb(158,0,0)',     // red
  '&R':	'rgb(255,30,30)',   // bright red
  '&g':	'rgb(0,158,0)',     // green
  '&G':	'rgb(30,255,30)',   // bright green
  '&y':	'rgb(158,158,0)',   // yellow		
  '&Y':	'rgb(255,255,30)',  // bright yellow
  '&b':	'rgb(0,0,158)',     // blue
  '&B':	'rgb(30,30,255)',   // bright blue
  '&m':	'rgb(158,0,158)',   // magenta
  '&M':	'rgb(255,30,255)',  // bright magenta
  '&c':	'rgb(0,158,158)',   // cyan
  '&C':	'rgb(30,255,255)',  // bright cyan
  '&w':	'rgb(188,188,188)', // off-white
  '&W':	'rgb(255,255,255)'	// bright white
}

export abstract class MudColors
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  public static get DEFAULT_COLOR() { return Colors['&w']; }

  // Color of escaped color codes (like '&&R').
  public static get COLOR_CODE_COLOR() { return 'rgb(78,78,0)'; }

  // Color of user commands reprinted to scrollwindow output.
  public static get COMMAND_ECHO_COLOR() { return 'rgb(128,64,64)'; }
  /*
  // If you send a command, it will be printed to output using this font.
  public static get COMMAND_ECHO_FONT() { return 'CourierNew'; }
  */

  /// Not used yet.
  // Color of client messages (like 'Attempting to reconnect').
  public static get CLIENT_MESSAGE_COLOR() { return 'rgb(0,128,255)'; }

  /// Not used yet.
  // Color of hypertext links in client messages.
  public static get CLIENT_LINK_COLOR() { return 'rgb(0,191,255)'; }

  // Color of form input problems like "Name is too short".
  public static get PROBLEM_TEXT_COLOR() { return '&R'; }

  // Color of recommendation text (it should really stand out).
  public static get RECOMMENDATION_TEXT_COLOR() { return '&Y'; }

  // ------------- Public static methods ---------------- 

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  // For colorless messages, no color is specified unless 'baseColor' is
  // provided. It means that text color or parent html element is used.
  // -> Returns html that creates the element.
  public static htmlize(message: string, baseColor: (string | null) = null)
  {
    if (this.hasNoColors(message))
      return this.htmlizeColorlessMessage(message, baseColor);

    let baseColorParseResult =
    {
      offset: 0,
      baseColor: baseColor
    };

    // If 'baseColor' isn't provided, read it from
    // the beginning of the message.
    if (baseColor)
      baseColorParseResult = this.parseBaseColor(message);
    
    // Skip the characters we have already parsed.
    if (baseColorParseResult.offset !== 0)
      message = message.substr(baseColorParseResult.offset);
    
    // Encapsulate the result in one more <span> element so it
    // behaves as a single html element.
    return "<span>" + this.parseMudColors(message, baseColor) + "</span>";

    // // If 'baseColor' is provided, use it.
    // if (baseColor !== null)
    //   return this.parseMudColors(message, baseColor);

    // // Otherwise read it from the begenning of the 'message' first.
    // return this.parseBaseColor(message);
  }

  // ------------ Protected static methods --------------

  // ------------- Private static methods ---------------

  // -> Returns html rgb code if two characters on 'index'
  //    represent a color code, 'null' otherwise.
  private static parseColorCode(colorCode: string, baseColor: string)
  {
    // '&_' means 'baseColor'
    // (which is usually the color at the start of the message).
    if (colorCode === '&_')
      return baseColor;

    let htmlColor = Colors[colorCode];

    if (htmlColor === undefined)
      return null;

    return htmlColor;
  }

  private static closeSpanIfOpen(parser: { html: string, spanOpen: boolean })
  {
    if (parser.spanOpen === true)
    {
      parser.html += '</span>';
      parser.spanOpen = false;
    }
  }

  // Regularly, 'parser.activeColor' (which is obtained by parsing
  // color codes from in the message) will be used with opening
  // tag. If you provide a 'color' param, it will be used instead
  // (without modifying parser.activeColor value, so the next opened
  // <span> tag will use parser.activeColor again).
  private static openSpanIfClosed
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    color: (string | null) = null
  )
  {
    if (color === null)
      color = parser.activeColor;

    if (parser.spanOpen === false)
    {
      parser.html += '<span style="'
                  +    'color:' + color
                  +  '">';

      parser.spanOpen = true;
    }
  }

  // Adds 'characters' string to resulting html coloured with
  // 'color' if you provide it or 'parser.activeColor' if you don't.
  private static outputCharacters
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    characters: string,
    color: (string | null) = null
  )
  {
    this.openSpanIfClosed(parser, color);
    parser.html += characters;
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private static outputEscapedColorCode
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    colorCode: string
  )
  {
    this.closeSpanIfOpen(parser);

    // This will also open a <span> tag.
    this.outputCharacters
    (
      parser,
      colorCode,
      // Use special color to distiguish escaped color codes.
      MudColors.COLOR_CODE_COLOR
    );

    this.closeSpanIfOpen(parser);

    // Skip parsing of two extra characters because
    // we have just outputed them in advance.
    return 2;
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private static parseEscapedColorCode
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    message: string,
    index: number,
    baseColor: string
  )
  {
    // Take a peek at the two following characters.
    let colorCode = message.substr(index + 1, 2);
    let color = this.parseColorCode(colorCode, baseColor);

    if (color === null)
    {
      // It there isn't a color code after '&' character
      // and it isn't part of color code itself, treat
      // it just like a regular character.
      this.outputCharacters(parser, '&');

      // Don't skip any extra characters.
      return 0;
    }

    // If there is a color code after a '&' (so it's something like '&&r'),
    // we output it as an unescaped color code ('&r') using special color.
    return this.outputEscapedColorCode(parser, colorCode);
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private static parseAmpersand
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    message: string,
    index: number,
    baseColor: string
  )
  {
    // Check if there is a color code at position 'index'.
    let colorCode = message.substr(index, 2);
    let color = this.parseColorCode(colorCode, baseColor);

    // If there is a color code.
    if (color !== null)
    {
      this.closeSpanIfOpen(parser);

      // Update the active color.
      // (We don't open next <span> tag here, it will be
      // opened automatically by parsing the next character.
      parser.activeColor = color;

      // Skip one extra character
      // (because we have just parsed a color code which is
      // two character long).
      return 1;
    }

    return this.parseEscapedColorCode(parser, message, index, baseColor);
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private static parseCharacter
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    message: string,
    index: number,
    baseColor: string
  )
  {
    let ch = message.substr(index, 1);

    switch(ch)
    {
      case '&':
        // Return the number of extra parsed characters to be skipped).
        return this.parseAmpersand(parser, message, index, baseColor);

      case '\n':
        this.closeSpanIfOpen(parser);
        parser.html += '<br />';
        break;

      default:
        this.outputCharacters(parser, ch);
        break;
    }

    // Don't skip any extra characters.
    return 0;
  }

  // Creates a series of colored <span> elements.
  private static parseMudColors(message: string, baseColor: string)
  {
    if (message.length === 0)
      return "";

    let parser = 
    {
      // Start with empty string.
      html: "",
      // Flag to indicate that we have a <span> tag open.
      spanOpen: false,
      // 'baseColor' is the first color used in the string.
      activeColor: baseColor
    }
    
    for (let i = 0; i < message.length; i++)
    {
      // It is possible that more than 1 character is parsed.
      // The extra parsed ones are skipped.
      i += this.parseCharacter(parser, message, i, baseColor);
    }

    this.closeSpanIfOpen(parser);

    return parser.html;
  }

  // -> Returns htmlized message.
  private static parseBaseColor(message: string)
  {
    let offset = 2;
    // Check the very beginning of the message for a color code.
    let code = message.substr(0, offset);
    // If the message begins with '&_' (which means 'return to base color'),
    // use DEFAULT_COLOR as base color.
    let baseColor = this.parseColorCode(code, MudColors.DEFAULT_COLOR);

    // If there isn't a color code at the start at the message,
    // use DEFAULT_COLOR as base color.
    if (baseColor === null)
    {
      offset = 0;
      baseColor = MudColors.DEFAULT_COLOR;
    }

    // // If there is a color code, use it. Also skip the first
    // // two characters because we don't have to parse it again.
    // return this.parseMudColors(message.substr(2), baseColor);

    return { baseColor: baseColor, offset: offset };
  }

  private static hasNoColors(message: string)
  {
    if (!message)
      return true;

    return message.indexOf('&') === -1;
  }

  // -> Returns <span> element containing 'message'.
  private static htmlizeColorlessMessage(message: string, baseColor: string)
  {
    // Treat 'undefined' or 'null' value as ""
    // (to prevent outputing words 'undefined' or 'null').
    if (!message)
      message = "";

    if (baseColor)
      return '<span style="color:' + baseColor + '">' + message + "</span>";

    return "<span>" + message + "</span>";
  }
}