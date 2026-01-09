import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, CandlestickSeries, HistogramSeries, AreaSeries } from 'lightweight-charts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

export const StockChart = ({ data, indicatorData, indicatorType, indicatorColor, chartType = 'candlestick' }) => {
  const theme = useTheme();
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null); // Ref for Line/Area chart
  const indicatorSeriesRef = useRef(null);
  const bollingerBandsSeriesRef = useRef({ upper: null, middle: null, lower: null });
  const macdSeriesRef = useRef({ macd: null, signal: null, histogram: null });

  // Legend State
  const [legend, setLegend] = useState(null);

  useEffect(() => {
    // 1. Initialize Chart
    const handleResize = () => {
      if (chartInstance.current && chartContainerRef.current) {
        chartInstance.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme.palette.background.paper },
        textColor: theme.palette.text.primary,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: theme.palette.divider },
        horzLines: { color: theme.palette.divider },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      timeScale: {
        borderColor: theme.palette.divider,
      },
    });

    chartInstance.current = chart;

    // 2. Add Series
    // Candlestick
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', // Green 500
      downColor: '#ef4444', // Red 500
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      visible: chartType === 'candlestick', 
    });
    candlestickSeriesRef.current = candleSeries;

    // Area (Line)
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: theme.palette.primary.main,
      topColor: `${theme.palette.primary.main}4d`, // 30% Alpha approx
      bottomColor: `${theme.palette.primary.main}00`, // 0% Alpha
      visible: chartType === 'line',
    });
    areaSeriesRef.current = areaSeries;

    // 3. Add Indicator Series (Placeholder)
    indicatorSeriesRef.current = chart.addSeries(LineSeries, {
      color: indicatorColor || theme.palette.primary.main,
      lineWidth: 2,
    });

    // Bollinger Bands Series
    bollingerBandsSeriesRef.current.upper = chart.addSeries(LineSeries, { color: '#22c55e', lineWidth: 1, visible: false });
    bollingerBandsSeriesRef.current.middle = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, visible: false }); // Amber 500
    bollingerBandsSeriesRef.current.lower = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, visible: false });

    // MACD Series
    macdSeriesRef.current.macd = chart.addSeries(LineSeries, { color: theme.palette.primary.main, lineWidth: 2, visible: false });
    macdSeriesRef.current.signal = chart.addSeries(LineSeries, { color: '#f97316', lineWidth: 2, visible: false }); // Orange 500
    macdSeriesRef.current.histogram = chart.addSeries(HistogramSeries, {
        color: '#22c55e',
        base: 0,
        visible: false,
    });

    // 4. Initial Data Set
    if (data && data.length > 0) {
      candleSeries.setData(data);
      
      // For Area series, we need singular value (close price) not OHLC
      const areaData = data.map(d => ({ time: d.time, value: d.close }));
      areaSeries.setData(areaData);

      // Set initial legend to last data point
      const last = data[data.length - 1];
      setLegend({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        time: last.time,
        indicator: null
      });
    }

    // 5. Crosshair Handler (Legend Update)
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
         return;
      }

      // Try to get data from whichever series is active, or both.
      // Note: param.seriesData is a Map.
      const candleData = param.seriesData.get(candlestickSeriesRef.current);
      const areaData = param.seriesData.get(areaSeriesRef.current);
      
      const indData = indicatorSeriesRef.current ? param.seriesData.get(indicatorSeriesRef.current) : null;
      const bbData = {
          upper: bollingerBandsSeriesRef.current.upper ? param.seriesData.get(bollingerBandsSeriesRef.current.upper) : null,
          middle: bollingerBandsSeriesRef.current.middle ? param.seriesData.get(bollingerBandsSeriesRef.current.middle) : null,
          lower: bollingerBandsSeriesRef.current.lower ? param.seriesData.get(bollingerBandsSeriesRef.current.lower) : null,
      };
      const macdData = {
        macd: macdSeriesRef.current.macd ? param.seriesData.get(macdSeriesRef.current.macd) : null,
        signal: macdSeriesRef.current.signal ? param.seriesData.get(macdSeriesRef.current.signal) : null,
        histogram: macdSeriesRef.current.histogram ? param.seriesData.get(macdSeriesRef.current.histogram) : null,
      };

      // Construct legend data. 
      // If candleData is present, we have OHLC.
      // If only areaData is present, we basically only have "Close" (value).
      // However, usually the 'data' source is the same full object, so even if we use area chart, we "typically" want to see the full OHLC info if available in the original source, but the crosshair might only return what that specific series holds.
      // LightWeight Charts 'seriesData' returns the data item provided to setData.
      // For AreaSeries we provided {time, value}. So we only get value (Close).
      
      let legendValues = {};
      
      if (candleData) {
          legendValues = {
              open: candleData.open,
              high: candleData.high,
              low: candleData.low,
              close: candleData.close,
          };
      } else if (areaData) {
          // If we are in line mode, we only get 'value' which is the close price.
          legendValues = {
              close: areaData.value
          };
      }

      setLegend({
          ...legendValues,
        indicator: indData ? indData.value : null,
        bollingerBands: bbData.upper ? bbData : null,
        macd: macdData.macd ? macdData : null,
      });
    });

    // 6. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Effect: Handle Chart Type Switching
  useEffect(() => {
      if (candlestickSeriesRef.current && areaSeriesRef.current) {
          if (chartType === 'candlestick') {
            candlestickSeriesRef.current.applyOptions({ visible: true });
            areaSeriesRef.current.applyOptions({ visible: false });
          } else {
            candlestickSeriesRef.current.applyOptions({ visible: false });
            areaSeriesRef.current.applyOptions({ visible: true });
          }
      }
  }, [chartType]);

  // Update Data Effects
  useEffect(() => {
    if (data) {
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(data);
      }
      if (areaSeriesRef.current) {
           const areaData = data.map(d => ({ time: d.time, value: d.close }));
           areaSeriesRef.current.setData(areaData);
      }

      if (chartInstance.current) {
           chartInstance.current.timeScale().fitContent();
      }

      if(data.length > 0) {
         const last = data[data.length - 1];
         setLegend(prev => ({...prev, open: last.open, high: last.high, low: last.low, close: last.close }));
      }
    }
  }, [data]);

   useEffect(() => {
    const isBollingerBands = indicatorType === 'BollingerBands' && indicatorData && indicatorData.upper;
    const isMACD = indicatorType === 'MACD' && indicatorData && indicatorData.macdLine;

    // Handle single line indicators
    if (indicatorSeriesRef.current) {
        const shouldShow = !isBollingerBands && !isMACD && indicatorData && indicatorData.length > 0;
        indicatorSeriesRef.current.setData(shouldShow ? indicatorData : []);
        indicatorSeriesRef.current.applyOptions({
            visible: shouldShow,
            color: indicatorColor || '#2962ff'
        });
    }

    // Handle Bollinger Bands
    if (bollingerBandsSeriesRef.current.upper) {
        bollingerBandsSeriesRef.current.upper.setData(isBollingerBands ? indicatorData.upper : []);
        bollingerBandsSeriesRef.current.middle.setData(isBollingerBands ? indicatorData.middle : []);
        bollingerBandsSeriesRef.current.lower.setData(isBollingerBands ? indicatorData.lower : []);
        bollingerBandsSeriesRef.current.upper.applyOptions({ visible: isBollingerBands });
        bollingerBandsSeriesRef.current.middle.applyOptions({ visible: isBollingerBands });
        bollingerBandsSeriesRef.current.lower.applyOptions({ visible: isBollingerBands });
    }

    // Handle MACD
    if (macdSeriesRef.current.macd) {
        const histogramData = isMACD ? indicatorData.histogram.map(d => ({ ...d, color: d.value > 0 ? '#26a69a' : '#ef5350' })) : [];
        macdSeriesRef.current.macd.setData(isMACD ? indicatorData.macdLine : []);
        macdSeriesRef.current.signal.setData(isMACD ? indicatorData.signalLine : []);
        macdSeriesRef.current.histogram.setData(histogramData);
        macdSeriesRef.current.macd.applyOptions({ visible: isMACD });
        macdSeriesRef.current.signal.applyOptions({ visible: isMACD });
        macdSeriesRef.current.histogram.applyOptions({ visible: isMACD });
    }
  }, [indicatorData, indicatorType, indicatorColor]);


  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
        {/* Floating Legend */}
        <Paper
            elevation={0}
            sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 20,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                p: 1,
                borderRadius: 1,
                pointerEvents: 'none',
                border: '1px solid #e0e0e0',
                fontSize: '0.8rem',
                fontFamily: 'Roboto, sans-serif',
                lineHeight: 1.4
            }}
        >
            {legend ? (
                <>
                    <Box component="span" sx={{ mr: 1.5 }}>
                        <strong>O:</strong> {legend.open?.toFixed(2)}
                    </Box>
                    <Box component="span" sx={{ mr: 1.5 }}>
                        <strong>H:</strong> {legend.high?.toFixed(2)}
                    </Box>
                    <Box component="span" sx={{ mr: 1.5 }}>
                        <strong>L:</strong> {legend.low?.toFixed(2)}
                    </Box>
                    <Box component="span" sx={{ mr: 1.5 }}>
                        <strong>C:</strong> {legend.close?.toFixed(2)}
                    </Box>
                    {indicatorType && legend.indicator !== undefined && legend.indicator !== null && (
                         <Box component="span" sx={{ color: indicatorColor || '#2962ff' }}>
                            <strong>{indicatorType}:</strong> {legend.indicator?.toFixed(2)}
                        </Box>
                    )}
                    {indicatorType === 'BollingerBands' && legend.bollingerBands && (
                        <>
                            <Box component="span" sx={{ color: '#4caf50', mr: 1.5 }}>
                                <strong>Upper:</strong> {legend.bollingerBands.upper?.value.toFixed(2)}
                            </Box>
                            <Box component="span" sx={{ color: '#ff9800', mr: 1.5 }}>
                                <strong>Middle:</strong> {legend.bollingerBands.middle?.value.toFixed(2)}
                            </Box>
                            <Box component="span" sx={{ color: '#f44336' }}>
                                <strong>Lower:</strong> {legend.bollingerBands.lower?.value.toFixed(2)}
                            </Box>
                        </>
                    )}
                    {indicatorType === 'MACD' && legend.macd && (
                        <>
                            <Box component="span" sx={{ color: '#2962ff', mr: 1.5 }}>
                                <strong>MACD:</strong> {legend.macd.macd?.value.toFixed(2)}
                            </Box>
                            <Box component="span" sx={{ color: '#ff6d00', mr: 1.5 }}>
                                <strong>Signal:</strong> {legend.macd.signal?.value.toFixed(2)}
                            </Box>
                            <Box component="span" sx={{ color: legend.macd.histogram?.value > 0 ? '#26a69a' : '#ef5350' }}>
                                <strong>Hist:</strong> {legend.macd.histogram?.value.toFixed(2)}
                            </Box>
                        </>
                    )}
                </>
            ) : (
                <Typography variant="caption">Hover for details</Typography>
            )}
        </Paper>

        {/* Chart Container */}
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};