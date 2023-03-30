const { Router } = require("express")
const router = Router()
const UserManager = require('../daos/userManager.js');
const users = new UserManager();



//endpoints usuarios
router.get('/', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await users.loginUser(username, password);
    req.session.user = user;
    res.redirect('/products');
  } catch (err) {
    res.render('login', { error: err.message });
  }
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    await users.registerUser({ username, password, role });
    res.redirect('/');
  } catch (err) {
    res.render('register', { error: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router