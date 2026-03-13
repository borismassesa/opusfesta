// Fix React 18/19 type incompatibility in monorepo
// Root has @types/react@18, studio uses @types/react@19
// Libraries hoisted to root resolve React 18 types, causing JSX component errors
import type { JSX } from 'react';

declare module 'react' {
  interface ExoticComponent<P = object> {
    (props: P): JSX.Element | null;
  }
  interface ForwardRefExoticComponent<P> {
    (props: P): JSX.Element | null;
  }
  interface NamedExoticComponent<P = object> {
    (props: P): JSX.Element | null;
  }
  interface MemoExoticComponent<T extends React.ComponentType<unknown>> {
    (props: React.ComponentProps<T>): JSX.Element | null;
  }
  interface LazyExoticComponent<T extends React.ComponentType<unknown>> {
    (props: React.ComponentProps<T>): JSX.Element | null;
  }
}
