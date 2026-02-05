import crypto from 'node:crypto';

export default class Column {
  constructor(name, boardId, order, isInitial = false) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.boardId = boardId;
    this.order = order;
    this.isInitial = isInitial;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      boardId: this.boardId,
      order: this.order,
      isInitial: this.isInitial,
    };
  }

  static fromJSON(data) {
    const col = Object.create(Column.prototype);
    col.id = data.id;
    col.name = data.name;
    col.boardId = data.boardId;
    col.order = data.order;
    col.isInitial = data.isInitial;
    return col;
  }
}
