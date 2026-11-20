import './styles.css';
import { byId } from './dom';
import { CommandRegistry, registerBuiltinCommands } from './commands';
import { CommandLine } from './commandLine';
import { ProjectBrowser } from './projectBrowser';
import { Ribbon } from './ribbon';
import { StatusBar } from './statusBar';
import { Viewport } from './viewport';
import { WallStore } from './walls';
import { WallTool } from './wallTool';

// 1. One registry holds every command.
const registry = new CommandRegistry();
registerBuiltinCommands(registry);

// 2. Build the UI pieces. Ribbon and command line both talk to the registry.
const viewport = new Viewport(byId('viewport'));
const statusBar = new StatusBar(byId('statusbar'));
const commandLine = new CommandLine(byId('command-line'), byId('command-log'), registry);
new Ribbon(byId('ribbon'), registry);
new ProjectBrowser(byId('project-browser'));

viewport.onCursorMove = (point) => statusBar.setCursor(point);

// Wall data lives in the store; meshes are built from it.
const walls = new WallStore();
const wallTool = new WallTool(
  viewport,
  walls,
  (text) => statusBar.setInfo(text),
  () => {
    statusBar.setTool('Select');
    commandLine.print('Wall tool finished.', 'muted');
    commandLine.focus();
  },
);

// 3. Give commands access to the app.
registry.setContext({
  print: (message, kind) => commandLine.print(message, kind),
  clearLog: () => commandLine.clear(),
  setTool: (name) => statusBar.setTool(name),
  startWall: () => {
    statusBar.setTool('Wall');
    wallTool.activate();
  },
  viewport,
});

commandLine.print('BIM Studio ready. Type HELP for a list of commands.', 'muted');
commandLine.focus();