import React from 'react';
import { LoadingStatus } from './LoadingStatus';

interface State {
  message: string;
  step: number;
  total: number;
}

export class LoadingStatusDisplay extends React.Component<{}, State> {
  state: State = LoadingStatus.getStatus();

  private listener = () => {
    this.setState(LoadingStatus.getStatus());
  };

  componentDidMount() {
    LoadingStatus.addListener(this.listener);
  }

  componentWillUnmount() {
    LoadingStatus.removeListener(this.listener);
  }

  render() {
    const { message, step, total } = this.state;
    if (!message || total === 0) return null;

    const percent = Math.min(100, Math.round((step / total) * 100));

    return (
      <div className="mt-3 z-3 w-100">
        <div className="alert alert-info p-2 mb-1 text-center">{message}</div>
        <div className="progress" style={{ height: '8px' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  }
}
