import { writable, type Writable } from 'svelte/store';

export interface NoticeWithoutMeta {
	type: 'info' | 'error' | 'warning' | 'success';
	msg: string;
	snooze?: number;
}
export interface Notice extends NoticeWithoutMeta {
	title?: string;
	uuid: string;
}

export const notices: Writable<Notice[]> = writable([]);

export const addNotice = (notice: NoticeWithoutMeta | string) => {
	let notice_obj = notice as Notice;
	if (typeof notice == 'string') {
		notice_obj = {
			type: 'info',
			msg: notice,
		} as Notice;
	}
	notice_obj.uuid = generateUUID();
	if (notice_obj.snooze) {
		setTimeout(() => {
			//remove the notice with the uuid
			notices.update((n) => n.filter((notice: Notice) => notice.uuid !== notice_obj.uuid));
		}, notice_obj.snooze * 1000);
	}
	notices.update((n) => [...n, notice_obj]);
};

export const addError = (err: string | Error | NoticeWithoutMeta, snooze = 0) => {
	let error_obj: NoticeWithoutMeta;
	if (typeof err == 'string') {
		error_obj = {
			type: 'error',
			msg: err,
		};
	} else if (err instanceof Error) {
		error_obj = {
			type: 'error',
			msg: err.message,
		};
	} else {
		console.log(err);
		error_obj = {
			type: 'error',
			msg: 'Unable to display error. Check console',
			snooze: 5,
		};
	}
	if (snooze) error_obj.snooze = snooze;
	addNotice(error_obj);
};

function generateUUID() {
	let uuid = '';
	for (let i = 0; i < 32; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		uuid += Math.floor(Math.random() * 16).toString(16);
	}
	return uuid;
}
