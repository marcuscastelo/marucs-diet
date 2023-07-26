// "use client";

// import { MealData } from "@/model/mealModel";
// import MealItem from "../MealItem";
// import { MealItemData } from "@/model/mealItemModel";
// import { DragDropContext, Draggable, DropResult, Droppable } from "@hello-pangea/dnd";
// import { useState } from "react";

// export type MealProps = {
//     mealData: MealData,
//     onNewItem: () => void,
//     onEditItem: (item: MealItemData) => void,
//     onUpdateMeal: (meal: MealData) => void,
//     className?: string,
// };

// //TODO: move this function
// // a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//     const result = Array.from(list);
//     const [removed] = result.splice(startIndex, 1);
//     result.splice(endIndex, 0, removed);
  
//     return result;
//   };
  

// export default function Meal({ mealData, onNewItem, onEditItem, onUpdateMeal, className }: MealProps) {
//     const onDragEnd = (result: DropResult) => {
//         // dropped outside the list
//         if (!result.destination) {
//             return;
//         }

//         const items = reorder(
//             mealData.items,
//             result.source.index,
//             result.destination.index,
//         ) as MealItemData[];

//         const newMealData = {
//             ...mealData,
//             items,
//         };

//         onUpdateMeal(newMealData);
//     }

//     const onClearItems = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//         e.preventDefault();
//         // Confirm
//         if (!confirm('Tem certeza que deseja limpar os itens?')) {
//             return;
//         }

//         const newMealData = {
//             ...mealData,
//             items: [],
//         };

//         onUpdateMeal(newMealData);
//     }

//     return (
//         <DragDropContext
//             onDragEnd={onDragEnd} autoScrollerOptions={{
//                 startFromPercentage: 0.1,
//                 maxScrollAtPercentage: 0.01,
//             }}>
//             <Droppable droppableId={mealData.id}>
//                 {(droppableProvided, droppableSnapshot) => (
//                     <div
//                         ref={droppableProvided.innerRef}
//                     >
//                         <div className={`bg-gray-800 p-3 ${className || ''}`}>
//                             <div className="flex">
//                                 <h5 className="text-3xl my-2">{mealData.name}</h5>
//                                 <button 
//                                     className="btn bg-red-800 px-5 ml-auto text-white"
//                                     onClick={onClearItems}
//                                 >
//                                     Limpar itens
//                                 </button>
//                             </div>
//                             {
//                                 mealData.items.map((item, index) =>
//                                     <div key={item.id} className="mt-2">
//                                         <Draggable draggableId={item.id} index={index} shouldRespectForcePress={true}>
//                                             {(draggableProvided, draggableSnapshot) => (
//                                                 <div
//                                                     ref={draggableProvided.innerRef}
//                                                     {...draggableProvided.draggableProps}
//                                                     {...draggableProvided.dragHandleProps}
//                                                 >
//                                                     <MealItem
//                                                         mealItem={item}
//                                                         onClick={onEditItem}
//                                                         favorite='hide'
//                                                     />
//                                                 </div>)}
//                                         </Draggable>

//                                     </div>
//                                 )
//                             }
//                             {droppableProvided.placeholder}
//                             <button
//                                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
//                                 onClick={onNewItem}
//                             >
//                                 Adicionar item
//                             </button>

//                         </div>
//                     </div>
//                 )}
//             </Droppable>
//         </DragDropContext>
//     )
// }