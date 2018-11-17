const ClassName = (function () {
  // const _privateInstanceNumber = new WeakMap();
  // const _privateStaticNumber = new WeakMap();
  // const _privateNumberPrint = function (iM, sM) {
  //   console.log('Instance:', iM, 'Static:', sM);
  // };

  class ClassName {
    constructor(index, total) {
      // console.log('Frame ID:', Frame.frames);
      // _privateInstanceNumber.set(this, Math.random() * 2);
      // console.log('Instance:', _privateInstanceNumber.get(this));
      // _privateStaticNumber.set(Frame, Math.random() * 4);
      // console.log('Static:', _privateStaticNumber.get(Frame));
    }

    // /* eslint-disable */
    // get privateInstanceNumber() {
    //   return _privateInstanceNumber.get(this);
    // }
    // static get privateStaticNumber() {
    //   return _privateStaticNumber.get(Frame);
    // }
    // printPrivateNumbers() {
    //   _privateNumberPrint(this.privateInstanceNumber, Frame.privateStaticNumber);
    //   // _privateNumberPrint(_privateInstanceNumber.get(this), _privateStaticNumber.get(Frame));
    // }
    // /* eslint-enable */
  }

  // static property
  ClassName.number = 0;

  return ClassName;
}());

export default ClassName;
