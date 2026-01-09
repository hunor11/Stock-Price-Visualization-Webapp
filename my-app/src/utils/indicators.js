/**
 * Calculates the Simple Moving Average (SMA) for a given data set.
 * @param {Array} data - Array of objects containing 'close' price.
 * @param {number} period - The period for the SMA (e.g., 20).
 * @returns {Array} - Array of objects { time, value } for the line series.
 */
export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return [];

  const smaData = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
    smaData.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return smaData;
};

/**
 * Calculates the Exponential Moving Average (EMA) for a given data set.
 * @param {Array} data - Array of objects containing 'close' price.
 * @param {number} period - The period for the EMA.
 * @returns {Array} - Array of objects { time, value } for the line series.
 */
export const calculateEMA = (data, period) => {
  if (!data || data.length < period) return [];

  const emaData = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is the SMA of the first 'period' data points
  const initialSlice = data.slice(0, period);
  const initialSum = initialSlice.reduce((acc, curr) => acc + curr.close, 0);
  let previousEma = initialSum / period;
  
  emaData.push({ time: data[period - 1].time, value: previousEma });

  for (let i = period; i < data.length; i++) {
    const ema = (data[i].close - previousEma) * multiplier + previousEma;
    emaData.push({
      time: data[i].time,
      value: ema,
    });
    previousEma = ema;
  }
  
  return emaData;
};

/**
 * Calculates the Relative Strength Index (RSI) for a given data set.
 * Note: simplistic implementation.
 * @param {Array} data 
 * @param {number} period 
 * @returns {Array}
 */
export const calculateRSI = (data, period = 14) => {
  if (!data || data.length < period + 1) return [];
  
  // Need to implement RSI logic if requested, but for now placeholder or simple version
  // Leaving empty to focus on UI, or basic implementation:
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  const rsiData = [];
  
  // Push first point? RSI is usually not defined for first 'period' points.
  // Using Wilder's Smoothing for subsequent steps
  
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    let up = 0;
    let down = 0;
    if (change > 0) up = change;
    else down = Math.abs(change);
    
    avgGain = ((avgGain * (period - 1)) + up) / period;
    avgLoss = ((avgLoss * (period - 1)) + down) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    rsiData.push({
      time: data[i].time,
      value: rsi
    });
  }
  
  return rsiData;
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD) for a given data set.
 * @param {Array} data - Array of objects containing 'close' price.
 * @param {number} fastPeriod - The period for the fast EMA (e.g., 12).
 * @param {number} slowPeriod - The period for the slow EMA (e.g., 26).
 * @param {number} signalPeriod - The period for the signal line EMA (e.g., 9).
 * @returns {Object} - Object containing macdLine, signalLine, and histogram data.
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!data || data.length < slowPeriod) return { macdLine: [], signalLine: [], histogram: [] };

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Align data points by time
  const alignedFastEMA = fastEMA.slice(fastEMA.length - slowEMA.length);

  const macdLine = [];
  for (let i = 0; i < slowEMA.length; i++) {
    const macdValue = alignedFastEMA[i].value - slowEMA[i].value;
    macdLine.push({
      time: slowEMA[i].time,
      value: macdValue,
    });
  }

  const signalLineData = calculateEMA(macdLine.map(d => ({ ...d, close: d.value })), signalPeriod);

  const histogramData = [];
  // Align MACD line with signal line
  const alignedMacdLine = macdLine.slice(macdLine.length - signalLineData.length);

  for (let i = 0; i < signalLineData.length; i++) {
    const histogramValue = alignedMacdLine[i].value - signalLineData[i].value;
    histogramData.push({
      time: signalLineData[i].time,
      value: histogramValue,
    });
  }

  return { macdLine: alignedMacdLine, signalLine: signalLineData, histogram: histogramData };
};

/**
 * Calculates the Bollinger Bands for a given data set.
 * @param {Array} data - Array of objects containing 'close' price.
 * @param {number} period - The period for the moving average (e.g., 20).
 * @param {number} stdDev - The number of standard deviations (e.g., 2).
 * @returns {Object} - Object containing upper, middle, and lower band data.
 */
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };

  const upperBand = [];
  const middleBand = [];
  const lowerBand = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sma = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
    const standardDeviation = Math.sqrt(slice.reduce((acc, curr) => acc + Math.pow(curr.close - sma, 2), 0) / period);

    middleBand.push({ time: data[i].time, value: sma });
    upperBand.push({ time: data[i].time, value: sma + (standardDeviation * stdDev) });
    lowerBand.push({ time: data[i].time, value: sma - (standardDeviation * stdDev) });
  }

  return { upper: upperBand, middle: middleBand, lower: lowerBand };
};
