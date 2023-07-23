migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tg0hevxo",
    "name": "favoriteFoods",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "591h1p9sl7wg9yv",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // remove
  collection.schema.removeField("tg0hevxo")

  return dao.saveCollection(collection)
})
