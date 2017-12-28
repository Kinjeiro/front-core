if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    const p = this.constructor;
    // We don’t invoke the callback in here,
    // because we want then() to handle its exceptions
    return this.then(
      // Callback fulfills: pass on predecessor settlement
      // Callback rejects: pass on rejection (=omit 2nd arg.)
      (value) => {
        return p.resolve(callback())
          .then(() => {
            return value;
          });
      },
      (reason) => {
        return p.resolve(callback())
          .then(() => {
            throw reason;
          });
      }
    );
  };
}
