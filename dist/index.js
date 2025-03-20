import * as process$1 from 'process';
import * as fs from 'fs/promises';
import require$$0$1 from 'assert';
import require$$0 from 'util';
import require$$2 from 'fs';
import require$$4 from 'path';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var argparse = {exports: {}};

var sub;
var hasRequiredSub;

function requireSub () {
	if (hasRequiredSub) return sub;
	hasRequiredSub = 1;

	const { inspect } = require$$0;


	sub = function sub(pattern, ...values) {
	    let regex = /%(?:(%)|(-)?(\*)?(?:\((\w+)\))?([A-Za-z]))/g;

	    let result = pattern.replace(regex, function (_, is_literal, is_left_align, is_padded, name, format) {
	        if (is_literal) return '%'

	        let padded_count = 0;
	        if (is_padded) {
	            if (values.length === 0) throw new TypeError('not enough arguments for format string')
	            padded_count = values.shift();
	            if (!Number.isInteger(padded_count)) throw new TypeError('* wants int')
	        }

	        let str;
	        if (name !== undefined) {
	            let dict = values[0];
	            if (typeof dict !== 'object' || dict === null) throw new TypeError('format requires a mapping')
	            if (!(name in dict)) throw new TypeError(`no such key: '${name}'`)
	            str = dict[name];
	        } else {
	            if (values.length === 0) throw new TypeError('not enough arguments for format string')
	            str = values.shift();
	        }

	        switch (format) {
	            case 's':
	                str = String(str);
	                break
	            case 'r':
	                str = inspect(str);
	                break
	            case 'd':
	            case 'i':
	                if (typeof str !== 'number') {
	                    throw new TypeError(`%${format} format: a number is required, not ${typeof str}`)
	                }
	                str = String(str.toFixed(0));
	                break
	            default:
	                throw new TypeError(`unsupported format character '${format}'`)
	        }

	        if (padded_count > 0) {
	            return is_left_align ? str.padEnd(padded_count) : str.padStart(padded_count)
	        } else {
	            return str
	        }
	    });

	    if (values.length) {
	        if (values.length === 1 && typeof values[0] === 'object' && values[0] !== null) ; else {
	            throw new TypeError('not all arguments converted during string formatting')
	        }
	    }

	    return result
	};
	return sub;
}

var textwrap;
var hasRequiredTextwrap;

function requireTextwrap () {
	if (hasRequiredTextwrap) return textwrap;
	hasRequiredTextwrap = 1;

	/*
	 * Text wrapping and filling.
	 */

	// Copyright (C) 1999-2001 Gregory P. Ward.
	// Copyright (C) 2002, 2003 Python Software Foundation.
	// Copyright (C) 2020 argparse.js authors
	// Originally written by Greg Ward <gward@python.net>

	// Hardcode the recognized whitespace characters to the US-ASCII
	// whitespace characters.  The main reason for doing this is that
	// some Unicode spaces (like \u00a0) are non-breaking whitespaces.
	//
	// This less funky little regex just split on recognized spaces. E.g.
	//   "Hello there -- you goof-ball, use the -b option!"
	// splits into
	//   Hello/ /there/ /--/ /you/ /goof-ball,/ /use/ /the/ /-b/ /option!/
	const wordsep_simple_re = /([\t\n\x0b\x0c\r ]+)/;

	class TextWrapper {
	    /*
	     *  Object for wrapping/filling text.  The public interface consists of
	     *  the wrap() and fill() methods; the other methods are just there for
	     *  subclasses to override in order to tweak the default behaviour.
	     *  If you want to completely replace the main wrapping algorithm,
	     *  you'll probably have to override _wrap_chunks().
	     *
	     *  Several instance attributes control various aspects of wrapping:
	     *    width (default: 70)
	     *      the maximum width of wrapped lines (unless break_long_words
	     *      is false)
	     *    initial_indent (default: "")
	     *      string that will be prepended to the first line of wrapped
	     *      output.  Counts towards the line's width.
	     *    subsequent_indent (default: "")
	     *      string that will be prepended to all lines save the first
	     *      of wrapped output; also counts towards each line's width.
	     *    expand_tabs (default: true)
	     *      Expand tabs in input text to spaces before further processing.
	     *      Each tab will become 0 .. 'tabsize' spaces, depending on its position
	     *      in its line.  If false, each tab is treated as a single character.
	     *    tabsize (default: 8)
	     *      Expand tabs in input text to 0 .. 'tabsize' spaces, unless
	     *      'expand_tabs' is false.
	     *    replace_whitespace (default: true)
	     *      Replace all whitespace characters in the input text by spaces
	     *      after tab expansion.  Note that if expand_tabs is false and
	     *      replace_whitespace is true, every tab will be converted to a
	     *      single space!
	     *    fix_sentence_endings (default: false)
	     *      Ensure that sentence-ending punctuation is always followed
	     *      by two spaces.  Off by default because the algorithm is
	     *      (unavoidably) imperfect.
	     *    break_long_words (default: true)
	     *      Break words longer than 'width'.  If false, those words will not
	     *      be broken, and some lines might be longer than 'width'.
	     *    break_on_hyphens (default: true)
	     *      Allow breaking hyphenated words. If true, wrapping will occur
	     *      preferably on whitespaces and right after hyphens part of
	     *      compound words.
	     *    drop_whitespace (default: true)
	     *      Drop leading and trailing whitespace from lines.
	     *    max_lines (default: None)
	     *      Truncate wrapped lines.
	     *    placeholder (default: ' [...]')
	     *      Append to the last line of truncated text.
	     */

	    constructor(options = {}) {
	        let {
	            width = 70,
	            initial_indent = '',
	            subsequent_indent = '',
	            expand_tabs = true,
	            replace_whitespace = true,
	            fix_sentence_endings = false,
	            break_long_words = true,
	            drop_whitespace = true,
	            break_on_hyphens = true,
	            tabsize = 8,
	            max_lines = undefined,
	            placeholder=' [...]'
	        } = options;

	        this.width = width;
	        this.initial_indent = initial_indent;
	        this.subsequent_indent = subsequent_indent;
	        this.expand_tabs = expand_tabs;
	        this.replace_whitespace = replace_whitespace;
	        this.fix_sentence_endings = fix_sentence_endings;
	        this.break_long_words = break_long_words;
	        this.drop_whitespace = drop_whitespace;
	        this.break_on_hyphens = break_on_hyphens;
	        this.tabsize = tabsize;
	        this.max_lines = max_lines;
	        this.placeholder = placeholder;
	    }


	    // -- Private methods -----------------------------------------------
	    // (possibly useful for subclasses to override)

	    _munge_whitespace(text) {
	        /*
	         *  _munge_whitespace(text : string) -> string
	         *
	         *  Munge whitespace in text: expand tabs and convert all other
	         *  whitespace characters to spaces.  Eg. " foo\\tbar\\n\\nbaz"
	         *  becomes " foo    bar  baz".
	         */
	        if (this.expand_tabs) {
	            text = text.replace(/\t/g, ' '.repeat(this.tabsize)); // not strictly correct in js
	        }
	        if (this.replace_whitespace) {
	            text = text.replace(/[\t\n\x0b\x0c\r]/g, ' ');
	        }
	        return text
	    }

	    _split(text) {
	        /*
	         *  _split(text : string) -> [string]
	         *
	         *  Split the text to wrap into indivisible chunks.  Chunks are
	         *  not quite the same as words; see _wrap_chunks() for full
	         *  details.  As an example, the text
	         *    Look, goof-ball -- use the -b option!
	         *  breaks into the following chunks:
	         *    'Look,', ' ', 'goof-', 'ball', ' ', '--', ' ',
	         *    'use', ' ', 'the', ' ', '-b', ' ', 'option!'
	         *  if break_on_hyphens is True, or in:
	         *    'Look,', ' ', 'goof-ball', ' ', '--', ' ',
	         *    'use', ' ', 'the', ' ', '-b', ' ', option!'
	         *  otherwise.
	         */
	        let chunks = text.split(wordsep_simple_re);
	        chunks = chunks.filter(Boolean);
	        return chunks
	    }

	    _handle_long_word(reversed_chunks, cur_line, cur_len, width) {
	        /*
	         *  _handle_long_word(chunks : [string],
	         *                    cur_line : [string],
	         *                    cur_len : int, width : int)
	         *
	         *  Handle a chunk of text (most likely a word, not whitespace) that
	         *  is too long to fit in any line.
	         */
	        // Figure out when indent is larger than the specified width, and make
	        // sure at least one character is stripped off on every pass
	        let space_left;
	        if (width < 1) {
	            space_left = 1;
	        } else {
	            space_left = width - cur_len;
	        }

	        // If we're allowed to break long words, then do so: put as much
	        // of the next chunk onto the current line as will fit.
	        if (this.break_long_words) {
	            cur_line.push(reversed_chunks[reversed_chunks.length - 1].slice(0, space_left));
	            reversed_chunks[reversed_chunks.length - 1] = reversed_chunks[reversed_chunks.length - 1].slice(space_left);

	        // Otherwise, we have to preserve the long word intact.  Only add
	        // it to the current line if there's nothing already there --
	        // that minimizes how much we violate the width constraint.
	        } else if (!cur_line) {
	            cur_line.push(...reversed_chunks.pop());
	        }

	        // If we're not allowed to break long words, and there's already
	        // text on the current line, do nothing.  Next time through the
	        // main loop of _wrap_chunks(), we'll wind up here again, but
	        // cur_len will be zero, so the next line will be entirely
	        // devoted to the long word that we can't handle right now.
	    }

	    _wrap_chunks(chunks) {
	        /*
	         *  _wrap_chunks(chunks : [string]) -> [string]
	         *
	         *  Wrap a sequence of text chunks and return a list of lines of
	         *  length 'self.width' or less.  (If 'break_long_words' is false,
	         *  some lines may be longer than this.)  Chunks correspond roughly
	         *  to words and the whitespace between them: each chunk is
	         *  indivisible (modulo 'break_long_words'), but a line break can
	         *  come between any two chunks.  Chunks should not have internal
	         *  whitespace; ie. a chunk is either all whitespace or a "word".
	         *  Whitespace chunks will be removed from the beginning and end of
	         *  lines, but apart from that whitespace is preserved.
	         */
	        let lines = [];
	        let indent;
	        if (this.width <= 0) {
	            throw Error(`invalid width ${this.width} (must be > 0)`)
	        }
	        if (this.max_lines !== undefined) {
	            if (this.max_lines > 1) {
	                indent = this.subsequent_indent;
	            } else {
	                indent = this.initial_indent;
	            }
	            if (indent.length + this.placeholder.trimStart().length > this.width) {
	                throw Error('placeholder too large for max width')
	            }
	        }

	        // Arrange in reverse order so items can be efficiently popped
	        // from a stack of chucks.
	        chunks = chunks.reverse();

	        while (chunks.length > 0) {

	            // Start the list of chunks that will make up the current line.
	            // cur_len is just the length of all the chunks in cur_line.
	            let cur_line = [];
	            let cur_len = 0;

	            // Figure out which static string will prefix this line.
	            let indent;
	            if (lines) {
	                indent = this.subsequent_indent;
	            } else {
	                indent = this.initial_indent;
	            }

	            // Maximum width for this line.
	            let width = this.width - indent.length;

	            // First chunk on line is whitespace -- drop it, unless this
	            // is the very beginning of the text (ie. no lines started yet).
	            if (this.drop_whitespace && chunks[chunks.length - 1].trim() === '' && lines.length > 0) {
	                chunks.pop();
	            }

	            while (chunks.length > 0) {
	                let l = chunks[chunks.length - 1].length;

	                // Can at least squeeze this chunk onto the current line.
	                if (cur_len + l <= width) {
	                    cur_line.push(chunks.pop());
	                    cur_len += l;

	                // Nope, this line is full.
	                } else {
	                    break
	                }
	            }

	            // The current line is full, and the next chunk is too big to
	            // fit on *any* line (not just this one).
	            if (chunks.length && chunks[chunks.length - 1].length > width) {
	                this._handle_long_word(chunks, cur_line, cur_len, width);
	                cur_len = cur_line.map(l => l.length).reduce((a, b) => a + b, 0);
	            }

	            // If the last chunk on this line is all whitespace, drop it.
	            if (this.drop_whitespace && cur_line.length > 0 && cur_line[cur_line.length - 1].trim() === '') {
	                cur_len -= cur_line[cur_line.length - 1].length;
	                cur_line.pop();
	            }

	            if (cur_line) {
	                if (this.max_lines === undefined ||
	                    lines.length + 1 < this.max_lines ||
	                    (chunks.length === 0 ||
	                     this.drop_whitespace &&
	                     chunks.length === 1 &&
	                     !chunks[0].trim()) && cur_len <= width) {
	                    // Convert current line back to a string and store it in
	                    // list of all lines (return value).
	                    lines.push(indent + cur_line.join(''));
	                } else {
	                    let had_break = false;
	                    while (cur_line) {
	                        if (cur_line[cur_line.length - 1].trim() &&
	                            cur_len + this.placeholder.length <= width) {
	                            cur_line.push(this.placeholder);
	                            lines.push(indent + cur_line.join(''));
	                            had_break = true;
	                            break
	                        }
	                        cur_len -= cur_line[-1].length;
	                        cur_line.pop();
	                    }
	                    if (!had_break) {
	                        if (lines) {
	                            let prev_line = lines[lines.length - 1].trimEnd();
	                            if (prev_line.length + this.placeholder.length <=
	                                    this.width) {
	                                lines[lines.length - 1] = prev_line + this.placeholder;
	                                break
	                            }
	                        }
	                        lines.push(indent + this.placeholder.lstrip());
	                    }
	                    break
	                }
	            }
	        }

	        return lines
	    }

	    _split_chunks(text) {
	        text = this._munge_whitespace(text);
	        return this._split(text)
	    }

	    // -- Public interface ----------------------------------------------

	    wrap(text) {
	        /*
	         *  wrap(text : string) -> [string]
	         *
	         *  Reformat the single paragraph in 'text' so it fits in lines of
	         *  no more than 'self.width' columns, and return a list of wrapped
	         *  lines.  Tabs in 'text' are expanded with string.expandtabs(),
	         *  and all other whitespace characters (including newline) are
	         *  converted to space.
	         */
	        let chunks = this._split_chunks(text);
	        // not implemented in js
	        //if (this.fix_sentence_endings) {
	        //    this._fix_sentence_endings(chunks)
	        //}
	        return this._wrap_chunks(chunks)
	    }

	    fill(text) {
	        /*
	         *  fill(text : string) -> string
	         *
	         *  Reformat the single paragraph in 'text' to fit in lines of no
	         *  more than 'self.width' columns, and return a new string
	         *  containing the entire wrapped paragraph.
	         */
	        return this.wrap(text).join('\n')
	    }
	}


	// -- Convenience interface ---------------------------------------------

	function wrap(text, options = {}) {
	    /*
	     *  Wrap a single paragraph of text, returning a list of wrapped lines.
	     *
	     *  Reformat the single paragraph in 'text' so it fits in lines of no
	     *  more than 'width' columns, and return a list of wrapped lines.  By
	     *  default, tabs in 'text' are expanded with string.expandtabs(), and
	     *  all other whitespace characters (including newline) are converted to
	     *  space.  See TextWrapper class for available keyword args to customize
	     *  wrapping behaviour.
	     */
	    let { width = 70, ...kwargs } = options;
	    let w = new TextWrapper(Object.assign({ width }, kwargs));
	    return w.wrap(text)
	}

	function fill(text, options = {}) {
	    /*
	     *  Fill a single paragraph of text, returning a new string.
	     *
	     *  Reformat the single paragraph in 'text' to fit in lines of no more
	     *  than 'width' columns, and return a new string containing the entire
	     *  wrapped paragraph.  As with wrap(), tabs are expanded and other
	     *  whitespace characters converted to space.  See TextWrapper class for
	     *  available keyword args to customize wrapping behaviour.
	     */
	    let { width = 70, ...kwargs } = options;
	    let w = new TextWrapper(Object.assign({ width }, kwargs));
	    return w.fill(text)
	}

	// -- Loosely related functionality -------------------------------------

	let _whitespace_only_re = /^[ \t]+$/mg;
	let _leading_whitespace_re = /(^[ \t]*)(?:[^ \t\n])/mg;

	function dedent(text) {
	    /*
	     *  Remove any common leading whitespace from every line in `text`.
	     *
	     *  This can be used to make triple-quoted strings line up with the left
	     *  edge of the display, while still presenting them in the source code
	     *  in indented form.
	     *
	     *  Note that tabs and spaces are both treated as whitespace, but they
	     *  are not equal: the lines "  hello" and "\\thello" are
	     *  considered to have no common leading whitespace.
	     *
	     *  Entirely blank lines are normalized to a newline character.
	     */
	    // Look for the longest leading string of spaces and tabs common to
	    // all lines.
	    let margin = undefined;
	    text = text.replace(_whitespace_only_re, '');
	    let indents = text.match(_leading_whitespace_re) || [];
	    for (let indent of indents) {
	        indent = indent.slice(0, -1);

	        if (margin === undefined) {
	            margin = indent;

	        // Current line more deeply indented than previous winner:
	        // no change (previous winner is still on top).
	        } else if (indent.startsWith(margin)) ; else if (margin.startsWith(indent)) {
	            margin = indent;

	        // Find the largest common whitespace between current line and previous
	        // winner.
	        } else {
	            for (let i = 0; i < margin.length && i < indent.length; i++) {
	                if (margin[i] !== indent[i]) {
	                    margin = margin.slice(0, i);
	                    break
	                }
	            }
	        }
	    }

	    if (margin) {
	        text = text.replace(new RegExp('^' + margin, 'mg'), '');
	    }
	    return text
	}

	textwrap = { wrap, fill, dedent };
	return textwrap;
}

var hasRequiredArgparse;

