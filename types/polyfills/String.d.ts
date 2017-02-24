//эти методы есть в lib.es6.d.ts но нет в d.ts которую юзает ts

interface String {
	repeat(count: number): string
	includes(searchString: string, position?: number): boolean
	endsWith(searchString: string, endPosition?: number): boolean
	startsWith(searchString: string, position?: number): boolean
}