migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.name = "Foods"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_OylkKXc` ON `Foods` (`tbcaId`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("591h1p9sl7wg9yv")

  collection.name = "Foods_duplicate1"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_OylkKXc` ON `Foods_duplicate1` (`tbcaId`)"
  ]

  return dao.saveCollection(collection)
})
