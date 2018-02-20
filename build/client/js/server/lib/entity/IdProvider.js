/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/
define(["require", "exports", "../../../shared/lib/error/FATAL_ERROR"], function (require, exports, FATAL_ERROR_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class IdProvider {
        constructor(timeOfBoot) {
            this.timeOfBoot = timeOfBoot;
            // ----------------- Private data ---------------------
            // Number of issued ids in this boot.
            this.lastIssuedId = 0;
        }
        // ---------------- Public methods --------------------
        generateId() {
            if (this.timeOfBoot === null) {
                FATAL_ERROR_1.FATAL_ERROR("Uninicialized timeOfBoot in IdProvider."
                    + " Unable to generate ids");
            }
            // Increment lastIssuedId first so we start with 1 (initial value is 0).
            this.lastIssuedId++;
            // String id consists of radix-36 representation of lastIssuedId
            // and a radix-36 representation of current boot timestamp
            // (in miliseconds from the start of computer age) separated by dash ('-').
            // (radix 36 is used because it's a maximum radix toString() allows to use
            // and thus it leads to the shortest possible string representation of id)
            return this.lastIssuedId.toString(36)
                + '-'
                + this.timeOfBoot.getTime().toString(36);
        }
    }
    exports.IdProvider = IdProvider;
});
//# sourceMappingURL=IdProvider.js.map