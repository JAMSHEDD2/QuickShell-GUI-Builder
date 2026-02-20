const state = {
  profileName: 'my-shell',
  theme: 'dark',
  fontFamily: 'JetBrains Mono',
  uiScale: 1,
  bars: [],
  player: {
    enabled: true,
    backend: 'mpris',
    command: "playerctl metadata --format '{{artist}} - {{title}}'",
    interval: 1000,
  },
  actions: [],
};

const elements = {
  profileName: document.querySelector('#profile-name'),
  theme: document.querySelector('#theme-mode'),
  fontFamily: document.querySelector('#font-family'),
  uiScale: document.querySelector('#ui-scale'),
  barsList: document.querySelector('#bars-list'),
  barTemplate: document.querySelector('#bar-template'),
  playerEnabled: document.querySelector('#player-enabled'),
  playerBackend: document.querySelector('#player-backend'),
  playerCommand: document.querySelector('#player-command'),
  playerInterval: document.querySelector('#player-interval'),
  actionsList: document.querySelector('#actions-list'),
  actionTemplate: document.querySelector('#action-template'),
  jsonPreview: document.querySelector('#json-preview'),
};

function addBar(data = { position: 'top', size: 32, opacity: 0.9, widgets: ['launcher', 'clock'] }) {
  state.bars.push(data);
  render();
}

function addAction(data = { name: 'Open terminal', hotkey: 'SUPER+ENTER', command: 'kitty' }) {
  state.actions.push(data);
  render();
}

function renderBars() {
  elements.barsList.innerHTML = '';
  state.bars.forEach((bar, index) => {
    const node = elements.barTemplate.content.firstElementChild.cloneNode(true);
    const inputs = node.querySelectorAll('[data-field]');

    inputs.forEach((input) => {
      const key = input.dataset.field;
      if (key === 'widgets') {
        input.value = bar.widgets.join(',');
      } else {
        input.value = bar[key];
      }
      input.addEventListener('input', () => {
        if (key === 'widgets') {
          bar.widgets = input.value.split(',').map((x) => x.trim()).filter(Boolean);
        } else if (key === 'size') {
          bar.size = Number(input.value);
        } else if (key === 'opacity') {
          bar.opacity = Number(input.value);
        } else {
          bar[key] = input.value;
        }
        updatePreview();
      });
    });

    node.querySelector('.remove').addEventListener('click', () => {
      state.bars.splice(index, 1);
      render();
    });

    elements.barsList.append(node);
  });
}

function renderActions() {
  elements.actionsList.innerHTML = '';
  state.actions.forEach((action, index) => {
    const node = elements.actionTemplate.content.firstElementChild.cloneNode(true);
    node.querySelectorAll('[data-field]').forEach((input) => {
      const key = input.dataset.field;
      input.value = action[key];
      input.addEventListener('input', () => {
        action[key] = input.value;
        updatePreview();
      });
    });
    node.querySelector('.remove').addEventListener('click', () => {
      state.actions.splice(index, 1);
      render();
    });
    elements.actionsList.append(node);
  });
}

function toConfig() {
  return {
    quickshell: {
      profile: state.profileName,
      appearance: {
        theme: state.theme,
        font_family: state.fontFamily,
        ui_scale: state.uiScale,
      },
      bars: state.bars,
      integrations: {
        player: { ...state.player },
      },
      actions: state.actions,
    },
  };
}

function updatePreview() {
  elements.jsonPreview.textContent = JSON.stringify(toConfig(), null, 2);
}

function render() {
  elements.profileName.value = state.profileName;
  elements.theme.value = state.theme;
  elements.fontFamily.value = state.fontFamily;
  elements.uiScale.value = state.uiScale;
  elements.playerEnabled.checked = state.player.enabled;
  elements.playerBackend.value = state.player.backend;
  elements.playerCommand.value = state.player.command;
  elements.playerInterval.value = state.player.interval;

  renderBars();
  renderActions();
  updatePreview();
}

function bindTopLevelInputs() {
  elements.profileName.addEventListener('input', (e) => {
    state.profileName = e.target.value;
    updatePreview();
  });
  elements.theme.addEventListener('change', (e) => {
    state.theme = e.target.value;
    updatePreview();
  });
  elements.fontFamily.addEventListener('input', (e) => {
    state.fontFamily = e.target.value;
    updatePreview();
  });
  elements.uiScale.addEventListener('input', (e) => {
    state.uiScale = Number(e.target.value);
    updatePreview();
  });

  elements.playerEnabled.addEventListener('change', (e) => {
    state.player.enabled = e.target.checked;
    updatePreview();
  });
  elements.playerBackend.addEventListener('change', (e) => {
    state.player.backend = e.target.value;
    updatePreview();
  });
  elements.playerCommand.addEventListener('input', (e) => {
    state.player.command = e.target.value;
    updatePreview();
  });
  elements.playerInterval.addEventListener('input', (e) => {
    state.player.interval = Number(e.target.value);
    updatePreview();
  });
}

document.querySelector('#add-bar').addEventListener('click', () => addBar());
document.querySelector('#add-action').addEventListener('click', () => addAction());

document.querySelector('#copy-json').addEventListener('click', async () => {
  await navigator.clipboard.writeText(JSON.stringify(toConfig(), null, 2));
});

document.querySelector('#download-json').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(toConfig(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quickshell.config.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.querySelector('#load-demo').addEventListener('click', () => {
  state.profileName = 'gaming-layout';
  state.theme = 'auto';
  state.fontFamily = 'FiraCode Nerd Font';
  state.uiScale = 1.1;
  state.bars = [
    { position: 'top', size: 34, opacity: 0.85, widgets: ['launcher', 'workspaces', 'clock', 'player', 'tray'] },
    { position: 'bottom', size: 28, opacity: 0.95, widgets: ['notifications', 'net', 'volume'] },
  ];
  state.actions = [
    { name: 'Open terminal', hotkey: 'SUPER+ENTER', command: 'kitty' },
    { name: 'Open launcher', hotkey: 'SUPER+SPACE', command: 'wofi --show drun' },
  ];
  render();
});

document.querySelector('#reset-all').addEventListener('click', () => {
  state.profileName = 'my-shell';
  state.theme = 'dark';
  state.fontFamily = 'JetBrains Mono';
  state.uiScale = 1;
  state.bars = [];
  state.actions = [];
  state.player = {
    enabled: true,
    backend: 'mpris',
    command: "playerctl metadata --format '{{artist}} - {{title}}'",
    interval: 1000,
  };
  render();
});

bindTopLevelInputs();
addBar();
addAction();
