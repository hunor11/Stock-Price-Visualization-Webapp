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
