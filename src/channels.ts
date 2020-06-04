import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';
import Relay from './Relay';

function broadcastUsers(app: Application) {
  app.service('users').find({
    query: {
      $limit: 0,
      active: true,
    }
  })
  .then(results => ({ activeUserCount: (results as {total: number}).total}))
  .then(payload => {
    Relay.sendAll('activeUsers', payload);
  })
  .catch(err => console.log(err));
}

export default function(app: Application) {
  if(typeof app.channel !== 'function') {
    return;
  }

  app.on('connection', (connection: any) => {
    broadcastUsers(app);
  });

  app.on('login', (authResult: any, { connection }: any) => {
    if (connection) {
      const user = connection.user;
      app.service('users')
        .patch(user._id, {active: true})
        .then(() => {
          broadcastUsers(app);
        });
      app.channel('authenticated').join(connection);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, hook: HookContext) => {
    return app.channel('authenticated');
  });

  app.on('logout', (connection: any) => {
    if (connection) {
      const user = connection.user;
      app.service('users')
        .patch(user._id, {active: false})
        .then(() => {
          broadcastUsers(app);
        });
    }
  });
};
