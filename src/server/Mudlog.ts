/*
  Part of BrutusNEXT

  Implements logger.

  Usage:
    let Mudlog = require('./Mudlog');
    Mudlog.log("OK", Mudlog.INFO, 0);
*/

/*
let Levels = require('../game/Levels');

class Mudlog
{
  // -------- Public Methods ----------

  // Log the message.
  static log(message, severity, visibilityLevel)
  {
    checkArguments(arguments, "string", "string", "number");

    if (visibilityLevel >= Levels.MORTAL)  // Everything is logged for now.
    {
      // Log message to the console.
      console.log(severity + ' ' + message);
    }
  }

  // ------- Public Accessors ---------

  static get INFO() { return '[INFO]'; }
  static get WARNING() { return '[WARNING]'; }
  static get ERROR() { return '[ERROR]'; }
  static get FATAL_ERROR() { return '[FATAL ERROR]'; }

  constructor()
  {
    // --------- Public Data ----------

    // -------- Protected Data --------

    // Prevent changing propreties of this class.
    Object.seal(this);
  }

  // ----- Protected Accessors --------

  // ------- Protected Methods --------

}

module.exports = Mudlog;
*/