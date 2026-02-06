/**
 * Database Interface - Contract for all database operations
 * Koi bhi database use karo, ye methods implement karne padenge
 */
export class DatabaseInterface {
  /**
   * Save new user
   */
  async saveUser(userData) {
    throw new Error('saveUser() must be implemented');
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    throw new Error('getUser() must be implemented');
  }

  /**
   * Get user by face match
   */
  async getUserByFaceId(faceId) {
    throw new Error('getUserByFaceId() must be implemented');
  }

  /**
   * Update user details
   */
  async updateUser(userId, userData) {
    throw new Error('updateUser() must be implemented');
  }

  /**
   * Mark attendance
   */
  async markAttendance(userId, timestamp) {
    throw new Error('markAttendance() must be implemented');
  }

  /**
   * Get attendance records
   */
  async getAttendanceByMonth(userId, month, year) {
    throw new Error('getAttendanceByMonth() must be implemented');
  }

  /**
   * Check if attendance already marked today
   */
  async isAttendanceMarkedToday(userId) {
    throw new Error('isAttendanceMarkedToday() must be implemented');
  }

  /**
   * Save face image URL
   */
  async saveFaceData(userId, faceImageUrl) {
    throw new Error('saveFaceData() must be implemented');
  }
}