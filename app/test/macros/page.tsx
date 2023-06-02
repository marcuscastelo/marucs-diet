import MacroNutrients from "../../MacroNutrients";

export default async function MacrosPage() {
    const props = { carbs: 123, protein: 222, fat: 321 };

    return (
        <>
            <MacroNutrients {...props} />
        </>
    )
}