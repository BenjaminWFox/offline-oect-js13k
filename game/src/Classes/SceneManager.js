import TitleScene from '../Scenes/TitleScene';

class SceneManager {
  constructor(g) {
    this.gameLoop;
    this.gameScene;

    this.titleScene = new TitleScene(g);
    this.introScene = undefined;
    this.gameOverScene = undefined;

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

  get game() {
    return () => {
      this.titleScene.visible = false;
      this.gameLoop();
    };
  }
}

export default SceneManager;
