const model = require('../model');
const { User } = model;

const Index = async (ctx, next) => {
  ctx.render('index.html');
};

const Login = async (ctx, next) => {
  const { name, password } = ctx.request.body;
  const user = await User.find({
    where: {
      name
    }
  });
  if (user && password === user.password) {
    const value = Buffer.from(JSON.stringify(user)).toString('base64');
    ctx.cookies.set('user', value);
    ctx.render('success.html', {
      name,
      type: 'Login'
    });
  } else {
    ctx.render('failure.html', {
      type: 'Login'
    });
  }
};

const Logout = async (ctx, next) => {
  ctx.cookies.set('user', '');
  ctx.response.redirect('/');
};

const Chat = async (ctx, next) => {
  const user = ctx.state.user;
  if (user) {
    ctx.render('chat.html', {
      user
    });
  } else {
    ctx.response.redirect('/');
  }
};

const Product = async (ctx, next) => {
  ctx.render('product.html');
};

module.exports = {
  'get /': Index,
  'post /login': Login,
  'get /chat': Chat,
  'get /logout': Logout,
  'get /product': Product
};
