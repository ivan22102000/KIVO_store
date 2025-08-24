// Admin Dashboard Canvas Gauges Implementation
// Creates animated circular gauges for metrics visualization

// Canvas Gauge Implementation
function createGauge(canvasId, value, maxValue, color, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas with id "${canvasId}" not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate progress
    const progress = Math.min(value / maxValue, 1);
    const startAngle = 0.75 * Math.PI; // Start from bottom left
    const endAngle = 0.25 * Math.PI; // End at bottom right
    const totalAngle = endAngle - startAngle + 2 * Math.PI;
    const progressAngle = startAngle + progress * totalAngle;
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle + 2 * Math.PI);
    ctx.strokeStyle = options.backgroundColor || '#e2e8f0';
    ctx.lineWidth = options.lineWidth || 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw progress arc with gradient
    const gradient = ctx.createLinearGradient(
        centerX - radius, centerY - radius,
        centerX + radius, centerY + radius
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lightenColor(color, 20));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, progressAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = options.lineWidth || 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw value text
    ctx.font = `bold ${options.fontSize || '24px'} Inter`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const displayValue = options.displaySuffix ? 
        Math.round(value) + (options.displaySuffix) : 
        Math.round(value);
    
    ctx.fillText(displayValue, centerX, centerY + 8);
    
    // Draw label if provided
    if (options.label) {
        ctx.font = `500 ${options.labelFontSize || '12px'} Inter`;
        ctx.fillStyle = '#6B7280';
        ctx.fillText(options.label, centerX, centerY + 35);
    }
    
    // Animate if this is the first draw
    if (!canvas.dataset.animated) {
        canvas.dataset.animated = 'true';
        animateGauge(canvasId, 0, value, maxValue, color, options);
    }
}

// Animate gauge from 0 to target value
function animateGauge(canvasId, startValue, targetValue, maxValue, color, options = {}) {
    const duration = options.animationDuration || 1500;
    const frames = 60;
    const increment = (targetValue - startValue) / frames;
    let currentValue = startValue;
    let frame = 0;
    
    const animate = () => {
        if (frame >= frames) {
            currentValue = targetValue;
        } else {
            currentValue += increment;
        }
        
        // Use easing function for smooth animation
        const easedValue = easeOutCubic(frame / frames) * targetValue;
        createGaugeStatic(canvasId, easedValue, maxValue, color, options);
        
        frame++;
        if (frame <= frames) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// Static gauge drawing (for animation frames)
function createGaugeStatic(canvasId, value, maxValue, color, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const progress = Math.min(value / maxValue, 1);
    const startAngle = 0.75 * Math.PI;
    const endAngle = 0.25 * Math.PI;
    const totalAngle = endAngle - startAngle + 2 * Math.PI;
    const progressAngle = startAngle + progress * totalAngle;
    
    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle + 2 * Math.PI);
    ctx.strokeStyle = options.backgroundColor || '#e2e8f0';
    ctx.lineWidth = options.lineWidth || 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Progress arc
    const gradient = ctx.createLinearGradient(
        centerX - radius, centerY - radius,
        centerX + radius, centerY + radius
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lightenColor(color, 20));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, progressAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = options.lineWidth || 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Value text
    ctx.font = `bold ${options.fontSize || '24px'} Inter`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const displayValue = options.displaySuffix ? 
        Math.round(value) + options.displaySuffix : 
        Math.round(value);
    
    ctx.fillText(displayValue, centerX, centerY + 8);
}

// Utility function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Easing function for smooth animations
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Advanced gauge with multiple data points
function createMultiDataGauge(canvasId, dataPoints, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const totalValue = dataPoints.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top
    
    dataPoints.forEach((point, index) => {
        const sliceAngle = (point.value / totalValue) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = point.color;
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.font = '12px Inter';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(point.label, labelX, labelY);
        
        currentAngle += sliceAngle;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Draw center text
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.fillText(options.centerText || 'Total', centerX, centerY);
}

// Real-time gauge updater
function updateGaugeRealtime(canvasId, newValue, maxValue, color, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Store the current value for smooth transitions
    const currentValue = parseFloat(canvas.dataset.currentValue || 0);
    canvas.dataset.currentValue = newValue;
    
    // Animate from current to new value
    const duration = options.updateDuration || 800;
    const frames = 30;
    const increment = (newValue - currentValue) / frames;
    let frame = 0;
    
    const animate = () => {
        const value = currentValue + (increment * frame);
        createGaugeStatic(canvasId, value, maxValue, color, options);
        
        frame++;
        if (frame <= frames) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// Initialize all gauges on page load
function initializeGauges() {
    // Set canvas dimensions for proper rendering
    const canvases = document.querySelectorAll('.gauge-canvas');
    canvases.forEach(canvas => {
        const container = canvas.parentElement;
        const size = Math.min(container.offsetWidth, 200);
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
    });
}

// Export functions for global use
window.createGauge = createGauge;
window.createMultiDataGauge = createMultiDataGauge;
window.updateGaugeRealtime = updateGaugeRealtime;
window.initializeGauges = initializeGauges;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGauges);
} else {
    initializeGauges();
}
