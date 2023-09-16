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
    console.error(`Open and fakeClose are equal, this should not happen`)
  }

  const close = equals ? open : fakeClose

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

  const bodyVariation = Math.abs(open - fakeClose)
  const ratio = Math.abs(height / bodyVariation)
  console.debug(
    `ratio = height / (bodyVariation) = ${height} / (${bodyVariation}) = ${ratio}`,
  )

  const minBody = Math.min(open, close)
  const maxBody = Math.max(open, close)

  const topTip = Math.abs(high - maxBody)
  const bottomTip = Math.abs(low - minBody)

  const rectangleBase = Math.max(y, y + height)
  const rectangleTop = Math.min(y, y + height)

  console.debug(`Props: ${JSON.stringify(props)}`)
  console.debug(
    `bottomTip: ${bottomTip}, \
    topTip: ${topTip}, \
    ratio: ${ratio}, \
    rectangleHeight: ${bodyVariation}, \
    minBody: ${minBody}, \
    maxBody: ${maxBody}`,
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
            M ${x + width / 2},${rectangleTop - topTip * ratio}
            V ${rectangleBase + bottomTip * ratio}
          `}
      />
    </g>
  )
}
