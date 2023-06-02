migrate((db) => {
  const collection = new Collection({
    "id": "3k3eph9fz34bci1",
    "created": "2023-06-02 11:35:16.993Z",
    "updated": "2023-06-02 11:35:16.993Z",
    "name": "MealItem",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vs2k8syt",
        "name": "food",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "c1ej4gfm20vnfai",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "j2se1bxw",
        "name": "quantity",
        "type": "number",
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 10000
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
  const collection = dao.findCollectionByNameOrId("3k3eph9fz34bci1");

  return dao.deleteCollection(collection);
})
