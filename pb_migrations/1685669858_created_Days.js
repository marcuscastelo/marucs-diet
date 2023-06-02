migrate((db) => {
  const collection = new Collection({
    "id": "k128qtjobwyf3kd",
    "created": "2023-06-02 01:37:38.177Z",
    "updated": "2023-06-02 01:37:38.177Z",
    "name": "Days",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "eoeif3br",
        "name": "days",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
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
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd");

  return dao.deleteCollection(collection);
})
