// From https://codesandbox.io/s/recharts-candlesticks-8m6n8?file=/src/Chart.jsx:3000-4236

export type CandleStickProps = {
  fill: string
  x: number
  y: number
  width: number
  height: number
  low: number
  high: number
  openClose: [number, number]
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
    openClose: [open, close],
  } = props
  const isGrowing = open < close
  const color = isGrowing ? 'green' : 'red'
  const ratio = Math.abs(height / (open - close))
  console.log(props)
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
      {/* bottom line */}
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - low) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - low) * ratio}
          `}
        />
      )}
      {/* top line */}
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - high) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - high) * ratio}
          `}
        />
      )}
    </g>
  )
}
