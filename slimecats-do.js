// https://github.com/earthstar-project/earthstar/blob/main/docs/tutorial.js

const {
  OnePubOneWorkspaceSyncer,
  StorageMemory,
  StorageSqlite,
  ValidatorEs4,
  generateAuthorKeypair,
  isErr,
  sleep,
} = require('earthstar');

/*
You can also use import syntax:
  import {
      OnePubOneWorkspaceSyncer
      StorageMemory,
      // etc
  } from 'earthstar';
*/

// ================================================================================
/*
Let's make a todo list app using Earthstar.

It'll run on the command line, in Node, but this code will also work in browsers.
This demo is plain Javascript, but Earthstar also works with Typescript.

Every computer running this app will keep its own complete copy of the data
so it can work when offline.
When online, they can sync with each other.

Our app will handle Todo objects like this...

  type Todo = {
      id: string,
      text: string,
      isDone: boolean,
  };

And we'll write some functions to save and load from that Todo format
to Earthstar.

ID GENERATION

Each Todo will have a unique id made from a timestamp plus some extra randomness
to avoid accidental collisions.
*/

const randInt = (lo, hi) =>
  // a random integer, inclusive of endpoints
  Math.floor(Math.random() * ((hi + 1) - lo) + lo);

const generateTodoId = () =>
  // make an id like "1606164670376000:78987897"
  // Earthstar uses MICROseconds everywhere, not milliseconds,
  // so we multiply by 1000.
  `${Date.now() * 1000}-${randInt(1000000, 9999999)}`;

/*
PATHS

The atomic unit of storage in Earthstar is a "document".
It's similar to a file in a filesystem.
It has a "path" within its Earthstar workspace, and
some "content" which is a utf-8 string.

When there's a conflict in Earthstar, the documents aren't merged;
the most recent one wins.

So if we want users to be able to independenly update the text and isDone of a Todo,
we need to store --two-- Earthstar documents for each todo.

We also need to decide what paths to save our documents at,
and what the content will be.
*/

const todoTextPath = (id) =>
  `/todo/${id}/text.txt`;     // will hold the text of the todo

const todoIsDonePath = (id) =>
  `/todo/${id}/isDone.json`;  // will hold true or false (as a string)

/*
Why we chose those paths:
  * Always start with the name of the application
  * The app name is unique, not a common word like "todo" --
     we don't want to collide with other apps and their data.
  * The id is next, so that they conveniently sort in chronological order
  * We use "file extensions" as a hint about the kind of data in each doc

EDIT PERMISSIONS

By default, Earthstar documents can be edited and deleted by any user.

You can limit the edit permissions by including ("~" + author.address) in a path.
We don't use that feature in this tutorial, but it would look like this:

  `/slimecatsdo/~${author.address}/${id}/todo.txt`
  /slimecatsdo/~@suzy.bo6u3bozzjg4njjolt7eevdyws7dknjiuzjsmyg3winte6fbaktca/1606164670376000:78987897/todo.txt

The user address can appear anywhere in the path, at any depth of the folder hierarchy.
If a path has several addresses, any of those authors (and nobody else) can edit the document.
*/

// stores contents of your slimecat's boxes
const boxesPath = () =>
  '/slimecatsdo/boxes.json';

/*
AUTHOR IDENTITY

In Earthstar, users are called Authors.
Each Author has a public and private key.

In the code we call these their "address" and "secret".
In user interfaces I like to call these "username" and "password"
to help people understand how they work.

Generate a new identity like this.
You can choose the first 4 letters of the address (called a "shortname").
The rest will be different every time you run it:

  let keypair = generateAuthorKeypair('suzy');
  console.log(keypair);

For this demo we'll use a hardcoded identity:
*/
const keypair = {
  address: "@suzy.bo6u3bozzjg4njjolt7eevdyws7dknjiuzjsmyg3winte6fbaktca",
  secret: "b2wmruovqhl4w6pbetozzvoh7zi4i66pdwwlsbfrmktk642w56ogq"
};

// ================================================================================
// MAIN

/*
We're done making helper functions!  Let's actually set up our Earthstar storage
and start doing stuff.

WORKSPACE

A workspace is a collection of users and documents.
Just make up a workspace name to start using it.
Workspaces should have some randomness on the end to make them hard to guess,
because if you know the workspace you can get its data.
*/
const workspace = '+slimecatsdo.iu8nhj2anvr74slnjei';

/*
STORAGE

Make the earthstar Storage class which will hold the documents of one workspace.

There are several storage backends to choose from.
You can use the in-memory storage which will be lost when the program ends...
*/
console.log('using memory storage');
const storage = new StorageMemory([ValidatorEs4], workspace);

/*
Or keep your data in an SQLite file.  SQLite only works in Node, not browsers.

There's also a command-line tool called "earthstar-cli" which can manage
sqlite files like this one and sync them for you.
https://www.npmjs.com/package/earthstar-cli

  let sqliteFilename = 'slimecatsdo.sqlite';
  console.log('using sqlite storage: ' + sqliteFilename);
  let storage = new StorageSqlite({
      mode: 'create-or-open',
      workspace: workspace,
      validators: [ValidatorEs4],
      filename: sqliteFilename
  });
*/