function requireArgparse () {
	if (hasRequiredArgparse) return argparse.exports;
	hasRequiredArgparse = 1;
	(function (module) {

		// Copyright (C) 2010-2020 Python Software Foundation.
		// Copyright (C) 2020 argparse.js authors

		/*
		 * Command-line parsing library
		 *
		 * This module is an optparse-inspired command-line parsing library that:
		 *
		 *     - handles both optional and positional arguments
		 *     - produces highly informative usage messages
		 *     - supports parsers that dispatch to sub-parsers
		 *
		 * The following is a simple usage example that sums integers from the
		 * command-line and writes the result to a file::
		 *
		 *     parser = argparse.ArgumentParser(
		 *         description='sum the integers at the command line')
		 *     parser.add_argument(
		 *         'integers', metavar='int', nargs='+', type=int,
		 *         help='an integer to be summed')
		 *     parser.add_argument(
		 *         '--log', default=sys.stdout, type=argparse.FileType('w'),
		 *         help='the file where the sum should be written')
		 *     args = parser.parse_args()
		 *     args.log.write('%s' % sum(args.integers))
		 *     args.log.close()
		 *
		 * The module contains the following public classes:
		 *
		 *     - ArgumentParser -- The main entry point for command-line parsing. As the
		 *         example above shows, the add_argument() method is used to populate
		 *         the parser with actions for optional and positional arguments. Then
		 *         the parse_args() method is invoked to convert the args at the
		 *         command-line into an object with attributes.
		 *
		 *     - ArgumentError -- The exception raised by ArgumentParser objects when
		 *         there are errors with the parser's actions. Errors raised while
		 *         parsing the command-line are caught by ArgumentParser and emitted
		 *         as command-line messages.
		 *
		 *     - FileType -- A factory for defining types of files to be created. As the
		 *         example above shows, instances of FileType are typically passed as
		 *         the type= argument of add_argument() calls.
		 *
		 *     - Action -- The base class for parser actions. Typically actions are
		 *         selected by passing strings like 'store_true' or 'append_const' to
		 *         the action= argument of add_argument(). However, for greater
		 *         customization of ArgumentParser actions, subclasses of Action may
		 *         be defined and passed as the action= argument.
		 *
		 *     - HelpFormatter, RawDescriptionHelpFormatter, RawTextHelpFormatter,
		 *         ArgumentDefaultsHelpFormatter -- Formatter classes which
		 *         may be passed as the formatter_class= argument to the
		 *         ArgumentParser constructor. HelpFormatter is the default,
		 *         RawDescriptionHelpFormatter and RawTextHelpFormatter tell the parser
		 *         not to change the formatting for help text, and
		 *         ArgumentDefaultsHelpFormatter adds information about argument defaults
		 *         to the help.
		 *
		 * All other classes in this module are considered implementation details.
		 * (Also note that HelpFormatter and RawDescriptionHelpFormatter are only
		 * considered public as object names -- the API of the formatter objects is
		 * still considered an implementation detail.)
		 */

		const SUPPRESS = '==SUPPRESS==';

		const OPTIONAL = '?';
		const ZERO_OR_MORE = '*';
		const ONE_OR_MORE = '+';
		const PARSER = 'A...';
		const REMAINDER = '...';
		const _UNRECOGNIZED_ARGS_ATTR = '_unrecognized_args';


		// ==================================
		// Utility functions used for porting
		// ==================================
		const assert = require$$0$1;
		const util = require$$0;
		const fs = require$$2;
		const sub = requireSub();
		const path = require$$4;
		const repr = util.inspect;

		function get_argv() {
		    // omit first argument (which is assumed to be interpreter - `node`, `coffee`, `ts-node`, etc.)
		    return process.argv.slice(1)
		}

		function get_terminal_size() {
		    return {
		        columns: +process.env.COLUMNS || process.stdout.columns || 80
		    }
		}

		function hasattr(object, name) {
		    return Object.prototype.hasOwnProperty.call(object, name)
		}

		function getattr(object, name, value) {
		    return hasattr(object, name) ? object[name] : value
		}

		function setattr(object, name, value) {
		    object[name] = value;
		}

		function setdefault(object, name, value) {
		    if (!hasattr(object, name)) object[name] = value;
		    return object[name]
		}

		function delattr(object, name) {
		    delete object[name];
		}

		function range(from, to, step=1) {
		    // range(10) is equivalent to range(0, 10)
		    if (arguments.length === 1) [ to, from ] = [ from, 0 ];
		    if (typeof from !== 'number' || typeof to !== 'number' || typeof step !== 'number') {
		        throw new TypeError('argument cannot be interpreted as an integer')
		    }
		    if (step === 0) throw new TypeError('range() arg 3 must not be zero')

		    let result = [];
		    if (step > 0) {
		        for (let i = from; i < to; i += step) result.push(i);
		    } else {
		        for (let i = from; i > to; i += step) result.push(i);
		    }
		    return result
		}

		function splitlines(str, keepends = false) {
		    let result;
		    if (!keepends) {
		        result = str.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/);
		    } else {
		        result = [];
		        let parts = str.split(/(\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029])/);
		        for (let i = 0; i < parts.length; i += 2) {
		            result.push(parts[i] + (i + 1 < parts.length ? parts[i + 1] : ''));
		        }
		    }
		    if (!result[result.length - 1]) result.pop();
		    return result
		}

		function _string_lstrip(string, prefix_chars) {
		    let idx = 0;
		    while (idx < string.length && prefix_chars.includes(string[idx])) idx++;
		    return idx ? string.slice(idx) : string
		}

		function _string_split(string, sep, maxsplit) {
		    let result = string.split(sep);
		    if (result.length > maxsplit) {
		        result = result.slice(0, maxsplit).concat([ result.slice(maxsplit).join(sep) ]);
		    }
		    return result
		}

		function _array_equal(array1, array2) {
		    if (array1.length !== array2.length) return false
		    for (let i = 0; i < array1.length; i++) {
		        if (array1[i] !== array2[i]) return false
		    }
		    return true
		}

		function _array_remove(array, item) {
		    let idx = array.indexOf(item);
		    if (idx === -1) throw new TypeError(sub('%r not in list', item))
		    array.splice(idx, 1);
		}

		// normalize choices to array;
		// this isn't required in python because `in` and `map` operators work with anything,
		// but in js dealing with multiple types here is too clunky
		function _choices_to_array(choices) {
		    if (choices === undefined) {
		        return []
		    } else if (Array.isArray(choices)) {
		        return choices
		    } else if (choices !== null && typeof choices[Symbol.iterator] === 'function') {
		        return Array.from(choices)
		    } else if (typeof choices === 'object' && choices !== null) {
		        return Object.keys(choices)
		    } else {
		        throw new Error(sub('invalid choices value: %r', choices))
		    }
		}

		// decorator that allows a class to be called without new
		function _callable(cls) {
		    let result = { // object is needed for inferred class name
		        [cls.name]: function (...args) {
		            let this_class = new.target === result || !new.target;
		            return Reflect.construct(cls, args, this_class ? cls : new.target)
		        }
		    };
		    result[cls.name].prototype = cls.prototype;
		    // fix default tag for toString, e.g. [object Action] instead of [object Object]
		    cls.prototype[Symbol.toStringTag] = cls.name;
		    return result[cls.name]
		}

		function _alias(object, from, to) {
		    try {
		        let name = object.constructor.name;
		        Object.defineProperty(object, from, {
		            value: util.deprecate(object[to], sub('%s.%s() is renamed to %s.%s()',
		                name, from, name, to)),
		            enumerable: false
		        });
		    } catch {}
		}

		// decorator that allows snake_case class methods to be called with camelCase and vice versa
		function _camelcase_alias(_class) {
		    for (let name of Object.getOwnPropertyNames(_class.prototype)) {
		        let camelcase = name.replace(/\w_[a-z]/g, s => s[0] + s[2].toUpperCase());
		        if (camelcase !== name) _alias(_class.prototype, camelcase, name);
		    }
		    return _class
		}

		function _to_legacy_name(key) {
		    key = key.replace(/\w_[a-z]/g, s => s[0] + s[2].toUpperCase());
		    if (key === 'default') key = 'defaultValue';
		    if (key === 'const') key = 'constant';
		    return key
		}

		function _to_new_name(key) {
		    if (key === 'defaultValue') key = 'default';
		    if (key === 'constant') key = 'const';
		    key = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
		    return key
		}

		// parse options
		let no_default = Symbol('no_default_value');
		function _parse_opts(args, descriptor) {
		    function get_name() {
		        let stack = new Error().stack.split('\n')
		            .map(x => x.match(/^    at (.*) \(.*\)$/))
		            .filter(Boolean)
		            .map(m => m[1])
		            .map(fn => fn.match(/[^ .]*$/)[0]);

		        if (stack.length && stack[0] === get_name.name) stack.shift();
		        if (stack.length && stack[0] === _parse_opts.name) stack.shift();
		        return stack.length ? stack[0] : ''
		    }

		    args = Array.from(args);
		    let kwargs = {};
		    let result = [];
		    let last_opt = args.length && args[args.length - 1];

		    if (typeof last_opt === 'object' && last_opt !== null && !Array.isArray(last_opt) &&
		        (!last_opt.constructor || last_opt.constructor.name === 'Object')) {
		        kwargs = Object.assign({}, args.pop());
		    }

		    // LEGACY (v1 compatibility): camelcase
		    let renames = [];
		    for (let key of Object.keys(descriptor)) {
		        let old_name = _to_legacy_name(key);
		        if (old_name !== key && (old_name in kwargs)) {
		            if (key in kwargs) ; else {
		                kwargs[key] = kwargs[old_name];
		            }
		            renames.push([ old_name, key ]);
		            delete kwargs[old_name];
		        }
		    }
		    if (renames.length) {
		        let name = get_name();
		        deprecate('camelcase_' + name, sub('%s(): following options are renamed: %s',
		            name, renames.map(([ a, b ]) => sub('%r -> %r', a, b))));
		    }
		    // end

		    let missing_positionals = [];
		    let positional_count = args.length;

		    for (let [ key, def ] of Object.entries(descriptor)) {
		        if (key[0] === '*') {
		            if (key.length > 0 && key[1] === '*') {
		                // LEGACY (v1 compatibility): camelcase
		                let renames = [];
		                for (let key of Object.keys(kwargs)) {
		                    let new_name = _to_new_name(key);
		                    if (new_name !== key && (key in kwargs)) {
		                        if (new_name in kwargs) ; else {
		                            kwargs[new_name] = kwargs[key];
		                        }
		                        renames.push([ key, new_name ]);
		                        delete kwargs[key];
		                    }
		                }
		                if (renames.length) {
		                    let name = get_name();
		                    deprecate('camelcase_' + name, sub('%s(): following options are renamed: %s',
		                        name, renames.map(([ a, b ]) => sub('%r -> %r', a, b))));
		                }
		                // end
		                result.push(kwargs);
		                kwargs = {};
		            } else {
		                result.push(args);
		                args = [];
		            }
		        } else if (key in kwargs && args.length > 0) {
		            throw new TypeError(sub('%s() got multiple values for argument %r', get_name(), key))
		        } else if (key in kwargs) {
		            result.push(kwargs[key]);
		            delete kwargs[key];
		        } else if (args.length > 0) {
		            result.push(args.shift());
		        } else if (def !== no_default) {
		            result.push(def);
		        } else {
		            missing_positionals.push(key);
		        }
		    }

		    if (Object.keys(kwargs).length) {
		        throw new TypeError(sub('%s() got an unexpected keyword argument %r',
		            get_name(), Object.keys(kwargs)[0]))
		    }

		    if (args.length) {
		        let from = Object.entries(descriptor).filter(([ k, v ]) => k[0] !== '*' && v !== no_default).length;
		        let to = Object.entries(descriptor).filter(([ k ]) => k[0] !== '*').length;
		        throw new TypeError(sub('%s() takes %s positional argument%s but %s %s given',
		            get_name(),
		            from === to ? sub('from %s to %s', from, to) : to,
		            from === to && to === 1 ? '' : 's',
		            positional_count,
		            positional_count === 1 ? 'was' : 'were'))
		    }

		    if (missing_positionals.length) {
		        let strs = missing_positionals.map(repr);
		        if (strs.length > 1) strs[strs.length - 1] = 'and ' + strs[strs.length - 1];
		        let str_joined = strs.join(strs.length === 2 ? '' : ', ');
		        throw new TypeError(sub('%s() missing %i required positional argument%s: %s',
		            get_name(), strs.length, strs.length === 1 ? '' : 's', str_joined))
		    }

		    return result
		}

		let _deprecations = {};
		function deprecate(id, string) {
		    _deprecations[id] = _deprecations[id] || util.deprecate(() => {}, string);
		    _deprecations[id]();
		}


		// =============================
		// Utility functions and classes
		// =============================
		function _AttributeHolder(cls = Object) {
		    /*
		     *  Abstract base class that provides __repr__.
		     *
		     *  The __repr__ method returns a string in the format::
		     *      ClassName(attr=name, attr=name, ...)
		     *  The attributes are determined either by a class-level attribute,
		     *  '_kwarg_names', or by inspecting the instance __dict__.
		     */

		    return class _AttributeHolder extends cls {
		        [util.inspect.custom]() {
		            let type_name = this.constructor.name;
		            let arg_strings = [];
		            let star_args = {};
		            for (let arg of this._get_args()) {
		                arg_strings.push(repr(arg));
		            }
		            for (let [ name, value ] of this._get_kwargs()) {
		                if (/^[a-z_][a-z0-9_$]*$/i.test(name)) {
		                    arg_strings.push(sub('%s=%r', name, value));
		                } else {
		                    star_args[name] = value;
		                }
		            }
		            if (Object.keys(star_args).length) {
		                arg_strings.push(sub('**%s', repr(star_args)));
		            }
		            return sub('%s(%s)', type_name, arg_strings.join(', '))
		        }

		        toString() {
		            return this[util.inspect.custom]()
		        }

		        _get_kwargs() {
		            return Object.entries(this)
		        }

		        _get_args() {
		            return []
		        }
		    }
		}


		function _copy_items(items) {
		    if (items === undefined) {
		        return []
		    }
		    return items.slice(0)
		}


		// ===============
		// Formatting Help
		// ===============
		const HelpFormatter = _camelcase_alias(_callable(class HelpFormatter {
		    /*
		     *  Formatter for generating usage messages and argument help strings.
		     *
		     *  Only the name of this class is considered a public API. All the methods
		     *  provided by the class are considered an implementation detail.
		     */

		    constructor() {
		        let [
		            prog,
		            indent_increment,
		            max_help_position,
		            width
		        ] = _parse_opts(arguments, {
		            prog: no_default,
		            indent_increment: 2,
		            max_help_position: 24,
		            width: undefined
		        });

		        // default setting for width
		        if (width === undefined) {
		            width = get_terminal_size().columns;
		            width -= 2;
		        }

		        this._prog = prog;
		        this._indent_increment = indent_increment;
		        this._max_help_position = Math.min(max_help_position,
		                                      Math.max(width - 20, indent_increment * 2));
		        this._width = width;

		        this._current_indent = 0;
		        this._level = 0;
		        this._action_max_length = 0;

		        this._root_section = this._Section(this, undefined);
		        this._current_section = this._root_section;

		        this._whitespace_matcher = /[ \t\n\r\f\v]+/g; // equivalent to python /\s+/ with ASCII flag
		        this._long_break_matcher = /\n\n\n+/g;
		    }

		    // ===============================
		    // Section and indentation methods
		    // ===============================
		    _indent() {
		        this._current_indent += this._indent_increment;
		        this._level += 1;
		    }

		    _dedent() {
		        this._current_indent -= this._indent_increment;
		        assert(this._current_indent >= 0, 'Indent decreased below 0.');
		        this._level -= 1;
		    }

		    _add_item(func, args) {
		        this._current_section.items.push([ func, args ]);
		    }

		    // ========================
		    // Message building methods
		    // ========================
		    start_section(heading) {
		        this._indent();
		        let section = this._Section(this, this._current_section, heading);
		        this._add_item(section.format_help.bind(section), []);
		        this._current_section = section;
		    }

		    end_section() {
		        this._current_section = this._current_section.parent;
		        this._dedent();
		    }

		    add_text(text) {
		        if (text !== SUPPRESS && text !== undefined) {
		            this._add_item(this._format_text.bind(this), [text]);
		        }
		    }

		    add_usage(usage, actions, groups, prefix = undefined) {
		        if (usage !== SUPPRESS) {
		            let args = [ usage, actions, groups, prefix ];
		            this._add_item(this._format_usage.bind(this), args);
		        }
		    }

		    add_argument(action) {
		        if (action.help !== SUPPRESS) {

		            // find all invocations
		            let invocations = [this._format_action_invocation(action)];
		            for (let subaction of this._iter_indented_subactions(action)) {
		                invocations.push(this._format_action_invocation(subaction));
		            }

		            // update the maximum item length
		            let invocation_length = Math.max(...invocations.map(invocation => invocation.length));
		            let action_length = invocation_length + this._current_indent;
		            this._action_max_length = Math.max(this._action_max_length,
		                                               action_length);

		            // add the item to the list
		            this._add_item(this._format_action.bind(this), [action]);
		        }
		    }

		    add_arguments(actions) {
		        for (let action of actions) {
		            this.add_argument(action);
		        }
		    }

		    // =======================
		    // Help-formatting methods
		    // =======================
		    format_help() {
		        let help = this._root_section.format_help();
		        if (help) {
		            help = help.replace(this._long_break_matcher, '\n\n');
		            help = help.replace(/^\n+|\n+$/g, '') + '\n';
		        }
		        return help
		    }

		    _join_parts(part_strings) {
		        return part_strings.filter(part => part && part !== SUPPRESS).join('')
		    }

		    _format_usage(usage, actions, groups, prefix) {
		        if (prefix === undefined) {
		            prefix = 'usage: ';
		        }

		        // if usage is specified, use that
		        if (usage !== undefined) {
		            usage = sub(usage, { prog: this._prog });

		        // if no optionals or positionals are available, usage is just prog
		        } else if (usage === undefined && !actions.length) {
		            usage = sub('%(prog)s', { prog: this._prog });

		        // if optionals and positionals are available, calculate usage
		        } else if (usage === undefined) {
		            let prog = sub('%(prog)s', { prog: this._prog });

		            // split optionals from positionals
		            let optionals = [];
		            let positionals = [];
		            for (let action of actions) {
		                if (action.option_strings.length) {
		                    optionals.push(action);
		                } else {
		                    positionals.push(action);
		                }
		            }

		            // build full usage string
		            let action_usage = this._format_actions_usage([].concat(optionals).concat(positionals), groups);
		            usage = [ prog, action_usage ].map(String).join(' ');

		            // wrap the usage parts if it's too long
		            let text_width = this._width - this._current_indent;
		            if (prefix.length + usage.length > text_width) {

		                // break usage into wrappable parts
		                let part_regexp = /\(.*?\)+(?=\s|$)|\[.*?\]+(?=\s|$)|\S+/g;
		                let opt_usage = this._format_actions_usage(optionals, groups);
		                let pos_usage = this._format_actions_usage(positionals, groups);
		                let opt_parts = opt_usage.match(part_regexp) || [];
		                let pos_parts = pos_usage.match(part_regexp) || [];
		                assert(opt_parts.join(' ') === opt_usage);
		                assert(pos_parts.join(' ') === pos_usage);

		                // helper for wrapping lines
		                let get_lines = (parts, indent, prefix = undefined) => {
		                    let lines = [];
		                    let line = [];
		                    let line_len;
		                    if (prefix !== undefined) {
		                        line_len = prefix.length - 1;
		                    } else {
		                        line_len = indent.length - 1;
		                    }
		                    for (let part of parts) {
		                        if (line_len + 1 + part.length > text_width && line) {
		                            lines.push(indent + line.join(' '));
		                            line = [];
		                            line_len = indent.length - 1;
		                        }
		                        line.push(part);
		                        line_len += part.length + 1;
		                    }
		                    if (line.length) {
		                        lines.push(indent + line.join(' '));
		                    }
		                    if (prefix !== undefined) {
		                        lines[0] = lines[0].slice(indent.length);
		                    }
		                    return lines
		                };

		                let lines;

		                // if prog is short, follow it with optionals or positionals
		                if (prefix.length + prog.length <= 0.75 * text_width) {
		                    let indent = ' '.repeat(prefix.length + prog.length + 1);
		                    if (opt_parts.length) {
		                        lines = get_lines([prog].concat(opt_parts), indent, prefix);
		                        lines = lines.concat(get_lines(pos_parts, indent));
		                    } else if (pos_parts.length) {
		                        lines = get_lines([prog].concat(pos_parts), indent, prefix);
		                    } else {
		                        lines = [prog];
		                    }

		                // if prog is long, put it on its own line
		                } else {
		                    let indent = ' '.repeat(prefix.length);
		                    let parts = [].concat(opt_parts).concat(pos_parts);
		                    lines = get_lines(parts, indent);
		                    if (lines.length > 1) {
		                        lines = [];
		                        lines = lines.concat(get_lines(opt_parts, indent));
		                        lines = lines.concat(get_lines(pos_parts, indent));
		                    }
		                    lines = [prog].concat(lines);
		                }

		                // join lines into usage
		                usage = lines.join('\n');
		            }
		        }

		        // prefix with 'usage:'
		        return sub('%s%s\n\n', prefix, usage)
		    }

		    _format_actions_usage(actions, groups) {
		        // find group indices and identify actions in groups
		        let group_actions = new Set();
		        let inserts = {};
		        for (let group of groups) {
		            let start = actions.indexOf(group._group_actions[0]);
		            if (start === -1) {
		                continue
		            } else {
		                let end = start + group._group_actions.length;
		                if (_array_equal(actions.slice(start, end), group._group_actions)) {
		                    for (let action of group._group_actions) {
		                        group_actions.add(action);
		                    }
		                    if (!group.required) {
		                        if (start in inserts) {
		                            inserts[start] += ' [';
		                        } else {
		                            inserts[start] = '[';
		                        }
		                        if (end in inserts) {
		                            inserts[end] += ']';
		                        } else {
		                            inserts[end] = ']';
		                        }
		                    } else {
		                        if (start in inserts) {
		                            inserts[start] += ' (';
		                        } else {
		                            inserts[start] = '(';
		                        }
		                        if (end in inserts) {
		                            inserts[end] += ')';
		                        } else {
		                            inserts[end] = ')';
		                        }
		                    }
		                    for (let i of range(start + 1, end)) {
		                        inserts[i] = '|';
		                    }
		                }
		            }
		        }

		        // collect all actions format strings
		        let parts = [];
		        for (let [ i, action ] of Object.entries(actions)) {

		            // suppressed arguments are marked with None
		            // remove | separators for suppressed arguments
		            if (action.help === SUPPRESS) {
		                parts.push(undefined);
		                if (inserts[+i] === '|') {
		                    delete inserts[+i];
		                } else if (inserts[+i + 1] === '|') {
		                    delete inserts[+i + 1];
		                }

		            // produce all arg strings
		            } else if (!action.option_strings.length) {
		                let default_value = this._get_default_metavar_for_positional(action);
		                let part = this._format_args(action, default_value);

		                // if it's in a group, strip the outer []
		                if (group_actions.has(action)) {
		                    if (part[0] === '[' && part[part.length - 1] === ']') {
		                        part = part.slice(1, -1);
		                    }
		                }

		                // add the action string to the list
		                parts.push(part);

		            // produce the first way to invoke the option in brackets
		            } else {
		                let option_string = action.option_strings[0];
		                let part;

		                // if the Optional doesn't take a value, format is:
		                //    -s or --long
		                if (action.nargs === 0) {
		                    part = action.format_usage();

		                // if the Optional takes a value, format is:
		                //    -s ARGS or --long ARGS
		                } else {
		                    let default_value = this._get_default_metavar_for_optional(action);
		                    let args_string = this._format_args(action, default_value);
		                    part = sub('%s %s', option_string, args_string);
		                }

		                // make it look optional if it's not required or in a group
		                if (!action.required && !group_actions.has(action)) {
		                    part = sub('[%s]', part);
		                }

		                // add the action string to the list
		                parts.push(part);
		            }
		        }

		        // insert things at the necessary indices
		        for (let i of Object.keys(inserts).map(Number).sort((a, b) => b - a)) {
		            parts.splice(+i, 0, inserts[+i]);
		        }

		        // join all the action items with spaces
		        let text = parts.filter(Boolean).join(' ');

		        // clean up separators for mutually exclusive groups
		        text = text.replace(/([\[(]) /g, '$1');
		        text = text.replace(/ ([\])])/g, '$1');
		        text = text.replace(/[\[(] *[\])]/g, '');
		        text = text.replace(/\(([^|]*)\)/g, '$1', text);
		        text = text.trim();

		        // return the text
		        return text
		    }

		    _format_text(text) {
		        if (text.includes('%(prog)')) {
		            text = sub(text, { prog: this._prog });
		        }
		        let text_width = Math.max(this._width - this._current_indent, 11);
		        let indent = ' '.repeat(this._current_indent);
		        return this._fill_text(text, text_width, indent) + '\n\n'
		    }

		    _format_action(action) {
		        // determine the required width and the entry label
		        let help_position = Math.min(this._action_max_length + 2,
		                                     this._max_help_position);
		        let help_width = Math.max(this._width - help_position, 11);
		        let action_width = help_position - this._current_indent - 2;
		        let action_header = this._format_action_invocation(action);
		        let indent_first;

		        // no help; start on same line and add a final newline
		        if (!action.help) {
		            let tup = [ this._current_indent, '', action_header ];
		            action_header = sub('%*s%s\n', ...tup);

		        // short action name; start on the same line and pad two spaces
		        } else if (action_header.length <= action_width) {
		            let tup = [ this._current_indent, '', action_width, action_header ];
		            action_header = sub('%*s%-*s  ', ...tup);
		            indent_first = 0;

		        // long action name; start on the next line
		        } else {
		            let tup = [ this._current_indent, '', action_header ];
		            action_header = sub('%*s%s\n', ...tup);
		            indent_first = help_position;
		        }

		        // collect the pieces of the action help
		        let parts = [action_header];

		        // if there was help for the action, add lines of help text
		        if (action.help) {
		            let help_text = this._expand_help(action);
		            let help_lines = this._split_lines(help_text, help_width);
		            parts.push(sub('%*s%s\n', indent_first, '', help_lines[0]));
		            for (let line of help_lines.slice(1)) {
		                parts.push(sub('%*s%s\n', help_position, '', line));
		            }

		        // or add a newline if the description doesn't end with one
		        } else if (!action_header.endsWith('\n')) {
		            parts.push('\n');
		        }

		        // if there are any sub-actions, add their help as well
		        for (let subaction of this._iter_indented_subactions(action)) {
		            parts.push(this._format_action(subaction));
		        }

		        // return a single string
		        return this._join_parts(parts)
		    }

		    _format_action_invocation(action) {
		        if (!action.option_strings.length) {
		            let default_value = this._get_default_metavar_for_positional(action);
		            let metavar = this._metavar_formatter(action, default_value)(1)[0];
		            return metavar

		        } else {
		            let parts = [];

		            // if the Optional doesn't take a value, format is:
		            //    -s, --long
		            if (action.nargs === 0) {
		                parts = parts.concat(action.option_strings);

		            // if the Optional takes a value, format is:
		            //    -s ARGS, --long ARGS
		            } else {
		                let default_value = this._get_default_metavar_for_optional(action);
		                let args_string = this._format_args(action, default_value);
		                for (let option_string of action.option_strings) {
		                    parts.push(sub('%s %s', option_string, args_string));
		                }
		            }

		            return parts.join(', ')
		        }
		    }

		    _metavar_formatter(action, default_metavar) {
		        let result;
		        if (action.metavar !== undefined) {
		            result = action.metavar;
		        } else if (action.choices !== undefined) {
		            let choice_strs = _choices_to_array(action.choices).map(String);
		            result = sub('{%s}', choice_strs.join(','));
		        } else {
		            result = default_metavar;
		        }

		        function format(tuple_size) {
		            if (Array.isArray(result)) {
		                return result
		            } else {
		                return Array(tuple_size).fill(result)
		            }
		        }
		        return format
		    }

		    _format_args(action, default_metavar) {
		        let get_metavar = this._metavar_formatter(action, default_metavar);
		        let result;
		        if (action.nargs === undefined) {
		            result = sub('%s', ...get_metavar(1));
		        } else if (action.nargs === OPTIONAL) {
		            result = sub('[%s]', ...get_metavar(1));
		        } else if (action.nargs === ZERO_OR_MORE) {
		            let metavar = get_metavar(1);
		            if (metavar.length === 2) {
		                result = sub('[%s [%s ...]]', ...metavar);
		            } else {
		                result = sub('[%s ...]', ...metavar);
		            }
		        } else if (action.nargs === ONE_OR_MORE) {
		            result = sub('%s [%s ...]', ...get_metavar(2));
		        } else if (action.nargs === REMAINDER) {
		            result = '...';
		        } else if (action.nargs === PARSER) {
		            result = sub('%s ...', ...get_metavar(1));
		        } else if (action.nargs === SUPPRESS) {
		            result = '';
		        } else {
		            let formats;
		            try {
		                formats = range(action.nargs).map(() => '%s');
		            } catch (err) {
		                throw new TypeError('invalid nargs value')
		            }
		            result = sub(formats.join(' '), ...get_metavar(action.nargs));
		        }
		        return result
		    }

		    _expand_help(action) {
		        let params = Object.assign({ prog: this._prog }, action);
		        for (let name of Object.keys(params)) {
		            if (params[name] === SUPPRESS) {
		                delete params[name];
		            }
		        }
		        for (let name of Object.keys(params)) {
		            if (params[name] && params[name].name) {
		                params[name] = params[name].name;
		            }
		        }
		        if (params.choices !== undefined) {
		            let choices_str = _choices_to_array(params.choices).map(String).join(', ');
		            params.choices = choices_str;
		        }
		        // LEGACY (v1 compatibility): camelcase
		        for (let key of Object.keys(params)) {
		            let old_name = _to_legacy_name(key);
		            if (old_name !== key) {
		                params[old_name] = params[key];
		            }
		        }
		        // end
		        return sub(this._get_help_string(action), params)
		    }

		    * _iter_indented_subactions(action) {
		        if (typeof action._get_subactions === 'function') {
		            this._indent();
		            yield* action._get_subactions();
		            this._dedent();
		        }
		    }

		    _split_lines(text, width) {
		        text = text.replace(this._whitespace_matcher, ' ').trim();
		        // The textwrap module is used only for formatting help.
		        // Delay its import for speeding up the common usage of argparse.
		        let textwrap = requireTextwrap();
		        return textwrap.wrap(text, { width })
		    }

		    _fill_text(text, width, indent) {
		        text = text.replace(this._whitespace_matcher, ' ').trim();
		        let textwrap = requireTextwrap();
		        return textwrap.fill(text, { width,
		                                     initial_indent: indent,
		                                     subsequent_indent: indent })
		    }

		    _get_help_string(action) {
		        return action.help
		    }

		    _get_default_metavar_for_optional(action) {
		        return action.dest.toUpperCase()
		    }

		    _get_default_metavar_for_positional(action) {
		        return action.dest
		    }
		}));

		HelpFormatter.prototype._Section = _callable(class _Section {

		    constructor(formatter, parent, heading = undefined) {
		        this.formatter = formatter;
		        this.parent = parent;
		        this.heading = heading;
		        this.items = [];
		    }

		    format_help() {
		        // format the indented section
		        if (this.parent !== undefined) {
		            this.formatter._indent();
		        }
		        let item_help = this.formatter._join_parts(this.items.map(([ func, args ]) => func.apply(null, args)));
		        if (this.parent !== undefined) {
		            this.formatter._dedent();
		        }

		        // return nothing if the section was empty
		        if (!item_help) {
		            return ''
		        }

		        // add the heading if the section was non-empty
		        let heading;
		        if (this.heading !== SUPPRESS && this.heading !== undefined) {
		            let current_indent = this.formatter._current_indent;
		            heading = sub('%*s%s:\n', current_indent, '', this.heading);
		        } else {
		            heading = '';
		        }

		        // join the section-initial newline, the heading and the help
		        return this.formatter._join_parts(['\n', heading, item_help, '\n'])
		    }
		});


		const RawDescriptionHelpFormatter = _camelcase_alias(_callable(class RawDescriptionHelpFormatter extends HelpFormatter {
		    /*
		     *  Help message formatter which retains any formatting in descriptions.
		     *
		     *  Only the name of this class is considered a public API. All the methods
		     *  provided by the class are considered an implementation detail.
		     */

		    _fill_text(text, width, indent) {
		        return splitlines(text, true).map(line => indent + line).join('')
		    }
		}));


		const RawTextHelpFormatter = _camelcase_alias(_callable(class RawTextHelpFormatter extends RawDescriptionHelpFormatter {
		    /*
		     *  Help message formatter which retains formatting of all help text.
		     *
		     *  Only the name of this class is considered a public API. All the methods
		     *  provided by the class are considered an implementation detail.
		     */

		    _split_lines(text/*, width*/) {
		        return splitlines(text)
		    }
		}));


		const ArgumentDefaultsHelpFormatter = _camelcase_alias(_callable(class ArgumentDefaultsHelpFormatter extends HelpFormatter {
		    /*
		     *  Help message formatter which adds default values to argument help.
		     *
		     *  Only the name of this class is considered a public API. All the methods
		     *  provided by the class are considered an implementation detail.
		     */

		    _get_help_string(action) {
		        let help = action.help;
		        // LEGACY (v1 compatibility): additional check for defaultValue needed
		        if (!action.help.includes('%(default)') && !action.help.includes('%(defaultValue)')) {
		            if (action.default !== SUPPRESS) {
		                let defaulting_nargs = [OPTIONAL, ZERO_OR_MORE];
		                if (action.option_strings.length || defaulting_nargs.includes(action.nargs)) {
		                    help += ' (default: %(default)s)';
		                }
		            }
		        }
		        return help
		    }
		}));


		const MetavarTypeHelpFormatter = _camelcase_alias(_callable(class MetavarTypeHelpFormatter extends HelpFormatter {
		    /*
		     *  Help message formatter which uses the argument 'type' as the default
		     *  metavar value (instead of the argument 'dest')
		     *
		     *  Only the name of this class is considered a public API. All the methods
		     *  provided by the class are considered an implementation detail.
		     */

		    _get_default_metavar_for_optional(action) {
		        return typeof action.type === 'function' ? action.type.name : action.type
		    }

		    _get_default_metavar_for_positional(action) {
		        return typeof action.type === 'function' ? action.type.name : action.type
		    }
		}));


		// =====================
		// Options and Arguments
		// =====================
		function _get_action_name(argument) {
		    if (argument === undefined) {
		        return undefined
		    } else if (argument.option_strings.length) {
		        return argument.option_strings.join('/')
		    } else if (![ undefined, SUPPRESS ].includes(argument.metavar)) {
		        return argument.metavar
		    } else if (![ undefined, SUPPRESS ].includes(argument.dest)) {
		        return argument.dest
		    } else {
		        return undefined
		    }
		}


		const ArgumentError = _callable(class ArgumentError extends Error {
		    /*
		     *  An error from creating or using an argument (optional or positional).
		     *
		     *  The string value of this exception is the message, augmented with
		     *  information about the argument that caused it.
		     */

		    constructor(argument, message) {
		        super();
		        this.name = 'ArgumentError';
		        this._argument_name = _get_action_name(argument);
		        this._message = message;
		        this.message = this.str();
		    }

		    str() {
		        let format;
		        if (this._argument_name === undefined) {
		            format = '%(message)s';
		        } else {
		            format = 'argument %(argument_name)s: %(message)s';
		        }
		        return sub(format, { message: this._message,
		                             argument_name: this._argument_name })
		    }
		});


		const ArgumentTypeError = _callable(class ArgumentTypeError extends Error {
		    /*
		     * An error from trying to convert a command line string to a type.
		     */

		    constructor(message) {
		        super(message);
		        this.name = 'ArgumentTypeError';
		    }
		});


		// ==============
		// Action classes
		// ==============
		const Action = _camelcase_alias(_callable(class Action extends _AttributeHolder(Function) {
		    /*
		     *  Information about how to convert command line strings to Python objects.
		     *
		     *  Action objects are used by an ArgumentParser to represent the information
		     *  needed to parse a single argument from one or more strings from the
		     *  command line. The keyword arguments to the Action constructor are also
		     *  all attributes of Action instances.
		     *
		     *  Keyword Arguments:
		     *
		     *      - option_strings -- A list of command-line option strings which
		     *          should be associated with this action.
		     *
		     *      - dest -- The name of the attribute to hold the created object(s)
		     *
		     *      - nargs -- The number of command-line arguments that should be
		     *          consumed. By default, one argument will be consumed and a single
		     *          value will be produced.  Other values include:
		     *              - N (an integer) consumes N arguments (and produces a list)
		     *              - '?' consumes zero or one arguments
		     *              - '*' consumes zero or more arguments (and produces a list)
		     *              - '+' consumes one or more arguments (and produces a list)
		     *          Note that the difference between the default and nargs=1 is that
		     *          with the default, a single value will be produced, while with
		     *          nargs=1, a list containing a single value will be produced.
		     *
		     *      - const -- The value to be produced if the option is specified and the
		     *          option uses an action that takes no values.
		     *
		     *      - default -- The value to be produced if the option is not specified.
		     *
		     *      - type -- A callable that accepts a single string argument, and
		     *          returns the converted value.  The standard Python types str, int,
		     *          float, and complex are useful examples of such callables.  If None,
		     *          str is used.
		     *
		     *      - choices -- A container of values that should be allowed. If not None,
		     *          after a command-line argument has been converted to the appropriate
		     *          type, an exception will be raised if it is not a member of this
		     *          collection.
		     *
		     *      - required -- True if the action must always be specified at the
		     *          command line. This is only meaningful for optional command-line
		     *          arguments.
		     *
		     *      - help -- The help string describing the argument.
		     *
		     *      - metavar -- The name to be used for the option's argument with the
		     *          help string. If None, the 'dest' value will be used as the name.
		     */

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            nargs,
		            const_value,
		            default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            nargs: undefined,
		            const: undefined,
		            default: undefined,
		            type: undefined,
		            choices: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        // when this class is called as a function, redirect it to .call() method of itself
		        super('return arguments.callee.call.apply(arguments.callee, arguments)');

		        this.option_strings = option_strings;
		        this.dest = dest;
		        this.nargs = nargs;
		        this.const = const_value;
		        this.default = default_value;
		        this.type = type;
		        this.choices = choices;
		        this.required = required;
		        this.help = help;
		        this.metavar = metavar;
		    }

		    _get_kwargs() {
		        let names = [
		            'option_strings',
		            'dest',
		            'nargs',
		            'const',
		            'default',
		            'type',
		            'choices',
		            'help',
		            'metavar'
		        ];
		        return names.map(name => [ name, getattr(this, name) ])
		    }

		    format_usage() {
		        return this.option_strings[0]
		    }

		    call(/*parser, namespace, values, option_string = undefined*/) {
		        throw new Error('.call() not defined')
		    }
		}));


		const BooleanOptionalAction = _camelcase_alias(_callable(class BooleanOptionalAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            default: undefined,
		            type: undefined,
		            choices: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        let _option_strings = [];
		        for (let option_string of option_strings) {
		            _option_strings.push(option_string);

		            if (option_string.startsWith('--')) {
		                option_string = '--no-' + option_string.slice(2);
		                _option_strings.push(option_string);
		            }
		        }

		        if (help !== undefined && default_value !== undefined) {
		            help += ` (default: ${default_value})`;
		        }

		        super({
		            option_strings: _option_strings,
		            dest,
		            nargs: 0,
		            default: default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        });
		    }

		    call(parser, namespace, values, option_string = undefined) {
		        if (this.option_strings.includes(option_string)) {
		            setattr(namespace, this.dest, !option_string.startsWith('--no-'));
		        }
		    }

		    format_usage() {
		        return this.option_strings.join(' | ')
		    }
		}));


		const _StoreAction = _callable(class _StoreAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            nargs,
		            const_value,
		            default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            nargs: undefined,
		            const: undefined,
		            default: undefined,
		            type: undefined,
		            choices: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        if (nargs === 0) {
		            throw new TypeError('nargs for store actions must be != 0; if you ' +
		                        'have nothing to store, actions such as store ' +
		                        'true or store const may be more appropriate')
		        }
		        if (const_value !== undefined && nargs !== OPTIONAL) {
		            throw new TypeError(sub('nargs must be %r to supply const', OPTIONAL))
		        }
		        super({
		            option_strings,
		            dest,
		            nargs,
		            const: const_value,
		            default: default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        });
		    }

		    call(parser, namespace, values/*, option_string = undefined*/) {
		        setattr(namespace, this.dest, values);
		    }
		});


		const _StoreConstAction = _callable(class _StoreConstAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            const_value,
		            default_value,
		            required,
		            help
		            //, metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            const: no_default,
		            default: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            nargs: 0,
		            const: const_value,
		            default: default_value,
		            required,
		            help
		        });
		    }

		    call(parser, namespace/*, values, option_string = undefined*/) {
		        setattr(namespace, this.dest, this.const);
		    }
		});


		const _StoreTrueAction = _callable(class _StoreTrueAction extends _StoreConstAction {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            default_value,
		            required,
		            help
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            default: false,
		            required: false,
		            help: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            const: true,
		            default: default_value,
		            required,
		            help
		        });
		    }
		});


		const _StoreFalseAction = _callable(class _StoreFalseAction extends _StoreConstAction {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            default_value,
		            required,
		            help
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            default: true,
		            required: false,
		            help: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            const: false,
		            default: default_value,
		            required,
		            help
		        });
		    }
		});


		const _AppendAction = _callable(class _AppendAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            nargs,
		            const_value,
		            default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            nargs: undefined,
		            const: undefined,
		            default: undefined,
		            type: undefined,
		            choices: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        if (nargs === 0) {
		            throw new TypeError('nargs for append actions must be != 0; if arg ' +
		                        'strings are not supplying the value to append, ' +
		                        'the append const action may be more appropriate')
		        }
		        if (const_value !== undefined && nargs !== OPTIONAL) {
		            throw new TypeError(sub('nargs must be %r to supply const', OPTIONAL))
		        }
		        super({
		            option_strings,
		            dest,
		            nargs,
		            const: const_value,
		            default: default_value,
		            type,
		            choices,
		            required,
		            help,
		            metavar
		        });
		    }

		    call(parser, namespace, values/*, option_string = undefined*/) {
		        let items = getattr(namespace, this.dest, undefined);
		        items = _copy_items(items);
		        items.push(values);
		        setattr(namespace, this.dest, items);
		    }
		});


		const _AppendConstAction = _callable(class _AppendConstAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            const_value,
		            default_value,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            const: no_default,
		            default: undefined,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            nargs: 0,
		            const: const_value,
		            default: default_value,
		            required,
		            help,
		            metavar
		        });
		    }

		    call(parser, namespace/*, values, option_string = undefined*/) {
		        let items = getattr(namespace, this.dest, undefined);
		        items = _copy_items(items);
		        items.push(this.const);
		        setattr(namespace, this.dest, items);
		    }
		});


		const _CountAction = _callable(class _CountAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            default_value,
		            required,
		            help
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: no_default,
		            default: undefined,
		            required: false,
		            help: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            nargs: 0,
		            default: default_value,
		            required,
		            help
		        });
		    }

		    call(parser, namespace/*, values, option_string = undefined*/) {
		        let count = getattr(namespace, this.dest, undefined);
		        if (count === undefined) {
		            count = 0;
		        }
		        setattr(namespace, this.dest, count + 1);
		    }
		});


		const _HelpAction = _callable(class _HelpAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            dest,
		            default_value,
		            help
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            dest: SUPPRESS,
		            default: SUPPRESS,
		            help: undefined
		        });

		        super({
		            option_strings,
		            dest,
		            default: default_value,
		            nargs: 0,
		            help
		        });
		    }

		    call(parser/*, namespace, values, option_string = undefined*/) {
		        parser.print_help();
		        parser.exit();
		    }
		});


		const _VersionAction = _callable(class _VersionAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            version,
		            dest,
		            default_value,
		            help
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            version: undefined,
		            dest: SUPPRESS,
		            default: SUPPRESS,
		            help: "show program's version number and exit"
		        });

		        super({
		            option_strings,
		            dest,
		            default: default_value,
		            nargs: 0,
		            help
		        });
		        this.version = version;
		    }

		    call(parser/*, namespace, values, option_string = undefined*/) {
		        let version = this.version;
		        if (version === undefined) {
		            version = parser.version;
		        }
		        let formatter = parser._get_formatter();
		        formatter.add_text(version);
		        parser._print_message(formatter.format_help(), process.stdout);
		        parser.exit();
		    }
		});


		const _SubParsersAction = _camelcase_alias(_callable(class _SubParsersAction extends Action {

		    constructor() {
		        let [
		            option_strings,
		            prog,
		            parser_class,
		            dest,
		            required,
		            help,
		            metavar
		        ] = _parse_opts(arguments, {
		            option_strings: no_default,
		            prog: no_default,
		            parser_class: no_default,
		            dest: SUPPRESS,
		            required: false,
		            help: undefined,
		            metavar: undefined
		        });

		        let name_parser_map = {};

		        super({
		            option_strings,
		            dest,
		            nargs: PARSER,
		            choices: name_parser_map,
		            required,
		            help,
		            metavar
		        });

		        this._prog_prefix = prog;
		        this._parser_class = parser_class;
		        this._name_parser_map = name_parser_map;
		        this._choices_actions = [];
		    }

		    add_parser() {
		        let [
		            name,
		            kwargs
		        ] = _parse_opts(arguments, {
		            name: no_default,
		            '**kwargs': no_default
		        });

		        // set prog from the existing prefix
		        if (kwargs.prog === undefined) {
		            kwargs.prog = sub('%s %s', this._prog_prefix, name);
		        }

		        let aliases = getattr(kwargs, 'aliases', []);
		        delete kwargs.aliases;

		        // create a pseudo-action to hold the choice help
		        if ('help' in kwargs) {
		            let help = kwargs.help;
		            delete kwargs.help;
		            let choice_action = this._ChoicesPseudoAction(name, aliases, help);
		            this._choices_actions.push(choice_action);
		        }

		        // create the parser and add it to the map
		        let parser = new this._parser_class(kwargs);
		        this._name_parser_map[name] = parser;

		        // make parser available under aliases also
		        for (let alias of aliases) {
		            this._name_parser_map[alias] = parser;
		        }

		        return parser
		    }

		    _get_subactions() {
		        return this._choices_actions
		    }

		    call(parser, namespace, values/*, option_string = undefined*/) {
		        let parser_name = values[0];
		        let arg_strings = values.slice(1);

		        // set the parser name if requested
		        if (this.dest !== SUPPRESS) {
		            setattr(namespace, this.dest, parser_name);
		        }

		        // select the parser
		        if (hasattr(this._name_parser_map, parser_name)) {
		            parser = this._name_parser_map[parser_name];
		        } else {
		            let args = {parser_name,
		                        choices: this._name_parser_map.join(', ')};
		            let msg = sub('unknown parser %(parser_name)r (choices: %(choices)s)', args);
		            throw new ArgumentError(this, msg)
		        }

		        // parse all the remaining options into the namespace
		        // store any unrecognized options on the object, so that the top
		        // level parser can decide what to do with them

		        // In case this subparser defines new defaults, we parse them
		        // in a new namespace object and then update the original
		        // namespace for the relevant parts.
		        let subnamespace;
		        [ subnamespace, arg_strings ] = parser.parse_known_args(arg_strings, undefined);
		        for (let [ key, value ] of Object.entries(subnamespace)) {
		            setattr(namespace, key, value);
		        }

		        if (arg_strings.length) {
		            setdefault(namespace, _UNRECOGNIZED_ARGS_ATTR, []);
		            getattr(namespace, _UNRECOGNIZED_ARGS_ATTR).push(...arg_strings);
		        }
		    }
		}));


		_SubParsersAction.prototype._ChoicesPseudoAction = _callable(class _ChoicesPseudoAction extends Action {
		    constructor(name, aliases, help) {
		        let metavar = name, dest = name;
		        if (aliases.length) {
		            metavar += sub(' (%s)', aliases.join(', '));
		        }
		        super({ option_strings: [], dest, help, metavar });
		    }
		});


		const _ExtendAction = _callable(class _ExtendAction extends _AppendAction {
		    call(parser, namespace, values/*, option_string = undefined*/) {
		        let items = getattr(namespace, this.dest, undefined);
		        items = _copy_items(items);
		        items = items.concat(values);
		        setattr(namespace, this.dest, items);
		    }
		});


		// ==============
		// Type classes
		// ==============
		const FileType = _callable(class FileType extends Function {
		    /*
		     *  Factory for creating file object types
		     *
		     *  Instances of FileType are typically passed as type= arguments to the
		     *  ArgumentParser add_argument() method.
		     *
		     *  Keyword Arguments:
		     *      - mode -- A string indicating how the file is to be opened. Accepts the
		     *          same values as the builtin open() function.
		     *      - bufsize -- The file's desired buffer size. Accepts the same values as
		     *          the builtin open() function.
		     *      - encoding -- The file's encoding. Accepts the same values as the
		     *          builtin open() function.
		     *      - errors -- A string indicating how encoding and decoding errors are to
		     *          be handled. Accepts the same value as the builtin open() function.
		     */

		    constructor() {
		        let [
		            flags,
		            encoding,
		            mode,
		            autoClose,
		            emitClose,
		            start,
		            end,
		            highWaterMark,
		            fs
		        ] = _parse_opts(arguments, {
		            flags: 'r',
		            encoding: undefined,
		            mode: undefined, // 0o666
		            autoClose: undefined, // true
		            emitClose: undefined, // false
		            start: undefined, // 0
		            end: undefined, // Infinity
		            highWaterMark: undefined, // 64 * 1024
		            fs: undefined
		        });

		        // when this class is called as a function, redirect it to .call() method of itself
		        super('return arguments.callee.call.apply(arguments.callee, arguments)');

		        Object.defineProperty(this, 'name', {
		            get() {
		                return sub('FileType(%r)', flags)
		            }
		        });
		        this._flags = flags;
		        this._options = {};
		        if (encoding !== undefined) this._options.encoding = encoding;
		        if (mode !== undefined) this._options.mode = mode;
		        if (autoClose !== undefined) this._options.autoClose = autoClose;
		        if (emitClose !== undefined) this._options.emitClose = emitClose;
		        if (start !== undefined) this._options.start = start;
		        if (end !== undefined) this._options.end = end;
		        if (highWaterMark !== undefined) this._options.highWaterMark = highWaterMark;
		        if (fs !== undefined) this._options.fs = fs;
		    }

		    call(string) {
		        // the special argument "-" means sys.std{in,out}
		        if (string === '-') {
		            if (this._flags.includes('r')) {
		                return process.stdin
		            } else if (this._flags.includes('w')) {
		                return process.stdout
		            } else {
		                let msg = sub('argument "-" with mode %r', this._flags);
		                throw new TypeError(msg)
		            }
		        }

		        // all other arguments are used as file names
		        let fd;
		        try {
		            fd = fs.openSync(string, this._flags, this._options.mode);
		        } catch (e) {
		            let args = { filename: string, error: e.message };
		            let message = "can't open '%(filename)s': %(error)s";
		            throw new ArgumentTypeError(sub(message, args))
		        }

		        let options = Object.assign({ fd, flags: this._flags }, this._options);
		        if (this._flags.includes('r')) {
		            return fs.createReadStream(undefined, options)
		        } else if (this._flags.includes('w')) {
		            return fs.createWriteStream(undefined, options)
		        } else {
		            let msg = sub('argument "%s" with mode %r', string, this._flags);
		            throw new TypeError(msg)
		        }
		    }

		    [util.inspect.custom]() {
		        let args = [ this._flags ];
		        let kwargs = Object.entries(this._options).map(([ k, v ]) => {
		            if (k === 'mode') v = { value: v, [util.inspect.custom]() { return '0o' + this.value.toString(8) } };
		            return [ k, v ]
		        });
		        let args_str = []
		                .concat(args.filter(arg => arg !== -1).map(repr))
		                .concat(kwargs.filter(([/*kw*/, arg]) => arg !== undefined)
		                    .map(([kw, arg]) => sub('%s=%r', kw, arg)))
		                .join(', ');
		        return sub('%s(%s)', this.constructor.name, args_str)
		    }

		    toString() {
		        return this[util.inspect.custom]()
		    }
		});

		// ===========================
		// Optional and Positional Parsing
		// ===========================
		const Namespace = _callable(class Namespace extends _AttributeHolder() {
		    /*
		     *  Simple object for storing attributes.
		     *
		     *  Implements equality by attribute names and values, and provides a simple
		     *  string representation.
		     */

		    constructor(options = {}) {
		        super();
		        Object.assign(this, options);
		    }
		});

		// unset string tag to mimic plain object
		Namespace.prototype[Symbol.toStringTag] = undefined;


		const _ActionsContainer = _camelcase_alias(_callable(class _ActionsContainer {

		    constructor() {
		        let [
		            description,
		            prefix_chars,
		            argument_default,
		            conflict_handler
		        ] = _parse_opts(arguments, {
		            description: no_default,
		            prefix_chars: no_default,
		            argument_default: no_default,
		            conflict_handler: no_default
		        });

		        this.description = description;
		        this.argument_default = argument_default;
		        this.prefix_chars = prefix_chars;
		        this.conflict_handler = conflict_handler;

		        // set up registries
		        this._registries = {};

		        // register actions
		        this.register('action', undefined, _StoreAction);
		        this.register('action', 'store', _StoreAction);
		        this.register('action', 'store_const', _StoreConstAction);
		        this.register('action', 'store_true', _StoreTrueAction);
		        this.register('action', 'store_false', _StoreFalseAction);
		        this.register('action', 'append', _AppendAction);
		        this.register('action', 'append_const', _AppendConstAction);
		        this.register('action', 'count', _CountAction);
		        this.register('action', 'help', _HelpAction);
		        this.register('action', 'version', _VersionAction);
		        this.register('action', 'parsers', _SubParsersAction);
		        this.register('action', 'extend', _ExtendAction)
		        // LEGACY (v1 compatibility): camelcase variants
		        ;[ 'storeConst', 'storeTrue', 'storeFalse', 'appendConst' ].forEach(old_name => {
		            let new_name = _to_new_name(old_name);
		            this.register('action', old_name, util.deprecate(this._registry_get('action', new_name),
		                sub('{action: "%s"} is renamed to {action: "%s"}', old_name, new_name)));
		        });
		        // end

		        // raise an exception if the conflict handler is invalid
		        this._get_handler();

		        // action storage
		        this._actions = [];
		        this._option_string_actions = {};

		        // groups
		        this._action_groups = [];
		        this._mutually_exclusive_groups = [];

		        // defaults storage
		        this._defaults = {};

		        // determines whether an "option" looks like a negative number
		        this._negative_number_matcher = /^-\d+$|^-\d*\.\d+$/;

		        // whether or not there are any optionals that look like negative
		        // numbers -- uses a list so it can be shared and edited
		        this._has_negative_number_optionals = [];
		    }

		    // ====================
		    // Registration methods
		    // ====================
		    register(registry_name, value, object) {
		        let registry = setdefault(this._registries, registry_name, {});
		        registry[value] = object;
		    }

		    _registry_get(registry_name, value, default_value = undefined) {
		        return getattr(this._registries[registry_name], value, default_value)
		    }

		    // ==================================
		    // Namespace default accessor methods
		    // ==================================
		    set_defaults(kwargs) {
		        Object.assign(this._defaults, kwargs);

		        // if these defaults match any existing arguments, replace
		        // the previous default on the object with the new one
		        for (let action of this._actions) {
		            if (action.dest in kwargs) {
		                action.default = kwargs[action.dest];
		            }
		        }
		    }

		    get_default(dest) {
		        for (let action of this._actions) {
		            if (action.dest === dest && action.default !== undefined) {
		                return action.default
		            }
		        }
		        return this._defaults[dest]
		    }


		    // =======================
		    // Adding argument actions
		    // =======================
		    add_argument() {
		        /*
		         *  add_argument(dest, ..., name=value, ...)
		         *  add_argument(option_string, option_string, ..., name=value, ...)
		         */
		        let [
		            args,
		            kwargs
		        ] = _parse_opts(arguments, {
		            '*args': no_default,
		            '**kwargs': no_default
		        });
		        // LEGACY (v1 compatibility), old-style add_argument([ args ], { options })
		        if (args.length === 1 && Array.isArray(args[0])) {
		            args = args[0];
		            deprecate('argument-array',
		                sub('use add_argument(%(args)s, {...}) instead of add_argument([ %(args)s ], { ... })', {
		                    args: args.map(repr).join(', ')
		                }));
		        }
		        // end

		        // if no positional args are supplied or only one is supplied and
		        // it doesn't look like an option string, parse a positional
		        // argument
		        let chars = this.prefix_chars;
		        if (!args.length || args.length === 1 && !chars.includes(args[0][0])) {
		            if (args.length && 'dest' in kwargs) {
		                throw new TypeError('dest supplied twice for positional argument')
		            }
		            kwargs = this._get_positional_kwargs(...args, kwargs);

		        // otherwise, we're adding an optional argument
		        } else {
		            kwargs = this._get_optional_kwargs(...args, kwargs);
		        }

		        // if no default was supplied, use the parser-level default
		        if (!('default' in kwargs)) {
		            let dest = kwargs.dest;
		            if (dest in this._defaults) {
		                kwargs.default = this._defaults[dest];
		            } else if (this.argument_default !== undefined) {
		                kwargs.default = this.argument_default;
		            }
		        }

		        // create the action object, and add it to the parser
		        let action_class = this._pop_action_class(kwargs);
		        if (typeof action_class !== 'function') {
		            throw new TypeError(sub('unknown action "%s"', action_class))
		        }
		        // eslint-disable-next-line new-cap
		        let action = new action_class(kwargs);

		        // raise an error if the action type is not callable
		        let type_func = this._registry_get('type', action.type, action.type);
		        if (typeof type_func !== 'function') {
		            throw new TypeError(sub('%r is not callable', type_func))
		        }

		        if (type_func === FileType) {
		            throw new TypeError(sub('%r is a FileType class object, instance of it' +
		                                    ' must be passed', type_func))
		        }

		        // raise an error if the metavar does not match the type
		        if ('_get_formatter' in this) {
		            try {
		                this._get_formatter()._format_args(action, undefined);
		            } catch (err) {
		                // check for 'invalid nargs value' is an artifact of TypeError and ValueError in js being the same
		                if (err instanceof TypeError && err.message !== 'invalid nargs value') {
		                    throw new TypeError('length of metavar tuple does not match nargs')
		                } else {
		                    throw err
		                }
		            }
		        }

		        return this._add_action(action)
		    }

		    add_argument_group() {
		        let group = _ArgumentGroup(this, ...arguments);
		        this._action_groups.push(group);
		        return group
		    }

		    add_mutually_exclusive_group() {
		        // eslint-disable-next-line no-use-before-define
		        let group = _MutuallyExclusiveGroup(this, ...arguments);
		        this._mutually_exclusive_groups.push(group);
		        return group
		    }

		    _add_action(action) {
		        // resolve any conflicts
		        this._check_conflict(action);

		        // add to actions list
		        this._actions.push(action);
		        action.container = this;

		        // index the action by any option strings it has
		        for (let option_string of action.option_strings) {
		            this._option_string_actions[option_string] = action;
		        }

		        // set the flag if any option strings look like negative numbers
		        for (let option_string of action.option_strings) {
		            if (this._negative_number_matcher.test(option_string)) {
		                if (!this._has_negative_number_optionals.length) {
		                    this._has_negative_number_optionals.push(true);
		                }
		            }
		        }

		        // return the created action
		        return action
		    }

		    _remove_action(action) {
		        _array_remove(this._actions, action);
		    }

		    _add_container_actions(container) {
		        // collect groups by titles
		        let title_group_map = {};
		        for (let group of this._action_groups) {
		            if (group.title in title_group_map) {
		                let msg = 'cannot merge actions - two groups are named %r';
		                throw new TypeError(sub(msg, group.title))
		            }
		            title_group_map[group.title] = group;
		        }

		        // map each action to its group
		        let group_map = new Map();
		        for (let group of container._action_groups) {

		            // if a group with the title exists, use that, otherwise
		            // create a new group matching the container's group
		            if (!(group.title in title_group_map)) {
		                title_group_map[group.title] = this.add_argument_group({
		                    title: group.title,
		                    description: group.description,
		                    conflict_handler: group.conflict_handler
		                });
		            }

		            // map the actions to their new group
		            for (let action of group._group_actions) {
		                group_map.set(action, title_group_map[group.title]);
		            }
		        }

		        // add container's mutually exclusive groups
		        // NOTE: if add_mutually_exclusive_group ever gains title= and
		        // description= then this code will need to be expanded as above
		        for (let group of container._mutually_exclusive_groups) {
		            let mutex_group = this.add_mutually_exclusive_group({
		                required: group.required
		            });

		            // map the actions to their new mutex group
		            for (let action of group._group_actions) {
		                group_map.set(action, mutex_group);
		            }
		        }

		        // add all actions to this container or their group
		        for (let action of container._actions) {
		            group_map.get(action)._add_action(action);
		        }
		    }

		    _get_positional_kwargs() {
		        let [
		            dest,
		            kwargs
		        ] = _parse_opts(arguments, {
		            dest: no_default,
		            '**kwargs': no_default
		        });

		        // make sure required is not specified
		        if ('required' in kwargs) {
		            let msg = "'required' is an invalid argument for positionals";
		            throw new TypeError(msg)
		        }

		        // mark positional arguments as required if at least one is
		        // always required
		        if (![OPTIONAL, ZERO_OR_MORE].includes(kwargs.nargs)) {
		            kwargs.required = true;
		        }
		        if (kwargs.nargs === ZERO_OR_MORE && !('default' in kwargs)) {
		            kwargs.required = true;
		        }

		        // return the keyword arguments with no option strings
		        return Object.assign(kwargs, { dest, option_strings: [] })
		    }

		    _get_optional_kwargs() {
		        let [
		            args,
		            kwargs
		        ] = _parse_opts(arguments, {
		            '*args': no_default,
		            '**kwargs': no_default
		        });

		        // determine short and long option strings
		        let option_strings = [];
		        let long_option_strings = [];
		        let option_string;
		        for (option_string of args) {
		            // error on strings that don't start with an appropriate prefix
		            if (!this.prefix_chars.includes(option_string[0])) {
		                let args = {option: option_string,
		                            prefix_chars: this.prefix_chars};
		                let msg = 'invalid option string %(option)r: ' +
		                          'must start with a character %(prefix_chars)r';
		                throw new TypeError(sub(msg, args))
		            }

		            // strings starting with two prefix characters are long options
		            option_strings.push(option_string);
		            if (option_string.length > 1 && this.prefix_chars.includes(option_string[1])) {
		                long_option_strings.push(option_string);
		            }
		        }

		        // infer destination, '--foo-bar' -> 'foo_bar' and '-x' -> 'x'
		        let dest = kwargs.dest;
		        delete kwargs.dest;
		        if (dest === undefined) {
		            let dest_option_string;
		            if (long_option_strings.length) {
		                dest_option_string = long_option_strings[0];
		            } else {
		                dest_option_string = option_strings[0];
		            }
		            dest = _string_lstrip(dest_option_string, this.prefix_chars);
		            if (!dest) {
		                let msg = 'dest= is required for options like %r';
		                throw new TypeError(sub(msg, option_string))
		            }
		            dest = dest.replace(/-/g, '_');
		        }

		        // return the updated keyword arguments
		        return Object.assign(kwargs, { dest, option_strings })
		    }

		    _pop_action_class(kwargs, default_value = undefined) {
		        let action = getattr(kwargs, 'action', default_value);
		        delete kwargs.action;
		        return this._registry_get('action', action, action)
		    }

		    _get_handler() {
		        // determine function from conflict handler string
		        let handler_func_name = sub('_handle_conflict_%s', this.conflict_handler);
		        if (typeof this[handler_func_name] === 'function') {
		            return this[handler_func_name]
		        } else {
		            let msg = 'invalid conflict_resolution value: %r';
		            throw new TypeError(sub(msg, this.conflict_handler))
		        }
		    }

		    _check_conflict(action) {

		        // find all options that conflict with this option
		        let confl_optionals = [];
		        for (let option_string of action.option_strings) {
		            if (hasattr(this._option_string_actions, option_string)) {
		                let confl_optional = this._option_string_actions[option_string];
		                confl_optionals.push([ option_string, confl_optional ]);
		            }
		        }

		        // resolve any conflicts
		        if (confl_optionals.length) {
		            let conflict_handler = this._get_handler();
		            conflict_handler.call(this, action, confl_optionals);
		        }
		    }

		    _handle_conflict_error(action, conflicting_actions) {
		        let message = conflicting_actions.length === 1 ?
		            'conflicting option string: %s' :
		            'conflicting option strings: %s';
		        let conflict_string = conflicting_actions.map(([ option_string/*, action*/ ]) => option_string).join(', ');
		        throw new ArgumentError(action, sub(message, conflict_string))
		    }

		    _handle_conflict_resolve(action, conflicting_actions) {

		        // remove all conflicting options
		        for (let [ option_string, action ] of conflicting_actions) {

		            // remove the conflicting option
		            _array_remove(action.option_strings, option_string);
		            delete this._option_string_actions[option_string];

		            // if the option now has no option string, remove it from the
		            // container holding it
		            if (!action.option_strings.length) {
		                action.container._remove_action(action);
		            }
		        }
		    }
		}));


		const _ArgumentGroup = _callable(class _ArgumentGroup extends _ActionsContainer {

		    constructor() {
		        let [
		            container,
		            title,
		            description,
		            kwargs
		        ] = _parse_opts(arguments, {
		            container: no_default,
		            title: undefined,
		            description: undefined,
		            '**kwargs': no_default
		        });

		        // add any missing keyword arguments by checking the container
		        setdefault(kwargs, 'conflict_handler', container.conflict_handler);
		        setdefault(kwargs, 'prefix_chars', container.prefix_chars);
		        setdefault(kwargs, 'argument_default', container.argument_default);
		        super(Object.assign({ description }, kwargs));

		        // group attributes
		        this.title = title;
		        this._group_actions = [];

		        // share most attributes with the container
		        this._registries = container._registries;
		        this._actions = container._actions;
		        this._option_string_actions = container._option_string_actions;
		        this._defaults = container._defaults;
		        this._has_negative_number_optionals =
		            container._has_negative_number_optionals;
		        this._mutually_exclusive_groups = container._mutually_exclusive_groups;
		    }

		    _add_action(action) {
		        action = super._add_action(action);
		        this._group_actions.push(action);
		        return action
		    }

		    _remove_action(action) {
		        super._remove_action(action);
		        _array_remove(this._group_actions, action);
		    }
		});


		const _MutuallyExclusiveGroup = _callable(class _MutuallyExclusiveGroup extends _ArgumentGroup {

		    constructor() {
		        let [
		            container,
		            required
		        ] = _parse_opts(arguments, {
		            container: no_default,
		            required: false
		        });

		        super(container);
		        this.required = required;
		        this._container = container;
		    }

		    _add_action(action) {
		        if (action.required) {
		            let msg = 'mutually exclusive arguments must be optional';
		            throw new TypeError(msg)
		        }
		        action = this._container._add_action(action);
		        this._group_actions.push(action);
		        return action
		    }

		    _remove_action(action) {
		        this._container._remove_action(action);
		        _array_remove(this._group_actions, action);
		    }
		});


		const ArgumentParser = _camelcase_alias(_callable(class ArgumentParser extends _AttributeHolder(_ActionsContainer) {
		    /*
		     *  Object for parsing command line strings into Python objects.
		     *
		     *  Keyword Arguments:
		     *      - prog -- The name of the program (default: sys.argv[0])
		     *      - usage -- A usage message (default: auto-generated from arguments)
		     *      - description -- A description of what the program does
		     *      - epilog -- Text following the argument descriptions
		     *      - parents -- Parsers whose arguments should be copied into this one
		     *      - formatter_class -- HelpFormatter class for printing help messages
		     *      - prefix_chars -- Characters that prefix optional arguments
		     *      - fromfile_prefix_chars -- Characters that prefix files containing
		     *          additional arguments
		     *      - argument_default -- The default value for all arguments
		     *      - conflict_handler -- String indicating how to handle conflicts
		     *      - add_help -- Add a -h/-help option
		     *      - allow_abbrev -- Allow long options to be abbreviated unambiguously
		     *      - exit_on_error -- Determines whether or not ArgumentParser exits with
		     *          error info when an error occurs
		     */

		    constructor() {
		        let [
		            prog,
		            usage,
		            description,
		            epilog,
		            parents,
		            formatter_class,
		            prefix_chars,
		            fromfile_prefix_chars,
		            argument_default,
		            conflict_handler,
		            add_help,
		            allow_abbrev,
		            exit_on_error,
		            debug, // LEGACY (v1 compatibility), debug mode
		            version // LEGACY (v1 compatibility), version
		        ] = _parse_opts(arguments, {
		            prog: undefined,
		            usage: undefined,
		            description: undefined,
		            epilog: undefined,
		            parents: [],
		            formatter_class: HelpFormatter,
		            prefix_chars: '-',
		            fromfile_prefix_chars: undefined,
		            argument_default: undefined,
		            conflict_handler: 'error',
		            add_help: true,
		            allow_abbrev: true,
		            exit_on_error: true,
		            debug: undefined, // LEGACY (v1 compatibility), debug mode
		            version: undefined // LEGACY (v1 compatibility), version
		        });

		        // LEGACY (v1 compatibility)
		        if (debug !== undefined) {
		            deprecate('debug',
		                'The "debug" argument to ArgumentParser is deprecated. Please ' +
		                'override ArgumentParser.exit function instead.'
		            );
		        }

		        if (version !== undefined) {
		            deprecate('version',
		                'The "version" argument to ArgumentParser is deprecated. Please use ' +
		                "add_argument(..., { action: 'version', version: 'N', ... }) instead."
		            );
		        }
		        // end

		        super({
		            description,
		            prefix_chars,
		            argument_default,
		            conflict_handler
		        });

		        // default setting for prog
		        if (prog === undefined) {
		            prog = path.basename(get_argv()[0] || '');
		        }

		        this.prog = prog;
		        this.usage = usage;
		        this.epilog = epilog;
		        this.formatter_class = formatter_class;
		        this.fromfile_prefix_chars = fromfile_prefix_chars;
		        this.add_help = add_help;
		        this.allow_abbrev = allow_abbrev;
		        this.exit_on_error = exit_on_error;
		        // LEGACY (v1 compatibility), debug mode
		        this.debug = debug;
		        // end

		        this._positionals = this.add_argument_group('positional arguments');
		        this._optionals = this.add_argument_group('optional arguments');
		        this._subparsers = undefined;

		        // register types
		        function identity(string) {
		            return string
		        }
		        this.register('type', undefined, identity);
		        this.register('type', null, identity);
		        this.register('type', 'auto', identity);
		        this.register('type', 'int', function (x) {
		            let result = Number(x);
		            if (!Number.isInteger(result)) {
		                throw new TypeError(sub('could not convert string to int: %r', x))
		            }
		            return result
		        });
		        this.register('type', 'float', function (x) {
		            let result = Number(x);
		            if (isNaN(result)) {
		                throw new TypeError(sub('could not convert string to float: %r', x))
		            }
		            return result
		        });
		        this.register('type', 'str', String);
		        // LEGACY (v1 compatibility): custom types
		        this.register('type', 'string',
		            util.deprecate(String, 'use {type:"str"} or {type:String} instead of {type:"string"}'));
		        // end

		        // add help argument if necessary
		        // (using explicit default to override global argument_default)
		        let default_prefix = prefix_chars.includes('-') ? '-' : prefix_chars[0];
		        if (this.add_help) {
		            this.add_argument(
		                default_prefix + 'h',
		                default_prefix.repeat(2) + 'help',
		                {
		                    action: 'help',
		                    default: SUPPRESS,
		                    help: 'show this help message and exit'
		                }
		            );
		        }
		        // LEGACY (v1 compatibility), version
		        if (version) {
		            this.add_argument(
		                default_prefix + 'v',
		                default_prefix.repeat(2) + 'version',
		                {
		                    action: 'version',
		                    default: SUPPRESS,
		                    version: this.version,
		                    help: "show program's version number and exit"
		                }
		            );
		        }
		        // end

		        // add parent arguments and defaults
		        for (let parent of parents) {
		            this._add_container_actions(parent);
		            Object.assign(this._defaults, parent._defaults);
		        }
		    }

		    // =======================
		    // Pretty __repr__ methods
		    // =======================
		    _get_kwargs() {
		        let names = [
		            'prog',
		            'usage',
		            'description',
		            'formatter_class',
		            'conflict_handler',
		            'add_help'
		        ];
		        return names.map(name => [ name, getattr(this, name) ])
		    }

		    // ==================================
		    // Optional/Positional adding methods
		    // ==================================
		    add_subparsers() {
		        let [
		            kwargs
		        ] = _parse_opts(arguments, {
		            '**kwargs': no_default
		        });

		        if (this._subparsers !== undefined) {
		            this.error('cannot have multiple subparser arguments');
		        }

		        // add the parser class to the arguments if it's not present
		        setdefault(kwargs, 'parser_class', this.constructor);

		        if ('title' in kwargs || 'description' in kwargs) {
		            let title = getattr(kwargs, 'title', 'subcommands');
		            let description = getattr(kwargs, 'description', undefined);
		            delete kwargs.title;
		            delete kwargs.description;
		            this._subparsers = this.add_argument_group(title, description);
		        } else {
		            this._subparsers = this._positionals;
		        }

		        // prog defaults to the usage message of this parser, skipping
		        // optional arguments and with no "usage:" prefix
		        if (kwargs.prog === undefined) {
		            let formatter = this._get_formatter();
		            let positionals = this._get_positional_actions();
		            let groups = this._mutually_exclusive_groups;
		            formatter.add_usage(this.usage, positionals, groups, '');
		            kwargs.prog = formatter.format_help().trim();
		        }

		        // create the parsers action and add it to the positionals list
		        let parsers_class = this._pop_action_class(kwargs, 'parsers');
		        // eslint-disable-next-line new-cap
		        let action = new parsers_class(Object.assign({ option_strings: [] }, kwargs));
		        this._subparsers._add_action(action);

		        // return the created parsers action
		        return action
		    }

		    _add_action(action) {
		        if (action.option_strings.length) {
		            this._optionals._add_action(action);
		        } else {
		            this._positionals._add_action(action);
		        }
		        return action
		    }

		    _get_optional_actions() {
		        return this._actions.filter(action => action.option_strings.length)
		    }

		    _get_positional_actions() {
		        return this._actions.filter(action => !action.option_strings.length)
		    }

		    // =====================================
		    // Command line argument parsing methods
		    // =====================================
		    parse_args(args = undefined, namespace = undefined) {
		        let argv;
		        [ args, argv ] = this.parse_known_args(args, namespace);
		        if (argv && argv.length > 0) {
		            let msg = 'unrecognized arguments: %s';
		            this.error(sub(msg, argv.join(' ')));
		        }
		        return args
		    }

		    parse_known_args(args = undefined, namespace = undefined) {
		        if (args === undefined) {
		            args = get_argv().slice(1);
		        }

		        // default Namespace built from parser defaults
		        if (namespace === undefined) {
		            namespace = new Namespace();
		        }

		        // add any action defaults that aren't present
		        for (let action of this._actions) {
		            if (action.dest !== SUPPRESS) {
		                if (!hasattr(namespace, action.dest)) {
		                    if (action.default !== SUPPRESS) {
		                        setattr(namespace, action.dest, action.default);
		                    }
		                }
		            }
		        }

		        // add any parser defaults that aren't present
		        for (let dest of Object.keys(this._defaults)) {
		            if (!hasattr(namespace, dest)) {
		                setattr(namespace, dest, this._defaults[dest]);
		            }
		        }

		        // parse the arguments and exit if there are any errors
		        if (this.exit_on_error) {
		            try {
		                [ namespace, args ] = this._parse_known_args(args, namespace);
		            } catch (err) {
		                if (err instanceof ArgumentError) {
		                    this.error(err.message);
		                } else {
		                    throw err
		                }
		            }
		        } else {
		            [ namespace, args ] = this._parse_known_args(args, namespace);
		        }

		        if (hasattr(namespace, _UNRECOGNIZED_ARGS_ATTR)) {
		            args = args.concat(getattr(namespace, _UNRECOGNIZED_ARGS_ATTR));
		            delattr(namespace, _UNRECOGNIZED_ARGS_ATTR);
		        }

		        return [ namespace, args ]
		    }

		    _parse_known_args(arg_strings, namespace) {
		        // replace arg strings that are file references
		        if (this.fromfile_prefix_chars !== undefined) {
		            arg_strings = this._read_args_from_files(arg_strings);
		        }

		        // map all mutually exclusive arguments to the other arguments
		        // they can't occur with
		        let action_conflicts = new Map();
		        for (let mutex_group of this._mutually_exclusive_groups) {
		            let group_actions = mutex_group._group_actions;
		            for (let [ i, mutex_action ] of Object.entries(mutex_group._group_actions)) {
		                let conflicts = action_conflicts.get(mutex_action) || [];
		                conflicts = conflicts.concat(group_actions.slice(0, +i));
		                conflicts = conflicts.concat(group_actions.slice(+i + 1));
		                action_conflicts.set(mutex_action, conflicts);
		            }
		        }

		        // find all option indices, and determine the arg_string_pattern
		        // which has an 'O' if there is an option at an index,
		        // an 'A' if there is an argument, or a '-' if there is a '--'
		        let option_string_indices = {};
		        let arg_string_pattern_parts = [];
		        let arg_strings_iter = Object.entries(arg_strings)[Symbol.iterator]();
		        for (let [ i, arg_string ] of arg_strings_iter) {

		            // all args after -- are non-options
		            if (arg_string === '--') {
		                arg_string_pattern_parts.push('-');
		                for ([ i, arg_string ] of arg_strings_iter) {
		                    arg_string_pattern_parts.push('A');
		                }

		            // otherwise, add the arg to the arg strings
		            // and note the index if it was an option
		            } else {
		                let option_tuple = this._parse_optional(arg_string);
		                let pattern;
		                if (option_tuple === undefined) {
		                    pattern = 'A';
		                } else {
		                    option_string_indices[i] = option_tuple;
		                    pattern = 'O';
		                }
		                arg_string_pattern_parts.push(pattern);
		            }
		        }

		        // join the pieces together to form the pattern
		        let arg_strings_pattern = arg_string_pattern_parts.join('');

		        // converts arg strings to the appropriate and then takes the action
		        let seen_actions = new Set();
		        let seen_non_default_actions = new Set();
		        let extras;

		        let take_action = (action, argument_strings, option_string = undefined) => {
		            seen_actions.add(action);
		            let argument_values = this._get_values(action, argument_strings);

		            // error if this argument is not allowed with other previously
		            // seen arguments, assuming that actions that use the default
		            // value don't really count as "present"
		            if (argument_values !== action.default) {
		                seen_non_default_actions.add(action);
		                for (let conflict_action of action_conflicts.get(action) || []) {
		                    if (seen_non_default_actions.has(conflict_action)) {
		                        let msg = 'not allowed with argument %s';
		                        let action_name = _get_action_name(conflict_action);
		                        throw new ArgumentError(action, sub(msg, action_name))
		                    }
		                }
		            }

		            // take the action if we didn't receive a SUPPRESS value
		            // (e.g. from a default)
		            if (argument_values !== SUPPRESS) {
		                action(this, namespace, argument_values, option_string);
		            }
		        };

		        // function to convert arg_strings into an optional action
		        let consume_optional = start_index => {

		            // get the optional identified at this index
		            let option_tuple = option_string_indices[start_index];
		            let [ action, option_string, explicit_arg ] = option_tuple;

		            // identify additional optionals in the same arg string
		            // (e.g. -xyz is the same as -x -y -z if no args are required)
		            let action_tuples = [];
		            let stop;
		            for (;;) {

		                // if we found no optional action, skip it
		                if (action === undefined) {
		                    extras.push(arg_strings[start_index]);
		                    return start_index + 1
		                }

		                // if there is an explicit argument, try to match the
		                // optional's string arguments to only this
		                if (explicit_arg !== undefined) {
		                    let arg_count = this._match_argument(action, 'A');

		                    // if the action is a single-dash option and takes no
		                    // arguments, try to parse more single-dash options out
		                    // of the tail of the option string
		                    let chars = this.prefix_chars;
		                    if (arg_count === 0 && !chars.includes(option_string[1])) {
		                        action_tuples.push([ action, [], option_string ]);
		                        let char = option_string[0];
		                        option_string = char + explicit_arg[0];
		                        let new_explicit_arg = explicit_arg.slice(1) || undefined;
		                        let optionals_map = this._option_string_actions;
		                        if (hasattr(optionals_map, option_string)) {
		                            action = optionals_map[option_string];
		                            explicit_arg = new_explicit_arg;
		                        } else {
		                            let msg = 'ignored explicit argument %r';
		                            throw new ArgumentError(action, sub(msg, explicit_arg))
		                        }

		                    // if the action expect exactly one argument, we've
		                    // successfully matched the option; exit the loop
		                    } else if (arg_count === 1) {
		                        stop = start_index + 1;
		                        let args = [ explicit_arg ];
		                        action_tuples.push([ action, args, option_string ]);
		                        break

		                    // error if a double-dash option did not use the
		                    // explicit argument
		                    } else {
		                        let msg = 'ignored explicit argument %r';
		                        throw new ArgumentError(action, sub(msg, explicit_arg))
		                    }

		                // if there is no explicit argument, try to match the
		                // optional's string arguments with the following strings
		                // if successful, exit the loop
		                } else {
		                    let start = start_index + 1;
		                    let selected_patterns = arg_strings_pattern.slice(start);
		                    let arg_count = this._match_argument(action, selected_patterns);
		                    stop = start + arg_count;
		                    let args = arg_strings.slice(start, stop);
		                    action_tuples.push([ action, args, option_string ]);
		                    break
		                }
		            }

		            // add the Optional to the list and return the index at which
		            // the Optional's string args stopped
		            assert(action_tuples.length);
		            for (let [ action, args, option_string ] of action_tuples) {
		                take_action(action, args, option_string);
		            }
		            return stop
		        };

		        // the list of Positionals left to be parsed; this is modified
		        // by consume_positionals()
		        let positionals = this._get_positional_actions();

		        // function to convert arg_strings into positional actions
		        let consume_positionals = start_index => {
		            // match as many Positionals as possible
		            let selected_pattern = arg_strings_pattern.slice(start_index);
		            let arg_counts = this._match_arguments_partial(positionals, selected_pattern);

		            // slice off the appropriate arg strings for each Positional
		            // and add the Positional and its args to the list
		            for (let i = 0; i < positionals.length && i < arg_counts.length; i++) {
		                let action = positionals[i];
		                let arg_count = arg_counts[i];
		                let args = arg_strings.slice(start_index, start_index + arg_count);
		                start_index += arg_count;
		                take_action(action, args);
		            }

		            // slice off the Positionals that we just parsed and return the
		            // index at which the Positionals' string args stopped
		            positionals = positionals.slice(arg_counts.length);
		            return start_index
		        };

		        // consume Positionals and Optionals alternately, until we have
		        // passed the last option string
		        extras = [];
		        let start_index = 0;
		        let max_option_string_index = Math.max(-1, ...Object.keys(option_string_indices).map(Number));
		        while (start_index <= max_option_string_index) {

		            // consume any Positionals preceding the next option
		            let next_option_string_index = Math.min(
		                // eslint-disable-next-line no-loop-func
		                ...Object.keys(option_string_indices).map(Number).filter(index => index >= start_index)
		            );
		            if (start_index !== next_option_string_index) {
		                let positionals_end_index = consume_positionals(start_index);

		                // only try to parse the next optional if we didn't consume
		                // the option string during the positionals parsing
		                if (positionals_end_index > start_index) {
		                    start_index = positionals_end_index;
		                    continue
		                } else {
		                    start_index = positionals_end_index;
		                }
		            }

		            // if we consumed all the positionals we could and we're not
		            // at the index of an option string, there were extra arguments
		            if (!(start_index in option_string_indices)) {
		                let strings = arg_strings.slice(start_index, next_option_string_index);
		                extras = extras.concat(strings);
		                start_index = next_option_string_index;
		            }

		            // consume the next optional and any arguments for it
		            start_index = consume_optional(start_index);
		        }

		        // consume any positionals following the last Optional
		        let stop_index = consume_positionals(start_index);

		        // if we didn't consume all the argument strings, there were extras
		        extras = extras.concat(arg_strings.slice(stop_index));

		        // make sure all required actions were present and also convert
		        // action defaults which were not given as arguments
		        let required_actions = [];
		        for (let action of this._actions) {
		            if (!seen_actions.has(action)) {
		                if (action.required) {
		                    required_actions.push(_get_action_name(action));
		                } else {
		                    // Convert action default now instead of doing it before
		                    // parsing arguments to avoid calling convert functions
		                    // twice (which may fail) if the argument was given, but
		                    // only if it was defined already in the namespace
		                    if (action.default !== undefined &&
		                        typeof action.default === 'string' &&
		                        hasattr(namespace, action.dest) &&
		                        action.default === getattr(namespace, action.dest)) {
		                        setattr(namespace, action.dest,
		                                this._get_value(action, action.default));
		                    }
		                }
		            }
		        }

		        if (required_actions.length) {
		            this.error(sub('the following arguments are required: %s',
		                       required_actions.join(', ')));
		        }

		        // make sure all required groups had one option present
		        for (let group of this._mutually_exclusive_groups) {
		            if (group.required) {
		                let no_actions_used = true;
		                for (let action of group._group_actions) {
		                    if (seen_non_default_actions.has(action)) {
		                        no_actions_used = false;
		                        break
		                    }
		                }

		                // if no actions were used, report the error
		                if (no_actions_used) {
		                    let names = group._group_actions
		                        .filter(action => action.help !== SUPPRESS)
		                        .map(action => _get_action_name(action));
		                    let msg = 'one of the arguments %s is required';
		                    this.error(sub(msg, names.join(' ')));
		                }
		            }
		        }

		        // return the updated namespace and the extra arguments
		        return [ namespace, extras ]
		    }

		    _read_args_from_files(arg_strings) {
		        // expand arguments referencing files
		        let new_arg_strings = [];
		        for (let arg_string of arg_strings) {

		            // for regular arguments, just add them back into the list
		            if (!arg_string || !this.fromfile_prefix_chars.includes(arg_string[0])) {
		                new_arg_strings.push(arg_string);

		            // replace arguments referencing files with the file content
		            } else {
		                try {
		                    let args_file = fs.readFileSync(arg_string.slice(1), 'utf8');
		                    let arg_strings = [];
		                    for (let arg_line of splitlines(args_file)) {
		                        for (let arg of this.convert_arg_line_to_args(arg_line)) {
		                            arg_strings.push(arg);
		                        }
		                    }
		                    arg_strings = this._read_args_from_files(arg_strings);
		                    new_arg_strings = new_arg_strings.concat(arg_strings);
		                } catch (err) {
		                    this.error(err.message);
		                }
		            }
		        }

		        // return the modified argument list
		        return new_arg_strings
		    }

		    convert_arg_line_to_args(arg_line) {
		        return [arg_line]
		    }

		    _match_argument(action, arg_strings_pattern) {
		        // match the pattern for this action to the arg strings
		        let nargs_pattern = this._get_nargs_pattern(action);
		        let match = arg_strings_pattern.match(new RegExp('^' + nargs_pattern));

		        // raise an exception if we weren't able to find a match
		        if (match === null) {
		            let nargs_errors = {
		                undefined: 'expected one argument',
		                [OPTIONAL]: 'expected at most one argument',
		                [ONE_OR_MORE]: 'expected at least one argument'
		            };
		            let msg = nargs_errors[action.nargs];
		            if (msg === undefined) {
		                msg = sub(action.nargs === 1 ? 'expected %s argument' : 'expected %s arguments', action.nargs);
		            }
		            throw new ArgumentError(action, msg)
		        }

		        // return the number of arguments matched
		        return match[1].length
		    }

		    _match_arguments_partial(actions, arg_strings_pattern) {
		        // progressively shorten the actions list by slicing off the
		        // final actions until we find a match
		        let result = [];
		        for (let i of range(actions.length, 0, -1)) {
		            let actions_slice = actions.slice(0, i);
		            let pattern = actions_slice.map(action => this._get_nargs_pattern(action)).join('');
		            let match = arg_strings_pattern.match(new RegExp('^' + pattern));
		            if (match !== null) {
		                result = result.concat(match.slice(1).map(string => string.length));
		                break
		            }
		        }

		        // return the list of arg string counts
		        return result
		    }

		    _parse_optional(arg_string) {
		        // if it's an empty string, it was meant to be a positional
		        if (!arg_string) {
		            return undefined
		        }

		        // if it doesn't start with a prefix, it was meant to be positional
		        if (!this.prefix_chars.includes(arg_string[0])) {
		            return undefined
		        }

		        // if the option string is present in the parser, return the action
		        if (arg_string in this._option_string_actions) {
		            let action = this._option_string_actions[arg_string];
		            return [ action, arg_string, undefined ]
		        }

		        // if it's just a single character, it was meant to be positional
		        if (arg_string.length === 1) {
		            return undefined
		        }

		        // if the option string before the "=" is present, return the action
		        if (arg_string.includes('=')) {
		            let [ option_string, explicit_arg ] = _string_split(arg_string, '=', 1);
		            if (option_string in this._option_string_actions) {
		                let action = this._option_string_actions[option_string];
		                return [ action, option_string, explicit_arg ]
		            }
		        }

		        // search through all possible prefixes of the option string
		        // and all actions in the parser for possible interpretations
		        let option_tuples = this._get_option_tuples(arg_string);

		        // if multiple actions match, the option string was ambiguous
		        if (option_tuples.length > 1) {
		            let options = option_tuples.map(([ /*action*/, option_string/*, explicit_arg*/ ]) => option_string).join(', ');
		            let args = {option: arg_string, matches: options};
		            let msg = 'ambiguous option: %(option)s could match %(matches)s';
		            this.error(sub(msg, args));

		        // if exactly one action matched, this segmentation is good,
		        // so return the parsed action
		        } else if (option_tuples.length === 1) {
		            let [ option_tuple ] = option_tuples;
		            return option_tuple
		        }

		        // if it was not found as an option, but it looks like a negative
		        // number, it was meant to be positional
		        // unless there are negative-number-like options
		        if (this._negative_number_matcher.test(arg_string)) {
		            if (!this._has_negative_number_optionals.length) {
		                return undefined
		            }
		        }

		        // if it contains a space, it was meant to be a positional
		        if (arg_string.includes(' ')) {
		            return undefined
		        }

		        // it was meant to be an optional but there is no such option
		        // in this parser (though it might be a valid option in a subparser)
		        return [ undefined, arg_string, undefined ]
		    }

		    _get_option_tuples(option_string) {
		        let result = [];

		        // option strings starting with two prefix characters are only
		        // split at the '='
		        let chars = this.prefix_chars;
		        if (chars.includes(option_string[0]) && chars.includes(option_string[1])) {
		            if (this.allow_abbrev) {
		                let option_prefix, explicit_arg;
		                if (option_string.includes('=')) {
		                    [ option_prefix, explicit_arg ] = _string_split(option_string, '=', 1);
		                } else {
		                    option_prefix = option_string;
		                    explicit_arg = undefined;
		                }
		                for (let option_string of Object.keys(this._option_string_actions)) {
		                    if (option_string.startsWith(option_prefix)) {
		                        let action = this._option_string_actions[option_string];
		                        let tup = [ action, option_string, explicit_arg ];
		                        result.push(tup);
		                    }
		                }
		            }

		        // single character options can be concatenated with their arguments
		        // but multiple character options always have to have their argument
		        // separate
		        } else if (chars.includes(option_string[0]) && !chars.includes(option_string[1])) {
		            let option_prefix = option_string;
		            let explicit_arg = undefined;
		            let short_option_prefix = option_string.slice(0, 2);
		            let short_explicit_arg = option_string.slice(2);

		            for (let option_string of Object.keys(this._option_string_actions)) {
		                if (option_string === short_option_prefix) {
		                    let action = this._option_string_actions[option_string];
		                    let tup = [ action, option_string, short_explicit_arg ];
		                    result.push(tup);
		                } else if (option_string.startsWith(option_prefix)) {
		                    let action = this._option_string_actions[option_string];
		                    let tup = [ action, option_string, explicit_arg ];
		                    result.push(tup);
		                }
		            }

		        // shouldn't ever get here
		        } else {
		            this.error(sub('unexpected option string: %s', option_string));
		        }

		        // return the collected option tuples
		        return result
		    }

		    _get_nargs_pattern(action) {
		        // in all examples below, we have to allow for '--' args
		        // which are represented as '-' in the pattern
		        let nargs = action.nargs;
		        let nargs_pattern;

		        // the default (None) is assumed to be a single argument
		        if (nargs === undefined) {
		            nargs_pattern = '(-*A-*)';

		        // allow zero or one arguments
		        } else if (nargs === OPTIONAL) {
		            nargs_pattern = '(-*A?-*)';

		        // allow zero or more arguments
		        } else if (nargs === ZERO_OR_MORE) {
		            nargs_pattern = '(-*[A-]*)';

		        // allow one or more arguments
		        } else if (nargs === ONE_OR_MORE) {
		            nargs_pattern = '(-*A[A-]*)';

		        // allow any number of options or arguments
		        } else if (nargs === REMAINDER) {
		            nargs_pattern = '([-AO]*)';

		        // allow one argument followed by any number of options or arguments
		        } else if (nargs === PARSER) {
		            nargs_pattern = '(-*A[-AO]*)';

		        // suppress action, like nargs=0
		        } else if (nargs === SUPPRESS) {
		            nargs_pattern = '(-*-*)';

		        // all others should be integers
		        } else {
		            nargs_pattern = sub('(-*%s-*)', 'A'.repeat(nargs).split('').join('-*'));
		        }

		        // if this is an optional action, -- is not allowed
		        if (action.option_strings.length) {
		            nargs_pattern = nargs_pattern.replace(/-\*/g, '');
		            nargs_pattern = nargs_pattern.replace(/-/g, '');
		        }

		        // return the pattern
		        return nargs_pattern
		    }

		    // ========================
		    // Alt command line argument parsing, allowing free intermix
		    // ========================

		    parse_intermixed_args(args = undefined, namespace = undefined) {
		        let argv;
		        [ args, argv ] = this.parse_known_intermixed_args(args, namespace);
		        if (argv.length) {
		            let msg = 'unrecognized arguments: %s';
		            this.error(sub(msg, argv.join(' ')));
		        }
		        return args
		    }

		    parse_known_intermixed_args(args = undefined, namespace = undefined) {
		        // returns a namespace and list of extras
		        //
		        // positional can be freely intermixed with optionals.  optionals are
		        // first parsed with all positional arguments deactivated.  The 'extras'
		        // are then parsed.  If the parser definition is incompatible with the
		        // intermixed assumptions (e.g. use of REMAINDER, subparsers) a
		        // TypeError is raised.
		        //
		        // positionals are 'deactivated' by setting nargs and default to
		        // SUPPRESS.  This blocks the addition of that positional to the
		        // namespace

		        let extras;
		        let positionals = this._get_positional_actions();
		        let a = positionals.filter(action => [ PARSER, REMAINDER ].includes(action.nargs));
		        if (a.length) {
		            throw new TypeError(sub('parse_intermixed_args: positional arg' +
		                                    ' with nargs=%s', a[0].nargs))
		        }

		        for (let group of this._mutually_exclusive_groups) {
		            for (let action of group._group_actions) {
		                if (positionals.includes(action)) {
		                    throw new TypeError('parse_intermixed_args: positional in' +
		                                        ' mutuallyExclusiveGroup')
		                }
		            }
		        }

		        let save_usage;
		        try {
		            save_usage = this.usage;
		            let remaining_args;
		            try {
		                if (this.usage === undefined) {
		                    // capture the full usage for use in error messages
		                    this.usage = this.format_usage().slice(7);
		                }
		                for (let action of positionals) {
		                    // deactivate positionals
		                    action.save_nargs = action.nargs;
		                    // action.nargs = 0
		                    action.nargs = SUPPRESS;
		                    action.save_default = action.default;
		                    action.default = SUPPRESS;
		                }
		                [ namespace, remaining_args ] = this.parse_known_args(args,
		                                                                      namespace);
		                for (let action of positionals) {
		                    // remove the empty positional values from namespace
		                    let attr = getattr(namespace, action.dest);
		                    if (Array.isArray(attr) && attr.length === 0) {
		                        // eslint-disable-next-line no-console
		                        console.warn(sub('Do not expect %s in %s', action.dest, namespace));
		                        delattr(namespace, action.dest);
		                    }
		                }
		            } finally {
		                // restore nargs and usage before exiting
		                for (let action of positionals) {
		                    action.nargs = action.save_nargs;
		                    action.default = action.save_default;
		                }
		            }
		            let optionals = this._get_optional_actions();
		            try {
		                // parse positionals.  optionals aren't normally required, but
		                // they could be, so make sure they aren't.
		                for (let action of optionals) {
		                    action.save_required = action.required;
		                    action.required = false;
		                }
		                for (let group of this._mutually_exclusive_groups) {
		                    group.save_required = group.required;
		                    group.required = false;
		                }
		                [ namespace, extras ] = this.parse_known_args(remaining_args,
		                                                              namespace);
		            } finally {
		                // restore parser values before exiting
		                for (let action of optionals) {
		                    action.required = action.save_required;
		                }
		                for (let group of this._mutually_exclusive_groups) {
		                    group.required = group.save_required;
		                }
		            }
		        } finally {
		            this.usage = save_usage;
		        }
		        return [ namespace, extras ]
		    }

		    // ========================
		    // Value conversion methods
		    // ========================
		    _get_values(action, arg_strings) {
		        // for everything but PARSER, REMAINDER args, strip out first '--'
		        if (![PARSER, REMAINDER].includes(action.nargs)) {
		            try {
		                _array_remove(arg_strings, '--');
		            } catch (err) {}
		        }

		        let value;
		        // optional argument produces a default when not present
		        if (!arg_strings.length && action.nargs === OPTIONAL) {
		            if (action.option_strings.length) {
		                value = action.const;
		            } else {
		                value = action.default;
		            }
		            if (typeof value === 'string') {
		                value = this._get_value(action, value);
		                this._check_value(action, value);
		            }

		        // when nargs='*' on a positional, if there were no command-line
		        // args, use the default if it is anything other than None
		        } else if (!arg_strings.length && action.nargs === ZERO_OR_MORE &&
		              !action.option_strings.length) {
		            if (action.default !== undefined) {
		                value = action.default;
		            } else {
		                value = arg_strings;
		            }
		            this._check_value(action, value);

		        // single argument or optional argument produces a single value
		        } else if (arg_strings.length === 1 && [undefined, OPTIONAL].includes(action.nargs)) {
		            let arg_string = arg_strings[0];
		            value = this._get_value(action, arg_string);
		            this._check_value(action, value);

		        // REMAINDER arguments convert all values, checking none
		        } else if (action.nargs === REMAINDER) {
		            value = arg_strings.map(v => this._get_value(action, v));

		        // PARSER arguments convert all values, but check only the first
		        } else if (action.nargs === PARSER) {
		            value = arg_strings.map(v => this._get_value(action, v));
		            this._check_value(action, value[0]);

		        // SUPPRESS argument does not put anything in the namespace
		        } else if (action.nargs === SUPPRESS) {
		            value = SUPPRESS;

		        // all other types of nargs produce a list
		        } else {
		            value = arg_strings.map(v => this._get_value(action, v));
		            for (let v of value) {
		                this._check_value(action, v);
		            }
		        }

		        // return the converted value
		        return value
		    }

		    _get_value(action, arg_string) {
		        let type_func = this._registry_get('type', action.type, action.type);
		        if (typeof type_func !== 'function') {
		            let msg = '%r is not callable';
		            throw new ArgumentError(action, sub(msg, type_func))
		        }

		        // convert the value to the appropriate type
		        let result;
		        try {
		            try {
		                result = type_func(arg_string);
		            } catch (err) {
		                // Dear TC39, why would you ever consider making es6 classes not callable?
		                // We had one universal interface, [[Call]], which worked for anything
		                // (with familiar this-instanceof guard for classes). Now we have two.
		                if (err instanceof TypeError &&
		                    /Class constructor .* cannot be invoked without 'new'/.test(err.message)) {
		                    // eslint-disable-next-line new-cap
		                    result = new type_func(arg_string);
		                } else {
		                    throw err
		                }
		            }

		        } catch (err) {
		            // ArgumentTypeErrors indicate errors
		            if (err instanceof ArgumentTypeError) {
		                //let name = getattr(action.type, 'name', repr(action.type))
		                let msg = err.message;
		                throw new ArgumentError(action, msg)

		            // TypeErrors or ValueErrors also indicate errors
		            } else if (err instanceof TypeError) {
		                let name = getattr(action.type, 'name', repr(action.type));
		                let args = {type: name, value: arg_string};
		                let msg = 'invalid %(type)s value: %(value)r';
		                throw new ArgumentError(action, sub(msg, args))
		            } else {
		                throw err
		            }
		        }

		        // return the converted value
		        return result
		    }

		    _check_value(action, value) {
		        // converted value must be one of the choices (if specified)
		        if (action.choices !== undefined && !_choices_to_array(action.choices).includes(value)) {
		            let args = {value,
		                        choices: _choices_to_array(action.choices).map(repr).join(', ')};
		            let msg = 'invalid choice: %(value)r (choose from %(choices)s)';
		            throw new ArgumentError(action, sub(msg, args))
		        }
		    }

		    // =======================
		    // Help-formatting methods
		    // =======================
		    format_usage() {
		        let formatter = this._get_formatter();
		        formatter.add_usage(this.usage, this._actions,
		                            this._mutually_exclusive_groups);
		        return formatter.format_help()
		    }

		    format_help() {
		        let formatter = this._get_formatter();

		        // usage
		        formatter.add_usage(this.usage, this._actions,
		                            this._mutually_exclusive_groups);

		        // description
		        formatter.add_text(this.description);

		        // positionals, optionals and user-defined groups
		        for (let action_group of this._action_groups) {
		            formatter.start_section(action_group.title);
		            formatter.add_text(action_group.description);
		            formatter.add_arguments(action_group._group_actions);
		            formatter.end_section();
		        }

		        // epilog
		        formatter.add_text(this.epilog);

		        // determine help from format above
		        return formatter.format_help()
		    }

		    _get_formatter() {
		        // eslint-disable-next-line new-cap
		        return new this.formatter_class({ prog: this.prog })
		    }

		    // =====================
		    // Help-printing methods
		    // =====================
		    print_usage(file = undefined) {
		        if (file === undefined) file = process.stdout;
		        this._print_message(this.format_usage(), file);
		    }

		    print_help(file = undefined) {
		        if (file === undefined) file = process.stdout;
		        this._print_message(this.format_help(), file);
		    }

		    _print_message(message, file = undefined) {
		        if (message) {
		            if (file === undefined) file = process.stderr;
		            file.write(message);
		        }
		    }

		    // ===============
		    // Exiting methods
		    // ===============
		    exit(status = 0, message = undefined) {
		        if (message) {
		            this._print_message(message, process.stderr);
		        }
		        process.exit(status);
		    }

		    error(message) {
		        /*
		         *  error(message: string)
		         *
		         *  Prints a usage message incorporating the message to stderr and
		         *  exits.
		         *
		         *  If you override this in a subclass, it should not return -- it
		         *  should either exit or raise an exception.
		         */

		        // LEGACY (v1 compatibility), debug mode
		        if (this.debug === true) throw new Error(message)
		        // end
		        this.print_usage(process.stderr);
		        let args = {prog: this.prog, message: message};
		        this.exit(2, sub('%(prog)s: error: %(message)s\n', args));
		    }
		}));


		module.exports = {
		    ArgumentParser,
		    ArgumentError,
		    ArgumentTypeError,
		    BooleanOptionalAction,
		    FileType,
		    HelpFormatter,
		    ArgumentDefaultsHelpFormatter,
		    RawDescriptionHelpFormatter,
		    RawTextHelpFormatter,
		    MetavarTypeHelpFormatter,
		    Namespace,
		    Action,
		    ONE_OR_MORE,
		    OPTIONAL,
		    PARSER,
		    REMAINDER,
		    SUPPRESS,
		    ZERO_OR_MORE
		};

		// LEGACY (v1 compatibility), Const alias
		Object.defineProperty(module.exports, 'Const', {
		    get() {
		        let result = {};
		        Object.entries({ ONE_OR_MORE, OPTIONAL, PARSER, REMAINDER, SUPPRESS, ZERO_OR_MORE }).forEach(([ n, v ]) => {
		            Object.defineProperty(result, n, {
		                get() {
		                    deprecate(n, sub('use argparse.%s instead of argparse.Const.%s', n, n));
		                    return v
		                }
		            });
		        });
		        Object.entries({ _UNRECOGNIZED_ARGS_ATTR }).forEach(([ n, v ]) => {
		            Object.defineProperty(result, n, {
		                get() {
		                    deprecate(n, sub('argparse.Const.%s is an internal symbol and will no longer be available', n));
		                    return v
		                }
		            });
		        });
		        return result
		    },
		    enumerable: false
		});
		// end 
	} (argparse));
	return argparse.exports;
}

