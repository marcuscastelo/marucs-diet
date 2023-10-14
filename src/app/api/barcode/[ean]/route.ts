// This is the route file for the barcode API

import { NextRequest, NextResponse } from 'next/server'

import axios from 'axios'
import {
  EXTERNAL_API_AUTHORIZATION,
  EXTERNAL_API_BASE_URL,
  EXTERNAL_API_EAN_ENDPOINT,
  EXTERNAL_API_HOST,
  EXTERNAL_API_REFERER,
} from '@/modules/api/apiSecrets'

// TODO: rename all barcodes to EAN?
const searchBarCodeInternal = async (barcode: string) => {
  const url = `${EXTERNAL_API_BASE_URL}/${EXTERNAL_API_EAN_ENDPOINT}/${barcode}`
  const response = await axios.get(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-encoding': 'gzip',
      'app-token': 'wapstore',
      authorization: EXTERNAL_API_AUTHORIZATION,
      connection: 'Keep-Alive',
      host: EXTERNAL_API_HOST,
      referer: EXTERNAL_API_REFERER,
      'user-agent': 'okhttp/4.9.2',
    },
  })
  console.log(response.data)
  console.dir(response.data)
  return response.data
}

// TODO: merge this with the food search by name (using query params like ?name= or ?ean=)
export async function GET(
  request: NextRequest,
  { params }: { params: { ean: string } },
) {
  return NextResponse.json(await searchBarCodeInternal(params.ean))
}