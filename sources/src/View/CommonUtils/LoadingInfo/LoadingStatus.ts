type Listener = () => void;

export class LoadingStatus {
  private static currentMessage = '';
  private static currentStep = 0;
  private static totalSteps = 0;
  private static listeners: Listener[] = [];

  public static setTotalSteps(total: number) {
    this.totalSteps = total;
    this.notify();
  }

  public static log(message: string) {
    this.currentMessage = message;
    this.currentStep += 1;
    this.notify();
  }

  public static clear() {
    this.currentMessage = '';
    this.currentStep = 0;
    this.totalSteps = 0;
    this.notify();
  }

  public static getStatus() {
    return {
      message: this.currentMessage,
      step: this.currentStep,
      total: this.totalSteps,
    };
  }

  public static addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  public static removeListener(listener: Listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static notify() {
    this.listeners.forEach(l => l());
  }
}
