migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xcya0o9v",
    "name": "weight",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wshwryvf",
    "name": "macroProfile",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ls7i9m482axuwo9")

  // remove
  collection.schema.removeField("xcya0o9v")

  // remove
  collection.schema.removeField("wshwryvf")

  return dao.saveCollection(collection)
})
