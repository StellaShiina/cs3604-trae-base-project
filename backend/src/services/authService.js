const db = require('../database/init_db');

const authService = {
  register: async (userData) => {
    // TODO: Implement
    return { code: 0, data: null, message: 'Not implemented' };
  },

  checkUsername: async (username) => {
    // TODO: Implement
    return { code: 0, data: { available: true }, message: 'Not implemented' };
  },

  sendSmsCode: async (phone) => {
    // TODO: Implement
    return { code: 0, data: { code: '123456' }, message: 'Not implemented' };
  }
};

module.exports = authService;
