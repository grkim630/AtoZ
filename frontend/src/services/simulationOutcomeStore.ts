export type SimulationOutcome = 'success' | 'failure' | 'unknown';

let lastOutcome: SimulationOutcome = 'unknown';

export function setSimulationOutcome(outcome: SimulationOutcome) {
  lastOutcome = outcome;
}

export function getSimulationOutcome(): SimulationOutcome {
  return lastOutcome;
}

export function clearSimulationOutcome() {
  lastOutcome = 'unknown';
}

