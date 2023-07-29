import { apiFoodSchema } from '@/model/apiFoodModel';
import { INTERNAL_API } from '@/utils/api';

export const searchBarCode = async (barcode: string) => {
    //TODO: retriggered: this url should not be hardcoded
    return apiFoodSchema.parse((await INTERNAL_API.get(`barcode/${barcode}`)).data);
}