/**
 * Copyright (c) 2024 channelsdb contributors, licensed under Apache 2.0, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
export class SimpleObservable {
	counter: number;

    constructor(private watcher: () => any, private onChange: (value: any) => void, private defaultValue: any = {}) { this.counter = 0; }
  
    subscribe() {
      let currentValue = this.watcher();
      if (currentValue !== void 0) {
        this.onChange(currentValue);
      } else {
        const intervalId = setInterval(() => {
          const newValue = this.watcher();
          if (newValue !== void 0) {
            clearInterval(intervalId);
            this.onChange(newValue);
          }
		  if (this.counter >= 20) {
			clearInterval(intervalId);
			this.onChange(this.defaultValue)
		  }
          this.counter++;
        }, 100);
      }
    }
}