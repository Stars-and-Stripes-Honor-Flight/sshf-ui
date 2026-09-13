import {
  beginRosterControlsHydrate,
  createInitialRosterPersistCoordinatorState,
  evaluateRosterControlsPersist,
} from '../roster-controls-persist-coordinator';

describe('roster-controls-persist-coordinator', () => {
  test('first persist after hydrate is skipped so defaults are not written', () => {
    let state = createInitialRosterPersistCoordinatorState();
    state = beginRosterControlsHydrate(state);

    const firstPass = evaluateRosterControlsPersist(state, 'flight-1');
    expect(firstPass.shouldPersist).toBe(false);
    expect(firstPass.state.hydratedFlightId).toBe('flight-1');
    expect(firstPass.state.skipNextPersist).toBe(false);

    const secondPass = evaluateRosterControlsPersist(firstPass.state, 'flight-1');
    expect(secondPass.shouldPersist).toBe(true);
  });

  test('persist is blocked until hydrate completes for the flight', () => {
    let state = createInitialRosterPersistCoordinatorState();

    const beforeHydrate = evaluateRosterControlsPersist(state, 'flight-1');
    expect(beforeHydrate.shouldPersist).toBe(false);

    state = beginRosterControlsHydrate(state);
    const skippedHydratePass = evaluateRosterControlsPersist(state, 'flight-1');
    expect(skippedHydratePass.shouldPersist).toBe(false);

    const afterHydrate = evaluateRosterControlsPersist(skippedHydratePass.state, 'flight-1');
    expect(afterHydrate.shouldPersist).toBe(true);
  });

  test('switching flights re-skips the first persist pass', () => {
    let state = createInitialRosterPersistCoordinatorState();
    state = beginRosterControlsHydrate(state);

    let pass = evaluateRosterControlsPersist(state, 'flight-a');
    pass = evaluateRosterControlsPersist(pass.state, 'flight-a');
    expect(pass.shouldPersist).toBe(true);

    state = beginRosterControlsHydrate(pass.state);
    const switchPass = evaluateRosterControlsPersist(state, 'flight-b');
    expect(switchPass.shouldPersist).toBe(false);
    expect(switchPass.state.hydratedFlightId).toBe('flight-b');

    const afterSwitch = evaluateRosterControlsPersist(switchPass.state, 'flight-b');
    expect(afterSwitch.shouldPersist).toBe(true);
  });

  test('simulated mount race: saved seat sort is not overwritten on first persist pass', () => {
    localStorage.setItem(
      'sshf.flightRosterControls.v1.flight-1',
      JSON.stringify({ version: 1, sortBy: 'seat', nameFilter: '', statusFilter: 'all', busFilter: 'all', assignedCallerFilter: 'all' })
    );

    let coordinator = createInitialRosterPersistCoordinatorState();
    coordinator = beginRosterControlsHydrate(coordinator);

    const uiSortBy = 'name';
    const firstPersist = evaluateRosterControlsPersist(coordinator, 'flight-1');
    coordinator = firstPersist.state;

    expect(firstPersist.shouldPersist).toBe(false);

    if (firstPersist.shouldPersist) {
      localStorage.setItem(
        'sshf.flightRosterControls.v1.flight-1',
        JSON.stringify({ version: 1, sortBy: uiSortBy })
      );
    }

    const hydratedSortBy = 'seat';
    const secondPersist = evaluateRosterControlsPersist(coordinator, 'flight-1');
    expect(secondPersist.shouldPersist).toBe(true);

    if (secondPersist.shouldPersist) {
      localStorage.setItem(
        'sshf.flightRosterControls.v1.flight-1',
        JSON.stringify({ version: 1, sortBy: hydratedSortBy })
      );
    }

    expect(JSON.parse(localStorage.getItem('sshf.flightRosterControls.v1.flight-1')).sortBy).toBe('seat');
  });
});
