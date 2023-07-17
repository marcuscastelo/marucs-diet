import pb from "@/utils/pocketBase";
import { Record } from "pocketbase";

export const listAll = async <T>(collectionName: string) => {
    const first = await pb.collection(collectionName).getList(undefined, 1000, { $autoCancel: false });

    const totalPages = first.totalPages;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
            pb.collection(collectionName).getList(page, 1000, { $autoCancel: false, $page: page })
        )
    );

    const items = first.items.concat(...rest.map((r) => r.items));

    return items as (Record & T)[];
}