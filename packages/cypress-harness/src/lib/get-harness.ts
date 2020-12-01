import { ComponentHarness, HarnessQuery } from '@angular/cdk/testing';
import { CypressHarnessEnvironment } from './cypress-harness-environment';
import { addHarnessMethodsToChainer, getTestBedRoot } from './internals';

export function getHarness<T extends ComponentHarness>(query: HarnessQuery<T>) {
  /* Create a local variable so `pipe` can log name. */
  const getHarness = ($documentRoot: JQuery<Element>) => {
    const documentRoot = $documentRoot.get(0);
    return new CypressHarnessEnvironment(documentRoot, { documentRoot }).getHarness(
      query
    );
  }

  const harnessType = 'harnessType' in query ? query.harnessType : query;

  return addHarnessMethodsToChainer(
    getTestBedRoot().pipe(getHarness),
    harnessType
  );
}
