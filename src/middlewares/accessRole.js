const accessRole = (roles) => {
    return (req, res, next) => {
      const { user } = req.session;
      if (!user || !roles.includes(user.role)) {
        res.status(401).json({ error: 'Unauthorized access' });
      } else {
        next();
      }
    };
  };
  
  module.exports = accessRole;
  