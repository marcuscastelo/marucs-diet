import { mockMeal } from "@/app/test/unit/(mock)/mockData";
import { DayData } from "@/model/dayModel";
import pb from "./pocketBase";

const today = new Date();

const nextDay = (date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
}

const mockDay = (partial?: Partial<DayData>) => ({
    targetDay: '', // Will be set later
    meals: [
        mockMeal({
            name: `Breakfast ${Math.round(Math.random() * 100)}`,
        })
    ],
    ...partial
} as DayData);

const mockDays: DayData[] = [
    { ...mockDay(), targetDay: today.toISOString().split('T')[0] },
    { ...mockDay(), targetDay: nextDay(today).toISOString().split('T')[0] },
    { ...mockDay(), targetDay: nextDay(nextDay(today)).toISOString().split('T')[0] },
]

export async function importDays() {
    mockDays.forEach(async day => {
        try {
            await pb.collection('Days').create(day, { $autoCancel: false });
        }
        catch (e) {
            console.error(e);
        }
    });
}