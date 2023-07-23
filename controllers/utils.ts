import pb from "@/utils/pocketBase";
import { Record } from "pocketbase";

export const listAll = async <T>(collectionName: string, limit?: number) => {
    const first = await pb.collection(collectionName).getList(undefined, 1000, { $autoCancel: false });

    const totalPages = first.totalPages;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) => {
            if (limit && page * 1000 > limit) {
                return {
                    items: [],
                };
            }

            return pb.collection(collectionName).getList(page, 1000, { $autoCancel: false, $page: page })
        })
    );

    const items = first.items.concat(...rest.map((r) => r.items));

    return items as (Record & T)[];
}