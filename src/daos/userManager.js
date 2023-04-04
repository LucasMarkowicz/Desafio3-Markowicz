const bcrypt = require('bcrypt');
const User = require("./models/user.Models.js");

class UserManager {

  async registerUser(userData) {
    const userExists = await User.findOne({ email: userData.email });
  
    if (userExists) {
      throw new Error('User already exists');
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
      throw new Error('User not found');
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }
  
    return user;
  }
  
  async getUserRole(email) {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    return user.role;
  }
}

module.exports = UserManager;