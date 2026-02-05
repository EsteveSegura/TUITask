import crypto from 'node:crypto';

export default class Board {
  constructor(name) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.isDeleted = false;
  }

  toJSON() {
    return { id: this.id, name: this.name, isDeleted: this.isDeleted };
  }

  static fromJSON(data) {
    const board = Object.create(Board.prototype);
    board.id = data.id;
    board.name = data.name;
    board.isDeleted = data.isDeleted || false;
    return board;
  }
}
