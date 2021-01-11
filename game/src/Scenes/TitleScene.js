import Scene from 'Classes/Scene';

export default class TitleScene extends Scene {
  constructor(g) {
    super(g);

    this.difficulty = g.custom.getDifficulty();
    this.gInstance = g;

    this.titleMessageMain = this.gInstance.text('- OFFLINE: O.E.C.T. -', '64px Courier', '#15e815', 0, 0);
    this.titleMessageSub1 = this.gInstance.text('By Ben Fox.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub2 = this.gInstance.text('[ SPACE ] to page/pause.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub3 = this.gInstance.text('[ A/D ] to blast the floor. [ ARROWS ] to move.', '32px Courier', '#15e815', 0, 0);
    this.titleMessageSub4 = this.setDifficultyMessage(this.difficulty);

    this.titleMessageMain.y = 275;
    this.titleMessageSub1.y = 360;
    this.titleMessageSub2.y = 410;
    this.titleMessageSub3.y = 460;
    this.titleMessageSub4.y = 510;

    this.group = this.gInstance.group(
      this.titleMessageMain,
      this.titleMessageSub1,
      this.titleMessageSub2,
      this.titleMessageSub3,
      this.titleMessageSub4,
    );

    g.key.c.press = () => {
      console.log('Challange rating change!');
      this.setDifficulty(g.custom.changeDifficulty());
      this.difficulty = g.custom.getDifficulty();

      this.titleMessageSub4.content = `[ C ] -> Challenge: ${this.difficulty.toUpperCase()}`;
    };
  }

  get scene() {
    return this.group;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  setDifficultyMessage(difficulty) {
    return this.gInstance.text(`[ C ] -> Challenge: ${difficulty.toUpperCase()}`, '24px Courier', '#0098ff', 0, 0);
  }
}
