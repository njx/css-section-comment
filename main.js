/*
 * Copyright (c) 2012 Mike Chambers. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, btoa, atob */

// TODO:
// -- Useful for other comment styles too? (e.g. /////////////////////)
// -- Make it configurable (what to repeat, what comment style to use)
// -- Unit test

define(function (require, exports, module) {
    "use strict";
    
    var EditorManager   = brackets.getModule("editor/EditorManager"),
        CommandManager  = brackets.getModule("command/CommandManager"),
        Menus           = brackets.getModule("command/Menus");

    function getContext() {
        var editor = EditorManager.getFocusedEditor();
        if (editor.getModeForSelection() !== "css") {
            return null;
        }

        // Only handles comments that start at beginning of line and end at end of line.
        var doc = editor.document,
            commentLineNum = editor.getSelection().start.line,
            commentLine = doc.getLine(commentLineNum),
            matches = commentLine.match(/^\/\*(.*)\*\/\s*$/);
        if (!matches) {
            return null;
        }
        return { doc: doc, commentLineNum: commentLineNum, commentLine: commentLine, commentLength: matches[1].length };
    }
    
    function processLine(doc, asteriskLine, lineNum, after) {
        // If the given line is already an asterisk line, just replace it, otherwise insert.
        var replace = false, line = (lineNum >= 0 ? doc.getLine(lineNum) : "");
        if (line.match(/^\/\*(\**)\*\/\s*$/)) {
            doc.replaceRange(asteriskLine, { line: lineNum, ch: 0 }, { line: lineNum, ch: line.length});
        } else {
            doc.replaceRange(asteriskLine + "\n", { line: lineNum + (after ? 1 : 0), ch: 0 });
        }
    }
    
    function addOrUpdateAsteriskLines() {
        var i, context = getContext();
        if (!context) {
            return;
        }

        context.doc.batchOperation(function () {
            var asteriskLine = "/*";
            for (i = 0; i < context.commentLength; i++) {
                asteriskLine += "*";
            }
            asteriskLine += "*/";
            
            // Do the line afterwards first so we don't get confused by edits before the comment.
            processLine(context.doc, asteriskLine, context.commentLineNum + 1, false);
            processLine(context.doc, asteriskLine, context.commentLineNum - 1, true);
        });
    }

    var COMMAND_ID = "com.notwebsafe.css-section-comment";
    CommandManager.register("Make CSS Section Comment", COMMAND_ID, addOrUpdateAsteriskLines);
    
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(COMMAND_ID, "Ctrl-Alt-K");
});