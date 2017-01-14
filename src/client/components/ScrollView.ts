/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import Window = require('../components/Window');

import $ = require('jquery');

class ScrollView extends Window
{
  public static get CONTENT_CSS_CLASS() { return 'ScrollViewContent'; }
  public static get OUTPUT_CSS_CLASS() { return 'ScrollViewOutput'; }
  public static get INPUT_CSS_CLASS() { return 'ScrollViewInput'; }

  /*
  constructor()
  {
    super();
  }
  */

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  /// TODO: Kdyz bych chtel mit vic scrollView oken (jako ze jo,
  //    budu chtit logovat imma a mortala najednou), tak Tohle
  //  budu muset setovat zvenku (nebo nejak automaticky inkrementovat).
  protected id = 'scrollview';

  //------------------ Private data ---------------------


  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Client.getInstance()

  /// Example
  /*
  public static get game()
  {
    return Server.getInstance().game;
  }
  */
  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getOutputId() { return this.id + '_output'; }
  public getInputId() { return this.id + '_input'; }

  // ---------------- Public methods --------------------

  public appendMessage(message: string)
  {
    let messageHtml = this.createMessageHtml(message);

    // We have to user jquery and append element as html
    // instead of using document.create(), element.append()
    // is asynchronous so scroll area wound't be updated
    // right after calling it. Using jquery.append(), on
    // the other hand, is synchronous, so we can call
    // scrollToBottom() right away.
    /// leda ze by ne :\
    $('#' + this.getOutputId()).append(messageHtml);

    this.scrollToBottom();

  }

  // --------------- Protected methods ------------------

  // Returns html containing window title.
  protected getTitle()
  {
    /// TODO
    return "Rahman@BrutusNext";
  }

  // --- Element-generating methods ---

  // -> Returns created html element.
  protected createOutputElement()
  {
    let output = document.createElement('div');

    output.id = this.getOutputId();
    output.className = ScrollView.OUTPUT_CSS_CLASS;

    /*
    /// TEST
    let  text, br;
    for (let i = 0; i < 100; i++)
    {
      text = document.createElement('span');
      text.textContent = 'line ' + i;
      text.style.color = 'green';
      text.style.fontFamily = 'CourrierNewBold';
      text.style.padding = 0;
      text.style.border = 0;
      output.appendChild(text);

      br = document.createElement('br');
      output.appendChild(br);
    }
    /// /TEST
    */

    return output;
  }

  // -> Returns created html element.
  protected createInputElement()
  {
    // 'textarea' is a html multi-line input box.
    let input = document.createElement('textarea');

    input.id = this.getInputId();
    input.className = ScrollView.INPUT_CSS_CLASS;

    input.autofocus = true;
    input.rows = 1;
    /// Tohle by byl pocet znaku.
    //input.cols = 1;

    return input;
  }

  // Overrides Window.createContentElement().
  // -> Returns created html element.
  protected createContentElement()
  {
    // Create html element 'content'.
    let content = super.createContentElement();

    // Class names are divided by ' '.
    content.className = content.className + ' ' + ScrollView.CONTENT_CSS_CLASS;

    // Create html element 'output'.
    let output = this.createOutputElement();
    // Put it in the 'content' element.
    content.appendChild(output);

    // Create html element 'input'.
    let input = this.createInputElement();
    // Put it in the 'content' element.
    content.appendChild(input);

    return content;
  }

  /// Zatim ciste experimentalne
  // -> Returns html that creates the element.
  protected createMessageHtml(message: string)
  {
    let messageHtml =
      '<span style="color:green;font-family:CourrierNewBold;">'
        + message;
    + '</span>';

    return messageHtml;
    /*
    br = document.createElement('br');
    output.appendChild(br);
    */
  }

  // ---------------- Private methods -------------------

  /// TODO: Bud private, nebo presunout do public sekce.
  public scrollToBottom()
  {
    ///$('#' + this.getOutputId()).scrollTop(10000);
    let output = document.getElementById(this.getOutputId());

    // Scroll to bottom.
    output.scrollTop = output.scrollHeight;

    /*
    ///output.scrollTop = output.scrollHeight - output.clientHeight;
    console.log('scrollHeight: ' + output.scrollHeight);
    console.log('clientHeight: ' + output.clientHeight);
    console.log('scrollTop: ' + output.scrollTop);
    */
  }

  // ---------------- Event handlers --------------------

}

export = ScrollView;