var game = new Game();
game.start();

document.getElementById("restart").onclick = () => {
  game.loop.stop();
  game = new Game();
  game.start();
}