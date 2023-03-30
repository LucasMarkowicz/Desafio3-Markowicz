const bcrypt = require('bcrypt');
const { connect, getConnection } = require('../db/db.js');

class UserManager {
  constructor() {
    connect();
    this.collection = getConnection().collection('users');
  }

  async registerUser(userData) {
    const userExists = await this.collection.findOne({ username: userData.username });
  
    if (userExists) {
      throw new Error('User already exists');
    }
  
    const hashedPassword = await bcrypt.hash(userData.password, 10);
  
    const newUser = {
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'usuario',
    };
  
    const result = await this.collection.insertOne(newUser);
  
    return result;
  }
  
  async loginUser(username, password) {
    const user = await this.collection.findOne({ username });
  
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
    const user = await this.collection.findOne({ username });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    return user.role;
  }
}

module.exports = UserManager;