const configDifficulties = {
  playground: 'playground',
  easy: 'easy',
  normal: 'normal',
  hard: 'hard',
};

const pathUpdateFrequency = 500;
const blockRespawnSpeed = 3300;
const playerMoveSpeed = 150;

const configValues = {
  easy: {
    playerMoveSpeed,
    enemyMoveSpeed: 300,
    blockRespawnSpeed,
    pathUpdateFrequency,
    enemyUnstuckSpeed: blockRespawnSpeed / 2.5,
    allowFallingKills: false,
  },
  normal: {
    playerMoveSpeed,
    enemyMoveSpeed: 250,
    blockRespawnSpeed,
    pathUpdateFrequency,
    enemyUnstuckSpeed: blockRespawnSpeed / 2.5,
    allowFallingKills: false,
  },
  hard: {
    playerMoveSpeed,
    enemyMoveSpeed: 200,
    blockRespawnSpeed,
    pathUpdateFrequency,
    enemyUnstuckSpeed: blockRespawnSpeed / 2,
    allowFallingKills: true,
  },
};

export {configDifficulties, configValues};
