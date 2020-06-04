import Relay from './Relay';

export default function setup(io: SocketIO.Server) {
  console.log('setup socket io')
  Relay.setIO(io);
}
