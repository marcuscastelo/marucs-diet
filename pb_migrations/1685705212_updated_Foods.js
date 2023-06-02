migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  // remove
  collection.schema.removeField("we9mqurx")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  // add
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
})
