var Delta = require('../../lib/delta');
var expect = require('chai').expect;


describe('diff()', function () {
  it('insert', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('AB');
    var expected = new Delta().retain(1).insert('B');
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('delete', function () {
    var a = new Delta().insert('AB');
    var b = new Delta().insert('A');
    var expected = new Delta().retain(1).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('retain', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('A');
    var expected = new Delta();
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('format', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('A', { bold: true });
    var expected = new Delta().retain(1, { bold: true });
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed integer match', function () {
    var a = new Delta().insert(1);
    var b = new Delta().insert(1);
    var expected = new Delta();
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed integer mismatch', function () {
    var a = new Delta().insert(1);
    var b = new Delta().insert(2);
    var expected = new Delta().delete(1).insert(2);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed object match', function () {
    var a = new Delta().insert({ image: 'http://quilljs.com' });
    var b = new Delta().insert({ image: 'http://quilljs.com' });
    var expected = new Delta();
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed object mismatch', function () {
    var a = new Delta().insert({ image: 'http://quilljs.com', alt: 'Overwrite' });
    var b = new Delta().insert({ image: 'http://quilljs.com' });
    var expected = new Delta().insert({ image: 'http://quilljs.com' }).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('embed false positive', function () {
    var a = new Delta().insert(1);
    var b = new Delta().insert(String.fromCharCode(0)); // Placeholder char for embed in diff()
    var expected = new Delta().insert(String.fromCharCode(0)).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('error on non-documents', function () {
    var a = new Delta().insert('A');
    var b = new Delta().retain(1).insert('B');
    expect(function () {
      a.diff(b);
    }).to.throw(Error);
    expect(function () {
      b.diff(a);
    }).to.throw(Error);
  });

  it('inconvenient indexes', function () {
    var a = new Delta().insert('12', { bold: true }).insert('34', { italic: true });
    var b = new Delta().insert('123', { color: 'red' });
    var expected = new Delta().retain(2, { bold: null, color: 'red' }).retain(1, { italic: null, color: 'red' }).delete(1);
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('combination', function () {
    var a = new Delta().insert('Bad', { color: 'red' }).insert('cat', { color: 'blue' });
    var b = new Delta().insert('Good', { bold: true }).insert('dog', { italic: true });
    var expected = new Delta().insert('Good', { bold: true }).delete(2).retain(1, { italic: true, color: null }).delete(3).insert('og', { italic: true });
    expect(a.diff(b)).to.deep.equal(expected);
  });

  it('same document', function () {
    var a = new Delta().insert('A').insert('B', { bold: true });
    expected = new Delta();
    expect(a.diff(a)).to.deep.equal(expected);
  });

  it('immutability', function () {
    var attr1 = { color: 'red' };
    var attr2 = { color: 'red' };
    var a1 = new Delta().insert('A', attr1);
    var a2 = new Delta().insert('A', attr1);
    var b1 = new Delta().insert('A', { bold: true }).insert('B');
    var b2 = new Delta().insert('A', { bold: true }).insert('B');
    var expected = new Delta().retain(1, { bold: true, color: null }).insert('B');
    expect(a1.diff(b1)).to.deep.equal(expected);
    expect(a1).to.deep.equal(a2);
    expect(b2).to.deep.equal(b2);
    expect(attr1).to.deep.equal(attr2);
  });
});
