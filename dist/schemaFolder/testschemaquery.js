"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
//graphql type definintions
//query fns
//user can get teams which has channels, but make sure user cant access channels that
//they dont have permissions for
exports.default = `
type Query{
  hi:String
}
`;