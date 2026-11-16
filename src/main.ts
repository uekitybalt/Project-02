import './styles.css';
import { byId } from './dom';
import { CommandRegistry, registerBuiltinCommands } from './commands';
import { CommandLine } from './commandLine';
import { ProjectBrowser } from './projectBrowser';
import { Ribbon } from './ribbon';
import { StatusBar } from './statusBar';
import { Viewport } from './viewport';

// 1. One registry holds every command.
const registry = new CommandRegistry();
registerBuiltinCommands(registry);

// 2. Build the UI pieces. Ribbon and command line both talk to the registry.
const viewport = new Viewport(byId('viewport'));
const statusBar = new StatusBar(byId('statusbar'));
const commandLine = new CommandLine(byId('command-line'), registry);
new Ribbon(byId('ribbon'), registry);
new ProjectBrowser(byId('project-browser'));

viewport.onCursorMove = (point) => statusBar.setCursor(point);

// 3. Give commands access to the app.
registry.setContext({
  print: (message, kind) => commandLine.print(message, kind),
  clearLog: () => commandLine.clear(),
  setTool: (name) => statusBar.setTool(name),
  viewport,
});

commandLine.print('BIM Studio ready. Type HELP for a list of commands.', 'muted');
commandLine.focus();
