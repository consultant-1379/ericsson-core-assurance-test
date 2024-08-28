import { Trend } from 'k6/metrics';
export const healthCheckDurationTrend = new Trend('Health Check Duration', true);
export const useCaseDurationTrend = new Trend('Use Case Duration', true);