interface requireContext {
	(path:string):any;
	resolve(path:string):void
	keys():string[]
	id:number
}

declare var require:{
	(path:string):any;
	(paths:string[], callback:(...modules:any[]) => void):void;
	ensure:(paths:string[], callback:(require:<T>(path:string) => T) => void, chunkName?:string) => void;
	context:(directory:string, useSubdirectories:boolean, regExp:RegExp) => requireContext
};