var argparseExports = requireArgparse();

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && process.version !== undefined) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${
      process.arch
    })`;
  }

  return "<environment undetectable>";
}

// @ts-check

function register(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }

  if (!options) {
    options = {};
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce((callback, name) => {
      return register.bind(null, state, name, callback, options);
    }, method)();
  }

  return Promise.resolve().then(() => {
    if (!state.registry[name]) {
      return method(options);
    }

    return state.registry[name].reduce((method, registered) => {
      return registered.hook.bind(null, method, options);
    }, method)();
  });
}

// @ts-check

function addHook(state, kind, name, hook) {
  const orig = hook;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }

  if (kind === "before") {
    hook = (method, options) => {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options));
    };
  }

  if (kind === "after") {
    hook = (method, options) => {
      let result;
      return Promise.resolve()
        .then(method.bind(null, options))
        .then((result_) => {
          result = result_;
          return orig(result, options);
        })
        .then(() => {
          return result;
        });
    };
  }

  if (kind === "error") {
    hook = (method, options) => {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch((error) => {
          return orig(error, options);
        });
    };
  }

  state.registry[name].push({
    hook: hook,
    orig: orig,
  });
}

// @ts-check

function removeHook(state, name, method) {
  if (!state.registry[name]) {
    return;
  }

  const index = state.registry[name]
    .map((registered) => {
      return registered.orig;
    })
    .indexOf(method);

  if (index === -1) {
    return;
  }

  state.registry[name].splice(index, 1);
}

// @ts-check


// bind with array of arguments: https://stackoverflow.com/a/21792913
const bind = Function.bind;
const bindable = bind.bind(bind);

function bindApi(hook, state, name) {
  const removeHookRef = bindable(removeHook, null).apply(
    null,
    [state]
  );
  hook.api = { remove: removeHookRef };
  hook.remove = removeHookRef;
  ["before", "error", "after", "wrap"].forEach((kind) => {
    const args = [state, kind];
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
  });
}

function Collection() {
  const state = {
    registry: {},
  };

  const hook = register.bind(null, state);
  bindApi(hook, state);

  return hook;
}

var Hook = { Collection };

// pkg/dist-src/defaults.js

// pkg/dist-src/version.js
var VERSION$7 = "0.0.0-development";

// pkg/dist-src/defaults.js
var userAgent = `octokit-endpoint.js/${VERSION$7} ${getUserAgent()}`;
var DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: ""
  }
};

// pkg/dist-src/util/lowercase-keys.js
function lowercaseKeys(object) {
  if (!object) {
    return {};
  }
  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

// pkg/dist-src/util/is-plain-object.js
function isPlainObject$1(value) {
  if (typeof value !== "object" || value === null) return false;
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}

// pkg/dist-src/util/merge-deep.js
function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach((key) => {
    if (isPlainObject$1(options[key])) {
      if (!(key in defaults)) Object.assign(result, { [key]: options[key] });
      else result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, { [key]: options[key] });
    }
  });
  return result;
}

// pkg/dist-src/util/remove-undefined-properties.js
function removeUndefinedProperties(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}

// pkg/dist-src/merge.js
function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? { method, url } : { url: method }, options);
  } else {
    options = Object.assign({}, route);
  }
  options.headers = lowercaseKeys(options.headers);
  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options);
  if (options.url === "/graphql") {
    if (defaults && defaults.mediaType.previews?.length) {
      mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(
        (preview) => !mergedOptions.mediaType.previews.includes(preview)
      ).concat(mergedOptions.mediaType.previews);
    }
    mergedOptions.mediaType.previews = (mergedOptions.mediaType.previews || []).map((preview) => preview.replace(/-preview/, ""));
  }
  return mergedOptions;
}

// pkg/dist-src/util/add-query-parameters.js
function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);
  if (names.length === 0) {
    return url;
  }
  return url + separator + names.map((name) => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }
    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}

// pkg/dist-src/util/extract-url-variable-names.js
var urlVariableRegex = /\{[^{}}]+\}/g;
function removeNonChars(variableName) {
  return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}
function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);
  if (!matches) {
    return [];
  }
  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

// pkg/dist-src/util/omit.js
function omit(object, keysToOmit) {
  const result = { __proto__: null };
  for (const key of Object.keys(object)) {
    if (keysToOmit.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
}

// pkg/dist-src/util/url-template.js
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }
    return part;
  }).join("");
}
function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}
function getValues(context, operator, key, modifier) {
  var value = context[key], result = [];
  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();
      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }
      result.push(
        encodeValue(operator, value, isKeyOperator(operator) ? key : "")
      );
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            result.push(
              encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
            );
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            tmp.push(encodeValue(operator, value2));
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }
        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }
  return result;
}
function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}
function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  template = template.replace(
    /\{([^\{\}]+)\}|([^\{\}]+)/g,
    function(_, expression, literal) {
      if (expression) {
        let operator = "";
        const values = [];
        if (operators.indexOf(expression.charAt(0)) !== -1) {
          operator = expression.charAt(0);
          expression = expression.substr(1);
        }
        expression.split(/,/g).forEach(function(variable) {
          var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
          values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
        });
        if (operator && operator !== "+") {
          var separator = ",";
          if (operator === "?") {
            separator = "&";
          } else if (operator !== "#") {
            separator = operator;
          }
          return (values.length !== 0 ? operator : "") + values.join(separator);
        } else {
          return values.join(",");
        }
      } else {
        return encodeReserved(literal);
      }
    }
  );
  if (template === "/") {
    return template;
  } else {
    return template.replace(/\/$/, "");
  }
}

// pkg/dist-src/parse.js
function parse(options) {
  let method = options.method.toUpperCase();
  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]);
  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);
  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }
  const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
  if (!isBinaryRequest) {
    if (options.mediaType.format) {
      headers.accept = headers.accept.split(/,/).map(
        (format) => format.replace(
          /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
          `application/vnd$1$2.${options.mediaType.format}`
        )
      ).join(",");
    }
    if (url.endsWith("/graphql")) {
      if (options.mediaType.previews?.length) {
        const previewsFromAcceptHeader = headers.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g) || [];
        headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
          const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
          return `application/vnd.github.${preview}-preview${format}`;
        }).join(",");
      }
    }
  }
  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      }
    }
  }
  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  }
  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  }
  return Object.assign(
    { method, url, headers },
    typeof body !== "undefined" ? { body } : null,
    options.request ? { request: options.request } : null
  );
}

// pkg/dist-src/endpoint-with-defaults.js
function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}

// pkg/dist-src/with-defaults.js
function withDefaults$2(oldDefaults, newDefaults) {
  const DEFAULTS2 = merge(oldDefaults, newDefaults);
  const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
  return Object.assign(endpoint2, {
    DEFAULTS: DEFAULTS2,
    defaults: withDefaults$2.bind(null, DEFAULTS2),
    merge: merge.bind(null, DEFAULTS2),
    parse
  });
}

// pkg/dist-src/index.js
var endpoint = withDefaults$2(null, DEFAULTS);

var fastContentTypeParse = {};

var hasRequiredFastContentTypeParse;

function requireFastContentTypeParse () {
	if (hasRequiredFastContentTypeParse) return fastContentTypeParse;
	hasRequiredFastContentTypeParse = 1;

	const NullObject = function NullObject () { };
	NullObject.prototype = Object.create(null);

	/**
	 * RegExp to match *( ";" parameter ) in RFC 7231 sec 3.1.1.1
	 *
	 * parameter     = token "=" ( token / quoted-string )
	 * token         = 1*tchar
	 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
	 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
	 *               / DIGIT / ALPHA
	 *               ; any VCHAR, except delimiters
	 * quoted-string = DQUOTE *( qdtext / quoted-pair ) DQUOTE
	 * qdtext        = HTAB / SP / %x21 / %x23-5B / %x5D-7E / obs-text
	 * obs-text      = %x80-FF
	 * quoted-pair   = "\" ( HTAB / SP / VCHAR / obs-text )
	 */
	const paramRE = /; *([!#$%&'*+.^\w`|~-]+)=("(?:[\v\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\v\u0020-\u00ff])*"|[!#$%&'*+.^\w`|~-]+) */gu;

	/**
	 * RegExp to match quoted-pair in RFC 7230 sec 3.2.6
	 *
	 * quoted-pair = "\" ( HTAB / SP / VCHAR / obs-text )
	 * obs-text    = %x80-FF
	 */
	const quotedPairRE = /\\([\v\u0020-\u00ff])/gu;

	/**
	 * RegExp to match type in RFC 7231 sec 3.1.1.1
	 *
	 * media-type = type "/" subtype
	 * type       = token
	 * subtype    = token
	 */
	const mediaTypeRE = /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/u;

	// default ContentType to prevent repeated object creation
	const defaultContentType = { type: '', parameters: new NullObject() };
	Object.freeze(defaultContentType.parameters);
	Object.freeze(defaultContentType);

	/**
	 * Parse media type to object.
	 *
	 * @param {string|object} header
	 * @return {Object}
	 * @public
	 */

	function parse (header) {
	  if (typeof header !== 'string') {
	    throw new TypeError('argument header is required and must be a string')
	  }

	  let index = header.indexOf(';');
	  const type = index !== -1
	    ? header.slice(0, index).trim()
	    : header.trim();

	  if (mediaTypeRE.test(type) === false) {
	    throw new TypeError('invalid media type')
	  }

	  const result = {
	    type: type.toLowerCase(),
	    parameters: new NullObject()
	  };

	  // parse parameters
	  if (index === -1) {
	    return result
	  }

	  let key;
	  let match;
	  let value;

	  paramRE.lastIndex = index;

	  while ((match = paramRE.exec(header))) {
	    if (match.index !== index) {
	      throw new TypeError('invalid parameter format')
	    }

	    index += match[0].length;
	    key = match[1].toLowerCase();
	    value = match[2];

	    if (value[0] === '"') {
	      // remove quotes and escapes
	      value = value
	        .slice(1, value.length - 1);

	      quotedPairRE.test(value) && (value = value.replace(quotedPairRE, '$1'));
	    }

	    result.parameters[key] = value;
	  }

	  if (index !== header.length) {
	    throw new TypeError('invalid parameter format')
	  }

	  return result
	}

	function safeParse (header) {
	  if (typeof header !== 'string') {
	    return defaultContentType
	  }

	  let index = header.indexOf(';');
	  const type = index !== -1
	    ? header.slice(0, index).trim()
	    : header.trim();

	  if (mediaTypeRE.test(type) === false) {
	    return defaultContentType
	  }

	  const result = {
	    type: type.toLowerCase(),
	    parameters: new NullObject()
	  };

	  // parse parameters
	  if (index === -1) {
	    return result
	  }

	  let key;
	  let match;
	  let value;

	  paramRE.lastIndex = index;

	  while ((match = paramRE.exec(header))) {
	    if (match.index !== index) {
	      return defaultContentType
	    }

	    index += match[0].length;
	    key = match[1].toLowerCase();
	    value = match[2];

	    if (value[0] === '"') {
	      // remove quotes and escapes
	      value = value
	        .slice(1, value.length - 1);

	      quotedPairRE.test(value) && (value = value.replace(quotedPairRE, '$1'));
	    }

	    result.parameters[key] = value;
	  }

	  if (index !== header.length) {
	    return defaultContentType
	  }

	  return result
	}

	fastContentTypeParse.default = { parse, safeParse };
	fastContentTypeParse.parse = parse;
	fastContentTypeParse.safeParse = safeParse;
	fastContentTypeParse.defaultContentType = defaultContentType;
	return fastContentTypeParse;
}

var fastContentTypeParseExports = requireFastContentTypeParse();

let RequestError$1 = class RequestError extends Error {
  name;
  /**
   * http status code
   */
  status;
  /**
   * Request options that lead to the error.
   */
  request;
  /**
   * Response object if a response was received
   */
  response;
  constructor(message, statusCode, options) {
    super(message);
    this.name = "HttpError";
    this.status = Number.parseInt(statusCode);
    if (Number.isNaN(this.status)) {
      this.status = 0;
    }
    if ("response" in options) {
      this.response = options.response;
    }
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          /(?<! ) .*$/,
          " [REDACTED]"
        )
      });
    }
    requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }
};

