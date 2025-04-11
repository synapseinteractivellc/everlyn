// PerformanceMonitor.js - Performance monitoring utility
// This module helps identify performance bottlenecks in the application

/**
 * PerformanceMonitor - Utility for tracking performance metrics
 */
const PerformanceMonitor = {
    /**
     * Performance tracking data
     * @private
     */
    _metrics: new Map(),
    
    /**
     * Whether monitoring is enabled
     * @private
     */
    _enabled: false,
    
    /**
     * Minimum threshold for logging performance issues (ms)
     * @private
     */
    _threshold: 50,
    
    /**
     * Enable performance monitoring
     * @param {Object} options - Configuration options
     * @param {number} [options.threshold] - Threshold for logging (ms)
     */
    enable: function(options = {}) {
        this._enabled = true;
        if (options.threshold !== undefined) {
            this._threshold = options.threshold;
        }
        console.log(`PerformanceMonitor enabled (threshold: ${this._threshold}ms)`);
    },
    
    /**
     * Disable performance monitoring
     */
    disable: function() {
        this._enabled = false;
        console.log('PerformanceMonitor disabled');
    },
    
    /**
     * Start timing a function or code block
     * @param {string} label - Label for the timing
     * @returns {Function} - Function to call when complete
     */
    start: function(label) {
        if (!this._enabled) return () => {};
        
        const startTime = performance.now();
        
        // Return function to end timing
        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            this._recordMetric(label, duration);
            
            // Log slow operations
            if (duration > this._threshold) {
                console.warn(`[Performance] Slow operation: ${label} took ${duration.toFixed(2)}ms`);
            }
            
            return duration;
        };
    },
    
    /**
     * Measure execution time of a function
     * @param {Function} fn - Function to measure
     * @param {string} label - Label for the timing
     * @param {Array} args - Arguments to pass to the function
     * @returns {*} - Result of the function
     */
    measure: function(fn, label, ...args) {
        if (!this._enabled) return fn(...args);
        
        const end = this.start(label);
        try {
            const result = fn(...args);
            end();
            return result;
        } catch (error) {
            end();
            throw error;
        }
    },
    
    /**
     * Measure execution time of an async function
     * @param {Function} fn - Async function to measure
     * @param {string} label - Label for the timing
     * @param {Array} args - Arguments to pass to the function
     * @returns {Promise<*>} - Result of the function
     */
    measureAsync: async function(fn, label, ...args) {
        if (!this._enabled) return await fn(...args);
        
        const end = this.start(label);
        try {
            const result = await fn(...args);
            end();
            return result;
        } catch (error) {
            end();
            throw error;
        }
    },
    
    /**
     * Create a wrapped version of a function that measures performance
     * @param {Function} fn - Function to wrap
     * @param {string} label - Label for the timing
     * @returns {Function} - Wrapped function
     */
    wrapFunction: function(fn, label) {
        if (!this._enabled) return fn;
        
        return (...args) => this.measure(fn, label, ...args);
    },
    
    /**
     * Create a wrapped version of an async function that measures performance
     * @param {Function} fn - Async function to wrap
     * @param {string} label - Label for the timing
     * @returns {Function} - Wrapped async function
     */
    wrapAsyncFunction: function(fn, label) {
        if (!this._enabled) return fn;
        
        return async (...args) => this.measureAsync(fn, label, ...args);
    },
    
    /**
     * Record a performance metric
     * @param {string} label - Metric label
     * @param {number} duration - Duration in milliseconds
     * @private
     */
    _recordMetric: function(label, duration) {
        if (!this._metrics.has(label)) {
            this._metrics.set(label, {
                count: 0,
                total: 0,
                min: Infinity,
                max: 0,
                recent: []
            });
        }
        
        const metric = this._metrics.get(label);
        metric.count++;
        metric.total += duration;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);
        
        // Keep track of 10 most recent values
        metric.recent.push(duration);
        if (metric.recent.length > 10) {
            metric.recent.shift();
        }
    },
    
    /**
     * Get performance data for a specific label
     * @param {string} label - Metric label
     * @returns {Object|null} - Performance data or null if not found
     */
    getMetric: function(label) {
        if (!this._metrics.has(label)) return null;
        
        const metric = this._metrics.get(label);
        return {
            count: metric.count,
            total: metric.total,
            average: metric.total / metric.count,
            min: metric.min,
            max: metric.max,
            recent: [...metric.recent]
        };
    },
    
    /**
     * Get all performance metrics
     * @returns {Object} - All performance data
     */
    getAllMetrics: function() {
        const result = {};
        
        this._metrics.forEach((metric, label) => {
            result[label] = {
                count: metric.count,
                total: metric.total,
                average: metric.total / metric.count,
                min: metric.min,
                max: metric.max,
                recent: [...metric.recent]
            };
        });
        
        return result;
    },
    
    /**
     * Clear performance metrics
     * @param {string} [label] - Specific label to clear (optional)
     */
    clearMetrics: function(label) {
        if (label) {
            this._metrics.delete(label);
        } else {
            this._metrics.clear();
        }
    },
    
    /**
     * Print performance report to console
     */
    printReport: function() {
        if (this._metrics.size === 0) {
            console.log('No performance metrics recorded');
            return;
        }
        
        console.group('Performance Report');
        
        // Sort metrics by average time (descending)
        const sortedMetrics = [...this._metrics.entries()]
            .map(([label, metric]) => ({
                label,
                average: metric.total / metric.count,
                count: metric.count,
                total: metric.total,
                min: metric.min,
                max: metric.max
            }))
            .sort((a, b) => b.average - a.average);
        
        // Log table
        console.table(sortedMetrics.map(m => ({
            Label: m.label,
            'Avg (ms)': m.average.toFixed(2),
            'Min (ms)': m.min.toFixed(2),
            'Max (ms)': m.max.toFixed(2),
            'Total (ms)': m.total.toFixed(2),
            'Count': m.count
        })));
        
        console.groupEnd();
    }
};

export default PerformanceMonitor;