migrate((db) => {
  const collection = new Collection({
    "id": "lx0njcdji8zgyk0",
    "created": "2023-07-23 18:42:56.392Z",
    "updated": "2023-07-23 18:42:56.392Z",
    "name": "CachedSearches",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "scwbxylt",
        "name": "search",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_N5JPFJO` ON `CachedSearches` (`search`)"
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("lx0njcdji8zgyk0");

  return dao.deleteCollection(collection);
})
