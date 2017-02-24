interface Array<T> {
	includes(search:T, index?:number):boolean
	find(callback:(current:T, index?:number, array?:T[]) => void, thisArg?:any):T
}