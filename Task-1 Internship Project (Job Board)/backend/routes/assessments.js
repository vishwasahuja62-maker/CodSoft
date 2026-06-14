const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

const questionBank = [
  // ===== JAVASCRIPT (25 questions) =====
  { id: 1, skill: 'JavaScript', question: 'What is the output of: console.log(typeof [])?', options: ['array', 'object', 'undefined', 'null'], correct: 1 },
  { id: 2, skill: 'JavaScript', question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 0 },
  { id: 3, skill: 'JavaScript', question: 'What is a closure in JavaScript?', options: ['A function with access to its outer scope', 'A closed function', 'A loop construct', 'A data type'], correct: 0 },
  { id: 4, skill: 'JavaScript', question: 'What does the "this" keyword refer to in a browser\'s global context?', options: ['window', 'document', 'global', 'undefined'], correct: 0 },
  { id: 5, skill: 'JavaScript', question: 'Which of the following is NOT a JavaScript data type?', options: ['Symbol', 'Integer', 'Boolean', 'Null'], correct: 1 },
  { id: 6, skill: 'JavaScript', question: 'What is the difference between "==" and "==="?', options: ['=== checks value and type', '== checks value and type', 'They are identical', '=== checks only type'], correct: 0 },
  { id: 7, skill: 'JavaScript', question: 'What does JSON.stringify() do?', options: ['Converts JS object to JSON string', 'Parses JSON string to object', 'Validates JSON syntax', 'Minifies JSON'], correct: 0 },
  { id: 8, skill: 'JavaScript', question: 'Which method creates a new array with elements that pass a test?', options: ['filter()', 'map()', 'reduce()', 'forEach()'], correct: 0 },
  { id: 9, skill: 'JavaScript', question: 'What is hoisting?', options: ['Moving declarations to the top of scope', 'Lifting weights', 'A CSS property', 'A DOM event'], correct: 0 },
  { id: 10, skill: 'JavaScript', question: 'Which symbol is used for strict inequality?', options: ['!==', '!=', '<>', '=/='], correct: 0 },
  { id: 11, skill: 'JavaScript', question: 'What does the spread operator (...) do?', options: ['Expands iterables into individual elements', 'Creates a spread sheet', 'Spreads CSS styles', 'Concatenates strings'], correct: 0 },
  { id: 12, skill: 'JavaScript', question: 'Which of the following is true about const?', options: ['Cannot be reassigned', 'Cannot be mutated', 'Is block-scoped only if declared with let', 'Can be redeclared'], correct: 0 },
  { id: 13, skill: 'JavaScript', question: 'What is the event loop?', options: ['Handles async callbacks in JavaScript', 'A DOM event', 'A loop for events', 'A browser API'], correct: 0 },
  { id: 14, skill: 'JavaScript', question: 'Which method is used to parse JSON?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.convert()', 'JSON.read()'], correct: 0 },
  { id: 15, skill: 'JavaScript', question: 'What does the map() method return?', options: ['A new array', 'The original array mutated', 'A boolean', 'A string'], correct: 0 },
  { id: 16, skill: 'JavaScript', question: 'What is a Promise?', options: ['An object representing eventual completion', 'A guaranteed future value', 'A callback function', 'A synchronous operation'], correct: 0 },
  { id: 17, skill: 'JavaScript', question: 'How do you declare a class in JavaScript?', options: ['class MyClass {}', 'function MyClass {}', 'class MyClass()', 'new Class MyClass {}'], correct: 0 },
  { id: 18, skill: 'JavaScript', question: 'What is destructuring?', options: ['Unpacking values from arrays or objects', 'Destroying a structure', 'A type of loop', 'A debugging tool'], correct: 0 },
  { id: 19, skill: 'JavaScript', question: 'Which keyword is used to handle asynchronous operations?', options: ['async/await', 'sync/async', 'defer/wait', 'parallel/series'], correct: 0 },
  { id: 20, skill: 'JavaScript', question: 'What does the reduce() method do?', options: ['Reduces array to a single value', 'Removes duplicates', 'Sorts the array', 'Reverses the array'], correct: 0 },
  { id: 21, skill: 'JavaScript', question: 'What is the difference between let and var?', options: ['let is block-scoped, var is function-scoped', 'var is block-scoped, let is function-scoped', 'They are identical', 'let cannot be reassigned'], correct: 0 },
  { id: 22, skill: 'JavaScript', question: 'What is NaN in JavaScript?', options: ['Not a Number', 'Null and Nil', 'Number and Null', 'Not a Node'], correct: 0 },
  { id: 23, skill: 'JavaScript', question: 'What does the bind() method do?', options: ['Creates a new function with a fixed this', 'Binds two variables', 'Attaches an event', 'Concatenates arrays'], correct: 0 },
  { id: 24, skill: 'JavaScript', question: 'What is the prototype chain?', options: ['Mechanism for inheritance in JS', 'A chain of promises', 'A sequence of function calls', 'A DOM tree'], correct: 0 },
  { id: 25, skill: 'JavaScript', question: 'Which method removes the last element from an array?', options: ['pop()', 'push()', 'shift()', 'unshift()'], correct: 0 },

  // ===== REACT (25 questions) =====
  { id: 101, skill: 'React', question: 'What hook is used for side effects in React?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correct: 0 },
  { id: 102, skill: 'React', question: 'What is the virtual DOM?', options: ['A lightweight copy of the real DOM', 'A browser API', 'A JavaScript framework', 'A database'], correct: 0 },
  { id: 103, skill: 'React', question: 'Which hook is used to manage state in functional components?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], correct: 0 },
  { id: 104, skill: 'React', question: 'What is JSX?', options: ['JavaScript XML syntax extension', 'A new programming language', 'A database query language', 'A CSS framework'], correct: 0 },
  { id: 105, skill: 'React', question: 'What does the key prop do in lists?', options: ['Helps identify changed items', 'Encrypts the component', 'Locks the component', 'Styles the list'], correct: 0 },
  { id: 106, skill: 'React', question: 'What is the purpose of useRef?', options: ['Persist values across renders without causing re-render', 'Make HTTP requests', 'Style components', 'Handle routing'], correct: 0 },
  { id: 107, skill: 'React', question: 'What is a React Fragment?', options: ['Groups elements without adding DOM nodes', 'A broken component', 'An error boundary', 'A loading state'], correct: 0 },
  { id: 108, skill: 'React', question: 'Which hook is used for memoizing values?', options: ['useMemo', 'useEffect', 'useRef', 'useState'], correct: 0 },
  { id: 109, skill: 'React', question: 'What is prop drilling?', options: ['Passing props through multiple levels', 'A drilling machine', 'Creating new props', 'Deleting props'], correct: 0 },
  { id: 110, skill: 'React', question: 'What does useContext provide?', options: ['Access to context without prop drilling', 'A way to fetch data', 'A styling solution', 'Animation utilities'], correct: 0 },
  { id: 111, skill: 'React', question: 'What is the useReducer hook for?', options: ['Complex state management with actions', 'Making API calls', 'Styling components', 'Routing'], correct: 0 },
  { id: 112, skill: 'React', question: 'What is an effect cleanup function?', options: ['Runs when component unmounts to prevent memory leaks', 'Cleans CSS', 'Clears localStorage', 'Resets state'], correct: 0 },
  { id: 113, skill: 'React', question: 'What is React.memo()?', options: ['Higher-order component for performance optimization', 'A debugging tool', 'A state manager', 'A routing library'], correct: 0 },
  { id: 114, skill: 'React', question: 'What are controlled components?', options: ['Form inputs controlled by React state', 'Components without state', 'Class components only', 'Server components'], correct: 0 },
  { id: 115, skill: 'React', question: 'What is the dependency array in useEffect?', options: ['Tells React when to re-run the effect', 'Array of packages', 'List of API endpoints', 'Component props'], correct: 0 },
  { id: 116, skill: 'React', question: 'What does useCallback do?', options: ['Returns a memoized callback function', 'Makes HTTP callbacks', 'Handles error callbacks', 'Creates call stack'], correct: 0 },
  { id: 117, skill: 'React', question: 'What is a custom hook?', options: ['A reusable function that uses React hooks', 'A built-in React hook', 'A third-party library', 'A CSS class'], correct: 0 },
  { id: 118, skill: 'React', question: 'What is the purpose of forwardRef?', options: ['Pass refs to child components', 'Forward props to parent', 'Redirect URLs', 'Forward events'], correct: 0 },
  { id: 119, skill: 'React', question: 'What is React.StrictMode?', options: ['Development tool that highlights potential problems', 'A strict type checker', 'A security feature', 'A performance optimizer'], correct: 0 },
  { id: 120, skill: 'React', question: 'How do you conditionally render in React?', options: ['Using ternary or && operators', 'Using if-else statements only', 'Using switch-case', 'Using for loops'], correct: 0 },
  { id: 121, skill: 'React', question: 'What is the children prop?', options: ['Content passed between opening and closing tags', 'A prop for child components only', 'A reserved prop for styling', 'An array of child nodes'], correct: 0 },
  { id: 122, skill: 'React', question: 'What is React.lazy() used for?', options: ['Code-splitting and lazy loading components', 'Delaying state updates', 'Lazy evaluation of expressions', 'Deferred rendering'], correct: 0 },
  { id: 123, skill: 'React', question: 'What is a higher-order component?', options: ['A function that wraps a component to enhance it', 'A component with more props', 'A parent component', 'A component with state'], correct: 0 },
  { id: 124, skill: 'React', question: 'What does Suspense component do?', options: ['Handles fallback for lazy components', 'Pauses execution', 'Suspends rendering', 'Handles errors'], correct: 0 },
  { id: 125, skill: 'React', question: 'What is the rule of hooks?', options: ['Hooks must be called at top level, not inside conditions', 'Hooks can be called anywhere', 'Hooks are optional', 'Hooks only work in classes'], correct: 0 },

  // ===== NODE.JS (25 questions) =====
  { id: 201, skill: 'Node.js', question: 'What is npm?', options: ['Node Package Manager', 'Node Process Manager', 'Network Protocol Module', 'Node Performance Monitor'], correct: 0 },
  { id: 202, skill: 'Node.js', question: 'Which module is used to create a web server in Node.js?', options: ['http', 'fs', 'path', 'url'], correct: 0 },
  { id: 203, skill: 'Node.js', question: 'What is the event loop in Node.js?', options: ['Handles async operations without blocking', 'A browser feature', 'A CSS property', 'A database engine'], correct: 0 },
  { id: 204, skill: 'Node.js', question: 'What does the fs module do?', options: ['File system operations', 'Function scheduling', 'Form validation', 'Fuzzy search'], correct: 0 },
  { id: 205, skill: 'Node.js', question: 'What is Express.js?', options: ['A web framework for Node.js', 'A database', 'A CSS framework', 'A testing library'], correct: 0 },
  { id: 206, skill: 'Node.js', question: 'What is middleware in Express?', options: ['Functions that execute during request-response cycle', 'Database layer', 'Frontend code', 'Configuration files'], correct: 0 },
  { id: 207, skill: 'Node.js', question: 'What does the path module do?', options: ['Handles file and directory paths', 'Sets environment paths', 'Creates HTTP paths', 'Manages routes'], correct: 0 },
  { id: 208, skill: 'Node.js', question: 'What is the package.json file?', options: ['Metadata and dependencies for Node projects', 'A database file', 'A log file', 'A configuration for npm registry'], correct: 0 },
  { id: 209, skill: 'Node.js', question: 'What does process.nextTick() do?', options: ['Schedules callback on next event loop iteration', 'Creates a new process', 'Sets a timer', 'Handles errors'], correct: 0 },
  { id: 210, skill: 'Node.js', question: 'What is the buffer module used for?', options: ['Handles binary data', 'Buffers HTTP requests', 'Caches data', 'Manages memory'], correct: 0 },
  { id: 211, skill: 'Node.js', question: 'What is the cluster module?', options: ['Enables multi-process Node.js applications', 'Groups database queries', 'Clusters arrays', 'Manages file groups'], correct: 0 },
  { id: 212, skill: 'Node.js', question: 'What is the stream module?', options: ['Handles streaming data efficiently', 'Streams video', 'Manages water flow', 'A logging utility'], correct: 0 },
  { id: 213, skill: 'Node.js', question: 'What does the crypto module do?', options: ['Cryptographic functions', 'Currency conversion', 'Data compression', 'Code minification'], correct: 0 },
  { id: 214, skill: 'Node.js', question: 'What is process.env?', options: ['Environment variables', 'Process execution plan', 'Node.js environment', 'File extension'], correct: 0 },
  { id: 215, skill: 'Node.js', question: 'What is the os module?', options: ['Operating system information', 'Operating system installer', 'Object store', 'Ordered set'], correct: 0 },
  { id: 216, skill: 'Node.js', question: 'What does the querystring module do?', options: ['Parses and formats URL query strings', 'Creates SQL queries', 'Manages queues', 'Executes commands'], correct: 0 },
  { id: 217, skill: 'Node.js', question: 'What is npm init used for?', options: ['Creates a new package.json file', 'Initializes a git repo', 'Starts the server', 'Installs dependencies'], correct: 0 },
  { id: 218, skill: 'Node.js', question: 'What does the assert module do?', options: ['Testing and assertion utilities', 'Asserts permissions', 'Assigns variables', 'Creates arrays'], correct: 0 },
  { id: 219, skill: 'Node.js', question: 'What is the util module?', options: ['Utility functions for Node.js', 'A UI library', 'A unit test framework', 'An update manager'], correct: 0 },
  { id: 220, skill: 'Node.js', question: 'What is the dns module?', options: ['Domain Name System resolution', 'Dynamic name service', 'Data node storage', 'Distributed network system'], correct: 0 },
  { id: 221, skill: 'Node.js', question: 'What is the net module?', options: ['TCP/IP networking utilities', 'Internet speed test', 'Network visualization', 'URL shortener'], correct: 0 },
  { id: 222, skill: 'Node.js', question: 'What does the events module provide?', options: ['EventEmitter class for event-driven architecture', 'DOM events', 'Calendar events', 'System events'], correct: 0 },
  { id: 223, skill: 'Node.js', question: 'What is the child_process module for?', options: ['Spawn child processes', 'Manage child components', 'Handle child routes', 'Process child elements'], correct: 0 },
  { id: 224, skill: 'Node.js', question: 'What is the zlib module?', options: ['Compression and decompression', 'Zero-config library', 'Zone-based library', 'Zigzag layout'], correct: 0 },
  { id: 225, skill: 'Node.js', question: 'What does module.exports do?', options: ['Exports functions/objects from a module', 'Exports data to databases', 'Creates export files', 'Generates documentation'], correct: 0 },

  // ===== PYTHON (25 questions) =====
  { id: 301, skill: 'Python', question: 'Which keyword is used to define a function in Python?', options: ['def', 'function', 'fn', 'define'], correct: 0 },
  { id: 302, skill: 'Python', question: 'What data type is mutable in Python?', options: ['list', 'tuple', 'string', 'int'], correct: 0 },
  { id: 303, skill: 'Python', question: 'How do you create a virtual environment in Python?', options: ['python -m venv env', 'python create env', 'python env create', 'python virtual env'], correct: 0 },
  { id: 304, skill: 'Python', question: 'What is PEP 8?', options: ['Python style guide', 'Python package manager', 'Python IDE', 'Python compiler'], correct: 0 },
  { id: 305, skill: 'Python', question: 'What does pip stand for?', options: ['Pip Installs Packages', 'Python Installer Program', 'Package Index for Python', 'Python Internal Process'], correct: 0 },
  { id: 306, skill: 'Python', question: 'What is a decorator in Python?', options: ['A function that modifies another function', 'A design pattern', 'A class method', 'A variable annotation'], correct: 0 },
  { id: 307, skill: 'Python', question: 'What is the difference between a list and a tuple?', options: ['List is mutable, tuple is immutable', 'Tuple is mutable, list is immutable', 'Lists are faster', 'There is no difference'], correct: 0 },
  { id: 308, skill: 'Python', question: 'What is a dictionary in Python?', options: ['Key-value pair collection', 'An ordered list', 'A set of unique items', 'A text file'], correct: 0 },
  { id: 309, skill: 'Python', question: 'What does the range() function return?', options: ['An immutable sequence of numbers', 'A list of numbers', 'An array of numbers', 'A string of numbers'], correct: 0 },
  { id: 310, skill: 'Python', question: 'What is a lambda function?', options: ['An anonymous single-expression function', 'A named function', 'A recursive function', 'A built-in function'], correct: 0 },
  { id: 311, skill: 'Python', question: 'How do you handle exceptions in Python?', options: ['try/except', 'try/catch', 'catch/throw', 'try/finally only'], correct: 0 },
  { id: 312, skill: 'Python', question: 'What is a generator in Python?', options: ['Function that yields values lazily', 'A random number generator', 'A code generator', 'A documentation tool'], correct: 0 },
  { id: 313, skill: 'Python', question: 'What does __init__ do?', options: ['Constructor method for classes', 'Initializes variables', 'Starts the program', 'Imports modules'], correct: 0 },
  { id: 314, skill: 'Python', question: 'What is the Global Interpreter Lock (GIL)?', options: ['A mutex that limits one thread to execute at a time', 'A global variable lock', 'An import lock', 'A file lock'], correct: 0 },
  { id: 315, skill: 'Python', question: 'What is the purpose of __name__ == "__main__"?', options: ['Check if script is run directly', 'Get the module name', 'Check Python version', 'Verify imports'], correct: 0 },
  { id: 316, skill: 'Python', question: 'What does the with statement do?', options: ['Context manager for resource management', 'Creates a new thread', 'Opens a file for writing', 'Defines a block'], correct: 0 },
  { id: 317, skill: 'Python', question: 'What is list comprehension?', options: ['Concise way to create lists', 'A complex list operation', 'List documentation', 'List sorting algorithm'], correct: 0 },
  { id: 318, skill: 'Python', question: 'What is a set in Python?', options: ['Unordered collection of unique elements', 'An ordered list', 'A dictionary with only keys', 'A string method'], correct: 0 },
  { id: 319, skill: 'Python', question: 'What does the map() function do?', options: ['Applies a function to every item in an iterable', 'Creates a geographical map', 'Maps memory addresses', 'Generates a site map'], correct: 0 },
  { id: 320, skill: 'Python', question: 'What is self in Python classes?', options: ['Reference to the instance of the class', 'A global variable', 'A static method', 'A class decorator'], correct: 0 },
  { id: 321, skill: 'Python', question: 'What is the purpose of __slots__?', options: ['Reduces memory by preventing dynamic attribute creation', 'Creates empty slots', 'Allocates disk space', 'Defines time slots'], correct: 0 },
  { id: 322, skill: 'Python', question: 'What does the @staticmethod decorator do?', options: ['Defines a method that doesn\'t receive instance or class', 'Creates a static variable', 'Makes a method private', 'Freezes the method'], correct: 0 },
  { id: 323, skill: 'Python', question: 'What is the difference between deepcopy and shallow copy?', options: ['Deepcopy creates independent nested copies', 'Shallow copy is faster but unsafe', 'They are the same', 'Deepcopy is slower but always recommended'], correct: 0 },
  { id: 324, skill: 'Python', question: 'What does the filter() function do?', options: ['Filters elements based on a function', 'Filters out duplicates', 'Cleans data', 'Removes None values'], correct: 0 },
  { id: 325, skill: 'Python', question: 'What is the purpose of type hints?', options: ['Annotate expected types for better code clarity', 'Enforce types at runtime', 'Optimize performance', 'Generate TypeScript'], correct: 0 },

  // ===== SQL (25 questions) =====
  { id: 401, skill: 'SQL', question: 'Which SQL statement is used to extract data from a database?', options: ['SELECT', 'GET', 'EXTRACT', 'FETCH'], correct: 0 },
  { id: 402, skill: 'SQL', question: 'What does JOIN do in SQL?', options: ['Combines rows from two tables', 'Deletes a table', 'Creates a new database', 'Updates records'], correct: 0 },
  { id: 403, skill: 'SQL', question: 'What is a primary key?', options: ['Uniquely identifies each row in a table', 'A key for sorting', 'An indexed column', 'A foreign key reference'], correct: 0 },
  { id: 404, skill: 'SQL', question: 'What does the WHERE clause do?', options: ['Filters records based on conditions', 'Sorts the results', 'Groups records', 'Joins tables'], correct: 0 },
  { id: 405, skill: 'SQL', question: 'What is a foreign key?', options: ['A field linking to a primary key in another table', 'A key for external access', 'A secondary index', 'A backup key'], correct: 0 },
  { id: 406, skill: 'SQL', question: 'What does GROUP BY do?', options: ['Groups rows that have the same values', 'Orders the results', 'Filters groups', 'Creates groups for permissions'], correct: 0 },
  { id: 407, skill: 'SQL', question: 'What is the difference between INNER JOIN and LEFT JOIN?', options: ['INNER JOIN returns matching rows only, LEFT JOIN returns all from left table', 'They are identical', 'LEFT JOIN returns only non-matching rows', 'INNER JOIN is faster'], correct: 0 },
  { id: 408, skill: 'SQL', question: 'What does the HAVING clause do?', options: ['Filters groups created by GROUP BY', 'Filters rows before grouping', 'Specifies join conditions', 'Orders grouped results'], correct: 0 },
  { id: 409, skill: 'SQL', question: 'What is a subquery?', options: ['A query nested inside another query', 'A simplified query', 'A partial query', 'A suboptimal query'], correct: 0 },
  { id: 410, skill: 'SQL', question: 'What does the DISTINCT keyword do?', options: ['Returns unique values', 'Returns distinct rows only', 'Creates a distinct index', 'Separates databases'], correct: 0 },
  { id: 411, skill: 'SQL', question: 'What is an index in SQL?', options: ['A database structure for fast data retrieval', 'A table of contents', 'A sorted copy of data', 'A query plan'], correct: 0 },
  { id: 412, skill: 'SQL', question: 'What does the UNION operator do?', options: ['Combines result sets of two queries', 'Merges two tables', 'Creates a union of databases', 'Joins tables vertically'], correct: 0 },
  { id: 413, skill: 'SQL', question: 'What is normalization?', options: ['Organizing data to reduce redundancy', 'Converting data to normal form', 'Standardizing table names', 'Normalizing data types'], correct: 0 },
  { id: 414, skill: 'SQL', question: 'What does the LIKE operator do?', options: ['Pattern matching with wildcards', 'Checks for equality', 'Compares similarity', 'Finds similar rows'], correct: 0 },
  { id: 415, skill: 'SQL', question: 'What is a NULL value?', options: ['Represents missing or unknown data', 'Zero value', 'Empty string', 'False boolean'], correct: 0 },
  { id: 416, skill: 'SQL', question: 'What does the COUNT() function do?', options: ['Returns the number of rows', 'Counts distinct values', 'Calculates sum', 'Counts characters'], correct: 0 },
  { id: 417, skill: 'SQL', question: 'What is a transaction in SQL?', options: ['A unit of work with ACID properties', 'A data transfer', 'A table operation', 'A query execution'], correct: 0 },
  { id: 418, skill: 'SQL', question: 'What does the ALTER TABLE statement do?', options: ['Modifies table structure', 'Changes table data', 'Updates table name only', 'Deletes a table'], correct: 0 },
  { id: 419, skill: 'SQL', question: 'What is the purpose of the AS keyword?', options: ['Creates aliases for columns or tables', 'Assigns values', 'Creates new tables', 'Defines types'], correct: 0 },
  { id: 420, skill: 'SQL', question: 'What does the TRUNCATE TABLE statement do?', options: ['Removes all rows but keeps the table structure', 'Deletes the table entirely', 'Removes specific rows', 'Truncates column data'], correct: 0 },
  { id: 421, skill: 'SQL', question: 'What is the difference between WHERE and HAVING?', options: ['WHERE filters rows, HAVING filters groups', 'They are interchangeable', 'HAVING is faster', 'WHERE works only with GROUP BY'], correct: 0 },
  { id: 422, skill: 'SQL', question: 'What does the ORDER BY clause do?', options: ['Sorts result set', 'Orders execution', 'Creates a sequence', 'Arranges columns'], correct: 0 },
  { id: 423, skill: 'SQL', question: 'What is a view in SQL?', options: ['A virtual table based on a query', 'A database diagram', 'A table snapshot', 'A query log'], correct: 0 },
  { id: 424, skill: 'SQL', question: 'What does the AUTO_INCREMENT attribute do?', options: ['Generates unique numbers automatically', 'Auto-updates values', 'Increments dates', 'Auto-sorts data'], correct: 0 },
  { id: 425, skill: 'SQL', question: 'What is a stored procedure?', options: ['A stored SQL code that can be executed repeatedly', 'A database function', 'A stored query result', 'A procedure manual'], correct: 0 },

  // ===== CSS (25 questions) =====
  { id: 501, skill: 'CSS', question: 'Which property makes a layout flexible in CSS?', options: ['display: flex', 'position: absolute', 'float: left', 'overflow: hidden'], correct: 0 },
  { id: 502, skill: 'CSS', question: 'How do you select an element with id "header" in CSS?', options: ['#header', '.header', 'header', '*header'], correct: 0 },
  { id: 503, skill: 'CSS', question: 'What does the box-sizing property do?', options: ['Controls how element sizing is calculated', 'Sizes the browser window', 'Creates a box shadow', 'Defines box dimensions'], correct: 0 },
  { id: 504, skill: 'CSS', question: 'What is the CSS Box Model?', options: ['Content, padding, border, margin', 'Header, main, footer', 'Width, height, depth', 'Inline, block, flex, grid'], correct: 0 },
  { id: 505, skill: 'CSS', question: 'What does position: relative do?', options: ['Positions relative to its normal position', 'Positions relative to viewport', 'Positions relative to parent', 'Positions absolutely'], correct: 0 },
  { id: 506, skill: 'CSS', question: 'What is the difference between display: none and visibility: hidden?', options: ['display: none removes element from flow, visibility: hidden hides but preserves space', 'They are identical', 'visibility: none is not valid', 'display: none preserves space'], correct: 0 },
  { id: 507, skill: 'CSS', question: 'What does the z-index property control?', options: ['Stacking order of elements', 'Zoom level', 'Z-axis rotation', 'Zoom index'], correct: 0 },
  { id: 508, skill: 'CSS', question: 'What is a CSS preprocessor?', options: ['Extends CSS with features like variables and nesting', 'Pre-processes HTML', 'Compiles JavaScript', 'Optimizes images'], correct: 0 },
  { id: 509, skill: 'CSS', question: 'What does @media do in CSS?', options: ['Applies styles based on media/device conditions', 'Loads media files', 'Creates media queries', 'Defines media type'], correct: 0 },
  { id: 510, skill: 'CSS', question: 'What is the CSS Grid?', options: ['A 2D layout system', 'A 1D flexbox alternative', 'A table-like layout', 'A 3D rendering engine'], correct: 0 },
  { id: 511, skill: 'CSS', question: 'How do you apply multiple background images?', options: ['Comma-separated values in background-image', 'Using multiple background properties', 'Nested elements', 'JavaScript only'], correct: 0 },
  { id: 512, skill: 'CSS', question: 'What does the transform property do?', options: ['Applies 2D/3D transformations', 'Changes element appearance', 'Transforms text', 'Converts units'], correct: 0 },
  { id: 513, skill: 'CSS', question: 'What is specificity in CSS?', options: ['Determines which styles apply when conflicts occur', 'A CSS framework', 'CSS performance metric', 'CSS syntax rule'], correct: 0 },
  { id: 514, skill: 'CSS', question: 'What does the :nth-child() pseudo-class do?', options: ['Selects elements based on their position', 'Selects the nth element type', 'Selects nth parent', 'Selects nth class'], correct: 0 },
  { id: 515, skill: 'CSS', question: 'What is the purpose of CSS custom properties?', options: ['Reusable values defined with -- prefix', 'Custom CSS rules', 'Proprietary CSS features', 'User-defined selectors'], correct: 0 },
  { id: 516, skill: 'CSS', question: 'What does the flex property shorthand include?', options: ['flex-grow, flex-shrink, flex-basis', 'flex-direction, flex-wrap', 'flex-start, flex-end', 'flex-container, flex-item'], correct: 0 },
  { id: 517, skill: 'CSS', question: 'How do you create a CSS animation?', options: ['@keyframes + animation property', '@animate rule', 'animation: name only', 'transition: all'], correct: 0 },
  { id: 518, skill: 'CSS', question: 'What does overflow: hidden do?', options: ['Clips content that overflows the box', 'Hides the element', 'Prevents scrolling', 'Hides overflow only in x-axis'], correct: 0 },
  { id: 519, skill: 'CSS', question: 'What is the difference between em and rem units?', options: ['em is relative to parent, rem is relative to root', 'they are the same', 'rem is relative to parent, em is relative to root', 'Both are absolute units'], correct: 0 },
  { id: 520, skill: 'CSS', question: 'What does the object-fit property control?', options: ['How content fits within its container', 'How objects are aligned', 'Fitness of the layout', 'Object dimensions'], correct: 0 },
  { id: 521, skill: 'CSS', question: 'What is a pseudo-element?', options: ['::before or ::after to style parts of elements', 'A fake element', 'A pseudo-class', 'A shadow element'], correct: 0 },
  { id: 522, skill: 'CSS', question: 'What does the calc() function do?', options: ['Performs mathematical calculations in CSS', 'Calculates element count', 'Computes styles', 'Measures performance'], correct: 0 },
  { id: 523, skill: 'CSS', question: 'What is the will-change property used for?', options: ['Hints browser about upcoming changes for optimization', 'Changes element behavior', 'Plans layout changes', 'Triggers animations'], correct: 0 },
  { id: 524, skill: 'CSS', question: 'What does flex-wrap: wrap do?', options: ['Allows items to wrap to next line', 'Wraps content in a border', 'Wraps text', 'Creates a wrapper'], correct: 0 },
  { id: 525, skill: 'CSS', question: 'What is the difference between class and ID selectors?', options: ['Classes can be reused, IDs must be unique', 'They are identical', 'IDs can be reused, classes must be unique', 'Classes have higher specificity'], correct: 0 },

  // ===== TYPESCRIPT (25 questions) =====
  { id: 601, skill: 'TypeScript', question: 'What is the main benefit of TypeScript?', options: ['Static type checking', 'Faster runtime', 'Smaller bundles', 'Built-in database'], correct: 0 },
  { id: 602, skill: 'TypeScript', question: 'What does the "any" type do?', options: ['Disables type checking for a variable', 'Represents any possible type safely', 'Makes a variable optional', 'Creates a generic type'], correct: 0 },
  { id: 603, skill: 'TypeScript', question: 'What is an interface in TypeScript?', options: ['Defines a contract for object shapes', 'A UI component', 'A class type', 'A database schema'], correct: 0 },
  { id: 604, skill: 'TypeScript', question: 'What is the difference between interface and type?', options: ['Interface can be extended, type cannot; type can use unions, interface cannot', 'They are identical', 'Type is for primitives only', 'Interface is for classes only'], correct: 0 },
  { id: 605, skill: 'TypeScript', question: 'What are generics?', options: ['Reusable components that work with multiple types', 'Generic types like any', 'Built-in utility types', 'Default type parameters'], correct: 0 },
  { id: 606, skill: 'TypeScript', question: 'What does the "?" after a property mean?', options: ['The property is optional', 'The property is nullable', 'The property is read-only', 'The property is conditional'], correct: 0 },
  { id: 607, skill: 'TypeScript', question: 'What is a type alias?', options: ['A different name for a type', 'An alias for a module', 'A type import', 'A type override'], correct: 0 },
  { id: 608, skill: 'TypeScript', question: 'What does the "readonly" modifier do?', options: ['Prevents reassignment of a property', 'Makes a property read-only at runtime', 'Creates read-only file', 'Makes a class immutable'], correct: 0 },
  { id: 609, skill: 'TypeScript', question: 'What is enum in TypeScript?', options: ['A set of named constants', 'An enumeration function', 'An enumerated type from JS', 'A number type'], correct: 0 },
  { id: 610, skill: 'TypeScript', question: 'What does the "as" keyword do?', options: ['Type assertion/casting', 'Creates an alias', 'Imports a module', 'Assigns a value'], correct: 0 },
  { id: 611, skill: 'TypeScript', question: 'What is a union type?', options: ['Type that can be one of several types', 'A combined type', 'A type union of interfaces', 'A merged interface'], correct: 0 },
  { id: 612, skill: 'TypeScript', question: 'What is a tuple type?', options: ['Array with fixed number of known types', 'A collection of tuples', 'A key-value pair', 'A database record'], correct: 0 },
  { id: 613, skill: 'TypeScript', question: 'What does the "never" type represent?', options: ['Value that never occurs', 'A null value', 'An undefined value', 'A void function'], correct: 0 },
  { id: 614, skill: 'TypeScript', question: 'What is type inference?', options: ['TypeScript automatically deduces types', 'Manual type declaration', 'Runtime type checking', 'Type conversion'], correct: 0 },
  { id: 615, skill: 'TypeScript', question: 'What does the "keyof" operator do?', options: ['Gets the union of keys from a type', 'Creates a key from a value', 'Extracts keys from an object', 'Generates key pairs'], correct: 0 },
  { id: 616, skill: 'TypeScript', question: 'What is a decorator in TypeScript?', options: ['A special declaration that modifies classes/methods', 'A design pattern', 'A type wrapper', 'A class utility'], correct: 0 },
  { id: 617, skill: 'TypeScript', question: 'What does the "implements" keyword do?', options: ['Makes a class adhere to an interface contract', 'Creates an implementation', 'Imports types', 'Instantiates a class'], correct: 0 },
  { id: 618, skill: 'TypeScript', question: 'What is a namespace in TypeScript?', options: ['Internal module for organizing code', 'A file system namespace', 'A directory structure', 'A package manager'], correct: 0 },
  { id: 619, skill: 'TypeScript', question: 'What does the "Partial<T>" utility type do?', options: ['Makes all properties of T optional', 'Makes T complete', 'Partially applies types', 'Creates a partial object'], correct: 0 },
  { id: 620, skill: 'TypeScript', question: 'What is the "Pick<T, K>" utility type?', options: ['Creates type from selected properties of T', 'Picks random types', 'Selects types from union', 'Chooses the best type'], correct: 0 },
  { id: 621, skill: 'TypeScript', question: 'What does "Omit<T, K>" do?', options: ['Creates type excluding specified properties', 'Omits null values', 'Removes types', 'Deletes properties'], correct: 0 },
  { id: 622, skill: 'TypeScript', question: 'What is the "Record<K, V>" utility type?', options: ['Creates object type with keys K and values V', 'Records function calls', 'Creates a log type', 'Maps key-value records'], correct: 0 },
  { id: 623, skill: 'TypeScript', question: 'What does the "!" (non-null assertion) operator do?', options: ['Tells TypeScript a value is not null/undefined', 'Negates a boolean', 'Throws an error', 'Forces a type cast'], correct: 0 },
  { id: 624, skill: 'TypeScript', question: 'What is the satisfies operator?', options: ['Checks type compatibility without narrowing', 'Makes a condition satisfied', 'Ensures type equality', 'Validates runtime types'], correct: 0 },
  { id: 625, skill: 'TypeScript', question: 'What are declaration files (.d.ts)?', options: ['Files that describe JavaScript types for TypeScript', 'Type declaration inside components', 'Data type schemas', 'Documentation files'], correct: 0 },

  // ===== HTML (25 questions) =====
  { id: 701, skill: 'HTML', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperText Markdown Language', 'HighLevel Markup Language'], correct: 0 },
  { id: 702, skill: 'HTML', question: 'Which tag is used for the largest heading?', options: ['<h1>', '<h6>', '<head>', '<header>'], correct: 0 },
  { id: 703, skill: 'HTML', question: 'What is the purpose of the <a> tag?', options: ['Creates hyperlinks', 'Adds articles', 'Aligns text', 'Appends content'], correct: 0 },
  { id: 704, skill: 'HTML', question: 'Which attribute specifies an image URL in <img>?', options: ['src', 'href', 'url', 'link'], correct: 0 },
  { id: 705, skill: 'HTML', question: 'What does the <meta charset="UTF-8"> tag do?', options: ['Sets character encoding', 'Creates metadata', 'Defines keywords', 'Sets page title'], correct: 0 },
  { id: 706, skill: 'HTML', question: 'Which tag creates an unordered list?', options: ['<ul>', '<ol>', '<li>', '<list>'], correct: 0 },
  { id: 707, skill: 'HTML', question: 'What is the semantic tag for navigation?', options: ['<nav>', '<navigate>', '<navi>', '<menu>'], correct: 0 },
  { id: 708, skill: 'HTML', question: 'Which input type creates a checkbox?', options: ['checkbox', 'check', 'radio', 'toggle'], correct: 0 },
  { id: 709, skill: 'HTML', question: 'What does the <form> element do?', options: ['Collects user input and submits data', 'Formats text', 'Creates tables', 'Defines fonts'], correct: 0 },
  { id: 710, skill: 'HTML', question: 'Which attribute makes an input required?', options: ['required', 'mandatory', 'must', 'needed'], correct: 0 },
  { id: 711, skill: 'HTML', question: 'What is the <div> tag used for?', options: ['Generic container/division', 'Dividing numbers', 'Displaying video', 'Defining variables'], correct: 0 },
  { id: 712, skill: 'HTML', question: 'Which tag is used for embedding JavaScript?', options: ['<script>', '<javascript>', '<code>', '<js>'], correct: 0 },
  { id: 713, skill: 'HTML', question: 'What does the <span> tag do?', options: ['Inline container for styling', 'Spans the full width', 'Creates a new line', 'Adds spacing'], correct: 0 },
  { id: 714, skill: 'HTML', question: 'What is the purpose of the alt attribute on images?', options: ['Alternative text for accessibility', 'Aligns the image', 'Alternates images', 'Sets image height'], correct: 0 },
  { id: 715, skill: 'HTML', question: 'Which tag creates a table row?', options: ['<tr>', '<td>', '<th>', '<row>'], correct: 0 },
  { id: 716, skill: 'HTML', question: 'What does the <head> element contain?', options: ['Metadata and document information', 'The main content', 'Page footer', 'Navigation menu'], correct: 0 },
  { id: 717, skill: 'HTML', question: 'What is the <article> tag for?', options: ['Self-contained content like blog posts', 'Article metadata', 'Academic papers', 'Sidebar content'], correct: 0 },
  { id: 718, skill: 'HTML', question: 'Which tag is used for a line break?', options: ['<br>', '<lb>', '<break>', '<hr>'], correct: 0 },
  { id: 719, skill: 'HTML', question: 'What does the <footer> element represent?', options: ['Footer content for a section or page', 'Page bottom margin', 'Copyright section', 'Closing tags'], correct: 0 },
  { id: 720, skill: 'HTML', question: 'Which attribute defines the target URL in an <a> tag?', options: ['href', 'src', 'link', 'url'], correct: 0 },
  { id: 721, skill: 'HTML', question: 'What is the purpose of the <section> tag?', options: ['Groups related content thematically', 'Creates a section divider', 'Splits the page', 'Defines a segment'], correct: 0 },
  { id: 722, skill: 'HTML', question: 'What does the disabled attribute do on inputs?', options: ['Makes the input non-interactive', 'Hides the input', 'Deletes the input', 'Disables validation'], correct: 0 },
  { id: 723, skill: 'HTML', question: 'Which input type is for email addresses?', options: ['email', 'text', 'mail', 'url'], correct: 0 },
  { id: 724, skill: 'HTML', question: 'What is the <aside> tag used for?', options: ['Content related to the main content (sidebars)', 'Page margins', 'Hidden content', 'External content'], correct: 0 },
  { id: 725, skill: 'HTML', question: 'What does the <main> element represent?', options: ['The dominant content of the document', 'The main menu', 'The primary navigation', 'The main script'], correct: 0 },

  // ===== GIT (25 questions) =====
  { id: 801, skill: 'Git', question: 'What command checks the status of your working directory?', options: ['git status', 'git check', 'git info', 'git log'], correct: 0 },
  { id: 802, skill: 'Git', question: 'How do you stage a file for commit?', options: ['git add <file>', 'git stage <file>', 'git commit <file>', 'git push <file>'], correct: 0 },
  { id: 803, skill: 'Git', question: 'What does git commit -m "message" do?', options: ['Creates a commit with a message', 'Merges branches', 'Creates a new branch', 'Pushes to remote'], correct: 0 },
  { id: 804, skill: 'Git', question: 'How do you create a new branch?', options: ['git branch <name>', 'git create branch <name>', 'git new branch <name>', 'git checkout -new <name>'], correct: 0 },
  { id: 805, skill: 'Git', question: 'What does git merge do?', options: ['Merges changes from one branch into another', 'Combines commits', 'Merges repositories', 'Merges files'], correct: 0 },
  { id: 806, skill: 'Git', question: 'How do you view the commit history?', options: ['git log', 'git history', 'git show', 'git list'], correct: 0 },
  { id: 807, skill: 'Git', question: 'What is a remote repository?', options: ['A version of the repository hosted on a server', 'A local backup', 'A removed repository', 'A remote desktop connection'], correct: 0 },
  { id: 808, skill: 'Git', question: 'What does git pull do?', options: ['Fetches and merges changes from remote', 'Pushes changes to remote', 'Pulls files from stash', 'Downloads dependencies'], correct: 0 },
  { id: 809, skill: 'Git', question: 'What does git push do?', options: ['Uploads commits to remote repository', 'Downloads from remote', 'Pushes changes to stash', 'Creates a new remote'], correct: 0 },
  { id: 810, skill: 'Git', question: 'What is a conflict in Git?', options: ['When changes from different sources collide', 'A merge error', 'A branch issue', 'A push failure'], correct: 0 },
  { id: 811, skill: 'Git', question: 'What does git stash do?', options: ['Temporarily saves uncommitted changes', 'Deletes changes', 'Stores files permanently', 'Archives the repository'], correct: 0 },
  { id: 812, skill: 'Git', question: 'How do you switch to a different branch?', options: ['git checkout <branch>', 'git switch <branch>', 'git change <branch>', 'git move <branch>'], correct: 0 },
  { id: 813, skill: 'Git', question: 'What does git diff show?', options: ['Differences between files or commits', 'File conflicts', 'Branch differences', 'Repository differences'], correct: 0 },
  { id: 814, skill: 'Git', question: 'What is a fork in Git?', options: ['A personal copy of someone else\'s repository', 'A branch split', 'A code division', 'A version fork'], correct: 0 },
  { id: 815, skill: 'Git', question: 'What does .gitignore do?', options: ['Specifies files to ignore in version control', 'Deletes ignored files', 'Hides files from view', 'Removes files from disk'], correct: 0 },
  { id: 816, skill: 'Git', question: 'What is git rebase?', options: ['Reapplies commits on top of another branch tip', 'Bases a new branch', 'Rebuilds the repository', 'Resets the branch base'], correct: 0 },
  { id: 817, skill: 'Git', question: 'What does git reset do?', options: ['Unstages files or resets commit history', 'Deletes commits', 'Resets the repository', 'Clears the cache'], correct: 0 },
  { id: 818, skill: 'Git', question: 'What is the staging area?', options: ['Intermediate area before committing', 'A file storage zone', 'A deployment area', 'A test environment'], correct: 0 },
  { id: 819, skill: 'Git', question: 'What does git tag do?', options: ['Marks a specific commit with a label', 'Tags files', 'Creates a tag branch', 'Labels branches'], correct: 0 },
  { id: 820, skill: 'Git', question: 'How do you clone a repository?', options: ['git clone <url>', 'git copy <url>', 'git fork <url>', 'git download <url>'], correct: 0 },
  { id: 821, skill: 'Git', question: 'What does git fetch do?', options: ['Downloads commits and refs from remote without merging', 'Downloads and merges immediately', 'Fetches only file contents', 'Downloads dependencies'], correct: 0 },
  { id: 822, skill: 'Git', question: 'What is HEAD in Git?', options: ['Pointer to the current branch tip', 'The main branch', 'The root commit', 'The repository head'], correct: 0 },
  { id: 823, skill: 'Git', question: 'What does git revert do?', options: ['Creates a new commit that undoes a previous commit', 'Reverses the repository', 'Rolls back all changes', 'Deletes the last commit'], correct: 0 },
  { id: 824, skill: 'Git', question: 'What is the difference between git merge and git rebase?', options: ['Merge creates a merge commit, rebase rewrites history', 'They are identical', 'Rebase creates a merge commit', 'Merge is safer than rebase'], correct: 0 },
  { id: 825, skill: 'Git', question: 'What does git remote -v show?', options: ['Lists remote repositories with URLs', 'Shows remote version', 'Verifies remote connections', 'Displays remote branches'], correct: 0 },
];

const questionTemplates = [
  { q: (s) => `What is ${s} primarily used for?`, opts: (s) => [`Building and developing software applications`, `Graphic design and illustration`, `Hardware engineering`, `Data entry and management`], c: 0 },
  { q: (s) => `Which of the following is a key feature of ${s}?`, opts: (s) => [`Performance and scalability`, `Built-in video editing`, `Automatic hardware repair`, `Self-driving capabilities`], c: 0 },
  { q: (s) => `What is the best way to learn ${s}?`, opts: (s) => [`Hands-on practice and building projects`, `Reading only theory`, `Watching videos without coding`, `Memorizing documentation`], c: 0 },
  { q: (s) => `Which tool is commonly used with ${s}?`, opts: (s) => [`Visual Studio Code`, `Adobe Photoshop`, `Microsoft Excel`, `AutoCAD`], c: 0 },
  { q: (s) => `What type of language is ${s}?`, opts: (s) => [`Programming language`, `Markup language`, `Query language`, `Styling language`], c: 0 },
  { q: (s) => `In which domain is ${s} most commonly applied?`, opts: (s) => [`Web development and software engineering`, `Interior design`, `Agriculture`, `Medical surgery`], c: 0 },
  { q: (s) => `What is a common challenge when working with ${s}?`, opts: (s) => [`Debugging and error handling`, `Mixing paint colors`, `Finding the right hardware`, `Managing physical inventory`], c: 0 },
  { q: (s) => `Which of these concepts is fundamental to ${s}?`, opts: (s) => [`Variables and data structures`, `Color theory`, `Mechanical engineering`, `Pharmacology`], c: 0 },
  { q: (s) => `What is the best practice for writing ${s} code?`, opts: (s) => [`Writing clean, modular, and well-documented code`, `Writing as fast as possible`, `Copying without understanding`, `Using only one file`], c: 0 },
  { q: (s) => `Which ecosystem is ${s} part of?`, opts: (s) => [`Software development ecosystem`, `Automotive industry`, `Fashion industry`, `Construction industry`], c: 0 },
  { q: (s) => `What is the typical career path for a ${s} developer?`, opts: (s) => [`Junior to Senior Developer`, `Intern to Manager`, `Assistant to Director`, `Trainee to Executive`], c: 0 },
  { q: (s) => `Which version control system is commonly used with ${s} projects?`, opts: (s) => [`Git`, `SVN`, `Mercurial`, `CVS`], c: 0 },
  { q: (s) => `What is a popular framework or library for ${s}?`, opts: (s) => [`React, Angular, or Vue`, `Bootstrap only`, `jQuery only`, `There are no frameworks`], c: 0 },
  { q: (s) => `How do professionals stay updated with ${s}?`, opts: (s) => [`Following community blogs and release notes`, `Reading only books from 2010`, `Avoiding updates`, `Using only stable versions`], c: 0 },
  { q: (s) => `What is the most important skill for a ${s} developer?`, opts: (s) => [`Problem-solving and logical thinking`, `Fast typing speed`, `Knowing all syntax by heart`, `Having expensive hardware`], c: 0 },
  { q: (s) => `Which database is commonly used with ${s} applications?`, opts: (s) => [`PostgreSQL or MongoDB`, `Excel spreadsheets`, `File system`, `Paper records`], c: 0 },
  { q: (s) => `What is the role of testing in ${s} development?`, opts: (s) => [`Ensuring code quality and preventing bugs`, `Slowing down development`, `Optional for small projects`, `Only for enterprise apps`], c: 0 },
  { q: (s) => `What is the typical project structure for ${s}?`, opts: (s) => [`Organized with modules and clear separation of concerns`, `All files in one folder`, `No structure needed`, `Random file organization`], c: 0 },
  { q: (s) => `Which of these IDEs is best for ${s}?`, opts: (s) => [`VS Code or WebStorm`, `Notepad`, `MS Paint`, `Calculator`], c: 0 },
  { q: (s) => `How do you handle errors in ${s}?`, opts: (s) => [`Using try-catch blocks and proper error handling`, `Ignoring errors`, `Restarting the application`, `Deleting problematic code`], c: 0 },
  { q: (s) => `What is the community like for ${s}?`, opts: (s) => [`Large, active, and supportive with many resources`, `Non-existent`, `Small and exclusive`, `Only for experts`], c: 0 },
  { q: (s) => `What is a common deployment platform for ${s} projects?`, opts: (s) => [`AWS, Vercel, or Netlify`, `Physical servers only`, `USB drives`, `Localhost only`], c: 0 },
  { q: (s) => `How does ${s} compare to other similar technologies?`, opts: (s) => [`It has unique strengths and specific use cases`, `It is always better`, `It is always worse`, `They are all identical`], c: 0 },
  { q: (s) => `What is the future outlook for ${s}?`, opts: (s) => [`Growing demand with evolving features`, `Becoming obsolete soon`, `Staying the same forever`, `Already outdated`], c: 0 },
  { q: (s) => `What is the first step in learning ${s}?`, opts: (s) => [`Understanding the basics and syntax`, `Building a complex project`, `Reading the entire documentation`, `Buying courses`], c: 0 },
  { q: (s) => `What is the role of ${s} in full-stack development?`, opts: (s) => [`It can be used in various parts of the stack`, `It is only frontend`, `It is only backend`, `It is not used in web development`], c: 0 },
  { q: (s) => `What is a common interview question about ${s}?`, opts: (s) => [`Explain core concepts and demonstrate problem-solving`, `Recite the documentation`, `Name all functions`, `Write without any errors`], c: 0 },
  { q: (s) => `How do you optimize ${s} code for production?`, opts: (s) => [`Minification, bundling, and performance profiling`, `Adding more comments`, `Making code longer`, `Removing all functions`], c: 0 },
  { q: (s) => `What is the significance of ${s} in modern development?`, opts: (s) => [`It powers many modern applications and services`, `It has no real use`, `It is only for legacy systems`, `It is a niche technology`], c: 0 },
  { q: (s) => `Which book or resource is recommended for learning ${s}?`, opts: (s) => [`Official documentation and community tutorials`, `Fiction novels`, `Cookbooks`, `Travel guides`], c: 0 },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestionsForSkill(skill, count = 25) {
  const shuffled = shuffleArray(questionTemplates);
  const selected = shuffled.slice(0, count);
  const baseId = Date.now();
  return selected.map((t, i) => ({
    id: baseId + i,
    skill,
    question: t.q(skill),
    options: t.opts(skill),
    correct: t.c,
  }));
}

router.get('/questions', async (req, res) => {
  const { skill } = req.query;
  let questions;
  if (skill) {
    questions = getQuestionsForSkill(skill);
  } else {
    questions = questionBank;
  }
  const safe = questions.map(({ correct, ...q }) => q);
  res.json(safe);
});

router.get('/skills', (req, res) => {
  const staticSkills = [...new Set(questionBank.map(q => q.skill))];
  res.json(staticSkills);
});

const questionCache = new Map();

function getQuestionsForSkill(skill) {
  const filtered = questionBank.filter(q => q.skill.toLowerCase() === skill.toLowerCase());
  if (filtered.length > 0) return filtered;
  if (questionCache.has(skill.toLowerCase())) return questionCache.get(skill.toLowerCase());
  const generated = generateQuestionsForSkill(skill);
  questionCache.set(skill.toLowerCase(), generated);
  return generated;
}

router.post('/submit', async (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: 'Answers array required' });

  const allQuestions = getQuestionsForSkill(req.body.skill || 'general');

  let score = 0;
  let total = answers.length;
  const results = answers.map(a => {
    const question = allQuestions.find(q => q.id === a.questionId);
    const correct = question && question.correct === a.selected;
    if (correct) score++;
    return { questionId: a.questionId, correct: !!correct, correctAnswer: question ? question.correct : null };
  });

  const skill = req.body.skill || 'general';
  try {
    await dbRun(
      'INSERT INTO assessments (user_id, skill, score, total, answers) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, skill, score, total, JSON.stringify(results)]
    );
  } catch (err) { console.log('Save assessment error:', err.message); }

  res.json({ score, total, percentage: Math.round((score / total) * 100), results });
});

router.get('/results', async (req, res) => {
  try {
    const results = await dbAll('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
