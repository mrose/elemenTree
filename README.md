# simplicitree

![Thee Simplicit Tree](/img/simplicitree-264x264.png)

This Tree object is a tree of nodes where each node is a key-value pair.
Strings, or Arrays of Strings, may be used as a key. Any value (both objects
and primitive values) may be used as a value.

## Install

```
$ npm install simplicitree
```

## Import or Require

```bash
import { Tree } from "simplicitree";

```

## API

```
// Create a tree, all configuration is optional
const myTree = Tree.factory({ datamap, datum, distinct, pathStringDelimiter, rootNodeId, showRoot });

.datum
.depth
.distinct
.hasDescendents
.hasRootDatum
.pathStringDelimiter
.rootNodeId
.rootNodePath
.showRoot
.size

.cascade()
.clear()
.delete()
.entriesOf()
.everyOf()
.firstDescendentsOf()
.get()
.getAncestorOf()
.has
.keysOf()
.merge()
.set()
.someOf()
.traverse()
.valuesOf()

```

## More

<https://mrose.github.io/simplicitree/>
