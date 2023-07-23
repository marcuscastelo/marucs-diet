migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lx0njcdji8zgyk0")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_N5JPFJO` ON `CachedSearch` (`search`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lx0njcdji8zgyk0")

  collection.indexes = [
    "CREATE INDEX `idx_N5JPFJO` ON `CachedSearch` (`search`)"
  ]

  return dao.saveCollection(collection)
})
