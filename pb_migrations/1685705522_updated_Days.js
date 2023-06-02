migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_4vE8aMY` ON `Days` (`day`)"
  ]

  // remove
  collection.schema.removeField("eoeif3br")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "24qrf84k",
    "name": "day",
    "type": "date",
    "required": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qcpkocib",
    "name": "creationDate",
    "type": "date",
    "required": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = []

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eoeif3br",
    "name": "days",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("24qrf84k")

  // remove
  collection.schema.removeField("qcpkocib")

  // remove
  collection.schema.removeField("sotiz1u1")

  return dao.saveCollection(collection)
})
