import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { Box, Typography, Paper } from '@mui/material';

export const StockChart = ({ data, indicatorData, indicatorType, indicatorColor }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const candlestickSeriesRef = useRef(null);
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
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      timeScale: {
        borderColor: '#cccccc',
      },
    });

    chartInstance.current = chart;

    // 2. Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candleSeries;

    // 3. Add Indicator Series (Placeholder)
    indicatorSeriesRef.current = chart.addSeries(LineSeries, {
      color: indicatorColor || '#2962ff',
      lineWidth: 2,
    });

    // Bollinger Bands Series
    bollingerBandsSeriesRef.current.upper = chart.addSeries(LineSeries, { color: '#4caf50', lineWidth: 1, visible: false });
    bollingerBandsSeriesRef.current.middle = chart.addSeries(LineSeries, { color: '#ff9800', lineWidth: 1, visible: false });
    bollingerBandsSeriesRef.current.lower = chart.addSeries(LineSeries, { color: '#f44336', lineWidth: 1, visible: false });

    // MACD Series
    macdSeriesRef.current.macd = chart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 2, visible: false });
    macdSeriesRef.current.signal = chart.addSeries(LineSeries, { color: '#ff6d00', lineWidth: 2, visible: false });
    macdSeriesRef.current.histogram = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        base: 0,
        visible: false,
    });

    // 4. Initial Data Set
    if (data && data.length > 0) {
      candleSeries.setData(data);
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

      const candleData = param.seriesData.get(candlestickSeriesRef.current);
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

      if (candleData) {
        setLegend({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          indicator: indData ? indData.value : null,
          bollingerBands: bbData.upper ? bbData : null,
          macd: macdData.macd ? macdData : null,
        });
      }
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

  // Update Data Effects
  useEffect(() => {
    if (candlestickSeriesRef.current && data) {
      candlestickSeriesRef.current.setData(data);
      chartInstance.current.timeScale().fitContent();

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