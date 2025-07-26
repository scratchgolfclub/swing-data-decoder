export interface StructuredMetric {
  title: string;
  value: string | number;
  descriptor: string;
}

// Find a specific metric by title
export const findMetricByTitle = (metrics: StructuredMetric[], title: string): StructuredMetric | undefined => {
  return metrics?.find(metric => metric.title.toLowerCase().includes(title.toLowerCase()));
};

// Get numeric value from a metric
export const getMetricValue = (metrics: StructuredMetric[], title: string): number | null => {
  const metric = findMetricByTitle(metrics, title);
  if (!metric) return null;
  
  // Handle both string and number values
  if (typeof metric.value === 'number') {
    return metric.value;
  }
  
  if (typeof metric.value === 'string') {
    // Extract numeric value from string
    const numValue = parseFloat(metric.value.replace(/[^\d.-]/g, ''));
    return isNaN(numValue) ? null : numValue;
  }
  
  // Try to convert to number if it's another type
  const numValue = parseFloat(String(metric.value).replace(/[^\d.-]/g, ''));
  return isNaN(numValue) ? null : numValue;
};

// Get display value for a metric
export const getMetricDisplay = (metrics: StructuredMetric[], title: string): string => {
  const metric = findMetricByTitle(metrics, title);
  return metric?.value ? String(metric.value) : '';
};

// Main function to get structured metrics - only handles new format
export const getStructuredMetrics = (metrics: any): StructuredMetric[] => {
  if (Array.isArray(metrics) && 
      metrics.length > 0 && 
      metrics.every(metric => 
        typeof metric === 'object' &&
        'title' in metric &&
        'value' in metric &&
        'descriptor' in metric
      )) {
    return metrics;
  }
  
  return [];
};