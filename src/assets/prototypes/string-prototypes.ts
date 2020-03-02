export {};

declare global {
  interface String {
    equalIgnoreCase(str: string): boolean;

    isNullOrUndefined(str: string): boolean;
  }
}

String.prototype.equalIgnoreCase = function (str: string) {
  return (str != null &&
    typeof str === 'string' &&
    this.toUpperCase() === str.toUpperCase());
};

String.prototype.isNullOrUndefined = function (str: string) {
  return (str === null || str === undefined);
};

