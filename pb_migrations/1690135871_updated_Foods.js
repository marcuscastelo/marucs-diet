migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  collection.name = "Foods_old"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_UNVZytp` ON `Foods_old` (`tbcaId`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  collection.name = "Foods"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_UNVZytp` ON `Foods` (`tbcaId`)"
  ]

  return dao.saveCollection(collection)
})
