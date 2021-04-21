import { Tree, p2228t } from "../tree";
import isFunction from "lodash/fp/isFunction";

// (tree, path)
describe(`function p2228t`, () => {
    test(`can be curried`, () => {
        const tree = Tree.factory();
        const ret = p2228t(tree)
        expect(isFunction(ret)).toBeTruthy();
    });

    describe(`with distinct trees,`, () => {
        test(`always returns the last element of the provided path`, () => {
            const tree = Tree.factory({ distinct: true });
            const path = ["root","a","b","c"];
            const expected = "c";
            const received = p2228t(tree, path);
            expect(received).toEqual(expected);
        });
    });

    describe(`with indistinct trees`, () => {
        describe(`when the trees' showRoot is 'yes'`, () => {
            test(`when the trees' showRoot is 'yes', returns the full path `, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'yes' });
                let path = ["root","a","b","c"];
                let expected = ["root","a","b","c"];
                let received = p2228t(tree, path);
                expect(received).toEqual(expected);

                path = ["root"];
                expected = ["root"];
                received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
        });
        describe(`when the trees' showRoot is 'no'`, () => {
            test(`when the path is not the root path, returns the full path without the root`, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'no' });
                const path = ["root","a","b","c"];
                const expected = ["a","b","c"];
                const received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
            test(`when the path is the root path, returns an empty array `, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'no' });
                const path = ["root"];
                const expected = [];
                const received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
        });
        describe(`when the trees' showRoot is 'auto'`, () => {
            test(`when there is root node data, returns the full path `, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'auto', datum:{id:0, value:42} });
                const path = ["root","a","b","c"];
                const expected = ["root","a","b","c"];
                const received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
            test(`when there is no root node data, and the path is not the root path, returns the full path without the root`, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'auto' });
                const path = ["root","a","b","c"];
                const expected = ["a","b","c"];
                const received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
            test(`when there is no root node data, and the path is the root path, returns an empty array`, () => {
                const tree = Tree.factory({ distinct: false, showRoot:'auto' });
                const path = ["root"];
                const expected = [];
                const received = p2228t(tree, path);
                expect(received).toEqual(expected);
            });
        });
    });
});
