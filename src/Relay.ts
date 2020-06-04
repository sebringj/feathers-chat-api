class Relay { // use for more direct communication when services/models are overkill
  public static setIO(io: SocketIO.Server) {
    console.log('set IO');
    this.io = io;
    this.flushSendAll();
  }

  public static sendAll(ev: string, payload: object) {
    if (!this.io) {
      if (this.sendAllBuffer.length > 100) {
        this.sendAllBuffer.splice(0, this.sendAllBuffer.length - 100);
      }
      this.sendAllBuffer.push({ev, payload});
      return;
    }
    this.io.emit(ev, payload);
  }
  private static flushSendAll() {
    this.sendAllBuffer.forEach(message => {
        this.io?.emit(message.ev, message.payload);
    });
    this.sendAllBuffer = [];
  }
  private static io: SocketIO.Server | undefined = undefined;
  private static sendAllBuffer: {ev: string, payload: object}[] = [];
}

export default Relay;
