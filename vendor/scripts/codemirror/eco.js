// CodeMirror.defineMode("eco", function(config, parserConfig) {
//   var ecoOverlay = {
//     token: function(stream, state) {
//       var ch;
//       if (stream.match(/\<\%\=?/)) {
//         while ((ch = stream.next()) != null)
//           if (ch == "%" && stream.next() == ">") break;
//         return "coffeescript";
//       }
//       while (stream.next() != null && !stream.match(/\<\%\=?/, false)) {}
//       return null;
//     }
//   };
//   return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "text/html"), ecoOverlay);
// });