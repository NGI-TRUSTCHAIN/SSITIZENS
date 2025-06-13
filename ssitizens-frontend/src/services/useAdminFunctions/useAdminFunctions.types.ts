/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TransactionUserData {
	dni: string;
	iban: string;
	aid_funds: number;
	full_name: string;
	phone_number: string;
	store_id: string;
}

export interface TransactionUser {
	id: string;
	email: string;
	address: string;
	type: string;
	data: TransactionUserData;
	aid_type: string;
	terms_accepted: boolean;
	active_since: string;
	active_until: string;
	balance_tokens: number;
	balance_ethers: number;
}

export interface TransactionEventData {
	ticket_image?: string;
	expiration?: string;
	permission?: string;
	attachedData?: string;
	[key: string]: any;
}

export interface TransactionEvent {
	id: string;
	event: TransactionEventType;
	amount_tokens: number;
	amount_ethers: number;
	data: TransactionEventData | null;
	hash: string;
	timestamp: string;
	from_user: TransactionUser | null;
	to: TransactionUser | null;
}

export interface IPaginatedTransactions {
	count: number;
	next: string | null;
	previous: string | null;
	results: TransactionEvent[];
}

export type TransactionEventType =
	| "forcedBurn"
	| "generate"
	| "deleteRole"
	| "Transfer"
	| "assignRole"
	| string;

interface PaginationLinks {
	next: string | null;
	previous: string | null;
}