// pkg/dist-src/index.js

// pkg/dist-src/version.js
var VERSION$6 = "0.0.0-development";

// pkg/dist-src/defaults.js
var defaults_default = {
  headers: {
    "user-agent": `octokit-request.js/${VERSION$6} ${getUserAgent()}`
  }
};

// pkg/dist-src/is-plain-object.js
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
async function fetchWrapper(requestOptions) {
  const fetch = requestOptions.request?.fetch || globalThis.fetch;
  if (!fetch) {
    throw new Error(
      "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
    );
  }
  const log = requestOptions.request?.log || console;
  const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
  const body = isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body) ? JSON.stringify(requestOptions.body) : requestOptions.body;
  const requestHeaders = Object.fromEntries(
    Object.entries(requestOptions.headers).map(([name, value]) => [
      name,
      String(value)
    ])
  );
  let fetchResponse;
  try {
    fetchResponse = await fetch(requestOptions.url, {
      method: requestOptions.method,
      body,
      redirect: requestOptions.request?.redirect,
      headers: requestHeaders,
      signal: requestOptions.request?.signal,
      // duplex must be set if request.body is ReadableStream or Async Iterables.
      // See https://fetch.spec.whatwg.org/#dom-requestinit-duplex.
      ...requestOptions.body && { duplex: "half" }
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        error.status = 500;
        throw error;
      }
      message = error.message;
      if (error.name === "TypeError" && "cause" in error) {
        if (error.cause instanceof Error) {
          message = error.cause.message;
        } else if (typeof error.cause === "string") {
          message = error.cause;
        }
      }
    }
    const requestError = new RequestError$1(message, 500, {
      request: requestOptions
    });
    requestError.cause = error;
    throw requestError;
  }
  const status = fetchResponse.status;
  const url = fetchResponse.url;
  const responseHeaders = {};
  for (const [key, value] of fetchResponse.headers) {
    responseHeaders[key] = value;
  }
  const octokitResponse = {
    url,
    status,
    headers: responseHeaders,
    data: ""
  };
  if ("deprecation" in responseHeaders) {
    const matches = responseHeaders.link && responseHeaders.link.match(/<([^<>]+)>; rel="deprecation"/);
    const deprecationLink = matches && matches.pop();
    log.warn(
      `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
    );
  }
  if (status === 204 || status === 205) {
    return octokitResponse;
  }
  if (requestOptions.method === "HEAD") {
    if (status < 400) {
      return octokitResponse;
    }
    throw new RequestError$1(fetchResponse.statusText, status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  if (status === 304) {
    octokitResponse.data = await getResponseData(fetchResponse);
    throw new RequestError$1("Not modified", status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  if (status >= 400) {
    octokitResponse.data = await getResponseData(fetchResponse);
    throw new RequestError$1(toErrorMessage(octokitResponse.data), status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  octokitResponse.data = parseSuccessResponseBody ? await getResponseData(fetchResponse) : fetchResponse.body;
  return octokitResponse;
}
async function getResponseData(response) {
  const contentType = response.headers.get("content-type");
  if (!contentType) {
    return response.text().catch(() => "");
  }
  const mimetype = fastContentTypeParseExports.safeParse(contentType);
  if (isJSONResponse(mimetype)) {
    let text = "";
    try {
      text = await response.text();
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  } else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") {
    return response.text().catch(() => "");
  } else {
    return response.arrayBuffer().catch(() => new ArrayBuffer(0));
  }
}
function isJSONResponse(mimetype) {
  return mimetype.type === "application/json" || mimetype.type === "application/scim+json";
}
function toErrorMessage(data) {
  if (typeof data === "string") {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return "Unknown error";
  }
  if ("message" in data) {
    const suffix = "documentation_url" in data ? ` - ${data.documentation_url}` : "";
    return Array.isArray(data.errors) ? `${data.message}: ${data.errors.map((v) => JSON.stringify(v)).join(", ")}${suffix}` : `${data.message}${suffix}`;
  }
  return `Unknown error: ${JSON.stringify(data)}`;
}

// pkg/dist-src/with-defaults.js
function withDefaults$1(oldEndpoint, newDefaults) {
  const endpoint2 = oldEndpoint.defaults(newDefaults);
  const newApi = function(route, parameters) {
    const endpointOptions = endpoint2.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint2.parse(endpointOptions));
    }
    const request2 = (route2, parameters2) => {
      return fetchWrapper(
        endpoint2.parse(endpoint2.merge(route2, parameters2))
      );
    };
    Object.assign(request2, {
      endpoint: endpoint2,
      defaults: withDefaults$1.bind(null, endpoint2)
    });
    return endpointOptions.request.hook(request2, endpointOptions);
  };
  return Object.assign(newApi, {
    endpoint: endpoint2,
    defaults: withDefaults$1.bind(null, endpoint2)
  });
}

// pkg/dist-src/index.js
var request = withDefaults$1(endpoint, defaults_default);

// pkg/dist-src/index.js

// pkg/dist-src/version.js
var VERSION$5 = "0.0.0-development";

// pkg/dist-src/error.js
function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
var GraphqlResponseError = class extends Error {
  constructor(request2, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request2;
    this.headers = headers;
    this.response = response;
    this.errors = response.errors;
    this.data = response.data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  name = "GraphqlResponseError";
  errors;
  data;
};

// pkg/dist-src/graphql.js
var NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query",
  "mediaType",
  "operationName"
];
var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request2, query, options) {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(
        new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
      );
    }
    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
      return Promise.reject(
        new Error(
          `[@octokit/graphql] "${key}" cannot be used as variable name`
        )
      );
    }
  }
  const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
  const requestOptions = Object.keys(
    parsedOptions
  ).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }
    if (!result.variables) {
      result.variables = {};
    }
    result.variables[key] = parsedOptions[key];
    return result;
  }, {});
  const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }
  return request2(requestOptions).then((response) => {
    if (response.data.errors) {
      const headers = {};
      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }
      throw new GraphqlResponseError(
        requestOptions,
        headers,
        response.data
      );
    }
    return response.data.data;
  });
}

// pkg/dist-src/with-defaults.js
function withDefaults(request2, newDefaults) {
  const newRequest = request2.defaults(newDefaults);
  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };
  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: newRequest.endpoint
  });
}

// pkg/dist-src/index.js
withDefaults(request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION$5} ${getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

// pkg/dist-src/is-jwt.js
var b64url = "(?:[a-zA-Z0-9_-]+)";
var sep = "\\.";
var jwtRE = new RegExp(`^${b64url}${sep}${b64url}${sep}${b64url}$`);
var isJWT = jwtRE.test.bind(jwtRE);

// pkg/dist-src/auth.js
async function auth(token) {
  const isApp = isJWT(token);
  const isInstallation = token.startsWith("v1.") || token.startsWith("ghs_");
  const isUserToServer = token.startsWith("ghu_");
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
  return {
    type: "token",
    token,
    tokenType
  };
}

// pkg/dist-src/with-authorization-prefix.js
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }
  return `token ${token}`;
}

// pkg/dist-src/hook.js
async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(
    route,
    parameters
  );
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

// pkg/dist-src/index.js
var createTokenAuth = function createTokenAuth2(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }
  if (typeof token !== "string") {
    throw new Error(
      "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
    );
  }
  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

const VERSION$4 = "6.1.4";

const noop = () => {
};
const consoleWarn = console.warn.bind(console);
const consoleError = console.error.bind(console);
const userAgentTrail = `octokit-core.js/${VERSION$4} ${getUserAgent()}`;
let Octokit$1 = class Octokit {
  static VERSION = VERSION$4;
  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};
        if (typeof defaults === "function") {
          super(defaults(options));
          return;
        }
        super(
          Object.assign(
            {},
            defaults,
            options,
            options.userAgent && defaults.userAgent ? {
              userAgent: `${options.userAgent} ${defaults.userAgent}`
            } : null
          )
        );
      }
    };
    return OctokitWithDefaults;
  }
  static plugins = [];
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */
  static plugin(...newPlugins) {
    const currentPlugins = this.plugins;
    const NewOctokit = class extends this {
      static plugins = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
      );
    };
    return NewOctokit;
  }
  constructor(options = {}) {
    const hook = new Hook.Collection();
    const requestDefaults = {
      baseUrl: request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        // @ts-ignore internal usage only, no need to type
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    };
    requestDefaults.headers["user-agent"] = options.userAgent ? `${options.userAgent} ${userAgentTrail}` : userAgentTrail;
    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }
    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }
    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }
    this.request = request.defaults(requestDefaults);
    this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign(
      {
        debug: noop,
        info: noop,
        warn: consoleWarn,
        error: consoleError
      },
      options.log
    );
    this.hook = hook;
    if (!options.authStrategy) {
      if (!options.auth) {
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        const auth = createTokenAuth(options.auth);
        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
    } else {
      const { authStrategy, ...otherOptions } = options;
      const auth = authStrategy(
        Object.assign(
          {
            request: this.request,
            log: this.log,
            // we pass the current octokit instance as well as its constructor options
            // to allow for authentication strategies that return a new octokit instance
            // that shares the same internal state as the current one. The original
            // requirement for this was the "event-octokit" authentication strategy
            // of https://github.com/probot/octokit-auth-probot.
            octokit: this,
            octokitOptions: otherOptions
          },
          options.auth
        )
      );
      hook.wrap("request", auth.hook);
      this.auth = auth;
    }
    const classConstructor = this.constructor;
    for (let i = 0; i < classConstructor.plugins.length; ++i) {
      Object.assign(this, classConstructor.plugins[i](this, options));
    }
  }
  // assigned during constructor
  request;
  graphql;
  log;
  hook;
  // TODO: type `octokit.auth` based on passed options.authStrategy
  auth;
};

const VERSION$3 = "5.3.1";

function requestLog(octokit) {
  octokit.hook.wrap("request", (request, options) => {
    octokit.log.debug("request", options);
    const start = Date.now();
    const requestOptions = octokit.request.endpoint.parse(options);
    const path = requestOptions.url.replace(options.baseUrl, "");
    return request(options).then((response) => {
      const requestId = response.headers["x-github-request-id"];
      octokit.log.info(
        `${requestOptions.method} ${path} - ${response.status} with id ${requestId} in ${Date.now() - start}ms`
      );
      return response;
    }).catch((error) => {
      const requestId = error.response?.headers["x-github-request-id"] || "UNKNOWN";
      octokit.log.error(
        `${requestOptions.method} ${path} - ${error.status} with id ${requestId} in ${Date.now() - start}ms`
      );
      throw error;
    });
  });
}
requestLog.VERSION = VERSION$3;

// pkg/dist-src/version.js
var VERSION$2 = "0.0.0-development";

// pkg/dist-src/normalize-paginated-list-response.js
function normalizePaginatedListResponse(response) {
  if (!response.data) {
    return {
      ...response,
      data: []
    };
  }
  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization) return response;
  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;
  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }
  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }
  response.data.total_count = totalCount;
  return response;
}

// pkg/dist-src/iterator.js
function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url) return { done: true };
        try {
          const response = await requestMethod({ method, url, headers });
          const normalizedResponse = normalizePaginatedListResponse(response);
          url = ((normalizedResponse.headers.link || "").match(
            /<([^<>]+)>;\s*rel="next"/
          ) || [])[1];
          return { value: normalizedResponse };
        } catch (error) {
          if (error.status !== 409) throw error;
          url = "";
          return {
            value: {
              status: 200,
              headers: {},
              data: []
            }
          };
        }
      }
    })
  };
}

// pkg/dist-src/paginate.js
function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = void 0;
  }
  return gather(
    octokit,
    [],
    iterator(octokit, route, parameters)[Symbol.asyncIterator](),
    mapFn
  );
}
function gather(octokit, results, iterator2, mapFn) {
  return iterator2.next().then((result) => {
    if (result.done) {
      return results;
    }
    let earlyExit = false;
    function done() {
      earlyExit = true;
    }
    results = results.concat(
      mapFn ? mapFn(result.value, done) : result.value.data
    );
    if (earlyExit) {
      return results;
    }
    return gather(octokit, results, iterator2, mapFn);
  });
}

// pkg/dist-src/compose-paginate.js
Object.assign(paginate, {
  iterator
});

// pkg/dist-src/index.js
function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION$2;

const VERSION$1 = "13.5.0";

const Endpoints = {
  actions: {
    addCustomLabelsToSelfHostedRunnerForOrg: [
      "POST /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    addCustomLabelsToSelfHostedRunnerForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    addRepoAccessToSelfHostedRunnerGroupInOrg: [
      "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgVariable: [
      "PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"
    ],
    approveWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"
    ],
    cancelWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"
    ],
    createEnvironmentVariable: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/variables"
    ],
    createHostedRunnerForOrg: ["POST /orgs/{org}/actions/hosted-runners"],
    createOrUpdateEnvironmentSecret: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    createOrgVariable: ["POST /orgs/{org}/actions/variables"],
    createRegistrationTokenForOrg: [
      "POST /orgs/{org}/actions/runners/registration-token"
    ],
    createRegistrationTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/registration-token"
    ],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/remove-token"
    ],
    createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
    createWorkflowDispatch: [
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
    ],
    deleteActionsCacheById: [
      "DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"
    ],
    deleteActionsCacheByKey: [
      "DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"
    ],
    deleteArtifact: [
      "DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"
    ],
    deleteEnvironmentSecret: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    deleteEnvironmentVariable: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    deleteHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    deleteRepoVariable: [
      "DELETE /repos/{owner}/{repo}/actions/variables/{name}"
    ],
    deleteSelfHostedRunnerFromOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}"
    ],
    deleteSelfHostedRunnerFromRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: [
      "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    disableSelectedRepositoryGithubActionsOrganization: [
      "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    disableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"
    ],
    downloadArtifact: [
      "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"
    ],
    downloadJobLogsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"
    ],
    downloadWorkflowRunAttemptLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"
    ],
    downloadWorkflowRunLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    enableSelectedRepositoryGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    enableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"
    ],
    forceCancelWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"
    ],
    generateRunnerJitconfigForOrg: [
      "POST /orgs/{org}/actions/runners/generate-jitconfig"
    ],
    generateRunnerJitconfigForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig"
    ],
    getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
    getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
    getActionsCacheUsageByRepoForOrg: [
      "GET /orgs/{org}/actions/cache/usage-by-repository"
    ],
    getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
    getAllowedActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/selected-actions"
    ],
    getAllowedActionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getCustomOidcSubClaimForRepo: [
      "GET /repos/{owner}/{repo}/actions/oidc/customization/sub"
    ],
    getEnvironmentPublicKey: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key"
    ],
    getEnvironmentSecret: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    getEnvironmentVariable: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    getGithubActionsDefaultWorkflowPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions/workflow"
    ],
    getGithubActionsDefaultWorkflowPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    getGithubActionsPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions"
    ],
    getGithubActionsPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions"
    ],
    getHostedRunnerForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    getHostedRunnersGithubOwnedImagesForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/github-owned"
    ],
    getHostedRunnersLimitsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/limits"
    ],
    getHostedRunnersMachineSpecsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/machine-sizes"
    ],
    getHostedRunnersPartnerImagesForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/partner"
    ],
    getHostedRunnersPlatformsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/platforms"
    ],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
    getPendingDeploymentsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    getRepoPermissions: [
      "GET /repos/{owner}/{repo}/actions/permissions",
      {},
      { renamed: ["actions", "getGithubActionsPermissionsRepository"] }
    ],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getRepoVariable: ["GET /repos/{owner}/{repo}/actions/variables/{name}"],
    getReviewsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"
    ],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowAccessToRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/access"
    ],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"
    ],
    getWorkflowRunUsage: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"
    ],
    getWorkflowUsage: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"
    ],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listEnvironmentSecrets: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"
    ],
    listEnvironmentVariables: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/variables"
    ],
    listGithubHostedRunnersInGroupForOrg: [
      "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners"
    ],
    listHostedRunnersForOrg: ["GET /orgs/{org}/actions/hosted-runners"],
    listJobsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"
    ],
    listJobsForWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"
    ],
    listLabelsForSelfHostedRunnerForOrg: [
      "GET /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    listLabelsForSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listOrgVariables: ["GET /orgs/{org}/actions/variables"],
    listRepoOrganizationSecrets: [
      "GET /repos/{owner}/{repo}/actions/organization-secrets"
    ],
    listRepoOrganizationVariables: [
      "GET /repos/{owner}/{repo}/actions/organization-variables"
    ],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/downloads"
    ],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    listSelectedReposForOrgVariable: [
      "GET /orgs/{org}/actions/variables/{name}/repositories"
    ],
    listSelectedRepositoriesEnabledGithubActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/repositories"
    ],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"
    ],
    listWorkflowRuns: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
    ],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunJobForWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"
    ],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    reRunWorkflowFailedJobs: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    removeCustomLabelFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeCustomLabelFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    removeSelectedRepoFromOrgVariable: [
      "DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"
    ],
    reviewCustomGatesForRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule"
    ],
    reviewPendingDeploymentsForRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    setAllowedActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/selected-actions"
    ],
    setAllowedActionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    setCustomLabelsForSelfHostedRunnerForOrg: [
      "PUT /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    setCustomLabelsForSelfHostedRunnerForRepo: [
      "PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    setCustomOidcSubClaimForRepo: [
      "PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"
    ],
    setGithubActionsDefaultWorkflowPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/workflow"
    ],
    setGithubActionsDefaultWorkflowPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    setGithubActionsPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions"
    ],
    setGithubActionsPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    setSelectedReposForOrgVariable: [
      "PUT /orgs/{org}/actions/variables/{name}/repositories"
    ],
    setSelectedRepositoriesEnabledGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories"
    ],
    setWorkflowAccessToRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/access"
    ],
    updateEnvironmentVariable: [
      "PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    updateHostedRunnerForOrg: [
      "PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
    updateRepoVariable: [
      "PATCH /repos/{owner}/{repo}/actions/variables/{name}"
    ]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: [
      "DELETE /notifications/threads/{thread_id}/subscription"
    ],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: [
      "GET /notifications/threads/{thread_id}/subscription"
    ],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: [
      "GET /users/{username}/events/orgs/{org}"
    ],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: [
      "GET /users/{username}/received_events/public"
    ],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/notifications"
    ],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsDone: ["DELETE /notifications/threads/{thread_id}"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: [
      "PUT /notifications/threads/{thread_id}/subscription"
    ],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] }
    ],
    addRepoToInstallationForAuthenticatedUser: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    checkToken: ["POST /applications/{client_id}/token"],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: [
      "POST /app/installations/{installation_id}/access_tokens"
    ],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: [
      "GET /marketplace_listing/accounts/{account_id}"
    ],
    getSubscriptionPlanForAccountStubbed: [
      "GET /marketplace_listing/stubbed/accounts/{account_id}"
    ],
    getUserInstallation: ["GET /users/{username}/installation"],
    getWebhookConfigForApp: ["GET /app/hook/config"],
    getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: [
      "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"
    ],
    listInstallationReposForAuthenticatedUser: [
      "GET /user/installations/{installation_id}/repositories"
    ],
    listInstallationRequestsForAuthenticatedApp: [
      "GET /app/installation-requests"
    ],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: [
      "GET /user/marketplace_purchases/stubbed"
    ],
    listWebhookDeliveries: ["GET /app/hook/deliveries"],
    redeliverWebhookDelivery: [
      "POST /app/hook/deliveries/{delivery_id}/attempts"
    ],
    removeRepoFromInstallation: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] }
    ],
    removeRepoFromInstallationForAuthenticatedUser: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    scopeToken: ["POST /applications/{client_id}/token/scoped"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: [
      "DELETE /app/installations/{installation_id}/suspended"
    ],
    updateWebhookConfigForApp: ["PATCH /app/hook/config"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: [
      "GET /users/{username}/settings/billing/actions"
    ],
    getGithubBillingUsageReportOrg: [
      "GET /organizations/{org}/settings/billing/usage"
    ],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: [
      "GET /users/{username}/settings/billing/packages"
    ],
    getSharedStorageBillingOrg: [
      "GET /orgs/{org}/settings/billing/shared-storage"
    ],
    getSharedStorageBillingUser: [
      "GET /users/{username}/settings/billing/shared-storage"
    ]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs"],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
    listAnnotations: [
      "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"
    ],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
    listForSuite: [
      "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"
    ],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
    rerequestRun: [
      "POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"
    ],
    rerequestSuite: [
      "POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"
    ],
    setSuitesPreferences: [
      "PATCH /repos/{owner}/{repo}/check-suites/preferences"
    ],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
  },
  codeScanning: {
    commitAutofix: [
      "POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits"
    ],
    createAutofix: [
      "POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"
    ],
    createVariantAnalysis: [
      "POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"
    ],
    deleteAnalysis: [
      "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"
    ],
    deleteCodeqlDatabase: [
      "DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"
    ],
    getAlert: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
      {},
      { renamedParameters: { alert_id: "alert_number" } }
    ],
    getAnalysis: [
      "GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"
    ],
    getAutofix: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"
    ],
    getCodeqlDatabase: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"
    ],
    getDefaultSetup: ["GET /repos/{owner}/{repo}/code-scanning/default-setup"],
    getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
    getVariantAnalysis: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}"
    ],
    getVariantAnalysisRepoTask: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}"
    ],
    listAlertInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
    listAlertsInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
      {},
      { renamed: ["codeScanning", "listAlertInstances"] }
    ],
    listCodeqlDatabases: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/databases"
    ],
    listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"
    ],
    updateDefaultSetup: [
      "PATCH /repos/{owner}/{repo}/code-scanning/default-setup"
    ],
    uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
  },
  codeSecurity: {
    attachConfiguration: [
      "POST /orgs/{org}/code-security/configurations/{configuration_id}/attach"
    ],
    attachEnterpriseConfiguration: [
      "POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach"
    ],
    createConfiguration: ["POST /orgs/{org}/code-security/configurations"],
    createConfigurationForEnterprise: [
      "POST /enterprises/{enterprise}/code-security/configurations"
    ],
    deleteConfiguration: [
      "DELETE /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    deleteConfigurationForEnterprise: [
      "DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ],
    detachConfiguration: [
      "DELETE /orgs/{org}/code-security/configurations/detach"
    ],
    getConfiguration: [
      "GET /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    getConfigurationForRepository: [
      "GET /repos/{owner}/{repo}/code-security-configuration"
    ],
    getConfigurationsForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations"
    ],
    getConfigurationsForOrg: ["GET /orgs/{org}/code-security/configurations"],
    getDefaultConfigurations: [
      "GET /orgs/{org}/code-security/configurations/defaults"
    ],
    getDefaultConfigurationsForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations/defaults"
    ],
    getRepositoriesForConfiguration: [
      "GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories"
    ],
    getRepositoriesForEnterpriseConfiguration: [
      "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories"
    ],
    getSingleConfigurationForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ],
    setConfigurationAsDefault: [
      "PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults"
    ],
    setConfigurationAsDefaultForEnterprise: [
      "PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults"
    ],
    updateConfiguration: [
      "PATCH /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    updateEnterpriseConfiguration: [
      "PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct"],
    getConductCode: ["GET /codes_of_conduct/{key}"]
  },
  codespaces: {
    addRepositoryForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    checkPermissionsForDevcontainer: [
      "GET /repos/{owner}/{repo}/codespaces/permissions_check"
    ],
    codespaceMachinesForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/machines"
    ],
    createForAuthenticatedUser: ["POST /user/codespaces"],
    createOrUpdateOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}"
    ],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    createOrUpdateSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}"
    ],
    createWithPrForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"
    ],
    createWithRepoForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/codespaces"
    ],
    deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
    deleteFromOrganization: [
      "DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    deleteSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}"
    ],
    exportForAuthenticatedUser: [
      "POST /user/codespaces/{codespace_name}/exports"
    ],
    getCodespacesForUserInOrg: [
      "GET /orgs/{org}/members/{username}/codespaces"
    ],
    getExportDetailsForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/exports/{export_id}"
    ],
    getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
    getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
    getPublicKeyForAuthenticatedUser: [
      "GET /user/codespaces/secrets/public-key"
    ],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    getSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}"
    ],
    listDevcontainersInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/devcontainers"
    ],
    listForAuthenticatedUser: ["GET /user/codespaces"],
    listInOrganization: [
      "GET /orgs/{org}/codespaces",
      {},
      { renamedParameters: { org_id: "org" } }
    ],
    listInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces"
    ],
    listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
    listRepositoriesForSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}/repositories"
    ],
    listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories"
    ],
    preFlightWithRepoForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/new"
    ],
    publishForAuthenticatedUser: [
      "POST /user/codespaces/{codespace_name}/publish"
    ],
    removeRepositoryForSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    repoMachinesForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/machines"
    ],
    setRepositoriesForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories"
    ],
    startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
    stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
    stopInOrganization: [
      "POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"
    ],
    updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"]
  },
  copilot: {
    addCopilotSeatsForTeams: [
      "POST /orgs/{org}/copilot/billing/selected_teams"
    ],
    addCopilotSeatsForUsers: [
      "POST /orgs/{org}/copilot/billing/selected_users"
    ],
    cancelCopilotSeatAssignmentForTeams: [
      "DELETE /orgs/{org}/copilot/billing/selected_teams"
    ],
    cancelCopilotSeatAssignmentForUsers: [
      "DELETE /orgs/{org}/copilot/billing/selected_users"
    ],
    copilotMetricsForOrganization: ["GET /orgs/{org}/copilot/metrics"],
    copilotMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],
    getCopilotOrganizationDetails: ["GET /orgs/{org}/copilot/billing"],
    getCopilotSeatDetailsForUser: [
      "GET /orgs/{org}/members/{username}/copilot"
    ],
    listCopilotSeats: ["GET /orgs/{org}/copilot/billing/seats"],
    usageMetricsForOrg: ["GET /orgs/{org}/copilot/usage"],
    usageMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/usage"]
  },
  dependabot: {
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    createOrUpdateOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}"
    ],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    getAlert: ["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
    getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    listAlertsForEnterprise: [
      "GET /enterprises/{enterprise}/dependabot/alerts"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
    listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"
    ]
  },
  dependencyGraph: {
    createRepositorySnapshot: [
      "POST /repos/{owner}/{repo}/dependency-graph/snapshots"
    ],
    diffRange: [
      "GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"
    ],
    exportSbom: ["GET /repos/{owner}/{repo}/dependency-graph/sbom"]
  },
  emojis: { get: ["GET /emojis"] },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"]
  },
  hostedCompute: {
    createNetworkConfigurationForOrg: [
      "POST /orgs/{org}/settings/network-configurations"
    ],
    deleteNetworkConfigurationFromOrg: [
      "DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ],
    getNetworkConfigurationForOrg: [
      "GET /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ],
    getNetworkSettingsForOrg: [
      "GET /orgs/{org}/settings/network-settings/{network_settings_id}"
    ],
    listNetworkConfigurationsForOrg: [
      "GET /orgs/{org}/settings/network-configurations"
    ],
    updateNetworkConfigurationForOrg: [
      "PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ]
  },
  interactions: {
    getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
    getRestrictionsForYourPublicRepos: [
      "GET /user/interaction-limits",
      {},
      { renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] }
    ],
    removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
    removeRestrictionsForRepo: [
      "DELETE /repos/{owner}/{repo}/interaction-limits"
    ],
    removeRestrictionsForYourPublicRepos: [
      "DELETE /user/interaction-limits",
      {},
      { renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] }
    ],
    setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
    setRestrictionsForYourPublicRepos: [
      "PUT /user/interaction-limits",
      {},
      { renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] }
    ]
  },
  issues: {
    addAssignees: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    addSubIssue: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"
    ],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    checkUserCanBeAssignedToIssue: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}"
    ],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments"
    ],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"
    ],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: [
      "DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"
    ],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"
    ],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: [
      "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"
    ],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    listSubIssues: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"
    ],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    removeAssignees: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    removeLabel: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"
    ],
    removeSubIssue: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"
    ],
    reprioritizeSubIssue: [
      "PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority"
    ],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: [
      "PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"
    ]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: [
      "POST /markdown/raw",
      { headers: { "content-type": "text/plain; charset=utf-8" } }
    ]
  },
  meta: {
    get: ["GET /meta"],
    getAllVersions: ["GET /versions"],
    getOctocat: ["GET /octocat"],
    getZen: ["GET /zen"],
    root: ["GET /"]
  },
  migrations: {
    deleteArchiveForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/archive"
    ],
    deleteArchiveForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/archive"
    ],
    downloadArchiveForOrg: [
      "GET /orgs/{org}/migrations/{migration_id}/archive"
    ],
    getArchiveForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/archive"
    ],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
    listForAuthenticatedUser: ["GET /user/migrations"],
    listForOrg: ["GET /orgs/{org}/migrations"],
    listReposForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/repositories"
    ],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
    listReposForUser: [
      "GET /user/migrations/{migration_id}/repositories",
      {},
      { renamed: ["migrations", "listReposForAuthenticatedUser"] }
    ],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    unlockRepoForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"
    ],
    unlockRepoForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"
    ]
  },
  oidc: {
    getOidcCustomSubTemplateForOrg: [
      "GET /orgs/{org}/actions/oidc/customization/sub"
    ],
    updateOidcCustomSubTemplateForOrg: [
      "PUT /orgs/{org}/actions/oidc/customization/sub"
    ]
  },
  orgs: {
    addSecurityManagerTeam: [
      "PUT /orgs/{org}/security-managers/teams/{team_slug}",
      {},
      {
        deprecated: "octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team"
      }
    ],
    assignTeamToOrgRole: [
      "PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"
    ],
    assignUserToOrgRole: [
      "PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"
    ],
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: [
      "PUT /orgs/{org}/outside_collaborators/{username}"
    ],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createIssueType: ["POST /orgs/{org}/issue-types"],
    createOrUpdateCustomProperties: ["PATCH /orgs/{org}/properties/schema"],
    createOrUpdateCustomPropertiesValuesForRepos: [
      "PATCH /orgs/{org}/properties/values"
    ],
    createOrUpdateCustomProperty: [
      "PUT /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    createWebhook: ["POST /orgs/{org}/hooks"],
    delete: ["DELETE /orgs/{org}"],
    deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    enableOrDisableSecurityProductOnAllOrgRepos: [
      "POST /orgs/{org}/{security_product}/{enablement}",
      {},
      {
        deprecated: "octokit.rest.orgs.enableOrDisableSecurityProductOnAllOrgRepos() is deprecated, see https://docs.github.com/rest/orgs/orgs#enable-or-disable-a-security-feature-for-an-organization"
      }
    ],
    get: ["GET /orgs/{org}"],
    getAllCustomProperties: ["GET /orgs/{org}/properties/schema"],
    getCustomProperty: [
      "GET /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getOrgRole: ["GET /orgs/{org}/organization-roles/{role_id}"],
    getOrgRulesetHistory: ["GET /orgs/{org}/rulesets/{ruleset_id}/history"],
    getOrgRulesetVersion: [
      "GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}"
    ],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
    getWebhookDelivery: [
      "GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listCustomPropertiesValuesForRepos: ["GET /orgs/{org}/properties/values"],
    listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listIssueTypes: ["GET /orgs/{org}/issue-types"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOrgRoleTeams: ["GET /orgs/{org}/organization-roles/{role_id}/teams"],
    listOrgRoleUsers: ["GET /orgs/{org}/organization-roles/{role_id}/users"],
    listOrgRoles: ["GET /orgs/{org}/organization-roles"],
    listOrganizationFineGrainedPermissions: [
      "GET /orgs/{org}/organization-fine-grained-permissions"
    ],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPatGrantRepositories: [
      "GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"
    ],
    listPatGrantRequestRepositories: [
      "GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories"
    ],
    listPatGrantRequests: ["GET /orgs/{org}/personal-access-token-requests"],
    listPatGrants: ["GET /orgs/{org}/personal-access-tokens"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listSecurityManagerTeams: [
      "GET /orgs/{org}/security-managers",
      {},
      {
        deprecated: "octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams"
      }
    ],
    listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeCustomProperty: [
      "DELETE /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: [
      "DELETE /orgs/{org}/outside_collaborators/{username}"
    ],
    removePublicMembershipForAuthenticatedUser: [
      "DELETE /orgs/{org}/public_members/{username}"
    ],
    removeSecurityManagerTeam: [
      "DELETE /orgs/{org}/security-managers/teams/{team_slug}",
      {},
      {
        deprecated: "octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team"
      }
    ],
    reviewPatGrantRequest: [
      "POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"
    ],
    reviewPatGrantRequestsInBulk: [
      "POST /orgs/{org}/personal-access-token-requests"
    ],
    revokeAllOrgRolesTeam: [
      "DELETE /orgs/{org}/organization-roles/teams/{team_slug}"
    ],
    revokeAllOrgRolesUser: [
      "DELETE /orgs/{org}/organization-roles/users/{username}"
    ],
    revokeOrgRoleTeam: [
      "DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"
    ],
    revokeOrgRoleUser: [
      "DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"
    ],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: [
      "PUT /orgs/{org}/public_members/{username}"
    ],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateIssueType: ["PUT /orgs/{org}/issue-types/{issue_type_id}"],
    updateMembershipForAuthenticatedUser: [
      "PATCH /user/memberships/orgs/{org}"
    ],
    updatePatAccess: ["POST /orgs/{org}/personal-access-tokens/{pat_id}"],
    updatePatAccesses: ["POST /orgs/{org}/personal-access-tokens"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
    updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
  },
  packages: {
    deletePackageForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}"
    ],
    deletePackageForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    deletePackageForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}"
    ],
    deletePackageVersionForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getAllPackageVersionsForAPackageOwnedByAnOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
      {},
      { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] }
    ],
    getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions",
      {},
      {
        renamed: [
          "packages",
          "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"
        ]
      }
    ],
    getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions"
    ],
    getPackageForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}"
    ],
    getPackageForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    getPackageForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}"
    ],
    getPackageVersionForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    listDockerMigrationConflictingPackagesForAuthenticatedUser: [
      "GET /user/docker/conflicts"
    ],
    listDockerMigrationConflictingPackagesForOrganization: [
      "GET /orgs/{org}/docker/conflicts"
    ],
    listDockerMigrationConflictingPackagesForUser: [
      "GET /users/{username}/docker/conflicts"
    ],
    listPackagesForAuthenticatedUser: ["GET /user/packages"],
    listPackagesForOrganization: ["GET /orgs/{org}/packages"],
    listPackagesForUser: ["GET /users/{username}/packages"],
    restorePackageForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageVersionForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ]
  },
  privateRegistries: {
    createOrgPrivateRegistry: ["POST /orgs/{org}/private-registries"],
    deleteOrgPrivateRegistry: [
      "DELETE /orgs/{org}/private-registries/{secret_name}"
    ],
    getOrgPrivateRegistry: ["GET /orgs/{org}/private-registries/{secret_name}"],
    getOrgPublicKey: ["GET /orgs/{org}/private-registries/public-key"],
    listOrgPrivateRegistries: ["GET /orgs/{org}/private-registries"],
    updateOrgPrivateRegistry: [
      "PATCH /orgs/{org}/private-registries/{secret_name}"
    ]
  },
  projects: {
    addCollaborator: [
      "PUT /projects/{project_id}/collaborators/{username}",
      {},
      {
        deprecated: "octokit.rest.projects.addCollaborator() is deprecated, see https://docs.github.com/rest/projects/collaborators#add-project-collaborator"
      }
    ],
    createCard: [
      "POST /projects/columns/{column_id}/cards",
      {},
      {
        deprecated: "octokit.rest.projects.createCard() is deprecated, see https://docs.github.com/rest/projects/cards#create-a-project-card"
      }
    ],
    createColumn: [
      "POST /projects/{project_id}/columns",
      {},
      {
        deprecated: "octokit.rest.projects.createColumn() is deprecated, see https://docs.github.com/rest/projects/columns#create-a-project-column"
      }
    ],
    createForAuthenticatedUser: [
      "POST /user/projects",
      {},
      {
        deprecated: "octokit.rest.projects.createForAuthenticatedUser() is deprecated, see https://docs.github.com/rest/projects/projects#create-a-user-project"
      }
    ],
    createForOrg: [
      "POST /orgs/{org}/projects",
      {},
      {
        deprecated: "octokit.rest.projects.createForOrg() is deprecated, see https://docs.github.com/rest/projects/projects#create-an-organization-project"
      }
    ],
    createForRepo: [
      "POST /repos/{owner}/{repo}/projects",
      {},
      {
        deprecated: "octokit.rest.projects.createForRepo() is deprecated, see https://docs.github.com/rest/projects/projects#create-a-repository-project"
      }
    ],
    delete: [
      "DELETE /projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.projects.delete() is deprecated, see https://docs.github.com/rest/projects/projects#delete-a-project"
      }
    ],
    deleteCard: [
      "DELETE /projects/columns/cards/{card_id}",
      {},
      {
        deprecated: "octokit.rest.projects.deleteCard() is deprecated, see https://docs.github.com/rest/projects/cards#delete-a-project-card"
      }
    ],
    deleteColumn: [
      "DELETE /projects/columns/{column_id}",
      {},
      {
        deprecated: "octokit.rest.projects.deleteColumn() is deprecated, see https://docs.github.com/rest/projects/columns#delete-a-project-column"
      }
    ],
    get: [
      "GET /projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.projects.get() is deprecated, see https://docs.github.com/rest/projects/projects#get-a-project"
      }
    ],
    getCard: [
      "GET /projects/columns/cards/{card_id}",
      {},
      {
        deprecated: "octokit.rest.projects.getCard() is deprecated, see https://docs.github.com/rest/projects/cards#get-a-project-card"
      }
    ],
    getColumn: [
      "GET /projects/columns/{column_id}",
      {},
      {
        deprecated: "octokit.rest.projects.getColumn() is deprecated, see https://docs.github.com/rest/projects/columns#get-a-project-column"
      }
    ],
    getPermissionForUser: [
      "GET /projects/{project_id}/collaborators/{username}/permission",
      {},
      {
        deprecated: "octokit.rest.projects.getPermissionForUser() is deprecated, see https://docs.github.com/rest/projects/collaborators#get-project-permission-for-a-user"
      }
    ],
    listCards: [
      "GET /projects/columns/{column_id}/cards",
      {},
      {
        deprecated: "octokit.rest.projects.listCards() is deprecated, see https://docs.github.com/rest/projects/cards#list-project-cards"
      }
    ],
    listCollaborators: [
      "GET /projects/{project_id}/collaborators",
      {},
      {
        deprecated: "octokit.rest.projects.listCollaborators() is deprecated, see https://docs.github.com/rest/projects/collaborators#list-project-collaborators"
      }
    ],
    listColumns: [
      "GET /projects/{project_id}/columns",
      {},
      {
        deprecated: "octokit.rest.projects.listColumns() is deprecated, see https://docs.github.com/rest/projects/columns#list-project-columns"
      }
    ],
    listForOrg: [
      "GET /orgs/{org}/projects",
      {},
      {
        deprecated: "octokit.rest.projects.listForOrg() is deprecated, see https://docs.github.com/rest/projects/projects#list-organization-projects"
      }
    ],
    listForRepo: [
      "GET /repos/{owner}/{repo}/projects",
      {},
      {
        deprecated: "octokit.rest.projects.listForRepo() is deprecated, see https://docs.github.com/rest/projects/projects#list-repository-projects"
      }
    ],
    listForUser: [
      "GET /users/{username}/projects",
      {},
      {
        deprecated: "octokit.rest.projects.listForUser() is deprecated, see https://docs.github.com/rest/projects/projects#list-user-projects"
      }
    ],
    moveCard: [
      "POST /projects/columns/cards/{card_id}/moves",
      {},
      {
        deprecated: "octokit.rest.projects.moveCard() is deprecated, see https://docs.github.com/rest/projects/cards#move-a-project-card"
      }
    ],
    moveColumn: [
      "POST /projects/columns/{column_id}/moves",
      {},
      {
        deprecated: "octokit.rest.projects.moveColumn() is deprecated, see https://docs.github.com/rest/projects/columns#move-a-project-column"
      }
    ],
    removeCollaborator: [
      "DELETE /projects/{project_id}/collaborators/{username}",
      {},
      {
        deprecated: "octokit.rest.projects.removeCollaborator() is deprecated, see https://docs.github.com/rest/projects/collaborators#remove-user-as-a-collaborator"
      }
    ],
    update: [
      "PATCH /projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.projects.update() is deprecated, see https://docs.github.com/rest/projects/projects#update-a-project"
      }
    ],
    updateCard: [
      "PATCH /projects/columns/cards/{card_id}",
      {},
      {
        deprecated: "octokit.rest.projects.updateCard() is deprecated, see https://docs.github.com/rest/projects/cards#update-an-existing-project-card"
      }
    ],
    updateColumn: [
      "PATCH /projects/columns/{column_id}",
      {},
      {
        deprecated: "octokit.rest.projects.updateColumn() is deprecated, see https://docs.github.com/rest/projects/columns#update-an-existing-project-column"
      }
    ]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"
    ],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    deletePendingReview: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    deleteReviewComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ],
    dismissReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"
    ],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    listReviewComments: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    requestReviewers: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    submitReview: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"
    ],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"
    ],
    updateReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    updateReviewComment: [
      "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ]
  },
  rateLimit: { get: ["GET /rate_limit"] },
  reactions: {
    createForCommitComment: [
      "POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    createForIssue: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"
    ],
    createForIssueComment: [
      "POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    createForPullRequestReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    createForRelease: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    createForTeamDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    createForTeamDiscussionInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ],
    deleteForCommitComment: [
      "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForIssue: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"
    ],
    deleteForIssueComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForPullRequestComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForRelease: [
      "DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussion: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussionComment: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"
    ],
    listForCommitComment: [
      "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
    listForIssueComment: [
      "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    listForPullRequestReviewComment: [
      "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    listForRelease: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    listForTeamDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    listForTeamDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ]
  },
  repos: {
    acceptInvitation: [
      "PATCH /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "acceptInvitationForAuthenticatedUser"] }
    ],
    acceptInvitationForAuthenticatedUser: [
      "PATCH /user/repository_invitations/{invitation_id}"
    ],
    addAppAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    addTeamAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    addUserAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    cancelPagesDeployment: [
      "POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel"
    ],
    checkAutomatedSecurityFixes: [
      "GET /repos/{owner}/{repo}/automated-security-fixes"
    ],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkPrivateVulnerabilityReporting: [
      "GET /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    checkVulnerabilityAlerts: [
      "GET /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    compareCommitsWithBasehead: [
      "GET /repos/{owner}/{repo}/compare/{basehead}"
    ],
    createAttestation: ["POST /repos/{owner}/{repo}/attestations"],
    createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
    createCommitComment: [
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    createCommitSignatureProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentBranchPolicy: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"
    ],
    createDeploymentProtectionRule: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"
    ],
    createDeploymentStatus: [
      "POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateCustomPropertiesValues: [
      "PATCH /repos/{owner}/{repo}/properties/values"
    ],
    createOrUpdateEnvironment: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createOrgRuleset: ["POST /orgs/{org}/rulesets"],
    createPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createRepoRuleset: ["POST /repos/{owner}/{repo}/rulesets"],
    createUsingTemplate: [
      "POST /repos/{template_owner}/{template_repo}/generate"
    ],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: [
      "DELETE /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "declineInvitationForAuthenticatedUser"] }
    ],
    declineInvitationForAuthenticatedUser: [
      "DELETE /user/repository_invitations/{invitation_id}"
    ],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    deleteAdminBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    deleteAnEnvironment: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    deleteBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: [
      "DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"
    ],
    deleteDeploymentBranchPolicy: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: [
      "DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    deleteOrgRuleset: ["DELETE /orgs/{org}/rulesets/{ruleset_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
    deletePullRequestReviewProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: [
      "DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    deleteRepoRuleset: ["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: [
      "DELETE /repos/{owner}/{repo}/automated-security-fixes"
    ],
    disableDeploymentProtectionRule: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"
    ],
    disablePrivateVulnerabilityReporting: [
      "DELETE /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    disableVulnerabilityAlerts: [
      "DELETE /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    downloadArchive: [
      "GET /repos/{owner}/{repo}/zipball/{ref}",
      {},
      { renamed: ["repos", "downloadZipballArchive"] }
    ],
    downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
    downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
    enableAutomatedSecurityFixes: [
      "PUT /repos/{owner}/{repo}/automated-security-fixes"
    ],
    enablePrivateVulnerabilityReporting: [
      "PUT /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    enableVulnerabilityAlerts: [
      "PUT /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    generateReleaseNotes: [
      "POST /repos/{owner}/{repo}/releases/generate-notes"
    ],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    getAdminBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    getAllDeploymentProtectionRules: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"
    ],
    getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
    getAllStatusCheckContexts: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"
    ],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
    getAppsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"
    ],
    getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    getBranchRules: ["GET /repos/{owner}/{repo}/rules/branches/{branch}"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: [
      "GET /repos/{owner}/{repo}/collaborators/{username}/permission"
    ],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getCustomDeploymentProtectionRule: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"
    ],
    getCustomPropertiesValues: ["GET /repos/{owner}/{repo}/properties/values"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentBranchPolicy: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    getDeploymentStatus: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"
    ],
    getEnvironment: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getOrgRuleSuite: ["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],
    getOrgRuleSuites: ["GET /orgs/{org}/rulesets/rule-suites"],
    getOrgRuleset: ["GET /orgs/{org}/rulesets/{ruleset_id}"],
    getOrgRulesets: ["GET /orgs/{org}/rulesets"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getPagesDeployment: [
      "GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"
    ],
    getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getRepoRuleSuite: [
      "GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"
    ],
    getRepoRuleSuites: ["GET /repos/{owner}/{repo}/rulesets/rule-suites"],
    getRepoRuleset: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    getRepoRulesetHistory: [
      "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history"
    ],
    getRepoRulesetVersion: [
      "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}"
    ],
    getRepoRulesets: ["GET /repos/{owner}/{repo}/rulesets"],
    getStatusChecksProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    getTeamsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"
    ],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"
    ],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    getWebhookConfigForRepo: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    getWebhookDelivery: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    listActivities: ["GET /repos/{owner}/{repo}/activity"],
    listAttestations: [
      "GET /repos/{owner}/{repo}/attestations/{subject_digest}"
    ],
    listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"
    ],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: [
      "GET /repos/{owner}/{repo}/commits/{ref}/statuses"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listCustomDeploymentRuleIntegrations: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps"
    ],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentBranchPolicies: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"
    ],
    listDeploymentStatuses: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"
    ],
    listReleaseAssets: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets"
    ],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhookDeliveries: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"
    ],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeAppAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    removeCollaborator: [
      "DELETE /repos/{owner}/{repo}/collaborators/{username}"
    ],
    removeStatusCheckContexts: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    removeStatusCheckProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    removeTeamAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    removeUserAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    setAppAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    setStatusCheckContexts: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    setTeamAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    setUserAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateDeploymentBranchPolicy: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: [
      "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    updateOrgRuleset: ["PUT /orgs/{org}/rulesets/{ruleset_id}"],
    updatePullRequestReviewProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: [
      "PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    updateRepoRuleset: ["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    updateStatusCheckPotection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      {},
      { renamed: ["repos", "updateStatusCheckProtection"] }
    ],
    updateStatusCheckProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    updateWebhookConfigForRepo: [
      "PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    uploadReleaseAsset: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
      { baseUrl: "https://uploads.github.com" }
    ]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits"],
    issuesAndPullRequests: [
      "GET /search/issues",
      {},
      {
        deprecated: "octokit.rest.search.issuesAndPullRequests() is deprecated, see https://docs.github.com/rest/search/search#search-issues-and-pull-requests"
      }
    ],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics"],
    users: ["GET /search/users"]
  },
  secretScanning: {
    createPushProtectionBypass: [
      "POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses"
    ],
    getAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ],
    getScanHistory: ["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],
    listAlertsForEnterprise: [
      "GET /enterprises/{enterprise}/secret-scanning/alerts"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
    listLocationsForAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ]
  },
  securityAdvisories: {
    createFork: [
      "POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"
    ],
    createPrivateVulnerabilityReport: [
      "POST /repos/{owner}/{repo}/security-advisories/reports"
    ],
    createRepositoryAdvisory: [
      "POST /repos/{owner}/{repo}/security-advisories"
    ],
    createRepositoryAdvisoryCveRequest: [
      "POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve"
    ],
    getGlobalAdvisory: ["GET /advisories/{ghsa_id}"],
    getRepositoryAdvisory: [
      "GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"
    ],
    listGlobalAdvisories: ["GET /advisories"],
    listOrgRepositoryAdvisories: ["GET /orgs/{org}/security-advisories"],
    listRepositoryAdvisories: ["GET /repos/{owner}/{repo}/security-advisories"],
    updateRepositoryAdvisory: [
      "PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"
    ]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    addOrUpdateProjectPermissionsInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.addOrUpdateProjectPermissionsInOrg() is deprecated, see https://docs.github.com/rest/teams/teams#add-or-update-team-project-permissions"
      }
    ],
    addOrUpdateProjectPermissionsLegacy: [
      "PUT /teams/{team_id}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.addOrUpdateProjectPermissionsLegacy() is deprecated, see https://docs.github.com/rest/teams/teams#add-or-update-team-project-permissions-legacy"
      }
    ],
    addOrUpdateRepoPermissionsInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    checkPermissionsForProjectInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.checkPermissionsForProjectInOrg() is deprecated, see https://docs.github.com/rest/teams/teams#check-team-permissions-for-a-project"
      }
    ],
    checkPermissionsForProjectLegacy: [
      "GET /teams/{team_id}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.checkPermissionsForProjectLegacy() is deprecated, see https://docs.github.com/rest/teams/teams#check-team-permissions-for-a-project-legacy"
      }
    ],
    checkPermissionsForRepoInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    deleteDiscussionInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    getDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    getMembershipForUserInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/invitations"
    ],
    listProjectsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/projects",
      {},
      {
        deprecated: "octokit.rest.teams.listProjectsInOrg() is deprecated, see https://docs.github.com/rest/teams/teams#list-team-projects"
      }
    ],
    listProjectsLegacy: [
      "GET /teams/{team_id}/projects",
      {},
      {
        deprecated: "octokit.rest.teams.listProjectsLegacy() is deprecated, see https://docs.github.com/rest/teams/teams#list-team-projects-legacy"
      }
    ],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    removeProjectInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.removeProjectInOrg() is deprecated, see https://docs.github.com/rest/teams/teams#remove-a-project-from-a-team"
      }
    ],
    removeProjectLegacy: [
      "DELETE /teams/{team_id}/projects/{project_id}",
      {},
      {
        deprecated: "octokit.rest.teams.removeProjectLegacy() is deprecated, see https://docs.github.com/rest/teams/teams#remove-a-project-from-a-team-legacy"
      }
    ],
    removeRepoInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    updateDiscussionCommentInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    updateDiscussionInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: [
      "POST /user/emails",
      {},
      { renamed: ["users", "addEmailForAuthenticatedUser"] }
    ],
    addEmailForAuthenticatedUser: ["POST /user/emails"],
    addSocialAccountForAuthenticatedUser: ["POST /user/social_accounts"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: [
      "POST /user/gpg_keys",
      {},
      { renamed: ["users", "createGpgKeyForAuthenticatedUser"] }
    ],
    createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: [
      "POST /user/keys",
      {},
      { renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] }
    ],
    createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
    createSshSigningKeyForAuthenticatedUser: ["POST /user/ssh_signing_keys"],
    deleteEmailForAuthenticated: [
      "DELETE /user/emails",
      {},
      { renamed: ["users", "deleteEmailForAuthenticatedUser"] }
    ],
    deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: [
      "DELETE /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] }
    ],
    deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: [
      "DELETE /user/keys/{key_id}",
      {},
      { renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] }
    ],
    deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
    deleteSocialAccountForAuthenticatedUser: ["DELETE /user/social_accounts"],
    deleteSshSigningKeyForAuthenticatedUser: [
      "DELETE /user/ssh_signing_keys/{ssh_signing_key_id}"
    ],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getById: ["GET /user/{account_id}"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: [
      "GET /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "getGpgKeyForAuthenticatedUser"] }
    ],
    getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: [
      "GET /user/keys/{key_id}",
      {},
      { renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] }
    ],
    getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
    getSshSigningKeyForAuthenticatedUser: [
      "GET /user/ssh_signing_keys/{ssh_signing_key_id}"
    ],
    list: ["GET /users"],
    listAttestations: ["GET /users/{username}/attestations/{subject_digest}"],
    listBlockedByAuthenticated: [
      "GET /user/blocks",
      {},
      { renamed: ["users", "listBlockedByAuthenticatedUser"] }
    ],
    listBlockedByAuthenticatedUser: ["GET /user/blocks"],
    listEmailsForAuthenticated: [
      "GET /user/emails",
      {},
      { renamed: ["users", "listEmailsForAuthenticatedUser"] }
    ],
    listEmailsForAuthenticatedUser: ["GET /user/emails"],
    listFollowedByAuthenticated: [
      "GET /user/following",
      {},
      { renamed: ["users", "listFollowedByAuthenticatedUser"] }
    ],
    listFollowedByAuthenticatedUser: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: [
      "GET /user/gpg_keys",
      {},
      { renamed: ["users", "listGpgKeysForAuthenticatedUser"] }
    ],
    listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: [
      "GET /user/public_emails",
      {},
      { renamed: ["users", "listPublicEmailsForAuthenticatedUser"] }
    ],
    listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: [
      "GET /user/keys",
      {},
      { renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] }
    ],
    listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
    listSocialAccountsForAuthenticatedUser: ["GET /user/social_accounts"],
    listSocialAccountsForUser: ["GET /users/{username}/social_accounts"],
    listSshSigningKeysForAuthenticatedUser: ["GET /user/ssh_signing_keys"],
    listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
    setPrimaryEmailVisibilityForAuthenticated: [
      "PATCH /user/email/visibility",
      {},
      { renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] }
    ],
    setPrimaryEmailVisibilityForAuthenticatedUser: [
      "PATCH /user/email/visibility"
    ],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};
var endpoints_default = Endpoints;

const endpointMethodsMap = /* @__PURE__ */ new Map();
for (const [scope, endpoints] of Object.entries(endpoints_default)) {
  for (const [methodName, endpoint] of Object.entries(endpoints)) {
    const [route, defaults, decorations] = endpoint;
    const [method, url] = route.split(/ /);
    const endpointDefaults = Object.assign(
      {
        method,
        url
      },
      defaults
    );
    if (!endpointMethodsMap.has(scope)) {
      endpointMethodsMap.set(scope, /* @__PURE__ */ new Map());
    }
    endpointMethodsMap.get(scope).set(methodName, {
      scope,
      methodName,
      endpointDefaults,
      decorations
    });
  }
}
const handler = {
  has({ scope }, methodName) {
    return endpointMethodsMap.get(scope).has(methodName);
  },
  getOwnPropertyDescriptor(target, methodName) {
    return {
      value: this.get(target, methodName),
      // ensures method is in the cache
      configurable: true,
      writable: true,
      enumerable: true
    };
  },
  defineProperty(target, methodName, descriptor) {
    Object.defineProperty(target.cache, methodName, descriptor);
    return true;
  },
  deleteProperty(target, methodName) {
    delete target.cache[methodName];
    return true;
  },
  ownKeys({ scope }) {
    return [...endpointMethodsMap.get(scope).keys()];
  },
  set(target, methodName, value) {
    return target.cache[methodName] = value;
  },
  get({ octokit, scope, cache }, methodName) {
    if (cache[methodName]) {
      return cache[methodName];
    }
    const method = endpointMethodsMap.get(scope).get(methodName);
    if (!method) {
      return void 0;
    }
    const { endpointDefaults, decorations } = method;
    if (decorations) {
      cache[methodName] = decorate(
        octokit,
        scope,
        methodName,
        endpointDefaults,
        decorations
      );
    } else {
      cache[methodName] = octokit.request.defaults(endpointDefaults);
    }
    return cache[methodName];
  }
};
function endpointsToMethods(octokit) {
  const newMethods = {};
  for (const scope of endpointMethodsMap.keys()) {
    newMethods[scope] = new Proxy({ octokit, scope, cache: {} }, handler);
  }
  return newMethods;
}
function decorate(octokit, scope, methodName, defaults, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults);
  function withDecorations(...args) {
    let options = requestWithDefaults.endpoint.merge(...args);
    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: void 0
      });
      return requestWithDefaults(options);
    }
    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(
        `octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`
      );
    }
    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }
    if (decorations.renamedParameters) {
      const options2 = requestWithDefaults.endpoint.merge(...args);
      for (const [name, alias] of Object.entries(
        decorations.renamedParameters
      )) {
        if (name in options2) {
          octokit.log.warn(
            `"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`
          );
          if (!(alias in options2)) {
            options2[alias] = options2[name];
          }
          delete options2[name];
        }
      }
      return requestWithDefaults(options2);
    }
    return requestWithDefaults(...args);
  }
  return Object.assign(withDecorations, requestWithDefaults);
}

function legacyRestEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit);
  return {
    ...api,
    rest: api
  };
}
legacyRestEndpointMethods.VERSION = VERSION$1;

const VERSION = "21.1.1";

const Octokit = Octokit$1.plugin(requestLog, legacyRestEndpointMethods, paginateRest).defaults(
  {
    userAgent: `octokit-rest.js/${VERSION}`
  }
);

function parseResults(data, existing_issues) {
    /**
     * Parses Trivy result structure and creates a report per package/version that
     * was found. Return null if no Results found, ie. nothing to parse.
     *
     * @param data The report data that was parsed from JSON file.
     * @param existing_issues List of GitHub issues, used to exclude already reported issues.
     */
    try {
        const results = data.Results;
        if (!Array.isArray(results)) {
            throw new TypeError(`The JSON entry .Results is not a list, got: ${typeof results}`);
        }
        const reports = {};
        // Create a Set of existing issue identifiers for efficient lookup
        const existingIssueSet = new Set();
        for (const issue of existing_issues) {
            existingIssueSet.add(issue.toLowerCase()); // Normalize here
        }
        for (let idx = 0; idx < results.length; idx++) {
            const result = results[idx];
            if (typeof result !== "object" ||
                result === null ||
                Array.isArray(result)) {
                throw new TypeError(`The JSON entry .Results[${idx}] is not a dictionary, got: ${typeof result}`);
            }
            if (!("Vulnerabilities" in result)) {
                continue;
            }
            const package_type = result["Type"];
            const vulnerabilities = result["Vulnerabilities"];
            if (!Array.isArray(vulnerabilities)) {
                throw new TypeError(`The JSON entry .Results[${idx}].Vulnerabilities is not a list, got: ${typeof vulnerabilities}`);
            }
            for (const vulnerability of vulnerabilities) {
                const package_name = vulnerability["PkgName"];
                const package_version = vulnerability["InstalledVersion"];
                const package_fixed_version = vulnerability["FixedVersion"];
                const pkg = `${package_name}-${package_version}`;
                const report_id = `${pkg}`;
                const issueIdentifier = `${package_name.toLowerCase()} ${package_version.toLowerCase()}`; // Normalize here
                if (existingIssueSet.has(issueIdentifier)) {
                    continue;
                }
                const lookup_id = `${package_type}:${report_id}`;
                let report = reports[lookup_id];
                if (!report) {
                    report = {
                        id: report_id,
                        package: pkg,
                        package_name: package_name,
                        package_version: package_version,
                        package_fixed_version: package_fixed_version,
                        package_type: package_type,
                        target: result["Target"],
                        vulnerabilities: [vulnerability],
                    };
                    reports[lookup_id] = report;
                }
                else {
                    report.vulnerabilities.push(vulnerability);
                }
            }
        }
        return Object.values(reports);
    }
    catch (e) {
        console.error("Error during parse_results:", e);
        return null;
    }
}
function generateIssues(reports) {
    /**
     * Iterates all reports and renders them into GitHub issues.
     */
    const issues = [];
    for (const report of reports) {
        const issue_title = `Security Alert: ${report.package_type} package ${report.package}`;
        let issue_body = `# Vulnerabilities found for ${report.package_type} package \`${report.package}\` in \`${report.target}\`\n\n`;
        issue_body += `## Fixed in version\n**${report.package_fixed_version || "No known fix at this time"}**\n\n`;
        for (let vulnerability_idx = 0; vulnerability_idx < report.vulnerabilities.length; vulnerability_idx++) {
            const vulnerability = report.vulnerabilities[vulnerability_idx];
            const reference_items = vulnerability.References.map((reference) => `- ${reference}`).join("\n");
            issue_body += `## \`${vulnerability.VulnerabilityID}\` - ${vulnerability.Title}\n\n${vulnerability.Description}\n\n### Severity\n**${vulnerability.Severity}**\n\n### Primary URL\n${vulnerability.PrimaryURL}\n\n### References\n${reference_items}\n\n`;
        }
        issues.push({
            id: report.id,
            report: report,
            title: issue_title,
            body: issue_body,
        });
    }
    return issues;
}
// Example Usage (for testing):
/*
const data: ReportDict = {
  Results: [
    {
      Type: "npm",
      Target: "package.json",
      Vulnerabilities: [
        {
          PkgName: "lodash",
          InstalledVersion: "4.17.21",
          FixedVersion: "4.17.22",
          VulnerabilityID: "CVE-2021-1234",
          Title: "Prototype Pollution",
          Description: "Lodash is vulnerable to prototype pollution.",
          Severity: "High",
          PrimaryURL: "https://example.com/cve/CVE-2021-1234",
          References: ["https://example.com/reference1", "https://example.com/reference2"],
        },
      ],
    },
  ],
};

const existing_issues: string[] = [];

const reports = parse_results(data, existing_issues);

if (reports) {
    const issues = generate_issues(reports);
    console.log(issues);
}
*/

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

