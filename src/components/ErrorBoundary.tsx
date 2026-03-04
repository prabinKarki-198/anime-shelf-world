import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
