import Scene from 'Classes/Scene';

export default class GameOverScene extends Scene {
  constructor(g) {
    super(g);

    this.gInstance = g;
    // Add some text for the game over message
    this.endMessage = g.text('Placeholder Text', '32px Helvetica', '#15e815', 0, 0);
    // Create a `gameOver` group and add the message sprite to it
    this.group = g.group(this.endMessage);
  }

  get scene() {
    return this.group;
  }

  setLose() {
    this.endMessage.content = "Oh no! You're part of the building, now.";
    this.endMessage.y = (this.gInstance.canvas.height / 2) - 35;
    // this.group = this.gInstance.group(this.endMessage);
  }

  setWin() {
    this.endMessage.content = "You made it, nice work! We'll be back online in no time!";
    this.endMessage.y = (this.gInstance.canvas.height / 2) - 35;
    // this.group = this.gInstance.group(this.endMessage);
  }

}
