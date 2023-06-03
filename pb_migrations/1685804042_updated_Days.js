migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_4vE8aMY` ON `Days` (`targetDay`)"
  ]

  // remove
  collection.schema.removeField("qcpkocib")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "24qrf84k",
    "name": "targetDay",
    "type": "date",
    "required": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("k128qtjobwyf3kd")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_4vE8aMY` ON `Days` (`day`)"
  ]

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

  // update
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

  return dao.saveCollection(collection)
})
