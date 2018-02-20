/*
  Part of BrutusNEXT

  Implements server-side logger.

  Do not use it directly, use /shared/lib/log/Syslog instead.
*/
define(["require", "exports", "../../../shared/lib/app/App", "../../../shared/lib/message/MessageType", "../../../server/lib/message/Message"], function (require, exports, App_1, MessageType_1, Message_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ServerSyslog {
        // Outputs message to log file. Also sends it to online immortals
        // of required or greater level.
        static log(text, msgType, adminLevel) {
            let entry = "[" + MessageType_1.MessageType[msgType] + "] " + text;
            // We need to check if instance of ServerApp exists, because syslog
            // messages can be sent even before it is is created.
            if (App_1.App.instanceExists()) {
                let message = new Message_1.Message(entry, msgType);
                // Send log entry to all online characters that have appropriate
                // admin level. Syslog messages don't have sender ('sender'
                // parameter is null).
                message.sendToAllIngameConnections(adminLevel);
            }
            // Output to stdout.
            console.log(entry);
            // Output to log file.
            /// TODO
        }
    }
    exports.ServerSyslog = ServerSyslog;
});
//# sourceMappingURL=ServerSyslog.js.map