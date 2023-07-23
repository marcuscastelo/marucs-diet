migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // remove
  collection.schema.removeField("pxrt9ecs")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pxrt9ecs",
    "name": "favoriteFoods",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "c1ej4gfm20vnfai",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
})
