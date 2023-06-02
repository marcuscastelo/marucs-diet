migrate((db) => {
  const collection = new Collection({
    "id": "2xwoaszuqdki0gq",
    "created": "2023-06-02 11:31:11.433Z",
    "updated": "2023-06-02 11:31:11.433Z",
    "name": "Meal",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "5d4sntnw",
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
  const collection = dao.findCollectionByNameOrId("2xwoaszuqdki0gq");

  return dao.deleteCollection(collection);
})
