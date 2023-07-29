"use client";

import { MealData } from "@/model/mealModel";
import MealItem from "../(mealItem)/MealItem";
import { MealItemData } from "@/model/mealItemModel";
import { MealContextProvider, useMealContext } from "./MealContext";

export type MealProps = {
    mealData: MealData,
    header?: React.ReactNode,
    content?: React.ReactNode,
    actions?: React.ReactNode,
    className?: string,
    locked?: boolean,
};

//TODO: retriggered: move this function
// a little function to help us with reordering the result
const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export default function Meal({ mealData, header, content, actions, className, locked }: MealProps) {


    return (
        <div className={`bg-gray-800 p-3 ${className || ''}`}>
            <MealContextProvider mealData={mealData}>
                {header}
                {content}
                {actions}
            </MealContextProvider>
        </div>
    )
}

Meal.Header = MealHeader;
Meal.Content = MealContent;
Meal.Actions = MealActions;

//TODO: move locked to context or to the parent component
function MealHeader({ locked, onUpdateMeal }: { locked: boolean, onUpdateMeal: (meal: MealData) => void }) {
    const { mealData } = useMealContext();

    const onClearItems = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e?.preventDefault();

        if (locked) {
            alert('Não é possível limpar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        // Confirm
        if (!confirm('Tem certeza que deseja limpar os itens?')) {
            return;
        }

        const newMealData = {
            ...mealData,
            items: [],
        };

        onUpdateMeal(newMealData);
    }

    return (
        <div className="flex">
            <h5 className="text-3xl my-2">{mealData.name}</h5>
            <button
                className="btn bg-red-800 px-5 ml-auto text-white"
                onClick={onClearItems}
            >
                Limpar itens
            </button>
        </div>
    )
}

function MealContent({ locked, onEditItem }: { locked: boolean, onEditItem: (item: MealItemData) => void }) {
    const { mealData } = useMealContext();

    const handleEditItem = (item: MealItemData) => {
        if (locked) {
            alert('Não é possível editar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        onEditItem(item);
    }

    return (
        <>
            {
                mealData.items.map((item, index) =>
                    <div key={item.id} className="mt-2">
                        <MealItem
                            mealItem={item}
                            onClick={handleEditItem}
                            header={
                                <MealItem.Header
                                    name={<MealItem.Header.Name />}
                                />
                            }
                            nutritionalInfo={
                                <MealItem.NutritionalInfo/>
                            }
                        />
                    </div>
                )
            }
        </>
    )
}

function MealActions({ locked, onNewItem }: { locked: boolean, onNewItem: () => void }) {
    const handleNewItem = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (locked) {
            alert('Não é possível adicionar itens a uma refeição bloqueada, desbloqueie-a primeiro.');
            return;
        }

        onNewItem();
    }


    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
            onClick={handleNewItem}
        >
            Adicionar item
        </button>

    )
}


//TODO: reimplement drag and drop
// const onDragEnd = (result: DropResult) => {
//     // dropped outside the list
//     if (!result.destination) {
//         return;
//     }

//     if (locked) {
//         alert('Não é possível reordenar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
//         return;
//     }

//     const items = reorder(
//         mealData.items,
//         result.source.index,
//         result.destination.index,
//     ) as MealItemData[];

//     const newMealData = {
//         ...mealData,
//         items,
//     };

//     onUpdateMeal(newMealData);
// }
// if (locked) {
//     alert('Não é possível reordenar itens de uma refeição bloqueada, desbloqueie-a primeiro.');
//     return;
// }
// return (
//     <DragDropContext
//         onDragEnd={onDragEnd} autoScrollerOptions={{
//             startFromPercentage: 0.1,
//             maxScrollAtPercentage: 0.01,
//         }}>
//         <Droppable droppableId={mealData.id.toString()}>
//             {(droppableProvided, droppableSnapshot) => (
//                 <div
//                     ref={droppableProvided.innerRef}
//                 >
//                     <div className={`bg-gray-800 p-3 ${className || ''}`}>
//                         <div className="flex flex-col 2xs:flex-row">
//                             <h5 className="text-3xl my-2">
//                                 {mealData.name}
//                                 &nbsp;
//                                 {locked && <span className="text-red-700">[TRAVADA]</span>}
//                             </h5>
//                             <div
//                                 className={`${locked ? 'text-gray-500' : 'text-red-600'} px-5 ml-auto mt-1 text-white btn btn-ghost hover:scale-105`}
//                                 onClick={_ => onClearItems()}
//                             >
//                                 <TrashIcon/>
//                             </div>
//                         </div>
//                         {
//                             mealData.items.map((item, index) =>
//                                 <div key={item.id} className="mt-2">
//                                     <Draggable draggableId={item.id.toString()} index={index} shouldRespectForcePress={true}>
//                                         {(draggableProvided, draggableSnapshot) => (
//                                             <div
//                                                 ref={draggableProvided.innerRef}
//                                                 {...draggableProvided.draggableProps}
//                                                 {...draggableProvided.dragHandleProps}
//                                             >
//                                                 <MealItem
//                                                     mealItem={item}
//                                                     onClick={handleEditItem}
//                                                     favorite='hide'
//                                                 />
//                                             </div>)}
//                                     </Draggable>

//                                 </div>
//                             )
//                         }
//                         {droppableProvided.placeholder}
//                         <button
//                             className={`${locked ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 min-w-full rounded mt-3`}
//                             onClick={handleNewItem}
//                         >
//                             Adicionar item
//                         </button>

//                     </div>
//                 </div>
//             )}
//         </Droppable>
//     </DragDropContext>
// )