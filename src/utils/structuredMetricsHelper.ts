export interface StructuredMetric {
  title: string;
  value: string;
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
  
  // Extract numeric value from string
  const numValue = parseFloat(metric.value.replace(/[^\d.-]/g, ''));
  return isNaN(numValue) ? null : numValue;
};

// Get display value for a metric
export const getMetricDisplay = (metrics: StructuredMetric[], title: string): string => {
  const metric = findMetricByTitle(metrics, title);
  return metric?.value || '';
};

// Convert old unstructured metrics to structured format for backward compatibility
export const convertOldToStructured = (oldMetrics: any): StructuredMetric[] => {
  if (!oldMetrics || typeof oldMetrics !== 'object') return [];
  
  const structured: StructuredMetric[] = [];
  
  // Map common TrackMan metrics to structured format
  const metricMappings = [
    { key: 'clubSpeed', title: 'Club Speed', descriptor: 'Speed of clubhead at impact' },
    { key: 'ballSpeed', title: 'Ball Speed', descriptor: 'Speed of ball after impact' },
    { key: 'smashFactor', title: 'Smash Factor', descriptor: 'Efficiency of energy transfer' },
    { key: 'attackAngle', title: 'Attack Angle', descriptor: 'Club path angle at impact' },
    { key: 'clubPath', title: 'Club Path', descriptor: 'Direction of clubhead' },
    { key: 'faceAngle', title: 'Face Angle', descriptor: 'Clubface angle at impact' },
    { key: 'faceToPath', title: 'Face to Path', descriptor: 'Difference between face and path' },
    { key: 'launchAngle', title: 'Launch Angle', descriptor: 'Initial ball launch angle' },
    { key: 'launchDirection', title: 'Launch Direction', descriptor: 'Horizontal launch direction' },
    { key: 'spinRate', title: 'Spin Rate', descriptor: 'Ball rotation rate' },
    { key: 'spinAxis', title: 'Spin Axis', descriptor: 'Ball spin axis tilt' },
    { key: 'carryDistance', title: 'Carry Distance', descriptor: 'Distance ball carries in air' },
    { key: 'carry', title: 'Carry Distance', descriptor: 'Distance ball carries in air' },
    { key: 'total', title: 'Total Distance', descriptor: 'Total distance including roll' },
    { key: 'height', title: 'Height', descriptor: 'Maximum ball height' },
    { key: 'hangTime', title: 'Hang Time', descriptor: 'Time ball stays in air' },
    { key: 'landingAngle', title: 'Landing Angle', descriptor: 'Angle at which ball lands' },
    { key: 'curve', title: 'Curve', descriptor: 'Ball curve distance' },
    { key: 'side', title: 'Side', descriptor: 'Ball deviation from target line' },
    { key: 'dynLoft', title: 'Dynamic Loft', descriptor: 'Effective loft at impact' },
    { key: 'swingPlane', title: 'Swing Plane', descriptor: 'Swing plane angle' },
    { key: 'swingDirection', title: 'Swing Direction', descriptor: 'Overall swing direction' }
  ];
  
  metricMappings.forEach(mapping => {
    const value = oldMetrics[mapping.key];
    if (value != null && value !== '') {
      structured.push({
        title: mapping.title,
        value: String(value),
        descriptor: mapping.descriptor
      });
    }
  });
  
  return structured;
};

// Check if metrics are in structured format
export const isStructuredFormat = (metrics: any): metrics is StructuredMetric[] => {
  return Array.isArray(metrics) && metrics.length > 0 && 
         typeof metrics[0] === 'object' && 
         'title' in metrics[0] && 'value' in metrics[0] && 'descriptor' in metrics[0];
};

// Get metrics in structured format (handles both old and new formats)
export const getStructuredMetrics = (metrics: any): StructuredMetric[] => {
  if (!metrics) return [];
  
  if (isStructuredFormat(metrics)) {
    return metrics;
  }
  
  return convertOldToStructured(metrics);
};