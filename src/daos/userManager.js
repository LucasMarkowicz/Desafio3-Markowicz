const bcrypt = require('bcrypt');
const User = require("./models/user.Models.js");
const userErrors = require('../errors/userErrors.js');


class UserManager {

  async registerUser(userData) {
    const userExists = await User.findOne({ email: userData.email });
  
    if (userExists) {
      throw new Error(userErrors.USER_EXISTS);
    }
  
    const hashedPassword = await bcrypt.hash(userData.password, 10);
  
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'usuario',
    };
  
    const result = await User.create(newUser);
  
    return result;
  }
  
  async loginUser(email, password) {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error(userErrors.USER_NOT_FOUND);
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      throw new Error(userErrors.INVALID_PASSWORD);
    }
  
    return user;
  }
  
  async getUserRole(email) {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error(userErrors.USER_NOT_FOUND);
    }
  
    return user.role;
  }
}

module.exports = UserManager;