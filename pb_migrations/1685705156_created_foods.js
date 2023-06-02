migrate((db) => {
  const collection = new Collection({
    "id": "c1ej4gfm20vnfai",
    "created": "2023-06-02 11:25:56.328Z",
    "updated": "2023-06-02 11:25:56.328Z",
    "name": "foods",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wibjmepb",
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
        "id": "we9mqurx",
        "name": "tbca_id",
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
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai");

  return dao.deleteCollection(collection);
})
