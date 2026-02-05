import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';

const DATA_DIR = path.join(os.homedir(), '.tuitask');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

const EMPTY_STATE = { boards: [], columns: [], tasks: [] };

export default class Storage {
  static load() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        boards: (data.boards || []).map(b => Board.fromJSON(b)),
        columns: (data.columns || []).map(c => Column.fromJSON(c)),
        tasks: (data.tasks || []).map(t => Task.fromJSON(t)),
      };
    } catch {
      return { boards: [], columns: [], tasks: [] };
    }
  }

  static save({ boards, columns, tasks }) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = {
      boards: boards.map(b => b.toJSON()),
      columns: columns.map(c => c.toJSON()),
      tasks: tasks.map(t => t.toJSON()),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
}
