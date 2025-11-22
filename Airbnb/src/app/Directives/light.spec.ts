import { Light } from './light';

describe('Light', () => {
  it('should create an instance', () => {
    const directive = new Light();
    expect(directive).toBeTruthy();
  });
});
