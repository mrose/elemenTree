<a name="module_Tree"></a>

## Tree
A Tree objectThe Tree object is a tree of nodes where each node is a key-value pair.Strings, or Arrays of Strings, may be used as a key.Any value (both objects and primitive values) may be used as a value.


* [Tree](#module_Tree)
    * [Tree](#exp_module_Tree--Tree) ⏏
        * [new Tree(datum, root_node_id, path_string_delimiter, dataMap, distinct, show_root)](#new_module_Tree--Tree_new)
        * _instance_
            * [.depth](#module_Tree--Tree+depth) ⇒ <code>Number</code>
            * [.hasDescendents](#module_Tree--Tree+hasDescendents) ⇒ <code>Boolean</code>
            * [.rootNodePath](#module_Tree--Tree+rootNodePath) ⇒ <code>Array</code>
            * [.size](#module_Tree--Tree+size) ⇒ <code>Number</code>
            * [.cascade(fn, path, inclusive)](#module_Tree--Tree+cascade) ⇒ <code>Void</code>
            * [.clear()](#module_Tree--Tree+clear) ⇒ <code>Void</code>
            * [.delete(path, inclusive)](#module_Tree--Tree+delete) ⇒ <code>Boolean</code>
            * [.entriesOf(path, inclusive, nested, depth)](#module_Tree--Tree+entriesOf) ⇒ <code>Array</code>
            * [.everyOf(fn, path, inclusive, depth)](#module_Tree--Tree+everyOf) ⇒ <code>Boolean</code>
            * [.firstDescendentsOf(path)](#module_Tree--Tree+firstDescendentsOf) ⇒ <code>Array</code>
            * [.get(path)](#module_Tree--Tree+get) ⇒
            * [.getAncestorOf(path)](#module_Tree--Tree+getAncestorOf) ⇒
            * [.has(path)](#module_Tree--Tree+has) ⇒ <code>Boolean</code>
            * [.keysOf(path, inclusive, nested, depth)](#module_Tree--Tree+keysOf) ⇒ <code>Array</code>
            * [.merge(source)](#module_Tree--Tree+merge)
            * [.set(path, datum, ancestor)](#module_Tree--Tree+set) ⇒ <code>Array</code>
            * [.someOf(fn, path, inclusive, depth)](#module_Tree--Tree+someOf) ⇒ <code>Boolean</code>
            * [.traverse(fn, path, order)](#module_Tree--Tree+traverse)
            * [.valuesOf(path, inclusive, nested, depth)](#module_Tree--Tree+valuesOf) ⇒ <code>Array</code>
        * _static_
            * [.factory()](#module_Tree--Tree.factory)
            * [.s2p(tree, pathString)](#module_Tree--Tree.s2p) ⇒ <code>function</code> \| <code>Array</code>
        * _inner_
            * [~FactoryOptions](#module_Tree--Tree..FactoryOptions) : <code>Object</code>

<a name="exp_module_Tree--Tree"></a>

### Tree ⏏
Class representing a tree.Paths provided to the tree must strings, or arrays of strings.Paths are not required to include the root node id.The static Tree.factory method is favored over the direct use of the constructor.

**Kind**: Exported class  
<a name="new_module_Tree--Tree_new"></a>

#### new Tree(datum, root_node_id, path_string_delimiter, dataMap, distinct, show_root)
The path_string_delimiter, root_node_id, and distinct properties are set in the constructor and cannot be reset.For parameter details see the static Factory method.

**Throws**:

- show_root must be one of: 'yes', 'no', or 'auto'.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| datum | <code>\*</code> |  | Optional. Defaults to undefined. |
| root_node_id | <code>String</code> |  | Optional. Defaults to "root". |
| path_string_delimiter | <code>String</code> |  | Optional. Defaults to a pipe '|'. |
| dataMap | <code>Map</code> |  | Optional. Defaults to a Map. |
| distinct | <code>Boolean</code> | <code>true</code> | Optional. Defaults to True. |
| show_root | <code>String</code> | <code>auto</code> | Optional. Defaults to 'auto'. |

<a name="module_Tree--Tree+depth"></a>

#### tree.depth ⇒ <code>Number</code>
**Kind**: instance property of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Number</code> - The count of nodes in the longest path, including the root.  
**Read only**: true  
<a name="module_Tree--Tree+hasDescendents"></a>

#### tree.hasDescendents ⇒ <code>Boolean</code>
**Kind**: instance property of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Boolean</code> - True when a node other than the root node exists, else False.  
**Read only**: true  
<a name="module_Tree--Tree+rootNodePath"></a>

#### tree.rootNodePath ⇒ <code>Array</code>
**Kind**: instance property of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - The key to the root node as an Array.  
**Read only**: true  
<a name="module_Tree--Tree+size"></a>

#### tree.size ⇒ <code>Number</code>
**Kind**: instance property of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Number</code> - The number of nodes including the root node.  
**Read only**: true  
<a name="module_Tree--Tree+cascade"></a>

#### tree.cascade(fn, path, inclusive) ⇒ <code>Void</code>
Apply a function to a node's descendents, and optionally to the node itself.NOTE: The order of application is NOT guaranteed.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Throws**:

- node does not exist, use has?
- function provided must return undefined or an [path, datum] entry


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | Optional. Defaults to identity. The function to apply to each node; receives an entry and tree as arguments. The function MUST return a [path, datum] entry or undefined. |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to false. When true, the entry for the path itself will also be provided to the function. |

<a name="module_Tree--Tree+clear"></a>

#### tree.clear() ⇒ <code>Void</code>
Clear all nodes and datums.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
<a name="module_Tree--Tree+delete"></a>

#### tree.delete(path, inclusive) ⇒ <code>Boolean</code>
Remove a node and its descendents.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Boolean</code> - True when the node(s) to be removed exist(s), else False.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>true</code> | Optional. Defaults to true. When true, the entry for the path itself will be included in the group to be deleted. |

<a name="module_Tree--Tree+entriesOf"></a>

#### tree.entriesOf(path, inclusive, nested, depth) ⇒ <code>Array</code>
Provide a set of entries which match a path's descendents, and optionally include the path's entry.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - When nested is False, returns an array of [key, datum] entries.When nested is True, returns a nested array of [key, datum, descendents] entries.When the distinct property of the tree is True, keys are returned as node ids.NOTE: insertion order is NOT guaranteed.  
**Throws**:

- path must be an array or a string
- node does not exist, use has?
- depth must be an integer
- depth cannot be zero when inclusive is false


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. When True, the entry for the path itself will be included. |
| nested | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. Defines how the output array is returned. |
| depth | <code>integer</code> |  | Optional. Defaults to the maximum depth of the tree. An integer representing the maximum depth from the path. |

<a name="module_Tree--Tree+everyOf"></a>

#### tree.everyOf(fn, path, inclusive, depth) ⇒ <code>Boolean</code>
Tests whether all qualifying entries pass the test implemented by the provided function.WARNING: When the qualifiying entries are an empty array this method returns True.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Boolean</code> - True when all qualifying entries pass the test implemented by the provided function, else False.  
**Throws**:

- path must be an array or a string
- node does not exist, use has?
- depth must be an integer
- depth cannot be zero when inclusive is false


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | Optional. Defaults to identity. The function to apply to each node which should return truthy or falsey. |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to false. When True, the entry for the path itself will also be provided to the function. |
| depth | <code>integer</code> |  | Optional. Defaults to the maximum depth of the tree. An integer representing the maximum depth from the path. |

<a name="module_Tree--Tree+firstDescendentsOf"></a>

#### tree.firstDescendentsOf(path) ⇒ <code>Array</code>
Provide a set of entries which match a path's immediate descendents.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - A flat array of [key, datum] entries for the immediate descendents of the path.NOTE: insertion order is not guaranteed.  
**Throws**:

- path must be an array or a string
- node does not exist, use has?


| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be used. |

<a name="module_Tree--Tree+get"></a>

#### tree.get(path) ⇒
Get a node's value.NOTE: An exception is thrown when the path does not exist.In contrast to the Map api, an exception is thrown because the value of a node is allowed to be undefined.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: The datum at the path.  
**Throws**:

- path must be an array or string
- node does not exist, use has()?


| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be used. |

<a name="module_Tree--Tree+getAncestorOf"></a>

#### tree.getAncestorOf(path) ⇒
Get a node's ancestor's value.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: The datum of the ancestor of the path.  
**Throws**:

- path must be an array or string
- node does not exist, use has()?
- no ancestor exists for root node


| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |

<a name="module_Tree--Tree+has"></a>

#### tree.has(path) ⇒ <code>Boolean</code>
Check whether a node exists.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Boolean</code> - True when the datum for a node exists for the derived path (including undefined), else False.  
**Throws**:

- path must be an array or string


| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |

<a name="module_Tree--Tree+keysOf"></a>

#### tree.keysOf(path, inclusive, nested, depth) ⇒ <code>Array</code>
Provide a set of keys which match a path's descendents, and optionally include the path's key.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - When nested is False, returns an array of keys.When nested is True, returns a nested array of [key, descendents] entries.When the distinct property of the tree is True, keys will be returned as node ids.NOTE: insertion order is NOT guaranteed.  
**Throws**:

- path must be an array or a string
- depth must be an integer
- depth cannot be zero when inclusive is false


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. When True, the entry entry for the path itself will be included. |
| nested | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. Defines how the output array is returned. |
| depth | <code>integer</code> |  | Optional. Defaults to the maximum depth of the tree. An integer representing the maximum depth of elements qualifying for return. |

<a name="module_Tree--Tree+merge"></a>

#### tree.merge(source)
Merge a Tree into an existing target Tree.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Throws**:

- non distinct trees cannot be merged into distinct trees


| Param | Type |
| --- | --- |
| source | <code>Tree</code> | 

<a name="module_Tree--Tree+set"></a>

#### tree.set(path, datum, ancestor) ⇒ <code>Array</code>
Append or update a datum at the path provided.NOTE: When the path argument is a node id path array, intermediate nodes which do not exist will be provided a datum of undefined.NOTE: The ancestor argument is invalid and therefore ignored for a Tree whose distinct property is false.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - The path assigned to the datum.  
**Throws**:

- path must be a simple string (when the ancestor provided is not a simple string)
- elements in a path cannot be empty strings
- ancestor does not exist (when the ancestor provided is not in the tree)
- ancestor argument cannot be used to set nodes on distinct trees, full node id paths are required
- ancestor must be a simple string or single element array
- path already exists in this distinct tree
- elements in a path cannot be duplicated with distinct trees


| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| datum | <code>\*</code> | Optional. Defaults to undefined. Value to be associated with the path. |
| ancestor | <code>String</code> | Optional. Ignored when the path is not provided. Must be a String, path_string_delimiter delimited String, or Array. |

<a name="module_Tree--Tree+someOf"></a>

#### tree.someOf(fn, path, inclusive, depth) ⇒ <code>Boolean</code>
Tests whether at least one qualifying datum passes the test implemented by the provided function.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Boolean</code> - True when all datums in the tree pass the test implemented by the provided function, else False.  
**Throws**:

- path must be an array or a string
- node does not exist, use has?
- depth must be an integer
- depth cannot be zero when inclusive is false


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | Optional. Defaults to identity. The function to apply to each node, which should return truthy or falsey. |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. When True, the entry for the path itself will also be provided to the function. |
| depth | <code>integer</code> |  | Optional. Defaults to the maximum depth of the tree. An integer representing the maximum depth from the path. |

<a name="module_Tree--Tree+traverse"></a>

#### tree.traverse(fn, path, order)
Apply a function to each node in a path in a specified order.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Throws**:

- order must be one of "asc, desc"
- node does not exist, use has?
- function provided must return undefined or an [path, datum] entry


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | Optional. Defaults to identity. The function to apply to each node; receives an entry and tree as arguments. MUST return a [path, datum] entry or undefined. |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| order | <code>enum</code> | <code>desc</code> | Optional. Defaults to "desc". One of "asc"|"desc". NOTE: "desc" means from the root towards descendents. |

<a name="module_Tree--Tree+valuesOf"></a>

#### tree.valuesOf(path, inclusive, nested, depth) ⇒ <code>Array</code>
Provide a set of values which match a path's descendents, and optionally include the path's value.

**Kind**: instance method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>Array</code> - When nested is False, returns an array of values.When nested is True, returns a nested array of [value, descendents] entries.NOTE: insertion order is NOT guaranteed.  
**Throws**:

- path must be an array or a string
- node does not exist, use has?
- depth must be an integer
- depth cannot be zero when inclusive is false


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>\*</code> |  | Optional. Must be a String, path_string_delimiter delimited String, or Array. When undefined, blank, or empty, the root node's path will be utilized. |
| inclusive | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. When True, the entry entry for the path itself will be included. |
| nested | <code>Boolean</code> | <code>false</code> | Optional. Defaults to False. Defines how the output array is returned. |
| depth | <code>Integer</code> |  | Optional. Defaults to the maximum depth of the tree. An integer representing the maximum depth from the path. |

<a name="module_Tree--Tree.factory"></a>

#### Tree.factory()
Factory method to create a new Tree.The factory method is favored over direct use of the constructor.

**Kind**: static method of [<code>Tree</code>](#exp_module_Tree--Tree)  

| Param | Type | Description |
| --- | --- | --- |
| Optional. | <code>FactoryOptions</code> | See constructor for object contents. |

<a name="module_Tree--Tree.s2p"></a>

#### Tree.s2p(tree, pathString) ⇒ <code>function</code> \| <code>Array</code>
curried function to convert a string delimited with a pathStringDelimiter to an array.

**Kind**: static method of [<code>Tree</code>](#exp_module_Tree--Tree)  
**Returns**: <code>function</code> - The function returned accepts a single parameter:<code>Array</code>  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>Tree</code> |  |
| pathString | <code>String</code> | Optional, Defaults to an empty string. |

<a name="module_Tree--Tree..FactoryOptions"></a>

#### Tree~FactoryOptions : <code>Object</code>
**Kind**: inner typedef of [<code>Tree</code>](#exp_module_Tree--Tree)  

| Param | Type | Description |
| --- | --- | --- |
| datum | <code>\*</code> | Optional. Defaults to undefined. The data associated with the root node. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| root_node_id | <code>String</code> | Optional. Defaults to "root". The name used for the root node. n.b. The root_node_id is set in the constructor and cannot be reset. |
| path_string_delimiter, | <code>String</code> | Optional. Defaults to a pipe "|". The internal delimiter for paths ("|"). n.b. The path_string_delimiter is set in the constructor and cannot be reset. |
| dataMap | <code>Map</code> | Optional. Defaults to a Map. Internal storage for the tree. |
| distinct | <code>Boolean</code> | Optional. Defaults to True. Distinct trees have node ids which are never duplicated at any depth or breadth within the tree. When distinct is true the ancestor attribute is enabled (but not required) in the set method. Because node ids are unique, distinct trees can find nodes by node id alone. A node id must always be a string which does not contain the path_string_delimiter, or a single element array. Distinct trees never use node id paths. Non distinct trees may have the same node id appear in more than one place in the tree structure. When distinct is false the ancestor attribute is disallowed in the set method. Because node ids may appears in multiple places, keys must be full node id paths. |
| show_root | <code>String</code> | Optional Defaults to 'auto'. One of : 'yes', 'no', or 'auto'. Applies to non distinct trees only. When 'yes' the root node is included in node id paths. When 'no'  the root node is not included in node id paths. When 'auto' the root node is included when it's datum is not undefined. |

