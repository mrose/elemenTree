// babel.config.js
"use strict";
module.exports = (api) => {
  const isTest = api.env("test");
  //Jest will set process.env.NODE_ENV to 'test'
  // You can use isTest to determine what presets and plugins to use.

  return {
    presets: [["@babel/preset-env", { targets: { node: "current" } }]],
    plugins: [],
  };
};
