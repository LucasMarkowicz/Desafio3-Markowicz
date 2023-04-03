const bcrypt = require('bcrypt');
const User = require("./models/user.Models.js");

class UserManager {

  async registerUser(userData) {
    const userExists = await User.findOne({ username: userData.username });
  
    if (userExists) {
      throw new Error('User already exists');
    }
  
    const hashedPassword = await bcrypt.hash(userData.password, 10);
  
    const newUser = {
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'usuario',
    };
  
    const result = await User.create(newUser);
  
    return result;
  }
  
  async loginUser(username, password) {
    const user = await User.findOne({ username });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }
  
    return user;
  }
  
  async getUserRole(username) {
    const user = await User.findOne({ username });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    return user.role;
  }
}

module.exports = UserManager;