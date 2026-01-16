import { writable, type Writable } from 'svelte/store';
import { NetworkStatus } from '$lib/enums';

export const networkStatus: Writable<NetworkStatus> = writable(NetworkStatus.ONLINE);
