migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_2hgN9Tz` ON `Food` (`source`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tad5r2kw",
    "name": "source",
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
    "CREATE UNIQUE INDEX `idx_2hgN9Tz` ON `Food` (`apiInfo`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tad5r2kw",
    "name": "apiInfo",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
