var game = new Game();

window.onload = () => {
  document.body.hidden = false;
  game.start();
};

document.getElementById('restart').onclick = () => {
  document.getElementById('status').innerHTML = '';
  game.loop.stop();
  game = new Game();
  game.start();
};
