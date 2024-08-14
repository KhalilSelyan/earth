import { writable, type Writable } from 'svelte/store';
export function guiControls<T>(initialState: T): Writable<T> {
	return writable(initialState);
}
