migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.indexes = []

  // remove
  collection.schema.removeField("paizd8yo")

  // remove
  collection.schema.removeField("ht28dhil")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7n38zebh",
    "name": "macros",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_OylkKXc` ON `Food` (`tbcaId`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "paizd8yo",
    "name": "tbcaId",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ht28dhil",
    "name": "components",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("7n38zebh")

  return dao.saveCollection(collection)
})
