import crypto from 'node:crypto';

export default class Task {
  constructor(title, boardId, columnId) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.boardId = boardId;
    this.columnId = columnId;
    this.isDeleted = false;
  }

  moveTo(columnId) {
    this.columnId = columnId;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      boardId: this.boardId,
      columnId: this.columnId,
      isDeleted: this.isDeleted,
    };
  }

  static fromJSON(data) {
    const task = Object.create(Task.prototype);
    task.id = data.id;
    task.title = data.title;
    task.boardId = data.boardId;
    task.columnId = data.columnId;
    task.isDeleted = data.isDeleted || false;
    return task;
  }
}
