import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { Box, Typography, Paper } from '@mui/material';

export const StockChart = ({ data, indicatorData, indicatorType, indicatorColor }) => {
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null); 
  const candlestickSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef(null);

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
    const lineSeries = chart.addSeries(LineSeries, {
      color: indicatorColor || '#2962ff',
      lineWidth: 2,
    });
    indicatorSeriesRef.current = lineSeries;

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
         // Optionally reset to last available data or null
         // For now, let's keep the last valid hover or do nothing
         return;
      }

      const candleData = param.seriesData.get(candleSeries);
      const indData = param.seriesData.get(lineSeries);

      if (candleData) {
        setLegend({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          indicator: indData ? indData.value : null
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
    if (indicatorSeriesRef.current) {
        // Toggle visibility based on data presence
        if(indicatorData && indicatorData.length > 0) {
            indicatorSeriesRef.current.setData(indicatorData);
            indicatorSeriesRef.current.applyOptions({
                visible: true,
                color: indicatorColor || '#2962ff'
            });
        } else {
            indicatorSeriesRef.current.setData([]);
            indicatorSeriesRef.current.applyOptions({ visible: false });
        }
    }
  }, [indicatorData, indicatorColor]);


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
                pointerEvents: 'none', // Allow clicks to pass through to chart
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
