const { User } = require('../model');

const Register = async (ctx, next) => {
  ctx.render('register.html');
};

const Signup = async (ctx, next) => {
  const { name, email, password, gender } = ctx.request.body;
  const user = await User.create({ name, email, password, gender });
  if (user) {
    ctx.render('success.html', { type: 'Signup', name });
  } else {
    ctx.render('failure.html', { type: 'Signup' });
  }
};

module.exports = {
  'get /register': Register,
  'post /signup': Signup
};
