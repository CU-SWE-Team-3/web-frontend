"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/has-flag";
exports.ids = ["vendor-chunks/has-flag"];
exports.modules = {

/***/ "(ssr)/./node_modules/has-flag/index.js":
/*!****************************************!*\
  !*** ./node_modules/has-flag/index.js ***!
  \****************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = (flag, argv = process.argv) => {\n  const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';\n  const position = argv.indexOf(prefix + flag);\n  const terminatorPosition = argv.indexOf('--');\n  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaGFzLWZsYWcvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWJBLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLENBQUNDLElBQUksRUFBRUMsSUFBSSxHQUFHQyxPQUFPLENBQUNELElBQUksS0FBSztFQUMvQyxNQUFNRSxNQUFNLEdBQUdILElBQUksQ0FBQ0ksVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBSUosSUFBSSxDQUFDSyxNQUFNLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFLO0VBQzNFLE1BQU1DLFFBQVEsR0FBR0wsSUFBSSxDQUFDTSxPQUFPLENBQUNKLE1BQU0sR0FBR0gsSUFBSSxDQUFDO0VBQzVDLE1BQU1RLGtCQUFrQixHQUFHUCxJQUFJLENBQUNNLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDN0MsT0FBT0QsUUFBUSxLQUFLLENBQUMsQ0FBQyxLQUFLRSxrQkFBa0IsS0FBSyxDQUFDLENBQUMsSUFBSUYsUUFBUSxHQUFHRSxrQkFBa0IsQ0FBQztBQUN2RixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmlvYmVhdHMtZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvaGFzLWZsYWcvaW5kZXguanM/ZjNmNiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZsYWcsIGFyZ3YgPSBwcm9jZXNzLmFyZ3YpID0+IHtcblx0Y29uc3QgcHJlZml4ID0gZmxhZy5zdGFydHNXaXRoKCctJykgPyAnJyA6IChmbGFnLmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLScpO1xuXHRjb25zdCBwb3NpdGlvbiA9IGFyZ3YuaW5kZXhPZihwcmVmaXggKyBmbGFnKTtcblx0Y29uc3QgdGVybWluYXRvclBvc2l0aW9uID0gYXJndi5pbmRleE9mKCctLScpO1xuXHRyZXR1cm4gcG9zaXRpb24gIT09IC0xICYmICh0ZXJtaW5hdG9yUG9zaXRpb24gPT09IC0xIHx8IHBvc2l0aW9uIDwgdGVybWluYXRvclBvc2l0aW9uKTtcbn07XG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImZsYWciLCJhcmd2IiwicHJvY2VzcyIsInByZWZpeCIsInN0YXJ0c1dpdGgiLCJsZW5ndGgiLCJwb3NpdGlvbiIsImluZGV4T2YiLCJ0ZXJtaW5hdG9yUG9zaXRpb24iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/has-flag/index.js\n");

/***/ })

};
;