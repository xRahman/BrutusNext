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

    ///console.log('newlineAndColorSplit.length: ' + newlineAndColorSplit.length);

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

  private parseColorSegment(message: string, baseColor: string)
  {
    let searchFrom = 0;
    let ampersandPos = -1;
    let prevAmpersandPos = -1;
    let nextColor = null;
    let parsedCharacters = 0;

    /// ARGH, nejde mi to :\
    /// BIG TODO
    /*
      Možná by bylo lepší výsledný string postupně appendovat,
      než ze zdroje za běhu vyřezávat ampersandy.
    */

    do
    {
      prevAmpersandPos = ampersandPos;

      // Find next '&' character.
      ampersandPos = message.indexOf('&', searchFrom);
      
      // (parseColorCode() returns 'null' if there isn't a color code
      //  at the specified index).
      nextColor = this.parseColorCode(message, ampersandPos, baseColor);

      // If the color is immediately preceded by another '&'
      // (so we have something like '&&r'), color code will not be
      // translated to html color but rather printed as '&r'.
      let isPreampersanded =
        prevAmpersandPos >= 0 && prevAmpersandPos === ampersandPos - 1;

      // But only do that for actuall color codes (like '&&r')
      // (expressions like 'if (a && b)' won't be changed).
      if (nextColor !== null && isPreampersanded)
      {
        ampersandPos = prevAmpersandPos;

        console.log('message before cut: ' + message);

        // Remove one of the ampersands from the message
        // (so '&r' is printed instead of '&&r').
        message =
          message.substr(0, ampersandPos) + message.substr(ampersandPos + 1);

        // Removed '&' counts as one parsed character.
        parsedCharacters += 1;

        console.log('message after cut: ' + message);

        // Pretend that we didn't see the color code.
        nextColor = null;
      }

      // If we found an ampersand but it's not part of a color
      // code, we will repeat the search from the next character.
      searchFrom = ampersandPos + 1;
    }
    // Repeat the cycle if we have found an ampersand but it's not
    // a color code.
    while ((ampersandPos !== -1) && (nextColor === null));

    let result =
    {
      // If we didn't find a color code, segment will cover whole message.
      message: message,
      nextColor: nextColor,
      parsedCharacters: parsedCharacters
    };

    // If we have found a color, segemnt will end before the ampersand
    // position.
    if (nextColor !== null)
      result.message = message.substr(0, ampersandPos);

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

      ///console.log('parseResult.message: ' + parseResult.message);

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

      // Cut off the parsed segment.
      message = message.substr(parseResult.parsedCharacters);

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
    ///console.log('splitByColors(), message: ' + message);

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

      /*
      console.log('Pushing lineFragment, message: ' + lineFragment.message
        + ' split length: ' + split.length + ' i: ' + i
        + ' newLine:' + lineFragment.newLine);
      */

      result.push(lineFragment);
    }

    ///console.log('result.length: ' + result.length);

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

    ///console.log('messageData.length: ' + messageData.length);

    for (let i = 0; i < messageData.length; i++)
    {
      ///console.log('messageData[i].color: ' + messageData[i].color);
      ///console.log('messageData[i].message: ' + messageData[i].message);

      // We don't have to create a <span> tags for empty segments
      // (but we still need to add <br> tag if such segment is
      //  followed by newLine).
      if (messageData[i].message !== "")
        html += this.composeLineFragmentHtml(messageData[i]);

      ///console.log('inner html: ' + html);

      let isLast = (i === messageData.length - 1);

      ///console.log('CRLF: ' + messageData[i].newLine);

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

    ///console.log('message html: ' + html);

    return html;
  }
}

export = MudColorComponent;