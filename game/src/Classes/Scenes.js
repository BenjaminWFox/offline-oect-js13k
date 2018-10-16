class Scenes {
  constructor(g, config) {
    this.g = g;

    this.game = this.g.group();

    // Add some text for the game over message
    this.endMessage = this.g.text('Placeholder Text', '32px Helvetica', '#15e815', 0, 0);
    // Create a `gameOver` group and add the message sprite to it
    this.gameOver = this.g.group(this.endMessage);
    // Make the `gameOver` invisible for now
    this.gameOver.visible = false;

    // Add some text for the game over message
    this.introMessage1 = this.g.text(
      'Sir! That earthquake knocked the building offline! The bio-restraint has failed...',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage1.y = 200;
    this.introMessage2 = this.g.text(
      'Electronics are dead, batteries scattered, and the security-organics are haywire!',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage2.y = 250;
    this.introMessage3 = this.g.text(
      'The door cycle will drain the reserve. Go retrive the batteries so we can fix this!',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage3.y = 300;
    this.introMessage4 = this.g.text(
      'You\'re the best Organic Electro-Chemical Technician we\'ve got, be safe in there.',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage4.y = 350;
    // Create a `gameOver` group and add the message sprite to it
    this.intro = this.g.group(this.introMessage1, this.introMessage2, this.introMessage3, this.introMessage4);
    // Make the `gameOver` invisible for now
    this.intro.visible = false;

    // Add some text for the game over message
    this.titleMessageMain = this.g.text('- OFFLINE: O.E.C.T. -', '64px Courier', '#15e815', 0, 0);
    this.titleMessageSub1 = this.g.text('By Ben Fox.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub2 = this.g.text('[ SPACE ] to page/pause.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub3 = this.g.text('[ A/D ] to blast the floor. [ ARROWS ] to move.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub4 = this.g.text(`[ D ] -> Difficulty: ${config.difficulty.toUpperCase()}`, '24px Courier', '#0098ff', 0, 0);
    this.titleMessageMain.y = 275;
    this.titleMessageSub1.y = 360;
    this.titleMessageSub2.y = 410;
    this.titleMessageSub3.y = 460;
    this.titleMessageSub4.y = 510;
    // Create a `gameOver` group and add the message sprite to it
    this.title = this.g.group(this.titleMessageMain, this.titleMessageSub1, this.titleMessageSub2, this.titleMessageSub3, this.titleMessageSub4);
    // Make the `gameOver` invisible for now
    this.title.visible = false;
  }

  setLose() {
    this.game.visible = false;
    this.gameOver.visible = true;
    this.title.visible = false;
    this.endMessage.content = "Oh no! You're part of the building, now.";
    this.endMessage.y = (this.g.canvas.height / 2) - 35;
  }

  setWin() {
    this.game.visible = false;
    this.title.visible = false;
    this.gameOver.visible = true;
    this.endMessage.content = "You made it, nice work! We'll be back online in no time!";
    this.endMessage.y = (this.g.canvas.height / 2) - 35;
  }

  setTitle() {
    this.title.visible = true;
    this.game.visible = false;
    this.gameOver.visible = false;
    this.intro.visible = false;
  }

  setIntro() {
    this.game.visible = false;
    this.title.visible = false;
    this.gameOver.visible = false;
    this.intro.visible = true;
  }
}

export default Scenes;
