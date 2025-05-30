export function setTimeout(timeout: number): void {
  let originalTimeout: number;

  beforeEach(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout;
  });

  afterEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
}
