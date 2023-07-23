migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lx0njcdji8zgyk0")

  collection.name = "CachedSearch"
  collection.indexes = [
    "CREATE INDEX `idx_N5JPFJO` ON `CachedSearch` (`search`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lx0njcdji8zgyk0")

  collection.name = "CachedSearches"
  collection.indexes = [
    "CREATE INDEX `idx_N5JPFJO` ON `CachedSearches` (`search`)"
  ]

  return dao.saveCollection(collection)
})
