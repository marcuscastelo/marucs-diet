import { mockDay, mockMeal } from "@/app/test/unit/(mock)/mockData";
import { DayData } from "@/model/dayModel";
import pb from "./pocketBase";

const today = new Date();

const nextDay = (date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
}

const mock3Days: DayData[] = [
    { ...mockDay({ owner: '1', targetDay: today.toISOString().split('T')[0] }) },
    { ...mockDay({ owner: '1', targetDay: nextDay(today).toISOString().split('T')[0] }) },
    { ...mockDay({ owner: '1', targetDay: nextDay(nextDay(today)).toISOString().split('T')[0] }) },
]

export async function importDays() {
    mock3Days.forEach(async day => {
        try {
            await pb.collection('Days').create(day, { $autoCancel: false });
        }
        catch (e) {
            console.error(e);
        }
    });
}