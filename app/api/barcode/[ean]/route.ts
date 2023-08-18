// This is the route file for the barcode API

import { NextRequest, NextResponse } from 'next/server'

import EAN_SECRETS from '@/secrets/ean_api.json'

import axios from 'axios'

// TODO: rename all barcodes to EAN?
const searchBarCodeInternal = async (barcode: string) => {
  const url = `${EAN_SECRETS.base_url}/${EAN_SECRETS.ean_endpoint}/${barcode}`
  const response = await axios.get(url, {
    headers: EAN_SECRETS.headers,
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
