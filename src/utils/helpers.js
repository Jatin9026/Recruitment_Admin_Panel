
export const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  /**
   * Truncate long text with ellipsis
   * @param {string} text - input string
   * @param {number} maxLength - max allowed length
   * @returns {string} truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
  
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };
  
  /**
   * Capitalize the first letter of a string
   * @param {string} str
   * @returns {string}
   */
  export const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * Generate a random ID (useful for local lists)
   * @returns {string}
   */
  export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  /**
   * Convert status codes to human-readable labels
   * @param {string} status
   * @returns {string}
   */
  export const mapStatus = (status) => {
    switch (status) {
      case "pending":
        return "Pending ⏳";
      case "approved":
        return "Approved ✅";
      case "rejected":
        return "Rejected ❌";
      default:
        return "Unknown";
    }
  };
  
  /**
   * Debounce function calls (useful for search inputs)
   * @param {Function} func
   * @param {number} delay
   * @returns {Function}
   */
  export const debounce = (func, delay = 500) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  