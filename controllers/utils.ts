import pb from "@/utils/pocketBase";
import { Record } from "pocketbase";

export const listAll = async <T>(collectionName: string, limit?: number): Promise<(Record & T)[]> => {
    const firstPage = await pb.collection(collectionName).getList<Record & T>(undefined, 1000, { $autoCancel: false });

    const totalPages = firstPage.totalPages;

    const otherPages = await Promise.all(
        //TODO: revisar essa logica
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) => {
            if (limit && page * 1000 > limit) {
                return {
                    items: [],
                };
            }

            return pb.collection(collectionName).getList<Record & T>(page, 1000, { $autoCancel: false, $page: page })
        })
    );

    const items = firstPage.items.concat(...otherPages.map((r) => r.items));

    return items;
}