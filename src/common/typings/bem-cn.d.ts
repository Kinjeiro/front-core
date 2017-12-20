interface BemCn {
  (name: string, ...mod: any[]): any;
  (hash: any);
}

declare module "bem-cn" {
  var block: BemCn;
  export default block;
}
