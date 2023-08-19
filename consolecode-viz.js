const copyRef = copy;
GraphsList2 = Calc._calc.globalHotkeys.mygraphsController.graphsController.__savedGraphs.map(x=>x.hash)
var len = GraphsList2.length;
GraphsList = [];
ParentGraphsList = [];
var thetitles = {};
var thedates = {};

async function desmopast(hash0) {
    let cur = hash0;
    var setdate = '';
    while (true) {

        try {
            json = await (
                await fetch(`https://www.desmos.com/calculator/${cur}`, {
                    headers: {
                        Accept: "application/json",
                    },
                })
            ).json()
        } catch (err) {}
        if (json) {
            setdate = json.created;
        }
        if (!json) {
            printlog();
            json = {};
            json.title = "Desmos | Graphing Calculator"
        }

        if (json.created) {
            setdate = json.created;
        };
        thetitles[cur] = json.title;
        thedates[cur] = setdate;
        if (!GraphsList.includes(cur)) {
            GraphsList.push(cur);
            if (!json.parent_hash) {
                ParentGraphsList.push(null);
            } else {
                ParentGraphsList.push(json.parent_hash)
            };
        }
        if (!json.parent_hash) {
            break
        };
        cur = json.parent_hash;
    }
}

console.log('Please wait');
var saveprogressindex = 0;
const batches = 20;
for (let index = 0; index < batches; index++) {
    const promises = GraphsList2.slice(index * Math.ceil(len / batches), Math.ceil(len / batches) * (index + 1)).map(desmopast);
    await Promise.all(promises);
    saveprogressindex = index;
    printlog();
}
console.log('Step 1 of 3 ✅\nHashes loaded!');

function printlog() {
    console.clear();
    console.log("Please wait");
    index2 = saveprogressindex + 1
    console.log('[' + (index2) + '/' + batches + '] ' + new Array(batches.toString().length - index2.toString().length + 1).join(' ') + (new Array(index2 + 1).join('█') + new Array(batches - (index2) + 1).join('▒')));
}
//https://typeofnan.dev/an-easy-way-to-build-a-tree-with-object-references/
data = [...Array(GraphsList.length).keys()].map(function(x) {
    return ({
        id: GraphsList[x],
        parentId: ParentGraphsList[x],
        title: thetitles[GraphsList[x]],
        date: thedates[GraphsList[x]]
    })
});
//https://stackoverflow.com/questions/10123953/how-to-sort-an-object-array-by-date-property
(function() {
    if (typeof Object.defineProperty === 'function') {
        try {
            Object.defineProperty(Array.prototype, 'sortBy', {
                value: sb
            });
        } catch (e) {}
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

    function sb(f) {
        for (var i = this.length; i;) {
            var o = this[--i];
            this[i] = [].concat(f.call(o, o, i), o);
        }
        this.sort(function(a, b) {
            for (var i = 0, len = a.length; i < len; ++i) {
                if (a[i] != b[i]) return a[i] < b[i] ? -1 : 1;
            }
            return 0;
        });
        for (var i = this.length; i;) {
            this[--i] = this[i][this[i].length - 1];
        }
        return this;
    }
})();
data.sortBy(function(o) {
    return new Date(o.date)
});
//done sorting data
idMapping2 = data.reduce((acc, el, i) => {
    acc[el.id] = i;
    return acc;
}, {});
let root = [];
data.forEach((el) => {
    if (el.parentId === null) {
        root.push(el);
        return;
    }
    const parentEl = data[idMapping2[el.parentId]];
    parentEl.children = [...(parentEl.children || []), el];
});

console.log('Step 2 of 3 ✅\nTree constructed!');
console.log(root);

var Mindmap = 'digraph G {\n'+[...Array(GraphsList.length).keys()].map(x=>(((ParentGraphsList[x]==null)?('start'):(ParentGraphsList[x]))+' -> '+(GraphsList[x])+';')).join('\n')+'\n'+'start [shape=Mdiamond]\n}';
copyRef(Mindmap);
console.log('Step 3 of 3 ✅\nContents of a DOT file have been placed on your clipboard. Paste the file contents into http://viz-js.com/.');
