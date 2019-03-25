import uuid from 'uuid/v1';
import { getDivisions } from './math';

const learningRate = 0.0001;
const trainedScreenSizes = [[750, 1334]];

const quadrantDivisions = 3;

// add one for don't move (stay where you are)
const allowedDirections = getDivisions(quadrantDivisions) + 1;

function getPosStateSize() {
  const posSize = 2;
  const chars = 2;
  return posSize * chars;
}

function getActionSize() {
  const possibleMoveActions = allowedDirections;
  return possibleMoveActions;
}

export default {
  projectId: uuid(),
  learningRate,
  screenSizes: trainedScreenSizes,
  actionDistance: 10,
  stateSize: getPosStateSize(),
  actionSize: getActionSize(),
  allowedDirections,
  numEpochs: 1000,
  batchSize: 1000, // Each 1 is a timestep (NOT AN EPISODE) # YOU CAN CHANGE TO 5000 if you have GPU
  gamma: 0.99,
  training: false,
};
