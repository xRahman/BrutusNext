/*
  Part of BrutusNEXT

  Implements ability to convert mud colored message (like '&Rhealth&g')
  to respective html (using <span> elements).
*/

'use strict';

import Component = require('../component/Component');

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

abstract class MudColorComponent extends Component
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  public static get DEFAULT_COLOR() { return Colors['&w']; }

  public static get COLOR_CODE_COLOR() { return 'rgb(78,78,0)'; }

  // --------------- Protected methods ------------------

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  // -> Returns html that creates the element.
  protected htmlizeMudColors(message: string, baseColor: string = null)
  {
    // If 'baseColor' is provided, use it.
    if (baseColor !== null)
      return this.parseMudColors(message, baseColor);

    // Otherwise read it from the begenning of the 'message' first.
    return this.parseBaseColorAndMudColors(message);
  }

  // ---------------- Private methods -------------------

  // -> Returns html rgb code if two characters on 'index'
  //    represent a color code, 'null' otherwise.
  private parseColorCode(colorCode: string, baseColor: string)
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

  private closeSpanIfOpen(parser: { html: string, spanOpen: boolean })
  {
    if (parser.spanOpen === true)
    {
      parser.html += '</span>';
      parser.spanOpen = false;
    }
  }

  private openSpanIfClosed
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    color: string = null
  )
  {
    if (color === null)
      color = parser.activeColor;

    if (parser.spanOpen === false)
    {
      parser.html += '<span style="'
                  +    'color:' + color + ';'
                  +    'font-family:CourrierNewBold;'
                  +  '">';

      parser.spanOpen = false;
    }
  }

  // Adds 'characters' string to resulting html.
  private outputCharacters
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    characters: string,
    color: string = null
  )
  {
    this.openSpanIfClosed(parser, color);
    parser.html += characters;
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private outputEscapedColorCode
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    colorCode: string
  )
  {
    this.closeSpanIfOpen(parser);

    this.outputCharacters
    (
      parser,
      colorCode,
      // Use special color to distiguish escaped color codes.
      MudColorComponent.COLOR_CODE_COLOR
    );

    // Skip parsing of the next two characters because
    // we have just outputed them in advance.
    return 2;
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private parseEscapedColorCode
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    message: string,
    index: number,
    baseColor: string
  )
  {
    // Take a peak at the two following characters.
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
  private parseAmpersand
  (
    parser: { html: string, spanOpen: boolean, activeColor: string },
    message: string,
    index: number,
    baseColor: string
  )
  {
    // Check if thre is a color code at position 'index'.
    let colorCode = message.substr(index, 2);
    let color = this.parseColorCode(colorCode, baseColor);

    // If there is a color code.
    if (color !== null)
    {
      this.closeSpanIfOpen(parser);

      // Update the active color. The <span> tag will
      // be opened by parsing the next character.
      parser.activeColor = color;

      // Skip the next character
      // (because it is a part of color code).
      return 1;
    }

    return this.parseEscapedColorCode(parser, message, index, baseColor);
  }

  // -> Returns number of extra parsed characters that need
  //    to be skipped in the main cycle.
  private parseCharacter
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

  private parseMudColors(message: string, baseColor: string)
  {
    if (message.length === 0)
      return "";

    let parser = 
    {
      // Resulting html string. We start by an opening <div> tag.
      html: '<div>',
      // Flag to indicate if we have a <span> tag open.
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

    parser.html += '</div>';

    return parser.html;
  }

  // -> Returns htmlized message.
  private parseBaseColorAndMudColors(message: string)
  {
    // Check the very beginning of the message for a color code.
    let code = message.substr(0, 2);
    // If the string begins with '&_' (which means 'return to base color'),
    // use DEFAULT_COLOR as base color.
    let baseColor = this.parseColorCode(code, MudColorComponent.DEFAULT_COLOR);

    // If there isn't a color code at the start at the string,
    // use DEFAULT_COLOR as base color.
    if (baseColor === null)
      return this.parseMudColors(message, MudColorComponent.DEFAULT_COLOR);

    // If there is a color code, use it. Also skip the first
    // two characters because we don't have to parse it again.
    return this.parseMudColors(message.substr(2), baseColor);
  }
}

export = MudColorComponent;