// Text box shown over the canvas so the device keyboard can be used to type a name.
const dialog = document.getElementById('name-dialog');
const form = dialog.querySelector('form');
const input = document.getElementById('name-input');
const title = document.getElementById('name-title');
let onDone = null;
let fallback = '';

export function isNameDialogOpen() {
  return !dialog.hidden;
}

// Calls done(name) with the typed name (or `initial` if left blank); Cancel closes without calling.
export function askName(heading, initial, done) {
  title.textContent = heading;
  input.value = initial;
  fallback = initial;
  onDone = done;
  dialog.hidden = false;
  input.focus();
  input.select();
}

function close() {
  dialog.hidden = true;
  onDone = null;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const done = onDone;
  const name = input.value.trim() || fallback;
  close();
  done?.(name);
});

document.getElementById('name-cancel').addEventListener('click', close);
dialog.addEventListener('keydown', e => {
  if (e.key === 'Escape') close();
});
