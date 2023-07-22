import { NewFoodData } from '@/model/newFoodModel';
import axios from 'axios';

export const searchBarCode = async (barcode: string) => {
    //TODO: this url should not be hardcoded
    return (await axios.get(`http://192.168.0.14:3000/api/barcode/${barcode}`)).data as NewFoodData;
}