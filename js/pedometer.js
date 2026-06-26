// ═══════════════════════════════════════════════════════════════════
// PAC-STORE — Pedometer (Step Detection via DeviceMotion)
// ═══════════════════════════════════════════════════════════════════

/**
 * Pedometer module - detects steps using DeviceMotion API.
 * Broadcasts 'step' events that the game can listen to.
 */
class Pedometer {
  constructor() {
    this._isActive = false;
    this._stepCount = 0;
    this._lastMagnitude = 0;
    this._threshold = 1.2; // Acceleration threshold for step detection
    this._cooldown = 0;
    this._cooldownMs = 400; // Minimum ms between steps
    this._lastStepTime = 0;
    this._listeners = [];
    this._boundHandler = this._handleMotion.bind(this);
  }

  /**
   * Start listening for steps.
   * @param {Function} onStep - Callback invoked on each step detected.
   */
  start(onStep) {
    if (typeof DeviceMotionEvent === 'undefined') {
      console.warn('Pedometer: DeviceMotion not supported on this device/browser.');
      return false;
    }

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ requires permission
      DeviceMotionEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            this._activate(onStep);
          } else {
            console.warn('Pedometer: Motion permission denied.');
          }
        })
        .catch(err => {
          // Fallback: try without permission (older iOS / desktop)
          this._activate(onStep);
        });
    } else {
      this._activate(onStep);
    }
    return true;
  }

  _activate(onStep) {
    if (onStep) this._listeners.push(onStep);
    if (!this._isActive) {
      this._isActive = true;
      window.addEventListener('devicemotion', this._boundHandler);
    }
  }

  /**
   * Stop listening for steps.
   */
  stop() {
    this._isActive = false;
    window.removeEventListener('devicemotion', this._boundHandler);
    this._listeners = [];
  }

  /**
   * Reset step counter to zero.
   */
  reset() {
    this._stepCount = 0;
    this._lastStepTime = 0;
  }

  /**
   * Get current step count.
   */
  get count() {
    return this._stepCount;
  }

  /**
   * Check if pedometer is active.
   */
  get isActive() {
    return this._isActive;
  }

  _handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const magnitude = Math.sqrt(
      (acc.x || 0) ** 2 +
      (acc.y || 0) ** 2 +
      (acc.z || 0) ** 2
    );

    const now = Date.now();

    // Detect step: magnitude crosses threshold with cooldown
    if (
      magnitude > this._threshold &&
      this._lastMagnitude <= this._threshold &&
      now - this._lastStepTime > this._cooldownMs
    ) {
      this._stepCount++;
      this._lastStepTime = now;

      // Notify all listeners
      for (const listener of this._listeners) {
        try {
          listener(this._stepCount);
        } catch (e) {
          console.error('Pedometer listener error:', e);
        }
      }
    }

    this._lastMagnitude = magnitude;
  }
}

// Singleton instance
export const pedometer = new Pedometer();