/*
Storage types:

              node        browsers

memory          yes         yes
sqlite          yes         -
localstorage    -           yes
indexeddb       -           coming soon
*/


// ================================================================================
// SAVING AND LOADING TODO OBJECTS

// The basic Todo type used by our app
const makeNewTodo = (text, isDone = false) => {
  const newId = generateTodoId();
  console.log('generated todo id is:', newId);
  console.log('text is:', text);
  console.log('isDone is', isDone);
  return {
      id: newId,
      text: text,
      isDone: isDone,  // boolean
  };
};

const saveTodo = (todo, doStorage = storage, doKeypair = keypair) => {
  // Given a Todo object, write it to two Earthstar documents (text and isDone).

  // "storage" is the Earthstar Storage instance.
  // "keypair" is an AuthorKeypair object holding the users public and private keys.

  // To save a document to Earthstar, we have to choose a document format.
  // "es.4" is the latest format at the moment.
  const write1 = doStorage.set(doKeypair, {
      format: 'es.4',
      path: todoTextPath(todo.id),
      content: todo.text,
  });
  const write2 = doStorage.set(doKeypair, {
      format: 'es.4',
      path: todoIsDonePath(todo.id),
      content: '' + todo.isDone,  // convert the boolean a string: "true" or "false"
  });

  // If the write fails for some reason it will return an Error (not throw -- return.)
  // isErr is a helper function that checks if something is an instanceOf Error.

  if (isErr(write1) || isErr(write2)) {
      console.warn('write failed', write1, write2);
  }
};

const listTodoIds = (doStorage = storage) => {
  // Return an array of all the todo ids found in the Earthstar Storage.

  // Query for paths starting with "/todo/".
  // That'll return both kinds of docs, the text.txt and isDone.json docs.
  // Let's filter them to only keep the text.txt docs.
  // Note that storage queries always return results sorted alphabetically by path,
  // so we don't have to sort it ourself.
  const query = { pathStartsWith: '/todo/' };
  const labelPaths = doStorage.paths(query)
      .filter(path => path.endsWith('text.txt'));

  // Extract the todo id out of the path
  const ids = labelPaths.map(path => path.split('/')[2]);
  return ids;
};

const listUndoneIds = (doStorage = storage) => {
  const query = { pathStartsWith: '/todo/' };
  const labelPaths = doStorage.paths(query)
      .filter(path => path.endsWith('text.txt'));

  let ids = [];
  labelPaths.forEach(path => {
    const id = path.split('/')[2];
    const foundTodo = lookupTodo(id);
    if (!foundTodo.isDone) {
      ids.push(foundTodo.id);
    }
  });
  return ids;
};

const listDoneIds = (doStorage = storage) => {
  const query = { pathStartsWith: '/todo/' };
  const labelPaths = doStorage.paths(query)
      .filter(path => path.endsWith('text.txt'));

  let ids = [];
  labelPaths.forEach(path => {
    const id = path.split('/')[2];
    const foundTodo = lookupTodo(id);
    if (foundTodo.isDone) {
      ids.push(foundTodo.id);
    }
  });
  return ids;
};

const lookupTodo = (id, doStorage = storage) => {
  // Given a todo id, look up both of its Earthstar documents
  // and combine them into a Todo object that our app knows how to handle.
  // Return undefined if not found.

  // Earthstar documents can sync slowly, and in any order, so we have to
  // be prepared for any of our documents to be missing -- we might not have
  // both documents for a Todo.

  // Look up documents by path and return their content,
  // or undefined if they're missing
  const textContent = doStorage.getContent(todoTextPath(id));
  const isDoneContent = doStorage.getContent(todoIsDonePath(id));

  // If the text document is missing, act like the entire todo doesn't exist.
  if (textContent === undefined) { return undefined; }

  // If the isDone document is missing, default it to false.
  let isDone = false;
  if (isDoneContent !== undefined) {
      // This is a ".json" document but it should only
      // ever hold "true" or "false", so we don't need
      // to actually JSON.parse it.
      isDone = (isDoneContent === 'true');
  }

  // Make a Todo style object for our app
  return {
      id: id,
      text: textContent,
      isDone: isDone,
  };
};


/*
ACTUALLY DO SOME STUFF WITH TODOS

Now we can make some Todos, save them to Earthstar, and load them back again.

You would probably want to build some command line flags to make this a useful
todo app -- maybe some flags to create, list, or complete todos.
*/

