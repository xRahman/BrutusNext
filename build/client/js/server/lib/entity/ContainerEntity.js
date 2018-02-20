/*
  Part of BrutusNEXT

  Enables entity to contain list of other entities and to be put
  into a container entity. This is used for example for world to
  contain areas, for areas to contain rooms, for rooms to contain
  items and characters, for containers to contain other items or
  for characters who have inventory to contain items.

  When entity containing other entities is loaded or saved, it also
  loads/saves all entities in contains (to ensure that we don't load
  a container but not it's contents).
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../server/lib/entity/ServerEntity", "../../../shared/lib/entity/EntityList"], function (require, exports, ERROR_1, ServerEntity_1, EntityList_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ContainerEntity extends ServerEntity_1.ServerEntity {
        constructor() {
            // ----------------- Public data ----------------------
            super(...arguments);
            // ---------------- Protected data --------------------
            // Every game entity can contain other game entities.
            // (Rooms contain characters and objects, bags contain other objects,
            //  sectors contain rooms, etc.)
            this.contents = new EntityList_1.EntityList();
            // ContainerEntity this entity is contained in.
            // (Rooms are contained in Areas, characters may be in rooms or object,
            //  objects may be in room or object, etc.)
            this.location = null;
        }
        // ----------------- Private data ---------------------
        // --------------- Public accessors -------------------
        // Note: There is no 'setLocation()'. Localtion is automatically
        //   set when insert() is called.
        getLocation() { return this.location; }
        // ---------------- Public methods --------------------
        // ~ Overrides Entity.postSave()
        // When saving a a container entity, all contained
        //  entities are saved as well.
        postSave() {
            return __awaiter(this, void 0, void 0, function* () {
                ///await this.contents.save(this.getErrorIdString());
                yield this.contents.save();
            });
        }
        // If 'loadContents' is true, load all entities referenced in
        // this.contentns. This is used to prevent situation when you
        // e. g. load a conainer but it's contents is not available in
        // the world.
        postLoad(loadContents = true) {
            return __awaiter(this, void 0, void 0, function* () {
                if (loadContents)
                    yield this.contents.load(this.getErrorIdString());
            });
        }
        // --------------- Protected methods ------------------
        // Inserts 'entity' to contents of this entity.
        // Also removes it from it's previous location.
        insert(entity) {
            if (!entity || !entity.isValid()) {
                ERROR_1.ERROR("Attempt to insert invalid entity"
                    + " " + entity.getErrorIdString() + " to"
                    + " contents of " + this.getErrorIdString()
                    + " Entity is not inserted.");
                return;
            }
            let oldLocation = entity.location;
            // Remove entity from previous location.
            if (oldLocation !== null)
                oldLocation.removeEntity(entity);
            // Add it to the new one.
            this.contents.add(entity);
            entity.location = this;
        }
        // -------------- Private methods -------------------
        // Removes entity from contents of this entity
        // (removeEntity() is private because entities should never
        //  be located at "nowhere". Use insert() to move the
        //  entity to the new location - it will ensure that
        //  entity is always located somewhere).
        removeEntity(entity) {
            this.contents.remove(entity);
            entity.location = null;
        }
    }
    exports.ContainerEntity = ContainerEntity;
});
//# sourceMappingURL=ContainerEntity.js.map