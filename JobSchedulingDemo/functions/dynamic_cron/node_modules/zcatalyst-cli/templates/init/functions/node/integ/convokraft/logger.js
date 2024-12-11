// Logger module for logging messages
export default {
  info: function(message) {
    console.log('INFO:', message);
  },
  error: function(message) {
    console.error('ERROR:', message);
  }
};
