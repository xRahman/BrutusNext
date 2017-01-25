/*
  Part of BrutusNEXT

  Implements ability to convert mud colored message (like '&Rhealth&g')
  to respective html (using <span> elements).
*/

'use strict';

import Component = require('../component/Component');

const Colors =
{
  '&k': '#000',	    // black
  '&K':	'#6E6E6E',  // bright black
  '&r':	'#bf1b00',  // red
  '&R':	'#ff193f',  // bright red
  '&g':	'#00ac00',  // green
  '&G':	'#a1e577',  // bright green
  '&y':	'#DAA520',  // yellow		
  '&Y':	'#f3df00',  // bright yellow
  '&b':	'#1f68d5',  // blue
  '&B':	'#3680ee',  // bright blue
  '&m':	'#a501a7',  // magenta
  '&M':	'#e100e4',  // bright magenta
  '&c':	'#01c8d4',  // cyan
  '&C':	'#5bedf6',  // bright cyan
  '&w':	'#dbdbdb',  // off-white
  '&W':	'#fff'	    // bright white
}

abstract class MudColorComponent extends Component
{
  // Default base color that will be used if a message doesn't
  // start with a color code.
  public static get DEFAULT_COLOR() { return Colors['&w']; }

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

    console.log('newlineAndColorSplit.length: ' + newlineAndColorSplit.length);

