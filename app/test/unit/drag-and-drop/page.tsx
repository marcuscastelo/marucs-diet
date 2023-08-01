'use client'

// TODO: remove this example after we have implemented our own

import React, { Component } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

// fake data generator
const getItems = (count: any) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }))

// a little function to help us with reordering the result
const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const grid = 8

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'red',

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? 'lightblue' : 'grey',
  padding: grid,
  width: 250,
})

export default class App extends Component {
  constructor(props: any, context: any) {
    super(props, context)
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      items: getItems(100),
    }
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const items = reorder(
      (this.state as { items: any[] }).items,
      result.source.index,
      result.destination.index,
    )

    this.setState({
      items,
    })
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(droppableProvided, droppableSnapshot) => (
            <div
              ref={droppableProvided.innerRef}
              style={getListStyle(droppableSnapshot.isDraggingOver)}
            >
              {(this.state as { items: any[] }).items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(draggableProvided, draggableSnapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      style={getItemStyle(
                        draggableSnapshot.isDragging,
                        draggableProvided.draggableProps.style,
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}
