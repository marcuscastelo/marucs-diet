migrate((db) => {
  const collection = new Collection({
    "id": "591h1p9sl7wg9yv",
    "created": "2023-07-23 18:10:49.218Z",
    "updated": "2023-07-23 18:10:49.218Z",
    "name": "Foods_duplicate1",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ojtuyov4",
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
        "id": "paizd8yo",
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
        "id": "ht28dhil",
        "name": "components",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_OylkKXc` ON `Foods_duplicate1` (`tbcaId`)"
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
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv");

  return dao.deleteCollection(collection);
})
