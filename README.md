This is a little [Brackets](https://github.com/adobe/brackets) extension that surrounds a given
(single-line) comment with matching lines of asterisks. For example, if you put your cursor in this:

```css
/* Styles for main page */
```

and hit Ctrl-Alt-K/Cmd-Alt-K, it turns into this:

```css
/************************/
/* Styles for main page */
/************************/
```

If you later edit the comment and hit the shortcut again, it will update the existing asterisk
lines to match.

TODO:
* Support multiline comments
* Useful for other languages/comment styles too? (e.g. JS /////////////////////)
* Make it configurable (what to repeat, what comment style to use)
* Unit test