var once$1 = {exports: {}};

var wrappy_1;
var hasRequiredWrappy;

function requireWrappy () {
	if (hasRequiredWrappy) return wrappy_1;
	hasRequiredWrappy = 1;
	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	wrappy_1 = wrappy;
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)

	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')

	  Object.keys(fn).forEach(function (k) {
	    wrapper[k] = fn[k];
	  });

	  return wrapper

	  function wrapper() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    var ret = fn.apply(this, args);
	    var cb = args[args.length-1];
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(function (k) {
	        ret[k] = cb[k];
	      });
	    }
	    return ret
	  }
	}
	return wrappy_1;
}

var hasRequiredOnce;

function requireOnce () {
	if (hasRequiredOnce) return once$1.exports;
	hasRequiredOnce = 1;
	var wrappy = requireWrappy();
	once$1.exports = wrappy(once);
	once$1.exports.strict = wrappy(onceStrict);

	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  });

	  Object.defineProperty(Function.prototype, 'onceStrict', {
	    value: function () {
	      return onceStrict(this)
	    },
	    configurable: true
	  });
	});

	function once (fn) {
	  var f = function () {
	    if (f.called) return f.value
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  f.called = false;
	  return f
	}

	function onceStrict (fn) {
	  var f = function () {
	    if (f.called)
	      throw new Error(f.onceError)
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  var name = fn.name || 'Function wrapped with `once`';
	  f.onceError = name + " shouldn't be called more than once";
	  f.called = false;
	  return f
	}
	return once$1.exports;
}

var onceExports = requireOnce();
var once = /*@__PURE__*/getDefaultExportFromCjs(onceExports);

const logOnceCode = once((deprecation) => console.warn(deprecation));
const logOnceHeaders = once((deprecation) => console.warn(deprecation));
class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = "HttpError";
    this.status = statusCode;
    let headers;
    if ("headers" in options && typeof options.headers !== "undefined") {
      headers = options.headers;
    }
    if ("response" in options) {
      this.response = options.response;
      headers = options.response.headers;
    }
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          /(?<! ) .*$/,
          " [REDACTED]"
        )
      });
    }
    requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
    Object.defineProperty(this, "code", {
      get() {
        logOnceCode(
          new Deprecation(
            "[@octokit/request-error] `error.code` is deprecated, use `error.status`."
          )
        );
        return statusCode;
      }
    });
    Object.defineProperty(this, "headers", {
      get() {
        logOnceHeaders(
          new Deprecation(
            "[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."
          )
        );
        return headers || {};
      }
    });
  }
}

