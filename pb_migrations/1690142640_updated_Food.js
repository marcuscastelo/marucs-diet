migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_2hgN9Tz` ON `Food` (`apiId`)"
  ]

  // remove
  collection.schema.removeField("6rgt4wgs")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tad5r2kw",
    "name": "apiId",
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
    "CREATE INDEX `idx_2hgN9Tz` ON `Food` (`apiId`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "6rgt4wgs",
    "name": "apiId",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // remove
  collection.schema.removeField("tad5r2kw")

  return dao.saveCollection(collection)
})
