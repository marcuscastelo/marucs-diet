migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2xwoaszuqdki0gq")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "j1po0sye",
    "name": "items",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "3k3eph9fz34bci1",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2xwoaszuqdki0gq")

  // remove
  collection.schema.removeField("j1po0sye")

  return dao.saveCollection(collection)
})
