var game = new Game();

window.onload = () => {
  document.body.hidden = false;
  game.start();
};

document.getElementById('restart').onclick = () => {
  game.loop.stop();
  game = new Game();
  game.start();
};
