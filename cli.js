import { createElement } from 'react';
import { render } from 'ink';
import App from './dist/components/App.js';

render(createElement(App), { exitOnCtrlC: true });
