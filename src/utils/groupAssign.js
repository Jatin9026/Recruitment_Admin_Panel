import { apiClient } from './apiConfig';
import { toast } from 'sonner';

class AutoScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.batchSize = 5; // Default batch size (configurable)
    this.roundDuration = 10; // Duration in minutes
    this.checkInterval = 5000; // Check every 5 seconds
    this.processedApplicants = new Set(); // Track already processed applicants
    this.onScheduleCallback = null; // Callback for UI updates
    this.lastProcessTime = 0; // Debounce mechanism
    this.minProcessGap = 30000; // Minimum 30 seconds between processing batches
  }

  // Configure the auto-scheduler
  configure(options = {}) {
    if (options.batchSize && options.batchSize > 0) {
      this.batchSize = options.batchSize;
    }
    if (options.roundDuration && options.roundDuration > 0) {
      this.roundDuration = options.roundDuration;
    }
    if (options.checkInterval && options.checkInterval >= 1000) {
      this.checkInterval = options.checkInterval;
    }
    if (options.onScheduleCallback && typeof options.onScheduleCallback === 'function') {
      this.onScheduleCallback = options.onScheduleCallback;
    }
  }

  // Start the auto-scheduler
  start() {
    if (this.isRunning) {
      console.log('Auto-scheduler is already running');
      return;
    }

    console.log(`Starting auto-scheduler with batch size: ${this.batchSize}`);
    this.isRunning = true;
    this.processedApplicants.clear(); // Reset processed list
    
    // Start the periodic check
    this.intervalId = setInterval(() => {
      this.checkAndProcess();
    }, this.checkInterval);

    toast.success(`Auto-scheduler started (Batch size: ${this.batchSize})`);
  }

  // Stop the auto-scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Auto-scheduler is not running');
      return;
    }

    console.log('Stopping auto-scheduler');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    toast.info('Auto-scheduler stopped');
  }

  // Check for present applicants and process if threshold is met
  async checkAndProcess() {
    try {
      // Debounce mechanism to prevent rapid successive processing
      const now = Date.now();
      if (now - this.lastProcessTime < this.minProcessGap) {
        return;
      }

      // Fetch current applicants data
      const applicants = await this.fetchApplicants();
      
      // Get present applicants who haven't been processed yet
      const presentApplicants = this.getPresentUnprocessedApplicants(applicants);
      
      console.log(`Auto-scheduler check: ${presentApplicants.length} present unprocessed applicants (threshold: ${this.batchSize})`);

      // Check if we have enough present applicants
      if (presentApplicants.length >= this.batchSize) {
        await this.processApplicants(presentApplicants.slice(0, this.batchSize));
        this.lastProcessTime = now;
      }
    } catch (error) {
      console.warn('Auto-scheduler check failed:', error.message);
      
      // Only show error toast for critical errors, not network issues
      if (error.message && !error.message.toLowerCase().includes('network') && 
          !error.message.toLowerCase().includes('fetch')) {
        toast.error('Auto-scheduler encountered an error', {
          duration: 3000
        });
      }
    }
  }

  // Fetch applicants data (optimized for scheduler)
  async fetchApplicants() {
    try {
      // Use a lighter API call or cached data when possible
      const applicants = await apiClient.getUsers();
      
      // Filter only the data we need for scheduling
      return applicants.filter(applicant => 
        applicant.assignedSlot && // Must have assigned slot
        applicant.isPresent === true // Must be marked present
      );
    } catch (error) {
      // Handle errors silently for background operation
      console.warn('Scheduler failed to fetch applicants:', error.message);
      return []; // Return empty array to continue operation
    }
  }

  // Get present applicants who haven't been processed yet
  getPresentUnprocessedApplicants(applicants) {
    return applicants.filter(applicant => 
      !this.processedApplicants.has(applicant.email) && // Not already processed
      !this.isAlreadyScheduled(applicant) // Not already scheduled for rounds
    );
  }

  // Check if applicant is already scheduled for rounds
  isAlreadyScheduled(applicant) {
    // Check if they have scheduled GD, Screening, or PI
    const hasScheduledGD = applicant.gd && (
      applicant.gd.status === 'scheduled' || 
      applicant.gd.status === 'selected' || 
      applicant.gd.status === 'rejected'
    );
    
    const hasScheduledScreening = applicant.screening && (
      applicant.screening.status === 'scheduled' || 
      applicant.screening.status === 'selected' || 
      applicant.screening.status === 'rejected'
    );
    
    const hasScheduledPI = applicant.pi && (
      applicant.pi.status === 'scheduled' || 
      applicant.pi.status === 'selected' || 
      applicant.pi.status === 'rejected'
    );

    return hasScheduledGD || hasScheduledScreening || hasScheduledPI;
  }

  // Process applicants by creating rounds
  async processApplicants(applicants) {
    try {
      console.log(`Processing ${applicants.length} applicants for round creation`);
      
      // Generate schedule times
      const scheduleData = this.generateScheduleData(applicants);
      
      // Call bulk create rounds API
      const result = await apiClient.bulkCreateRounds(scheduleData);
      
      // Mark these applicants as processed
      applicants.forEach(applicant => {
        this.processedApplicants.add(applicant.email);
      });

      // Notify UI callback first
      if (this.onScheduleCallback) {
        this.onScheduleCallback({
          type: 'batch_scheduled',
          applicants: applicants,
          batchData: result,
          timestamp: new Date()
        });
      }

      // Silent success - no toast here as callback handles notification
      console.log('Batch processing successful:', result);
      
    } catch (error) {
      console.error('Failed to process applicants:', error);
      
      // Only show error toast, success is handled by callback
      toast.error(`Auto-scheduler failed: ${error.message}`, {
        duration: 4000
      });
      
      // Don't mark as processed if failed, so they can be retried
    }
  }

  // Generate schedule data for bulk create rounds API
  generateScheduleData(applicants) {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const startTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Calculate end time (now + 30 minutes)
    const endDateTime = new Date(now.getTime() + 30 * 60 * 1000);
    const endTime = endDateTime.toTimeString().slice(0, 5); // HH:MM format

    return {
      emails: applicants.map(applicant => applicant.email),
      batchSize: this.batchSize,
      startDate: startDate,
      startTime: startTime,
      endTime: endTime,
      roundDuration: this.roundDuration
    };
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      batchSize: this.batchSize,
      roundDuration: this.roundDuration,
      checkInterval: this.checkInterval,
      processedCount: this.processedApplicants.size,
      lastProcessTime: this.lastProcessTime
    };
  }

  // Reset processed applicants (useful for new sessions)
  reset() {
    this.processedApplicants.clear();
    this.lastProcessTime = 0;
    console.log('Auto-scheduler reset - cleared processed applicants');
  }

  // Update batch size dynamically
  updateBatchSize(newBatchSize) {
    if (newBatchSize && newBatchSize > 0) {
      const oldSize = this.batchSize;
      this.batchSize = newBatchSize;
      console.log(`Batch size updated from ${oldSize} to ${newBatchSize}`);
      
      if (this.isRunning) {
        toast.info(`Batch size updated to ${newBatchSize}`);
      }
    }
  }

  // Get detailed metrics
  getMetrics() {
    return {
      ...this.getStatus(),
      uptime: this.isRunning ? Date.now() - (this.lastProcessTime || Date.now()) : 0,
      nextCheckIn: this.isRunning ? this.checkInterval : 0
    };
  }
}

// Create singleton instance
export const autoScheduler = new AutoScheduler();

// Export utility functions
export const startAutoScheduling = (options = {}) => {
  autoScheduler.configure(options);
  autoScheduler.start();
};

export const stopAutoScheduling = () => {
  autoScheduler.stop();
};

export const updateBatchSize = (size) => {
  autoScheduler.updateBatchSize(size);
};

export const getSchedulerStatus = () => {
  return autoScheduler.getStatus();
};

export const resetScheduler = () => {
  autoScheduler.reset();
};

export default autoScheduler;
