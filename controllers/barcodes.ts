import { BarCodeResult } from '@/model/barCodeResult';
import axios from 'axios';

export const searchBarCode = async (barcode: string) => {
    //TODO: this url should not be hardcoded
    return (await axios.get(`http://localhost:3000/api/barcode/${barcode}`)).data as BarCodeResult;
}