migrate((db) => {
  const collection = new Collection({
    "id": "ls7i9m482axuwo9",
    "created": "2023-07-17 00:06:35.506Z",
    "updated": "2023-07-17 00:06:35.506Z",
    "name": "User",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "sv5a86ud",
        "name": "name",
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
    "indexes": [],
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
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9");

  return dao.deleteCollection(collection);
})
