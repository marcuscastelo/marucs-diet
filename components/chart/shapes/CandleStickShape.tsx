// From https://codesandbox.io/s/recharts-candlesticks-8m6n8?file=/src/Chart.jsx:3000-4236
export type CandleStickProps = {
  fill: string
  x: number
  y: number
  width: number
  height: number
  low: number
  high: number
  openClose: [number, number, boolean]
}

export const CandleStickShape = (props: CandleStickProps) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    low,
    high,
    openClose: [open, fakeClose, equals],
  } = props

  if (height === 0) {
    console.error(`Height is 0, this should not happen`)
  }

  if (open === fakeClose) {
    console.error(`Open and close are equal, this should not happen`)
  }

  const candleType = equals
    ? 'neutral'
    : open < fakeClose
    ? 'growing'
    : 'falling'

  const color =
    candleType === 'neutral'
      ? 'gray'
      : candleType === 'growing'
      ? 'green'
      : 'red'

  const ratio = Math.abs(height / open - fakeClose)
  const rectangleHeight = Math.abs(open - fakeClose)

  const rectangleBase = Math.min(open, fakeClose)
  const rectangleTop = Math.max(open, fakeClose)

  const topTipHeight = Math.abs(high - rectangleTop)
  const bottomTipHeight = Math.abs(low - rectangleBase)

  console.debug(`Props: ${JSON.stringify(props)}`)
  console.debug(
    `bottomTipHeight: ${bottomTipHeight}, topTipHeight: ${topTipHeight}, ratio: ${ratio}, rectangleHeight: ${rectangleHeight}, rectangleBase: ${rectangleBase}, rectangleTop: ${rectangleTop}`,
  )
  return (
    <g stroke={color} fill={color} strokeWidth="2">
      <path
        d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
      />

      <path
        d={`
            M ${x + width / 2}, ${y + height}
            V ${y - topTipHeight * ratio}
          `}
      />

      <path
        d={`
            M ${x + width / 2}, ${y + height}
            V ${y + height + bottomTipHeight * ratio}
          `}
      />
    </g>
  )
}