/*
console.log('workspace:', workspace);
console.log('author:', keypair.address);
console.log();

let todos = [
  makeNewTodo('take a nap', false),
  makeNewTodo('go outside', false),
  makeNewTodo('feed the cat', true),
];

// save them to Earthstar
for (let todo of todos) {
  saveTodo(storage, keypair, todo);
}

// load them back and print them, to make sure it worked
console.log('Our todos after a roundtrip into Earthstar and back out again:');
let todoIds = listTodoIds(storage);
for (let id of todoIds) {
  let loadedTodo = lookupTodo(storage, id);
  console.log(loadedTodo);
}

// show the Earthstar document paths and contents
console.log();
console.log('Earthstar documents:');
for (let doc of storage.documents()) {
  console.log(
      '    path:', doc.path.padEnd(47, ' '),
      'content:', doc.content,
  );
}

// show one raw Earthstar document in full detail
console.log();
console.log('One document in full detail:');
console.log(storage.documents()[0]);
*/

// ================================================================================
// SYNC

/*
Any two computers that can connect to each other can sync.
Eventually we'll allow direct p2p connections between users.
For now we're running "Pub servers" in the cloud because they're easier to connect to.

A pub is just another Earthstar peer with no special powers.
Its purpose is to keep your data online and to be easily reachable from anywhere.
You can sync a workspace with multiple pubs for redundancy.
Pubs can also serve a human-readable website for browsing your data.

Documents are signed by the author; pubs can read the data but
can't modify it.

For now, pubs just accept any data that's pushed to them, but it would be easy
to give them lists of allowed workspaces or users.

The sync protocol is just a couple of HTTP REST endpoints, using JSON data.

You can run a pub on your own computer:
> npm install --global earthstar-pub
> earthstar-pub --port 3333

You can also clone the demo pub on glitch.com (glitch calls this "remixing")
*/

const pub1 = 'https://earthstar-demo-pub-v5-a.glitch.me';
const pub2 = 'https://earthstar-demo-pub-6b.fly.dev';
const pub3 = 'https://earthstar-demo-pub-v6-a.glitch.me';

// Make a Syncer instance.
// It's responsible for syncing one pub with one local workspace.
const syncer1 = new OnePubOneWorkspaceSyncer(storage, pub1);
const syncer2 = new OnePubOneWorkspaceSyncer(storage, pub2);
const syncer3 = new OnePubOneWorkspaceSyncer(storage, pub3);


// You can "sync once" and then stop, or do a live sync that continues
// forever, streaming new changes as they happen.
// In this demo we'll just sync once.
const syncOnceWithOnePub = async (syncerToUse) => {
  try {
      console.log(`syncing once to ${syncerToUse.domain}...`);
      console.log('this might print a bunch of debug information...');

      const stats = await syncerToUse.syncOnce();

      console.log('done syncing');
      console.log(`visit ${syncerToUse.domain}/workspace/${workspace} to see your docs on the pub.`);
      console.log(stats);  // show the number of docs that were synced
  } catch (err) {
      console.error(err);
  }
};

const syncOnce = () => {
  syncOnceWithOnePub(syncer1);
  syncOnceWithOnePub(syncer2);
  syncOnceWithOnePub(syncer3);
};

// uncomment these two lines to actually do the sync:
syncOnce();

/*
If you're not familiar with await/async, just know
that syncer.syncOnce() returns a Promise.  You could do this instead:

  syncer.syncOnce()
      .then((stats) => console.log('done syncing', stats));
*/

// ================================================================================
// Extra credit: subscribing to changes

/*
If you're writing a web app you probably need to get notified when any
todos change in the storage (because of incoming data from a sync).

  let unsub = storage.onWrite(evt => {
      if (evt.isLocal) {
          // The write was caused by the local user.
          // Maybe we don't need to do anything in this case?
      } else {
          // The write came from the outside world, from a sync.
          // Do something with the new document,
          // maybe refresh the screen?
          let whatever = evt.document
      }
  });

  // Later, you can turn off this subscription:
  unsub();
*/

// ================================================================================
// CLOSING

/*
When you're done with a Storage instance you must close it or your
program will hang forever.
This turns off subscriptions, closes files on disk, stops ongoing syncs, etc.
*/
const closeStorage = async () => {
  storage.close();
};

// closeStorage();

// track what i've put in my cardboard boxes
// there is zero error checking
const boxes = (doStorage = storage) => {
  const boxesContent = doStorage.getContent(boxesPath());
  return boxesContent ? JSON.parse(boxesContent) : {};
};

const addThingToBoxes = (thing = 'treat', doStorage = storage, doKeyPair = keypair) => {
  const currentBoxes = boxes();
  if (currentBoxes && currentBoxes[thing]) {
    currentBoxes[thing] = currentBoxes[thing] + 1;
  } else {
    currentBoxes[thing] = 1;
  }
  const write = doStorage.set(doKeyPair, {
    format: 'es.4',
    path: boxesPath(),
    content: JSON.stringify(currentBoxes),
  });

  if (isErr(write)) {
    console.warn('write failed', write);
  }
};

module.exports = {
  makeNewTodo: makeNewTodo,
  saveTodo: saveTodo,
  listTodoIds: listTodoIds,
  listUndoneIds: listUndoneIds,
  listDoneIds: listDoneIds,
  lookupTodo: lookupTodo,
  syncOnce: syncOnce,
  closeStorage: closeStorage,
  boxes: boxes,
  addThingToBoxes: addThingToBoxes,
};