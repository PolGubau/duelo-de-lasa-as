import { Component, type ErrorInfo, type ReactNode } from "react";
import { playSound } from "../lib/sound.ts";
import { Button } from "./Button.tsx";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Título del mensaje de error; por defecto uno genérico con temática de cocina. */
  title?: string;
  /**
   * Se llama al pulsar "Reintentar", además de limpiar el error interno.
   * Útil para volver a un estado seguro (menú, sala) antes de reintentar.
   */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Red de seguridad de React: si algo revienta al renderizar una pantalla,
 * evita que toda la app se quede en blanco y ofrece volver a un estado
 * conocido en vez de forzar siempre una recarga completa.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
    playSound("error");
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-table p-6 text-center">
        <span className="text-5xl" aria-hidden="true">
          🍝💥
        </span>
        <h1 className="font-display text-2xl text-brand-cheese">
          {this.props.title ?? "¡Se nos quemó la lasaña!"}
        </h1>
        <p className="max-w-sm text-sm text-brand-bechamel/80">
          Algo ha fallado inesperadamente. Puedes intentar continuar o recargar la página.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={this.handleReset}>
            Reintentar
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    );
  }
}
