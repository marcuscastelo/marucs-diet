migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  collection.name = "Foods"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("c1ej4gfm20vnfai")

  collection.name = "foods"

  return dao.saveCollection(collection)
})
