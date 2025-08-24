import React, { useEffect } from 'react';
import { useChartHighlight } from '../context/ChartHighlightContext';

const ChartOverlay = ({ chartId = 'retirementChart', chartInstance }) => {
  const { highlights } = useChartHighlight();
  const chartHighlights = highlights[chartId] || {};

  useEffect(() => {
    if (chartInstance && chartInstance.current) {
      const chart = chartInstance.current;
      const canvas = chart.canvas;
      const ctx = canvas.getContext('2d');
      
      // Store original draw function if not already stored
      if (!chart._originalDraw) {
        chart._originalDraw = chart.draw;
      }
      
      // Override draw function to add highlights
      chart.draw = function() {
        // Call original draw first
        chart._originalDraw.call(this);
        
        // Add highlights on top
        if (chartHighlights.blueLine) {
          addBlueLineGlow(ctx, chart);
        }
        if (chartHighlights.redDot) {
          addRedDotPulse(ctx, chart);
        }
        if (chartHighlights.growthPhase) {
          addGrowthPhaseHighlight(ctx, chart);
        }
        if (chartHighlights.withdrawalPhase) {
          addWithdrawalPhaseHighlight(ctx, chart);
        }
        if (chartHighlights.bothPhases) {
          addGrowthPhaseHighlight(ctx, chart);
          addWithdrawalPhaseHighlight(ctx, chart);
        }
      };
      
      // Trigger redraw
      chart.update('none');
    }
    
    return () => {
      // Cleanup: restore original draw function
      if (chartInstance && chartInstance.current && chartInstance.current._originalDraw) {
        chartInstance.current.draw = chartInstance.current._originalDraw;
        chartInstance.current.update('none');
      }
    };
  }, [chartHighlights, chartInstance]);

  const addBlueLineGlow = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    ctx.save();
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    
    // Draw glowing line for entire curve
    ctx.beginPath();
    for (let i = 0; i < meta.data.length; i++) {
      const point = meta.data[i];
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  const addRedDotPulse = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    // Find retirement point by checking actual chart configuration
    const dataset = chart.data.datasets[0];
    let retirementIndex = -1;
    
    // Look for the point with larger radius (retirement point)
    for (let i = 0; i < meta.data.length; i++) {
      if (typeof dataset.pointRadius === 'function') {
        const radius = dataset.pointRadius({ dataIndex: i });
        if (radius === 6) {
          retirementIndex = i;
          break;
        }
      }
    }
    
    if (retirementIndex === -1) {
      retirementIndex = Math.floor(meta.data.length * 0.6);
    }
    
    const point = meta.data[retirementIndex];
    
    ctx.save();
    // Pulsing ring effect - perfectly centered on existing dot
    const time = Date.now() * 0.005;
    const pulseRadius = 10 + Math.sin(time) * 3;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 + Math.sin(time) * 0.3;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, pulseRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  };

  const addGrowthPhaseHighlight = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    const retirementIndex = Math.floor(meta.data.length * 0.6);
    const chartArea = chart.chartArea;
    
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)'; // More visible green background
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw vertical line at growth phase end (retirement)
    const retirementPoint = meta.data[retirementIndex];
    ctx.beginPath();
    ctx.moveTo(retirementPoint.x, chartArea.top);
    ctx.lineTo(retirementPoint.x, chartArea.bottom);
    ctx.stroke();
    
    // Add more visible background highlight for growth area
    ctx.fillRect(chartArea.left, chartArea.top, retirementPoint.x - chartArea.left, chartArea.height);
    
    ctx.restore();
  };

  const addWithdrawalPhaseHighlight = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    const retirementIndex = Math.floor(meta.data.length * 0.6);
    const chartArea = chart.chartArea;
    
    ctx.save();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw vertical line at withdrawal phase start (retirement)
    const retirementPoint = meta.data[retirementIndex];
    ctx.beginPath();
    ctx.moveTo(retirementPoint.x, chartArea.top);
    ctx.lineTo(retirementPoint.x, chartArea.bottom);
    ctx.stroke();
    
    // Add subtle background highlight for withdrawal area
    ctx.fillRect(retirementPoint.x, chartArea.top, chartArea.right - retirementPoint.x, chartArea.height);
    
    ctx.restore();
  };


  return null; // No DOM elements needed
};

export default ChartOverlay;
