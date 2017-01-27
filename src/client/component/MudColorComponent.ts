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
  '&k': '#2f2f2f',	// black
  '&K':	'#8f8f8f',  // bright black
  '&r':	'#9e0000',  // red
  '&R':	'#ff1e1e',  // bright red
  '&g':	'#009e00',  // green
  '&G':	'#1eff1e',  // bright green
  '&y':	'#9e9e00',  // yellow		
  '&Y':	'#ffff1e',  // bright yellow
  '&b':	'#00009e',  // blue
  '&B':	'#1e1eff',  // bright blue
  '&m':	'#9e009e',  // magenta
  '&M':	'#ff1eff',  // bright magenta
  '&c':	'#009e9e',  // cyan
  '&C':	'#1effff',  // bright cyan
  '&w':	'#cfcfcf',  // off-white
  '&W':	'#ffffff'	  // bright white
}

abstract class MudColorComponent extends Component
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  public static get DEFAULT_COLOR() { return Colors['&w']; }

  public static get COLOR_CODE_COLOR() { return '008080'; }

  // --------------- Protected methods ------------------

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  // -> Returns html that creates the element.
  protected htmlizeMudColors(message: string, baseColor: string = null)
  {
    // First split message to segements with same color code.
    let colorSplit = this.splitByColors(message, baseColor);

    // Now split each sam-color segment to smaller parts divided
    // by newlines.
    let newlineAndColorSplit = this.splitByNewlines(colorSplit);

    // And finaly generate a html based on resulting auxiliary data
    // structure.
    return this.composeMessageHtml(newlineAndColorSplit);
  }

  // ---------------- Private methods -------------------

  // -> Returns 'null' if two characters on 'index'
  //    don't represent a color code, html rgb code
  //    otherwise.
  private parseColorCode(message: string, index: number, baseColor: string)
  {
    let mudColorCode = message.substr(index, 2);

    // '&_' means 'color at the start of the message'.
    if (mudColorCode === '&_')
      return baseColor;

    let htmlColor = Colors[mudColorCode];

    if (htmlColor === undefined)
      return null;

    return htmlColor;
  }

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  private parseBaseColor(message: string)
  {
    // Check the very beginning of the message for a color code.
    // (parseColorCode() returns 'null' if there isn't a color code
    //  at the specified index).
    // (We pass empty string as the third parameter (baseColor),
    // because message is not supposed to start with '&_' (it
    // means 'the color at the start of the message'). If it
    // does anyways, parseColorCode() will return our "" value).
    let baseColor = this.parseColorCode(message, 0, "");

    // Default color code length is 2 characters.
    let codeLength = 2;

    if (baseColor === null)
      // If there hasn't been a color code at after all, it's length is zero.
      codeLength = 0;

    // If there isn't a color code at the start of the message
    // of it there is a '&_', we will use default base color.
    if (baseColor === null || baseColor === "")
    {
      // Default base color (if the string doesn't start with a color code).
      baseColor = MudColorComponent.DEFAULT_COLOR;
    }

    let result =
    {
      baseColor: baseColor,
      codeLength: codeLength
    }

    return result;
  }

  private checkColorAtPos
  (
    result:
    {
      message: string,
      nextColor: string,
      parsedChars: number,
      escapedColorCode: boolean
    },
    message: string,
    ampersandPos: number,
    baseColor: string
  )
  {
    /// TEST
    /*
    if (result.escapedColorCode === true)
    {
      result.message += 2;
      result.nextColor = null;
      result.parsedChars += 2;
      result.escapedColorCode = false;

      return result;
    }
    */   

    let color = this.parseColorCode(message, ampersandPos, baseColor);

    if (color !== null)
    {
      console.log('message: ' + message);
      console.log('(from pos: ' + result.parsedChars + ' to pos: ' + ampersandPos);
      result.message += message.substring(result.parsedChars, ampersandPos);
      console.log('result.message: ' + result.message);
      result.nextColor = color;
      // +2 characters of color code.
      result.parsedChars = ampersandPos + 2;
    }

    return result;
  }

  private checkColorAfterPos
  (
    result:
    {
      message: string,
      nextColor: string,
      parsedChars: number,
      escapedColorCode: boolean
    },
    message: string,
    ampersandPos: number,
    baseColor: string
  )
  {
    let color = this.parseColorCode(message, ampersandPos + 1, baseColor);

    // '&' followed by color code forces the color code to be printed.
    // ('&&r' will be printed as '&r').
    if (color !== null)
    {
      // Escaped color codes are printed using special color.
      result.nextColor = MudColorComponent.COLOR_CODE_COLOR;
      // +1 to skip the first ampersand.
      result.parsedChars = ampersandPos + 1;
      // We also have to remember that we have found an escaped color code.
      result.escapedColorCode = true;
    }

    ///result.nextColor = null;

    return result;
  }

  private parseNextAmpersand
  (
    result:
    {
      message: string,
      nextColor: string,
      parsedChars: number,
      escapedColorCode: boolean
    },
    message: string,
    baseColor: string
  )
  {
    // Find next '&' character (search from position 'result.parsedChars').
    let ampersandPos = message.indexOf('&', result.parsedChars);

    // If there is no ampersand in the rest of message,
    // segment will extend to the end.
    if (ampersandPos === -1)
    {
      result.message = message.substr(result.parsedChars);
      result.nextColor = null;
      result.parsedChars = message.length;
      result.escapedColorCode = false;

      return result;
    }

    // Check if there is a color code at 'ampersandPos'.
    result = this.checkColorAtPos(result, message, ampersandPos, baseColor);

    /// TEST:
    return result;
    /*
    if (result.nextColor !== null)
      return result;

    // Check if there is a color code at 'ampersandPos + 1'.
    return this.checkColorAfterPos(result, message, ampersandPos, baseColor);
    */
  }

  private parseColorSegment
  (
    result:
    {
      message: string,
      nextColor: string,
      parsedChars: number,
      escapedColorCode: boolean
    },
    message: string,
    baseColor: string
  )
  {
    do
    {
      result = this.parseNextAmpersand(result, message, baseColor);
    }
    // Repeat if we didn't found a color and didn't parsed whole message yet.
    while (result.nextColor === null && result.parsedChars < message.length);

    return result;
  }

  private parseColorSegments(message: string, baseColor: string)
  {
    let result = [];
    // The fist segment uses message base color.
    let segmentColor = baseColor;
    let parseResult =
    {
      message: "",
      nextColor: null,
      parsedChars: 0,
      escapedColorCode: false
    };

    do
    {
      // Find next position in message where color changes.
      parseResult = this.parseColorSegment(parseResult, message, baseColor);

      let colorSegment =
      {
        color: segmentColor,
        message: parseResult.message
      };
      
      // Zero-length segment can occur for example if there are
      // two color codes right next to each other (like &r&bHELLO).
      // (the first one will be parsed as zero-length segment)
      if (colorSegment.message.length > 0)
        result.push(colorSegment);

      // Next message segment will use the color that we have
      // parsed at the end of our segment.
      //   This is not done if the segment is an escaped color
      // code, because such segments use a special color and
      // we need to return to previous color.
      if (parseResult.escapedColorCode === false)
        segmentColor = parseResult.nextColor;
    }
    while (parseResult.parsedChars < message.length);

    return result;
  }

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  private splitByColors(message: string, baseColor: string)
  {

    // If we have been provided by 'baseColor', let's just use it.
    if (baseColor !== null)
      return this.parseColorSegments(message, baseColor);

    // Otherwise we have to read it from the begenning of the 'message'.
    //   If the message doesn't start with a color code (which shouldn't
    // happen), MudColorComponent.DEFAULT_COLOR will be used.
    let parseResult = this.parseBaseColor(message);

    if (parseResult.codeLength !== 0)
      // Cut-off the leading color code.
      message = message.substr(parseResult.codeLength);

    return this.parseColorSegments(message, parseResult.baseColor);
  }

  private splitSegmentByNewlines
  (
    segment: { color: string, message: string }
  )
  {
    let result = [];

    let split = segment.message.split('\n');

    for (let i = 0; i < split.length; i++)
    {
      let lineFragment =
      {
        color: segment.color,
        message: split[i],
        // When we split a string by '\r\n', the last part
        // won't be followed by a newline - if the string ended
        // with '\r\n', the last part will be empty string ('').
        newLine: (i < split.length - 1)
      }

      result.push(lineFragment);
    }

    return result;
  }

  private splitByNewlines
  (
    colorSplit: Array<{ color: string, message: string }>
  )
  {
    let result = [];

    for (let segment of colorSplit)
    {
      let lineSegments = this.splitSegmentByNewlines(segment);

      for (let lineSegment of lineSegments)
        result.push(lineSegment);
    }

    return result;
  }

  private composeLineFragmentHtml
  (
    lineFragment: { color: string, message: string }
  )
  {
    return '<span style="color:' + lineFragment.color + ';'
      +                 'font-family:CourrierNewBold;">'
      +       lineFragment.message
      +    '</span>';
  }

  private composeInnerHtml
  (
    messageData: Array<{ color: string, message: string, newLine: boolean }>
  )
  {
    let html = "";

    for (let i = 0; i < messageData.length; i++)
    {
      // We don't have to create a <span> tags for empty segments
      // (but we still need to add <br> tag if such segment is
      //  followed by newLine).
      if (messageData[i].message !== "")
        html += this.composeLineFragmentHtml(messageData[i]);

      let isLast = (i === messageData.length - 1);

      // Only add a newline after segments that are flagged so.
      //   We also don't have to add <br> tag after the last
      // line fragment, because whole message is inside a <div>
      // element, which is a block element so it will look
      // like a new line anyways.
      if (messageData[i].newLine && !isLast)
        html += '<br />';
    }

    return html;
  }

  private composeMessageHtml
  (
    messageData: Array<{ color: string, message: string, newLine: boolean }>
  )
  {
    // Each mud message is put into a <div> element.
    let html = '<div>'
      +           this.composeInnerHtml(messageData)
      +        '</div>';

    return html;
  }
}

export = MudColorComponent;