class Sound {
  constructor(context) {
    this.ctx = context;
  }

  init() {
    this.osc = this.ctx.createOscillator();
    this.gainNode = this.ctx.createGain();

    this.osc.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    this.osc.type = 'sine';
  }

  play(value, time) {
    this.init();

    this.osc.frequency.value = value;
    this.gainNode.gain.setValueAtTime(.5, this.ctx.currentTime);

    this.osc.start(time);
    this.stop(time);

  }

  stop(time) {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + .25);
    this.osc.stop(time + .25);
  }

  battery() {
    this.play(8000, this.ctx.currentTime);
  }

  move() {
    this.play(5, this.ctx.currentTime);
    this.play(5, this.ctx.currentTime);
    this.play(5, this.ctx.currentTime);
  }

  blast() {
    this.play(50, this.ctx.currentTime);
    this.play(99, this.ctx.currentTime + .05);
  }

  doorOpen() {
    this.play(261.63, this.ctx.currentTime + .25);
    this.play(329.63, this.ctx.currentTime + .35);
  }

  win() {
    this.play(261.63, this.ctx.currentTime + .25);
    this.play(329.63, this.ctx.currentTime + .35);
    this.play(392.00, this.ctx.currentTime + .45);
    this.play(523.25, this.ctx.currentTime + .55);
  }

  lose() {
    this.play(261.63, this.ctx.currentTime + .25);
    this.play(246.94, this.ctx.currentTime + .35);
    this.play(233.08, this.ctx.currentTime + .45);
  }

  static get context() {
    return new (window.AudioContext || window.webkitAudioContext)();
  }
}

export default Sound;
