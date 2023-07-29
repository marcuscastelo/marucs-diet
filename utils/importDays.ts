import { mockDay, mockMeal } from "@/app/test/unit/(mock)/mockData";
import { Day } from "@/model/dayModel";
import { getToday } from "./dateUtils";

const today = new Date(getToday());

const nextDay = (date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
}

const mock3Days: Day[] = [
    { ...mockDay({ owner: 1, target_day: today.toISOString().split('T')[0] }) },
    { ...mockDay({ owner: 1, target_day: nextDay(today).toISOString().split('T')[0] }) },
    { ...mockDay({ owner: 1, target_day: nextDay(nextDay(today)).toISOString().split('T')[0] }) },
]

export async function importDays() {
    // mock3Days.forEach(async day => {
    //     try {
    //         await pb.collection('Days').create(day, { $autoCancel: false });
    //     }
    //     catch (e) {
    //         console.error(e);
    //     }
    // });
    throw new Error('Not implemented');
}