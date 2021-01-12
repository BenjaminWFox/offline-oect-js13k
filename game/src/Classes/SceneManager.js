import TitleScene from '../Scenes/TitleScene';
import IntroScene from '../Scenes/IntroScene';
import GameOverScene from '../Scenes/GameOverScene';

class SceneManager {
  constructor(g) {
    this.gameLoop;
    this.gameScene;
    this.g = g;
    this.titleScene = new TitleScene(g);
    this.introScene = new IntroScene(g);
    this.gameOverScene = new GameOverScene(g);

    this.introScene.visible = false;
    this.titleScene.visible = false;
    this.gameOverScene.visible = false;

    g.key.space.press = () => {
      console.log('Spacebar pressed!');
    };
  }

  setGameScene(gameScene) {
    console.log('Game Scene Set');
    this.gameScene = gameScene;
  }

  setGameLoop(gameLoop) {
    console.log('Game Loop Set');
    this.gameLoop = gameLoop;
  }

  get title() {
    this.g.key.space.press = () => {
      this.g.state = this.intro;
    };

    return () => {
      this.introScene.visible = false;
      this.titleScene.visible = true;
      this.gameScene.visible = false;
      this.gameOverScene.visible = false;
    };
  }

  get intro() {
    this.g.key.space.press = () => {
      this.g.state = this.game;
    };
    this.g.key.c.press = () => {};

    return () => {
      this.introScene.visible = true;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
      this.gameOverScene.visible = false;
    };
  }

  get gameOverWon() {
    this.g.key.space.press = function () {
      window.location.reload();
    };

    return () => {
      this.introScene.visible = false;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
      this.gameOverScene.setWin();
      this.gameOverScene.visible = true;
    };
  }

  get gameOverLost() {
    this.g.key.space.press = function () {
      window.location.reload();
    };

    return () => {
      this.gameOverScene.setLose();
      this.introScene.visible = false;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
      this.gameOverScene.visible = true;
    };
  }

  get game() {
    this.g.key.space.press = () => {
      this.g.paused
        ? this.g.resume()
        : this.g.pause();
    };
    this.g.key.c.press = () => {};

    return () => {
      this.introScene.visible = false;
      this.titleScene.visible = false;
      this.gameOverScene.visible = false;
      this.gameScene.visible = true;
      this.gameLoop();
    };
  }
}

export default SceneManager;
