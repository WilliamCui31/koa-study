const Koa = require('koa');
const ws = require('ws');
const Cookies = require('cookies');
const bodyParser = require('koa-bodyparser')();
const router = require('koa-router')();
const template = require('./template.js');
const controller = require('./controller');
const rest = require('./rest');
const handleStaticFiles = require('./handleStaticFiles');
const isProduction = process.env.NODE_ENV === 'production';

// 创建Koa服务
const app = new Koa();

// 计算请求时间
app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next();
  const execTime = new Date().getTime() - start;
  ctx.response.set('X-Response-Time', `${execTime}ms`);
});

app.use(async (ctx, next) => {
  ctx.state.user = parseUser(ctx.cookies.get('user') || '');
  await next();
})

// 解析 body
app.use(bodyParser);

// 处理静态资源
if (!isProduction) {
  app.use(handleStaticFiles('/static'));
}

// 创建 ctx.render(view, model) 函数
app.use(template('views', { noCache: !isProduction, watch: !isProduction }));

// 创建 ctx.rest(data) 函数
app.use(rest.restify());

// 添加路由
app.use(controller(router));

// 启动Koa
const server = app.listen(3000);

const WebSocketServer = ws.Server;

app.wss = createWebSocketServer(server, onConnection, onMessage, onClose, onError);
console.log('server is starting at port 3000 ... ');

function parseUser(obj) {
  if(!obj) {
    return;
  }
  console.log('try parse: ' + obj);
  let userString = '';
  if(typeof obj === 'string') {
    userString = obj;
  } else if(obj.headers) {
    const cookies = new Cookies(obj, null);
    userString = cookies.get('user');
    console.log('=====user: ', userString);
  }
  if(userString) {
    try {
      const user = JSON.parse(Buffer.from(userString, 'base64').toString());
      console.log(`User: ${user.name}, ID: ${user.id}`);
      return user;
    } catch (error) {
      console.log(`parseUser error: ${error}`);
    }
  }
}

function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
  const wss = new WebSocketServer({ server });
  wss.broadcast = function (data) {
    wss.clients.forEach(function (client) {
      client.send(data);
    })
  }
  wss.on('connection', function (ws, req) {
    ws.on('message', onMessage);
    ws.on('close', onClose);
    ws.on('error', onError);
    if(req.url!== '/ws/chat') {
      ws.close(4000, 'Invaild URL');
    }
    const user = parseUser(req);
    if(!user) {
      ws.close(4001, 'Invalid user');
    }
    ws.user = user;
    ws.wss = wss;
    onConnection.apply(ws);
  });
  console.log('WebSocketServer was attached.');
  return wss;
}

// 刷新用户列表
function refreshUserList() {
  // build user list;
  const users = [...this.wss.clients].map(function(client) {
    return client.user;
  });
  const listMsg = createMessage('list', this.user, users);
  this.wss.broadcast(listMsg);
}

function onConnection() {
  console.log('[WebSocket] connected.');
  const user = this.user;
  const joinMsg = createMessage('join', user, `${user.name} 加入聊天室.`);
  this.wss.broadcast(joinMsg);
  refreshUserList.call(this);
}

function onMessage(message) {
  console.log('[WebSocket] message received.');
  if(message && message.trim()) {
    const msg = createMessage('chat', this.user, message);
    this.wss.broadcast(msg);
  }
}

function onClose(code, message) {
  console.log(`[WebSocket] closed: ${code}-${message}`);
  const user = this.user;
  const leftMsg = createMessage('left', user, `${user.name} 离开聊天室.`);
  this.wss.broadcast(leftMsg);
  refreshUserList.call(this);
}

function onError(error) {
  console.log('[WebSocket] error: ' + error);
}

var messageIndex = 0;
function createMessage(type, user, data) {
  messageIndex ++;
  return JSON.stringify({
    type,
    user,
    data,
    id: messageIndex,
  });
}