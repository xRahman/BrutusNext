/*
  Part of BrutusNEXT

  Initializes module loader (requirejs),
  defines 'jquery' module alias,
  launches BrutusNextClient.
*/

'use strict';

// Variable is actually declared in require.js,
// we just let typescript know that it exists.
var requirejs;

requirejs.config
(
  {
    // Alias so that you can use 'import $ = require('jquery');'.
    paths: { 'jquery': '../js/jquery/jquery.slim' }
  }
);

// Launch the client.
require(['../js/build/BrutusNextClient']);