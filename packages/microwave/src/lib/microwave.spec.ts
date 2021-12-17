import { ChangeDetectorRef, Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createObserver } from 'packages/microwave/testing/observer';
import { Microwave, watch } from './microwave';

@Microwave()
@Component({
  template: `{{ meal }} is {{ evaluation }}`,
})
class GreetingsComponent {
  meal?: string;
  evaluation = 'meh';
}

jest.useFakeTimers();

describe(Microwave.name, () => {
  const { observe } = createObserver();

  it('should detach change detector on startup', () => {
    const { cdRef } = createComponent();
    expect(cdRef.detach).toBeCalledTimes(1);
  });

  it('should not trigger change detection before one tick', () => {
    const { cdRef } = createComponent();
    expect(cdRef.detectChanges).toBeCalledTimes(0);
  });

  it('should trigger change detection after one tick', async () => {
    const { cdRef } = createComponent();
    await flushMicrotasks();

    expect(cdRef.detectChanges).toBeCalledTimes(1);
  });

  it('should trigger change detection once when fields change', async () => {
    const { cdRef, component } = createComponent();
    await flushMicrotasks();
    cdRef.detectChanges.mockReset();

    component.meal = 'Lasagna';
    component.evaluation = 'Delicious';

    await flushMicrotasks();

    expect(cdRef.detectChanges).toBeCalledTimes(1);
  });

  describe(watch.name, () => {
    xit('🚧 should emit undefined value', () => {
      const { component } = createComponent();

      const meal$ = watch(component, 'meal');

      const spy = observe(meal$);

      expect(spy.next).toBeCalledTimes(1);
      expect(spy.next).toBeCalledWith(undefined);
    });

    xit('🚧 should emit initial value', () => {
      const { component } = createComponent();

      const evaluation$ = watch(component, 'evaluation');

      const spy = observe(evaluation$);

      expect(spy.next).toBeCalledTimes(1);
      expect(spy.next).toBeCalledWith('meh');
    });

    xit('🚧 should emit changes', () => {
      const { component } = createComponent();

      const evaluation$ = watch(component, 'evaluation');

      const spy = observe(evaluation$);

      component.evaluation = 'Delicious';

      expect(spy.next).toBeCalledTimes(2);
      expect(spy.next).lastCalledWith('Delicious');
    });

    xit('🚧 should emit distinct values only', () => {
      const { component } = createComponent();

      const evaluation$ = watch(component, 'evaluation');

      const spy = observe(evaluation$);

      component.evaluation = 'meh';

      expect(spy.next).toBeCalledTimes(1);
    });
  });

  function createComponent() {
    const mock: jest.Mocked<
      Pick<ChangeDetectorRef, 'detach' | 'detectChanges'>
    > = {
      detach: jest.fn(),
      detectChanges: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GreetingsComponent,
        {
          provide: ChangeDetectorRef,
          useValue: mock,
        },
      ],
    });

    return {
      component: TestBed.inject(GreetingsComponent),
      cdRef: mock,
    };
  }

  async function flushMicrotasks() {
    await Promise.resolve();
  }
});
