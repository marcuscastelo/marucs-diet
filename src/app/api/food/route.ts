// This is the route file for the food search API.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return Response.json(
    JSON.stringify('oi'),
    // await searchFoodNameInternal(searchParams.get('q') ?? ''),
  )
}
