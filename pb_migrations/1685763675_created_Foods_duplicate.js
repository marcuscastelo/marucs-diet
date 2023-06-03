migrate((db) => {
  const collection = new Collection({
    "id": "tbctfxodly0u1pp",
    "created": "2023-06-03 03:41:15.642Z",
    "updated": "2023-06-03 03:41:15.642Z",
    "name": "Foods_duplicate",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hpc5mkte",
        "name": "name",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "xkgltl5m",
        "name": "tbcaId",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "wuuz90qp",
        "name": "components",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_dPmk9PU` ON `Foods_duplicate` (`tbcaId`)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("tbctfxodly0u1pp");

  return dao.deleteCollection(collection);
})
