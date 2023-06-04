migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  // remove
  collection.schema.removeField("sotiz1u1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lfpnpmn2",
    "name": "meals",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sotiz1u1",
    "name": "field",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "2xwoaszuqdki0gq",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  // remove
  collection.schema.removeField("lfpnpmn2")

  return dao.saveCollection(collection)
})
