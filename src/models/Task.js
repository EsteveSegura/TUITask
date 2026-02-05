import crypto from 'node:crypto';

export default class Task {
  constructor(title, boardId, columnId, description = '') {
    this.id = crypto.randomUUID();
    this.title = title;
    this.boardId = boardId;
    this.columnId = columnId;
    this.description = description;
    this.isDeleted = false;
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
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
      description: this.description,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    const task = Object.create(Task.prototype);
    task.id = data.id;
    task.title = data.title;
    task.boardId = data.boardId;
    task.columnId = data.columnId;
    task.description = data.description || '';
    task.isDeleted = data.isDeleted || false;
    task.createdAt = data.createdAt || new Date().toISOString();
    task.updatedAt = data.updatedAt || new Date().toISOString();
    return task;
  }
}
