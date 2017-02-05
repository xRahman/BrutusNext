/*
  Part of BrutusNEXT

  Implements http server.
*/

/*
  K vyzkouseni je to na adrese http://127.0.0.1:4445

  Prozatim je tam natvrdo hozene editorove schema (v souboru schema.js),
  slouzi to jen jako proof of concept.

  Vyhledove by to chtelo nepouzivat http server, ale provozovat to pod
  websocket serverem spolu s hernim klientem.

  (Editor je client-side skript, ktery nedela nic jineho, nez ze z daneho
  JSON schematu vygeneruje prislusny formular a umi vratit naeditovany objekt.
  Posilani objektu zpet na server uz si musim zaridit sam, takze to klidne muze
  bezet pres websockety.)
*/

/*
  IDEA je, ze vsechny herni objekty (respektive jejich datova cast) budou
  umet vygenerovat JSON schema pro editor. To ostatne neni az tak od veci,
  protoze soucasti schematu jsou povolene rozsahy hodnot a takove veci.

  Nasledne se kazdy objekt bude umet nainicializovat z toho, co vrati editor,
  coz uz by ale objekty umet mely, protoze to je proste loadFromJSON() stejne
  jako pri loadovani ze souboru.
*/

'use strict';

import {FileSystem} from '../../../../server/lib/fs/FileSystem';

// Built-in node.js modules.
import * as http from 'http';  // Import namespace 'http' from node.js

export class HttpServer
{
  constructor(protected port: number) { }

  // ----------------- Public data ----------------------

  // Do we accept http requests?
  public isOpen = false;

  public getPort() { return this.port; }

  // ---------------- Public methods --------------------

  // Starts the http server.
  public start()
  {
    this.httpServer =
      http.createServer
      (
        (request, response) => { this.onRequest(request, response); }
      );

    this.httpServer.listen(this.port, '127.0.0.1');

    this.isOpen = true;
  }

  //----------------- Protected data --------------------

  protected httpServer;
  
  // ---------------- Event handlers --------------------

  // Handles 'listening' event of telnet server.
  protected onRequest(request, response)
  {
    if (!this.isOpen)
      return;


    if (request.method == "GET")
    {

      response.writeHead(200, { 'Content-Type': 'text/html' });

      /*
      response.write('<!doctype html>\n<html lang="en">\n' +
        '\n<meta charset="utf-8">\n<title>Test web page on node.js</title>\n' +
        '<style type="text/css">* {font-family:arial, sans-serif;}</style>\n' +
        '\n\n<h1>Euro 2012 teams</h1>\n' +
        '<div id="content"><p>The teams in Group D for Euro 2012 are:</p><ul><li>England</li><li>France</li><li>Sweden</li><li>Ukraine</li></ul></div>' +
        '\n\n');
      */

      let webPage = FileSystem.readFileSync("./src/editor/editor.html");
      let editorScript = FileSystem.readFileSync
        ("./src/editor/3rd_party/jsoneditor.js");
      let schemaScript = FileSystem.readFileSync("./src/editor/schema.js");

      /// Do zakladniho html (editor.html) se "vlepi" obsah souboru
      /// jsoneditor.js a schema.js.
      webPage = webPage.replace(/{{editor}}/g, editorScript);
      webPage = webPage.replace(/{{schema}}/g, schemaScript);

      response.write(webPage);

      response.end();
    }
    else if (request.method == 'POST')
    {
      //read form data
      request.on
      (
        'data',
        function(data)
        {
          /// Prozatim jen vypisu do konzole, co mi prislo.
          console.log("Received data: " + data + "\n");

          // Respond.
          response.writeHead(200);
          response.end();
        }
      );
    }
    else
    {
      response.writeHead(200);
      response.end();
    };
  }
}
