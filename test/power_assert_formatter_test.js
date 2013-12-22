var formatter = require('../lib/power-assert-formatter')(),
    empower = require('empower'),
    weave = require('../test_helper').weave,
    baseAssert = require('assert'),
    assert = empower(baseAssert, formatter),
    assertPowerAssertContextFormatting = function (body, expectedLines) {
        try {
            body();
            baseAssert.fail('AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.message, expectedLines.join('\n'));
        }
    };



suite('power-assert-formatter', function () {

    test('Identifier with empty string', function () {
        var falsyStr = '';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(falsyStr);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(falsyStr);',
            '       |         ',
            '       ""        ',
            ''
        ]);
    });


    test('Identifier with falsy number', function () {
        var falsyNum = 0;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(falsyNum);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(falsyNum);',
            '       |         ',
            '       0         ',
            ''
        ]);
    });


    test('UnaryExpression, negation', function () {
        var truth = true;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!truth);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!truth);',
            '       ||      ',
            '       |true   ',
            '       false   ',
            ''
        ]);
    });


    test('UnaryExpression, double negative', function () {
        var some = '';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!!some);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!!some);',
            '       |||     ',
            '       ||""    ',
            '       |true   ',
            '       false   ',
            ''
        ]);
    });


    test('typeof operator: assert(typeof foo !== "undefined");', function () {
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(typeof foo !== "undefined");'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(typeof foo !== "undefined");',
            '       |          |                ',
            '       |          false            ',
            '       "undefined"                 ',
            ''
        ]);
    });


    test('undefined property: assert({}.hoge === "xxx");', function () {
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert({}.hoge === "xxx");'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert({}.hoge === "xxx");',
            '          |    |          ',
            '          |    false      ',
            '          undefined       ',
            ''
        ]);
    });


    test('assert((delete foo.bar) === false);', function () {
        var foo = {
            bar: {
                baz: false
            }
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert((delete foo.bar) === false);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert((delete foo.bar) === false);',
            '        |      |   |    |          ',
            '        |      |   |    false      ',
            '        |      |   {"baz":false}   ',
            '        true   {"bar":{"baz":false}}',
            ''
        ]);
    });


    test('assert((delete nonexistent) === false);', function () {
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert((delete nonexistent) === false);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert((delete nonexistent) === false);',
            '        |                   |          ',
            '        true                false      ',
            ''
        ]);
    });


    test('assert(fuga === piyo);', function () {
        var fuga = 'foo',
            piyo = 8;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(fuga === piyo);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(fuga === piyo);',
            '       |    |   |     ',
            '       |    |   8     ',
            '       |    false     ',
            '       "foo"          ',
            ''
        ]);
    });


    test('assert(fuga !== piyo);', function () {
        var fuga = 'foo',
            piyo = 'foo';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(fuga !== piyo);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(fuga !== piyo);',
            '       |    |   |     ',
            '       |    |   "foo" ',
            '       |    false     ',
            '       "foo"          ',
            ''
        ]);
    });


    test('BinaryExpression with Literal and Identifier: assert(fuga !== 4);', function () {
        var fuga = 4;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(fuga !== 4);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(fuga !== 4);',
            '       |    |      ',
            '       4    false  ',
            ''
        ]);
    });


    test('assert(4 !== 4);', function () {
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(4 !== 4);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(4 !== 4);',
            '         |      ',
            '         false  ',
            ''
        ]);
    });


    test('MemberExpression: assert(ary1.length === ary2.length);', function () {
        var ary1 = ['foo', 'bar'];
        var ary2 = ['aaa', 'bbb', 'ccc'];
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(ary1.length === ary2.length);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(ary1.length === ary2.length);',
            '       |    |      |   |    |       ',
            '       |    |      |   |    3       ',
            '       |    |      |   ["aaa","bbb","ccc"]',
            '       |    2      false            ',
            '       ["foo","bar"]                ',
            ''
        ]);
    });


    test('LogicalExpression: assert(5 < actual && actual < 13);', function () {
        var actual = 16;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(5 < actual && actual < 13);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(5 < actual && actual < 13);',
            '         | |      |  |      |     ',
            '         | |      |  16     false ',
            '         | 16     false           ',
            '         true                     ',
            ''
        ]);
    });


    test('LogicalExpression OR: assert.ok(actual < 5 || 13 < actual);', function () {
        var actual = 10;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.ok(actual < 5 || 13 < actual);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.ok(actual < 5 || 13 < actual);',
            '          |      |   |     | |       ',
            '          |      |   |     | 10      ',
            '          |      |   false false     ',
            '          10     false               ',
            ''
        ]);
    });


    test('Characterization test of LogicalExpression current spec: assert(2 > actual && actual < 13);', function () {
        var actual = 5;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(2 > actual && actual < 13);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(2 > actual && actual < 13);',
            '         | |      |               ',
            '         | 5      false           ',
            '         false                    ',
            ''
        ]);
    });


    test('Deep MemberExpression chain: assert(foo.bar.baz);', function () {
        var foo = {
            bar: {
                baz: false
            }
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(foo.bar.baz);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(foo.bar.baz);',
            '       |   |   |    ',
            '       |   |   false',
            '       |   {"baz":false}',
            '       {"bar":{"baz":false}}',
            ''
        ]);
    });


    test('computed MemberExpression with Literal key: assert(foo["bar"].baz);', function () {
        var foo = {
            bar: {
                baz: false
            }
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(foo["bar"].baz);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(foo["bar"].baz);',
            '       |  |       |    ',
            '       |  |       false',
            '       |  {"baz":false}',
            '       {"bar":{"baz":false}}',
            ''
        ]);
    });


    test('computed MemberExpression with Identifier key: assert(foo[propName].baz);', function () {
        var propName = 'bar',
            foo = {
                bar: {
                    baz: false
                }
            };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(foo[propName].baz);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(foo[propName].baz);',
            '       |  ||         |    ',
            '       |  |"bar"     false',
            '       |  {"baz":false}   ',
            '       {"bar":{"baz":false}}',
            ''
        ]);
    });


    test('computed MemberExpression chain with various key: assert(foo[propName]["baz"][keys()[0]]);', function () {
        var keys = function () { return ["toto"]; },
            propName = "bar",
            foo = {
                bar: {
                    baz: {
                        toto: false
                    }
                }
            };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(foo[propName]["baz"][keys()[0]]);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(foo[propName]["baz"][keys()[0]]);',
            '       |  ||        |      ||     |     ',
            '       |  ||        |      ||     "toto"',
            '       |  ||        |      |["toto"]    ',
            '       |  ||        |      false        ',
            '       |  |"bar"    {"toto":false}      ',
            '       |  {"baz":{"toto":false}}        ',
            '       {"bar":{"baz":{"toto":false}}}   ',
            ''
        ]);
    });


    test('assert(func());', function () {
        var func = function () { return false; };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(func());'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(func());',
            '       |       ',
            '       false   ',
            ''
        ]);
    });


    test('assert(obj.age());', function () {
        var obj = {
            age: function () {
                return 0;
            }
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(obj.age());'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(obj.age());',
            '       |   |      ',
            '       {}  0      ',
            ''
        ]);
    });


    test('CallExpression with arguments: assert(isFalsy(positiveInt));', function () {
        var isFalsy = function (arg) {
            return !(arg);
        };
        var positiveInt = 50;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(isFalsy(positiveInt));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(isFalsy(positiveInt));',
            '       |       |             ',
            '       false   50            ',
            ''
        ]);
    });


    test('assert(sum(one, two, three) === seven);', function () {
        var sum = function () {
            var result = 0;
            for (var i = 0; i < arguments.length; i += 1) {
                result += arguments[i];
            }
            return result;
        };
        var one = 1, two = 2, three = 3, seven = 7, ten = 10;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(sum(one, two, three) === seven);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(sum(one, two, three) === seven);',
            '       |   |    |    |      |   |      ',
            '       |   |    |    |      |   7      ',
            '       6   1    2    3      false      ',
            ''
        ]);
    });


    test('nexted CallExpression: assert(sum(sum(one, two), three) === sum(sum(two, three), seven));', function () {
        var sum = function () {
            var result = 0;
            for (var i = 0; i < arguments.length; i += 1) {
                result += arguments[i];
            }
            return result;
        };
        var one = 1, two = 2, three = 3, seven = 7, ten = 10;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(sum(sum(one, two), three) === sum(sum(two, three), seven));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(sum(sum(one, two), three) === sum(sum(two, three), seven));',
            '       |   |   |    |     |      |   |   |   |    |       |       ',
            '       |   |   |    |     |      |   12  5   2    3       7       ',
            '       6   3   1    2     3      false                            ',
            ''
        ]);
    });


    test('assert(math.calc.sum(one, two, three) === seven);', function () {
        var math = {
            calc: {
                sum: function () {
                    var result = 0;
                    for (var i = 0; i < arguments.length; i += 1) {
                        result += arguments[i];
                    }
                    return result;
                }
            }
        };
        var one = 1, two = 2, three = 3, seven = 7, ten = 10;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(math.calc.sum(one, two, three) === seven);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(math.calc.sum(one, two, three) === seven);',
            '       |    |    |   |    |    |      |   |      ',
            '       |    |    |   |    |    |      |   7      ',
            '       |    {}   6   1    2    3      false      ',
            '       {"calc":{}}                               ',
            ''
        ]);
    });


    test('Nested CallExpression with BinaryExpression: assert((three * (seven * ten)) === three);', function () {
        var one = 1, two = 2, three = 3, seven = 7, ten = 10;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert((three * (seven * ten)) === three);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert((three * (seven * ten)) === three);',
            '        |     |  |     | |     |   |      ',
            '        |     |  |     | |     |   3      ',
            '        |     |  |     | 10    false      ',
            '        |     |  7     70                 ',
            '        3     210                         ',
            ''
        ]);
    });


    test('Simple BinaryExpression with comment', function () {
        var hoge = 'foo';
        var fuga = 'bar';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.ok(hoge === fuga, "comment");'));
        }, [
            'comment # /path/to/some_test.js:1',
            '',
            'assert.ok(hoge === fuga, "comment");',
            '          |    |   |                ',
            '          |    |   "bar"            ',
            '          |    false                ',
            '          "foo"                     ',
            ''
        ]);
    });


    test('Looooong string', function () {
        var longString = 'very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
        var anotherLongString = 'yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(longString === anotherLongString);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(longString === anotherLongString);',
            '       |          |   |                  ',
            '       |          |   "yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message"',
            '       |          false                  ',
            '       "very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message"',
            ''
        ]);
    });


    test('double byte character width', function () {
        var fuga = 'あい',
            piyo = 'うえお';
        var concat = function (a, b) {
            return a + b;
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!concat(fuga, piyo));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!concat(fuga, piyo));',
            '       ||      |     |      ',
            '       ||      |     "うえお"',
            '       ||      "あい"       ',
            '       |"あいうえお"        ',
            '       false                ',
            ''
        ]);

    });


    test('Japanese hankaku width', function () {
        var fuga = 'ｱｲ',
            piyo = 'ｳｴｵ';
        var concat = function (a, b) {
            return a + b;
        };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!concat(fuga, piyo));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!concat(fuga, piyo));',
            '       ||      |     |      ',
            '       ||      "ｱｲ"  "ｳｴｵ"  ',
            '       |"ｱｲｳｴｵ"             ',
            '       false                ',
            ''
        ]);

    });


    test('Object having circular structure', function () {
        var cyclic = [], two = 2;
        cyclic.push('foo');
        cyclic.push(cyclic);
        cyclic.push('baz');
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.ok(cyclic[two] === cyclic);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.ok(cyclic[two] === cyclic);',
            '          |     ||    |   |       ',
            '          |     ||    |   ["foo","#Circular#","baz"]',
            '          |     |2    false       ',
            '          |     "baz"             ',
            '          ["foo","#Circular#","baz"]',
            ''
        ]);
    });


    test('UnaryExpression of UnaryExpression: assert(typeof + twoStr === -twoStr);', function () {
        var twoStr = '2';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(typeof + twoStr === -twoStr);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(typeof + twoStr === -twoStr);',
            '       |      | |      |   ||       ',
            '       |      | |      |   |"2"     ',
            '       |      | |      |   -2       ',
            '       |      2 "2"    false        ',
            '       "number"                     ',
            ''
        ]);
    });


    test('AssignmentExpression: assert(minusOne += 1);', function () {
        var minusOne = -1;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(minusOne += 1);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(minusOne += 1);',
            '                |     ',
            '                0     ',
            ''
        ]);
    });


    test('AssignmentExpression with MemberExpression: assert((dog.age += 1) === four);', function () {
        var dog = { age: 2 }, four = 4;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert((dog.age += 1) === four);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert((dog.age += 1) === four);',
            '                |     |   |     ',
            '                |     |   4     ',
            '                3     false     ',
            ''
        ]);
    });


    test('ArrayExpression: assert([foo, bar].length === four);', function () {
        var foo = 'hoge', bar = 'fuga', four = 4;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert([foo, bar].length === four);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert([foo, bar].length === four);',
            '        |    |    |      |   |     ',
            '        |    |    |      |   4     ',
            '        |    |    2      false     ',
            '        |    "fuga"                ',
            '        "hoge"                     ',
            ''
        ]);
    });


    test('various expressions in ArrayExpression: assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");', function () {
        var foo = {bar: 'fuga'}, baz = function (arg) { return null; }, moo = 'boo', fourStr = '4';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");',
            '       |        |   |    |   |      | |        |             ',
            '       |        |   |    |   "boo"  4 "4"      false         ',
            '       |        |   |    null                                ',
            '       |        |   "fuga"                                   ',
            '       "object" {"bar":"fuga"}                               ',
            ''
        ]);
    });


    test('prefix UpdateExpression: assert(++minusOne);', function () {
        var minusOne = -1;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(++minusOne);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(++minusOne);',
            '       |           ',
            '       0           ',
            ''
        ]);
    });


    test('suffix UpdateExpression: assert(zero--);', function () {
        var zero = 0;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(zero--);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(zero--);',
            '       |       ',
            '       0       ',
            ''
        ]);
    });


    test('ConditionalExpression: assert(truthy ? falsy : anotherFalsy);', function () {
        var truthy = 'truthy', falsy = 0, anotherFalsy = null;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(truthy ? falsy : anotherFalsy);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(truthy ? falsy : anotherFalsy);',
            '       |        |                     ',
            '       "truthy" 0                     ',
            ''
        ]);
    });


    test('ConditionalExpression of ConditionalExpression: assert(falsy ? truthy : truthy ? anotherFalsy : truthy);', function () {
        var truthy = 'truthy', falsy = 0, anotherFalsy = null;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(falsy ? truthy : truthy ? anotherFalsy : truthy);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(falsy ? truthy : truthy ? anotherFalsy : truthy);',
            '       |                |        |                      ',
            '       0                "truthy" null                   ',
            ''
        ]);
    });


    test('RegularExpression will not be instrumented: assert(/^not/.exec(str));', function () {
        var str = 'ok';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(/^not/.exec(str));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(/^not/.exec(str));',
            '              |    |     ',
            '              null "ok"  ',
            ''
        ]);
    });



    test('ObjectExpression: assert(!({foo: bar, hoge: fuga}));', function () {
        var bar = 'toto', fuga = 100;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!({foo: bar, hoge: fuga}));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!({foo: bar, hoge: fuga}));',
            '       |       |          |       ',
            '       false   "toto"     100     ',
            ''
        ]);
    });


    test('complex ObjectExpression: assert(!({ foo: bar.baz, name: nameOf({firstName: first, lastName: last}) }));', function () {
        var bar = { baz: 'BAZ' },  first = 'Brendan', last = 'Eich',
            nameOf = function (person) { return person.firstName + ' ' + person.lastName; };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!({ foo: bar.baz, name: nameOf({firstName: first, lastName: last}) }));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!({ foo: bar.baz, name: nameOf({firstName: first, lastName: last}) }));',
            '       |        |   |          |                  |                |          ',
            '       |        |   "BAZ"      "Brendan Eich"     "Brendan"        "Eich"     ',
            '       false    {"baz":"BAZ"}                                                 ',
            ''
        ]);
    });


    test('NewExpression: assert(!(new Array(foo, bar, baz)));', function () {
        var foo = 'foo', bar = 'bar', baz = 'baz';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(!(new Array(foo, bar, baz)));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(!(new Array(foo, bar, baz)));',
            '       | |         |    |    |      ',
            '       | |         |    |    "baz"  ',
            '       | |         |    "bar"       ',
            '       | |         "foo"            ',
            '       | ["foo","bar","baz"]        ',
            '       false                        ',
            ''
        ]);
    });


    test('NewExpression: assert(baz === new Array(foo, bar, baz)[1]);', function () {
        var foo = 'foo', bar = 'bar', baz = 'baz';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(baz === new Array(foo, bar, baz)[1]);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(baz === new Array(foo, bar, baz)[1]);',
            '       |   |   |         |    |    |   |    ',
            '       |   |   |         |    |    |   "bar"',
            '       |   |   |         |    |    "baz"    ',
            '       |   |   |         |    "bar"         ',
            '       |   |   |         "foo"              ',
            '       |   |   ["foo","bar","baz"]          ',
            '       |   false                            ',
            '       "baz"                                ',
            ''
        ]);
    });


    test('FunctionExpression will not be instrumented: assert(baz === (function (a, b) { return a + b; })(foo, bar));', function () {
        var foo = 'foo', bar = 'bar', baz = 'baz';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert(baz === (function (a, b) { return a + b; })(foo, bar));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert(baz === (function (a, b) { return a + b; })(foo, bar));',
            '       |   |   |                                   |    |     ',
            '       |   |   |                                   |    "bar" ',
            '       |   |   "foobar"                            "foo"      ',
            '       |   false                                              ',
            '       "baz"                                                  ',
            ''
        ]);
    });




    test('equal with Literal and Identifier: assert.equal(1, minusOne);', function () {
        var minusOne = -1;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.equal(1, minusOne)'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.equal(1, minusOne)',
            '                |        ',
            '                -1       ',
            ''
        ]);
    });


    test('equal with UpdateExpression and Literal: assert.equal(++minusOne, 1);', function () {
        var minusOne = -1;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.equal(++minusOne, 1)'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.equal(++minusOne, 1)',
            '             |             ',
            '             0             ',
            ''
        ]);
    });


    test('notEqual with ConditionalExpression and AssignmentExpression: assert.notEqual(truthy ? fiveInStr : tenInStr, four += 1);', function () {
        var truthy = 3, fiveInStr = '5', tenInStr = '10', four = 4;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.notEqual(truthy ? fiveInStr : tenInStr, four += 1)'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.notEqual(truthy ? fiveInStr : tenInStr, four += 1)',
            '                |        |                          |    ',
            '                3        "5"                        5    ',
            ''
        ]);
    });


    test('strictEqual with CallExpression and BinaryExpression, Identifier: assert.strictEqual(obj.truthy(), three == threeInStr);', function () {
        var obj = { truthy: function () { return 'true'; }}, three = 3, threeInStr = '3';
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.strictEqual(obj.truthy(), three == threeInStr);'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.strictEqual(obj.truthy(), three == threeInStr);',
            '                   |   |         |     |  |           ',
            '                   |   |         |     |  "3"         ',
            '                   {}  "true"    3     true           ',
            ''
        ]);
    });


    test('notStrictEqual with MemberExpression and UnaryExpression: assert.notStrictEqual(typeof undefinedVar, types.undef);', function () {
        var types = { undef: 'undefined' };
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.notStrictEqual(typeof undefinedVar, types.undef)'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.notStrictEqual(typeof undefinedVar, types.undef)',
            '                      |                    |     |     ',
            '                      |                    |     "undefined"',
            '                      "undefined"          {"undef":"undefined"}',
            ''
        ]);
    });


    test('deepEqual with LogicalExpression and ObjectExpression: assert.deepEqual(alice || bob, {name: kenName, age: four});', function () {
        var alice = {name: 'alice', age: 3}, bob = {name: 'bob', age: 5}, kenName = 'ken', four = 4;
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.deepEqual(alice || bob, {name: kenName, age: four});'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.deepEqual(alice || bob, {name: kenName, age: four});',
            '                 |     |              |             |      ',
            '                 |     |              "ken"         4      ',
            '                 |     {"name":"alice","age":3}            ',
            '                 {"name":"alice","age":3}                  ',
            ''
        ]);
    });


    test('notDeepEqual with ArrayExpression and NewExpression: assert.notDeepEqual([foo, bar, baz], new Array(foo, bar, baz));', function () {
        var foo = 'foo', bar = ['toto', 'tata'], baz = {name: 'hoge'};
        assertPowerAssertContextFormatting(function () {
            eval(weave('assert.notDeepEqual([foo, bar, baz], new Array(foo, bar, baz));'));
        }, [
            '# /path/to/some_test.js:1',
            '',
            'assert.notDeepEqual([foo, bar, baz], new Array(foo, bar, baz));',
            '                     |    |    |     |         |    |    |     ',
            '                     |    |    |     |         |    |    {"name":"hoge"}',
            '                     |    |    |     |         |    ["toto","tata"]',
            '                     |    |    |     |         "foo"           ',
            '                     |    |    |     ["foo",["toto","tata"],{"name":"hoge"}]',
            '                     |    |    {"name":"hoge"}                 ',
            '                     |    ["toto","tata"]                      ',
            '                     "foo"                                     ',
            ''
        ]);
    });

});
