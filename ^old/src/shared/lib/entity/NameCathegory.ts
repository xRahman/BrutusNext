  // Names of unique-named entities are unique only within each cathegory,
  // so you can have for example account Rahman and character Rahman.
  // Lowercased names of cathegories also serve as names of directories
  // in ./data where name lock files are located. So there will be
  // file './data/names/account/Rahman.json'
  // and './data/names/character/Rahman.json'.
  export enum NameCathegory
  {
    ACCOUNT,
    CHARACTER,
    PROTOTYPE,
    // Unique world locations (Rooms, Realms, Areas, the name
    // of the world itself, etc.)
    WORLD
  }