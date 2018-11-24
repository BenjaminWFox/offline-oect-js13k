const directions = {
  up: {
    code: 'u',
    key: 'upArrow',
  },
  down: {
    code: 'd',
    key: 'downArrow',
  },
  left: {
    code: 'l',
    key: 'leftArrow',
  },
  right: {
    code: 'r',
    key: 'rightArrow',
  },
  upLeft: {
    code: 'ul',
    key: null,
  },
  upRight: {
    code: 'ur',
    key: null,
  },
  current: 'c',
  still: 'still',
};

directions.cardinals = [directions.up, directions.down, directions.left, directions.right];

export default directions;
