migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "he22xo2e",
    "name": "owner",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "ls7i9m482axuwo9",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  // remove
  collection.schema.removeField("he22xo2e")

  return dao.saveCollection(collection)
})
