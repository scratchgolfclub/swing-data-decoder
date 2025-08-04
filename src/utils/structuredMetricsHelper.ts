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

// Convert raw swing data to structured metrics
export const convertRawSwingDataToStructuredMetrics = (swingData: any): StructuredMetric[] => {
  if (!swingData) return [];

  const metrics: StructuredMetric[] = [];

  // Club Data Metrics
  if (swingData.club_speed != null) {
    metrics.push({
      title: 'Club Speed',
      value: `${swingData.club_speed} mph`,
      descriptor: 'The velocity of the clubhead at impact'
    });
  }

  if (swingData.smash_factor != null) {
    metrics.push({
      title: 'Smash Factor',
      value: swingData.smash_factor.toFixed(2),
      descriptor: 'Efficiency of energy transfer from club to ball'
    });
  }

  if (swingData.attack_angle != null) {
    metrics.push({
      title: 'Attack Angle',
      value: `${swingData.attack_angle.toFixed(1)}°`,
      descriptor: 'The angle at which the club strikes the ball'
    });
  }

  if (swingData.club_path != null) {
    metrics.push({
      title: 'Club Path',
      value: `${swingData.club_path.toFixed(1)}°`,
      descriptor: 'The direction of the clubhead through impact'
    });
  }

  if (swingData.face_angle != null) {
    metrics.push({
      title: 'Face Angle',
      value: `${swingData.face_angle.toFixed(1)}°`,
      descriptor: 'The clubface angle at impact relative to target'
    });
  }

  if (swingData.face_to_path != null) {
    metrics.push({
      title: 'Face to Path',
      value: `${swingData.face_to_path.toFixed(1)}°`,
      descriptor: 'The difference between face angle and club path'
    });
  }

  if (swingData.dynamic_loft != null) {
    metrics.push({
      title: 'Dynamic Loft',
      value: `${swingData.dynamic_loft.toFixed(1)}°`,
      descriptor: 'The effective loft of the club at impact'
    });
  }

  if (swingData.swing_direction != null) {
    metrics.push({
      title: 'Swing Direction',
      value: `${swingData.swing_direction.toFixed(1)}°`,
      descriptor: 'The overall direction of the swing plane'
    });
  }

  // Ball Data Metrics
  if (swingData.ball_speed != null) {
    metrics.push({
      title: 'Ball Speed',
      value: `${swingData.ball_speed} mph`,
      descriptor: 'The initial velocity of the ball after impact'
    });
  }

  if (swingData.launch_angle != null) {
    metrics.push({
      title: 'Launch Angle',
      value: `${swingData.launch_angle.toFixed(1)}°`,
      descriptor: 'The vertical angle at which the ball launches'
    });
  }

  if (swingData.launch_direction != null) {
    metrics.push({
      title: 'Launch Direction',
      value: `${swingData.launch_direction.toFixed(1)}°`,
      descriptor: 'The horizontal direction the ball starts'
    });
  }

  if (swingData.spin_rate != null) {
    metrics.push({
      title: 'Spin Rate',
      value: `${swingData.spin_rate} rpm`,
      descriptor: 'The backspin rate of the ball'
    });
  }

  if (swingData.spin_axis != null) {
    metrics.push({
      title: 'Spin Axis',
      value: `${swingData.spin_axis.toFixed(1)}°`,
      descriptor: 'The tilt of the spin axis affecting ball curve'
    });
  }

  if (swingData.spin_loft != null) {
    metrics.push({
      title: 'Spin Loft',
      value: `${swingData.spin_loft.toFixed(1)}°`,
      descriptor: 'The difference between dynamic loft and attack angle'
    });
  }

  // Flight Data Metrics
  if (swingData.carry != null) {
    metrics.push({
      title: 'Carry Distance',
      value: `${swingData.carry} yds`,
      descriptor: 'Distance the ball travels in the air'
    });
  }

  if (swingData.total != null) {
    metrics.push({
      title: 'Total Distance',
      value: `${swingData.total} yds`,
      descriptor: 'Total distance including roll'
    });
  }

  if (swingData.side != null) {
    metrics.push({
      title: 'Side',
      value: `${swingData.side} yds`,
      descriptor: 'Lateral distance from target line'
    });
  }

  if (swingData.curve != null) {
    metrics.push({
      title: 'Curve',
      value: `${swingData.curve} yds`,
      descriptor: 'Total curvature of the ball flight'
    });
  }

  if (swingData.height != null) {
    metrics.push({
      title: 'Max Height',
      value: `${swingData.height} yds`,
      descriptor: 'Maximum height reached by the ball'
    });
  }

  if (swingData.hang_time != null) {
    metrics.push({
      title: 'Hang Time',
      value: `${swingData.hang_time} s`,
      descriptor: 'Time the ball spends in the air'
    });
  }

  if (swingData.landing_angle != null) {
    metrics.push({
      title: 'Landing Angle',
      value: `${swingData.landing_angle.toFixed(1)}°`,
      descriptor: 'The angle at which the ball hits the ground'
    });
  }

  return metrics;
};

// Main function to get structured metrics - handles both formats
export const getStructuredMetrics = (data: any): StructuredMetric[] => {
  // Handle array of already structured metrics
  if (Array.isArray(data) && 
      data.length > 0 && 
      data.every(metric => 
        typeof metric === 'object' &&
        'title' in metric &&
        'value' in metric &&
        'descriptor' in metric
      )) {
    return data;
  }
  
  // Handle raw swing data object
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return convertRawSwingDataToStructuredMetrics(data);
  }
  
  return [];
};