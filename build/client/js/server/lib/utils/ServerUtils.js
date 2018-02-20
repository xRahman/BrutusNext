/*
  Part of BrutusNEXT

  Various utility functions.
*/
define(["require", "exports", "../../../shared/lib/admin/AdminLevel", "../../../shared/lib/log/Syslog", "../../../shared/lib/message/MessageType", "crypto"], function (require, exports, AdminLevel_1, Syslog_1, MessageType_1, crypto) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServerUtils;
    (function (ServerUtils) {
        // Reports exception to Syslog, not just to console.
        function reportException(err) {
            Syslog_1.Syslog.log("Uncaught exception"
                + "\n"
                + err.stack, MessageType_1.MessageType.FATAL_RUNTIME_ERROR, AdminLevel_1.AdminLevel.IMMORTAL);
        }
        ServerUtils.reportException = reportException;
        function md5hash(input) {
            let hashFacility = crypto.createHash('md5');
            hashFacility.update(input.trim());
            return hashFacility.digest('hex');
        }
        ServerUtils.md5hash = md5hash;
        /*
        // Extracts 'property' value from 'attributes' object describing
        // an enum 'enumName'.
        export function getEnumAttributes
        (
          attributes: Object,
          enumName: string,
          property: string
        )
        {
          if (property in attributes)
            return attributes[property];
      
          ERROR("Enum value " + property + " doesn't exist in attributes"
                + " of enum " + enumName + ". You probably added a value"
                + " to the enum but forgot to add it to it's attributes");
      
          return null;
        }
        */
    })(ServerUtils = exports.ServerUtils || (exports.ServerUtils = {}));
});
//# sourceMappingURL=ServerUtils.js.map