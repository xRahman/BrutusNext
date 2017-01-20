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
  '&W':	'#fff',	    // bright white
  ///'39': '#dbdbdb',  //default
}

abstract class MudColorComponent extends Component
{
  // --------------- Protected methods ------------------

  // -> Returns html that creates the element.
  protected htmlizeMudColors(mudText: string)
  {
    let html = '<div>' + this.parse(mudText) + '</div>';

    return html;
  }

  // ---------------- Private methods -------------------

  // -> Returns 'undefined' if two characters on 'index'
  //    don't represent a color code, hexadecimal rgb code
  //    otherwise.
  private parseColorCode(line: string, index: number)
  {
    let colorCode = line.substr(index, 2);

    return Colors[colorCode];
  }

  private parseRestOfLine(color: string, restOfLine: string)
  {
    // TODO: Find next color code.
    let nextAmpersandPos = line.indexOf('&');

    if (ampersandPos !== -1)
    {
      ...
    }


    let html = '<span style="color:' + color + ';'
             +   'font-family:CourrierNewBold;">'

             +     textUpToNextColorCode

             + '</span>';

    html += this.parseRestOfLine(nextColor, newRestOfLine);

    return html;
  }

  private parseLine(line: string)
  {
    // First check the very beginning of the line for a color code
    let baseColor = this.parseColorCode(line, 0);
    // If the line starts with color code, 'useful text' will start
    // at this position.
    let startPos = 2;

    // Default base color (if the string doesn't start with a color code).
    if (baseColor === undefined)
    {
      startPos = 0;
      baseColor = Colors['&w'];
    }

    // Recursively parse the rest of the line (returns html).
    return this.parseRestOfLine(baseColor, line.substr(startPos));

    /*
    let ampersandPos = line.indexOf('&');

    if (ampersandPos !== -1)
    {
      let colorCode = line.substr(ampersandPos, 2);

      let rgbColor = Colors[colorCode];

      if (rgbColor !== undefined)
      {

      }
    }

    +   '<span style="color:green;font-family:CourrierNewBold;">'
    +      mudText
    +   '</span>'
    */
  }

  private parse(mudText: string)
  {
    let html = '';
    let lines = mudText.split('\r\n');

    for(let line of lines)
      html += this.parseLine(line) + '<br />';

    return html;
  }
}

export = MudColorComponent;