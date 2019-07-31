import TitleScene from '../Scenes/TitleScene';
import IntroScene from '../Scenes/IntroScene';
import GameOverScene from '../Scenes/GameOverScene';

class SceneManager {
  constructor(g) {
    this.gameLoop;
    this.gameScene;

    this.titleScene = new TitleScene(g);
    this.introScene = new IntroScene(g);
    this.gameOverScene = new GameOverScene(g);

    g.key.space.press = () => {
      console.log('Spacebar pressed!');
    };
  }

  setGameScene(gameScene) {
    this.gameScene = gameScene;
  }

  setGameLoop(gameLoop) {
    this.gameLoop = gameLoop;
  }

  get title() {
    return () => {
      this.titleScene.visible = true;
      this.gameScene.visible = false;
    };
  }

  get intro() {
    return () => {
      this.introScene.visible = true;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
    };
  }

  get gameOverWon() {
    return () => {
      this.introScene.visible = false;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
      this.gameOverScene.setWin();
      this.gameOverScene.visible = true;
    };
  }

  get gameOverLost() {
    return () => {
      this.introScene.visible = false;
      this.titleScene.visible = false;
      this.gameScene.visible = false;
      this.gameOverScene.setLose();
      this.gameOverScene.visible = true;
    };
  }

  get game() {
    return () => {
      this.titleScene.visible = false;
      this.gameLoop();
    };
  }
}

export default SceneManager;
