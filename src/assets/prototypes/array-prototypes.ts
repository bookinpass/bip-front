export{}

declare global {
  interface Array<T> {
    isNullOrUndefined(Array: Array<T>): boolean;
  }
}

Array.prototype.isNullOrUndefined = function(obj: Array<any>) {
  return (obj === null || obj === undefined);
};
