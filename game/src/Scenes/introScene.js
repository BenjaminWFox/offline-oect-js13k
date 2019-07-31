import Scene from 'Classes/Scene';

export default class IntroScene extends Scene {
  constructor(g) {
    super(g);

    this.gInstance = g;

    this.introMessage1 = g.text(
      'Sir! That earthquake knocked the building offline! The bio-restraint has failed...',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage2 = g.text(
      'Electronics are dead, batteries scattered, and the security-organics are haywire!',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage3 = g.text(
      'The door cycle will drain the reserve. Go retrive the batteries so we can fix this!',
      '25px Helvetica', '#15e815', 0, 0,
    );
    this.introMessage4 = g.text(
      'You\'re the best Organic Electro-Chemical Technician we\'ve got, be safe in there.',
      '25px Helvetica', '#15e815', 0, 0,
    );

    this.introMessage1.y = 200;
    this.introMessage2.y = 250;
    this.introMessage3.y = 300;
    this.introMessage4.y = 350;

    this.group = g.group(this.introMessage1, this.introMessage2, this.introMessage3, this.introMessage4);

  }

  get scene() {
    return this.group;
  }
}
