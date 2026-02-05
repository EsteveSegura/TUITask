# TUITask

A terminal-based Kanban board.

Manage multiple boards, columns, and tasks entirely from your terminal. Data persists in `~/.tuitask/data.json`.

## Install

```bash
npm install
```

## Usage

```bash
npm start
```

## Keyboard Shortcuts

### Board Mode

| Key | Action |
|-----|--------|
| `← → ↑ ↓` | Navigate between columns and tasks |
| `S` | Select / grab the focused task |
| `E` | Edit the focused column name |
| `D` | Delete the focused column (if empty) |
| `M` | Open menu |
| `Q` | Quit |

### Task Selected Mode

| Key | Action |
|-----|--------|
| `← →` | Move task to adjacent column |
| `E` | Edit task title |
| `D` | Delete task |
| `S` | Deselect task |

### Menu

| Key | Action |
|-----|--------|
| `B` | Create new board |
| `C` | Create new column |
| `T` | Create new task |
| `E` | Edit board name |
| `D` | Delete board |
| `S` | Switch board |
| `Q` | Close menu |

## Build

JSX is transpiled via Babel. To rebuild manually:

```bash
npm run build
```
