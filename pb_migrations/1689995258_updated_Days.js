migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_4vE8aMY` ON `Days` (\n  `targetDay`,\n  `owner`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_4vE8aMY` ON `Days` (`targetDay`)"
  ]

  return dao.saveCollection(collection)
})
