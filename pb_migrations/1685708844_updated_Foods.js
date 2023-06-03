migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oelmastv",
    "name": "components",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  // remove
  collection.schema.removeField("oelmastv")

  return dao.saveCollection(collection)
})
