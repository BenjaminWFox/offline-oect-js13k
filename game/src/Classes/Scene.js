export default class Scene {
  constructor(g) {
    this.group = undefined;
  }

  set visible(isVisible) {
    this.group.visible = isVisible;
  }
}