// ... (interfaces and types)
async function fetchExistingIssues(octokit, owner, repo, label) {
    try {
        const response = await octokit.issues.listForRepo({
            owner,
            repo,
            labels: label,
            state: "all",
        });
        return response.data.map((issue) => issue.title);
    }
    catch (error) {
        throw new Error(`Failed to fetch issues: ${error}`);
    }
}
async function createGitHubIssue(octokit, owner, repo, issue, label, assignees) {
    try {
        await octokit.issues.create({
            owner,
            repo,
            title: issue.title,
            body: issue.body,
            labels: [label],
            assignees: assignees,
        });
        console.log(`Created GitHub issue: ${issue.title}`);
    }
    catch (error) {
        throw new Error(`Failed to create issue: ${error}`);
    }
}
async function createLabelIfMissing(octokit, owner, repo, label) {
    try {
        await octokit.rest.issues.getLabel({
            owner: owner,
            repo: repo,
            name: label,
        });
        console.log(`Label "${label}" already exists.`);
    }
    catch (error) {
        if (error instanceof RequestError) {
            // Use RequestError (or the appropriate Octokit error type)
            if (error.status === 404) {
                console.log(`Label "${label}" does not exist. Creating it...`);
                await octokit.rest.issues.createLabel({
                    owner: owner,
                    repo: repo,
                    name: label,
                });
                console.log(`Label "${label}" created successfully.`);
            }
            else {
                throw new Error(`Error checking or creating label "${label}": ${error.message}`);
            }
        }
        else if (error instanceof Error) {
            // Handle other standard JavaScript errors
            throw new Error(`Error checking or creating label "${label}": ${error.message}`);
        }
        else {
            // Handle cases where error is not an Error instance
            throw new Error(`Error checking or creating label "${label}": An unknown error occurred.`);
        }
    }
}
function abort(message, error) {
    console.error(`Error: ${message}`);
    if (error) {
        console.error(error); // Optionally log the error object itself
    }
    process$1.exit(1);
}
async function main() {
    const parser = new argparseExports.ArgumentParser({
        description: "Parses Trivy JSON report files and reports new vulnerabilities as GitHub issues. Existing issues are read from the repository $GITHUB_REPOSITORY and used to exclude reported issues.",
    });
    parser.add_argument("file");
    const args = parser.parse_args();
    const filename = args.file;
    // GitHub Action inputs are accessed via process.env
    const githubRepo = process$1.env.GITHUB_REPOSITORY;
    const githubToken = process$1.env.INPUT_TOKEN; // Corrected: INPUT_token
    const inputLabel = process$1.env.INPUT_LABEL;
    const assignee = process$1.env.INPUT_ASSIGNEE;
    const createLabel = process$1.env.INPUT_CREATE_LABEL === "true"; // Convert to boolean
    if (!githubRepo || !githubToken || !inputLabel) {
        abort("Environment variables GITHUB_REPOSITORY, GITHUB_TOKEN, and INPUT_LABEL must be set.");
        return;
    }
    const [owner, repo] = githubRepo.split("/");
    if (!owner || !repo) {
        abort("Invalid GITHUB_REPOSITORY format. Expected 'owner/repo'.");
        return;
    }
    // Add validation for TOKEN (example: check length or prefix)
    if (githubToken.length < 4) {
        abort("Invalid GITHUB_TOKEN format. Token is too short.");
        return;
    }
    // Example: Check if INPUT_CREATE_LABEL is a valid boolean string
    if (process$1.env.INPUT_CREATE_LABEL &&
        !["true", "false"].includes(process$1.env.INPUT_CREATE_LABEL.toLowerCase())) {
        abort("Invalid INPUT_CREATE_LABEL value.  Must be 'true' or 'false'.");
        return;
    }
    const octokit = new Octokit({ auth: githubToken });
    const assignees = assignee ? [assignee] : [];
    try {
        if (createLabel) {
            await createLabelIfMissing(octokit, owner, repo, inputLabel);
        }
        const fileContent = await fs.readFile(filename, "utf-8");
        const data = JSON.parse(fileContent); // Data is now defined here.
        const existingIssues = await fetchExistingIssues(octokit, owner, repo, inputLabel);
        const reports = parseResults(data, existingIssues);
        if (reports === null) {
            console.log("No reports to create issues for");
            return;
        }
        const issues = generateIssues(reports);
        for (const issue of issues) {
            await createGitHubIssue(octokit, owner, repo, issue, inputLabel, assignees);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            abort(`Error: ${error.message}`, error);
        }
        else {
            abort(`Error: An unknown error occurred. ${error}`);
        }
    }
}
main();
//# sourceMappingURL=index.js.map