    // And finaly generate a html based on resulting auxiliary data
    // structure.
    return this.composeMessageHtml(newlineAndColorSplit);
  }

  // ---------------- Private methods -------------------

  // -> Returns 'null' if two characters on 'index'
  //    don't represent a color code, hexadecimal rgb code
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

  /*
  private isColorCode(line: string, ampersandPos: number)
  {
    let color = this.parseColorCode(line, ampersandPos);

    // Check there really is a color code at 'ampersandPos'.
    if (color === undefined)
      return null;

    // If it is a color code, we have found what we were
    // looking for, so let's return the results.
    let result = 
    {
      position: ampersandPos,
      color: color
    };

    return result;
  }
  */

  /*
  private findNextColorCode(line: string)
  {
    let ampersandPos = null;
    let searchFrom = 0;

    do
    {
      // Find next color code.
      ampersandPos = line.indexOf('&', searchFrom);

      // If there is an ampersand in the rest of the string.
      if (ampersandPos !== -1)
      {
        let result = this.isColorCode(line, ampersandPos);

        if (result !== null)
          return result;

        // If we found an ampersand but it's not part of a color
        // code, repeat the search from the next character.
        searchFrom = ampersandPos + 1;
      }
    }
    // Thy cycle ends when there is no ampersand left
    // in the line of text.
    while (ampersandPos !== -1);

    return null;
  }
  */

  /*
  private parseColorSegment(line: string)
  {
    let result =
    {
      sameColorSegment: null,
      restOfLine: null,
      nextColor: null
    }

    /// TODO
    // TODO: Find next color code.
    let nextAmpersandPos = mudText.indexOf('&');

    if (nextAmpersandPos !== -1)
    {
      let color = this.parseColorCode(mudText, nextAmpersandPos);

      if (color !== undefined)
      {
        result.sameColorSegment = mudText.substring(0, nextAmpersandPos);
        // To the rest of the string.
        result.restOfLine = mudText.substr(nextAmpersandPos + 2);
        result.nextColor = color;
      }
    }
  }
  */

  /*
  // 'baseColor' is what '&_' code will translate to,
  // 'trailingColor' is the last color on a previous line
  //  (or a baseColor if we are processing the first line
  //   of the message).
  private parseRestOfLine
  (
    baseColor: string,
    trailingColor: string,
    line: string
  )
  {
    let segmentParseResult = this.parseColorSegment(line);

    let html = '<span style="color:' + trailingColor + ';'
             +   'font-family:CourrierNewBold;">'

             +     segmentParseResult.sameColorSegment

             + '</span>';

    let restOfLineParseResult = this.parseRestOfLine
    (
      baseColor,
      segmentParseResult.nextColor,
      segmentParseResult.restOfLine
    );

    let result =
    {
      html: html + restOfLineParseResult.html,
      trailingColor: restOfLineParseResult.trailingColor
    };

    return result;
  }

  private parseMessageLines(message: string, baseColor: string)
  {
    let lines = message.split('\r\n');
    let html = '';
    // 'baseColor' will also serve as 'trailingColor' for the first line.
    let trailingColor = baseColor;

    // Parse the message, line by line.
    for(let line of lines)
    {
      let parseResult = this.parseRestOfLine(baseColor, trailingColor, line);

      // Each line of mud message will be represented by series of
      // <span> elements (one for each color change) followed
      // by <br>.      
      html += parseResult.html + '<br />';
      trailingColor = parseResult.trailingColor;
    }

    return html;
  }

  private parseMessage(message: string)
  {
    // First check the very beginning of the message for a color code.
    // If the message doesn't start with a color code (which shouldn't
    // happen), MudColorComponent.DEFAULT_COLOR will be used.
    let baseColor = this.parseBaseColor(message);

    if (baseColor !== null)
      // Cut-off the leading color code.
      message = message.substr(2);

    return this.parseMessageLines(message, baseColor);
  }
  */

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

  private parseColorSegment(message: string, baseColor: string)
  {
    let searchFrom = 0;
    let ampersandPos = -1;
    let nextColor = null;

    do
    {
      // Find next '&' character.
      ampersandPos = message.indexOf('&', searchFrom);

      // (parseColorCode() returns 'null' if there isn't a color code
      //  at the specified index).
      nextColor = this.parseColorCode(message, ampersandPos, baseColor);

      // If we found an ampersand but it's not part of a color
      // code, we will repeat the search from the next character.
      searchFrom = ampersandPos + 1;
    }
    // Repeat the cycle if we found an ampersand but it's not a color code.
    while ((ampersandPos !== -1) && (nextColor === null));

    let result =
    {
      // If we didn't find a color code, segment will cover whole message.
      message: message,
      nextColor: nextColor
    };

    // If we have found a color, segemnt will end one character before
    // the ampersand position.
    if (nextColor !== null)
      result.message = message.substr(0, ampersandPos - 1);

    return result;
  }

  private parseColorSegments(message: string, baseColor: string)
  {
    let result = [];
    // The fist segment uses message base color.
    let segmentColor = baseColor;
    let parseResult = null;

    do
    {
      parseResult = this.parseColorSegment(message, baseColor);

      console.log('parseResult.message: ' + parseResult.message);

      let colorSegment =
      {
        color: segmentColor,
        message: parseResult.message
      }
      result.push(colorSegment);

      // Cut the parsed segment off the message.
      message = message.substr(parseResult.message.length);

      // Next message segment will use the color that we have
      // parsed at the end of our segment.
      segmentColor = parseResult.nextColor;
    }
    while (message.length > 0);

    return result;
  }

  // If 'baseColor' is 'null', the color from the start of the message
  // (or a default color) will be used (that's how common mud messages
  //  are handled).
  private splitByColors(message: string, baseColor: string)
  {
    console.log('splitByColors(), message: ' + message);

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

    let split = segment.message.split('\r\n');

    for (let messagePart of split)
    {
      let lineFragment =
      {
        color: segment.color,
        message: messagePart
      }

      console.log('Pushing lineFragment, message: ' + lineFragment.message);

      result.push(lineFragment);
    }

    console.log('result.length: ' + result.length);

    return result;
  }

  private splitByNewlines
  (
    colorSplit: Array<{ color: string, message: string }>
  )
  {
    let result = [];

/// TODO: Concat kopiruje do noveho pole, asi by bylo lepsi si napsat
/// vlastni mergovani.
    for (let segment of colorSplit)
      result = result.concat(this.splitSegmentByNewlines(segment));

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
    messageData: Array<{ color: string, message: string }>
  )
  {
    let html = "";

    console.log('messageData.length: ' + messageData.length);

    for (let i = 0; i < messageData.length; i++)
    {
      console.log('messageData[i].color: ' + messageData[i].color);
      console.log('messageData[i].message: ' + messageData[i].message);

      html += this.composeLineFragmentHtml(messageData[i]);

      console.log('inner html: ' + html);

      // We don't have to add <br> tag after the last line
      // fragment, because whole message is inside a <div>
      // element, which is a block element so it will look
      // like a new line anyways.
      if (i < messageData.length - 1)
        html += '<br />';
    }

    return html;
  }

  private composeMessageHtml
  (
    messageData: Array<{ color: string, message: string }>
  )
  {
    // Each mud message is put into a <div> element.
    let html = '<div>'
      +           this.composeInnerHtml(messageData)
      +        '</div>';

    console.log('message html: ' + html);

    return html;
  }
}

export = MudColorComponent;