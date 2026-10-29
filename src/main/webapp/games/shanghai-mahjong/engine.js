(function (root) {
  'use strict';

  var FACE_LABELS = [
    '一萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬',
    '一條', '二條', '三條', '四條', '五條', '六條', '七條', '八條', '九條',
    '一筒', '二筒', '三筒', '四筒', '五筒', '六筒', '七筒', '八筒', '九筒',
    '東', '南', '西', '北', '中', '發', '白',
    '梅', '蘭', '竹', '菊', '春', '夏', '秋', '冬'
  ];
  var FACES = FACE_LABELS.map(function (label, face) {
    var suit;
    var rank;
    var group;
    if (face < 9) {
      suit = 'wan'; rank = face + 1; group = 'face-' + face;
    } else if (face < 18) {
      suit = 'tiao'; rank = face - 8; group = 'face-' + face;
    } else if (face < 27) {
      suit = 'tong'; rank = face - 17; group = 'face-' + face;
    } else if (face < 31) {
      suit = 'wind'; rank = face - 26; group = 'face-' + face;
    } else if (face < 34) {
      suit = 'dragon'; rank = face - 30; group = 'face-' + face;
    } else if (face < 38) {
      suit = 'flower'; rank = face - 33; group = 'flower';
    } else {
      suit = 'season'; rank = face - 37; group = 'season';
    }
    return { face: face, suit: suit, rank: rank, label: label, group: group };
  });

  function grid(width, height, x, y, z) {
    var cells = [];
    for (var row = 0; row < height; row += 1) {
      for (var col = 0; col < width; col += 1) {
        cells.push({ x: (x + col) * 2, y: (y + row) * 2, z: z });
      }
    }
    return cells;
  }

  function append(target, cells) {
    Array.prototype.push.apply(target, cells);
  }

  function twinTowerCells() {
    var cells = grid(12, 8, 0, 0, 0);
    append(cells, grid(4, 4, 0, 2, 1));
    append(cells, grid(4, 4, 8, 2, 1));
    append(cells, grid(3, 2, 1, 3, 2));
    append(cells, grid(3, 2, 9, 3, 2));
    append(cells, grid(2, 1, 2, 4, 3));
    append(cells, grid(2, 1, 10, 4, 3));
    return cells;
  }

  function spiralCells() {
    var cells = grid(10, 8, 0, 0, 0);
    append(cells, grid(8, 4, 1, 2, 1));
    append(cells, grid(6, 3, 2, 2, 2));
    append(cells, grid(4, 2, 3, 3, 3));
    append(cells, grid(3, 2, 4, 3, 4));
    return cells;
  }

  var LAYOUT_DATA = [
    { id: 'turtle', name: '龜', level: 1, cells: (function () {
      var cells = grid(12, 8, 0, 0, 0);
      append(cells, grid(8, 6, 2, 1, 1));
      return cells;
    }()) },
    { id: 'pyramid', name: '金字塔', level: 2, cells: (function () {
      var cells = grid(10, 8, 0, 0, 0);
      append(cells, grid(8, 6, 1, 1, 1));
      append(cells, grid(4, 4, 3, 2, 2));
      return cells;
    }()) },
    { id: 'fortress', name: '堡壘', level: 3, cells: (function () {
      var cells = grid(12, 8, 0, 0, 0);
      append(cells, grid(8, 4, 2, 2, 1));
      append(cells, grid(4, 4, 4, 2, 2));
      return cells;
    }()) },
    { id: 'dragon', name: '龍', level: 3, cells: (function () {
      var cells = grid(12, 6, 0, 1, 0);
      append(cells, grid(10, 4, 1, 2, 1));
      append(cells, grid(8, 4, 2, 2, 2));
      return cells;
    }()) },
    { id: 'twintowers', name: '雙塔', level: 4, cells: twinTowerCells() },
    { id: 'spiral', name: '螺旋迷宮', level: 5, cells: spiralCells() }
  ];

  var LAYOUTS = LAYOUT_DATA.map(function (layout) {
    return { id: layout.id, name: layout.name, tiles: layout.cells.length, level: layout.level };
  });

  function mulberry32(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      var value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(array, random) {
    for (var i = array.length - 1; i > 0; i -= 1) {
      var j = Math.floor(random() * (i + 1));
      var value = array[i];
      array[i] = array[j];
      array[j] = value;
    }
    return array;
  }

  function isFaceMatch(faceA, faceB) {
    if (faceA === faceB) return true;
    var a = FACES[faceA];
    var b = FACES[faceB];
    return !!a && !!b && a.group === b.group && (a.suit === 'flower' || a.suit === 'season');
  }

  function tileIsFree(tile, tiles, removed) {
    if (!tile || removed[tile.id]) return false;
    // 依序檢查上層覆蓋與左右鄰牌，至少一側必須保持暢通。
    for (var i = 0; i < tiles.length; i += 1) {
      var above = tiles[i];
      if (!removed[above.id] && above.z === tile.z + 1 &&
          Math.abs(above.x - tile.x) < 2 && Math.abs(above.y - tile.y) < 2) return false;
    }
    var leftBlocked = false;
    var rightBlocked = false;
    for (var j = 0; j < tiles.length; j += 1) {
      var side = tiles[j];
      if (removed[side.id] || side.id === tile.id || side.z !== tile.z || Math.abs(side.y - tile.y) >= 2) continue;
      if (side.x === tile.x - 2) leftBlocked = true;
      if (side.x === tile.x + 2) rightBlocked = true;
      if (leftBlocked && rightBlocked) return false;
    }
    return !leftBlocked || !rightBlocked;
  }

  function freeFrom(tiles, removed) {
    var ids = [];
    for (var i = 0; i < tiles.length; i += 1) {
      if (tileIsFree(tiles[i], tiles, removed)) ids.push(tiles[i].id);
    }
    return ids;
  }

  function countPairs(freeIds, tiles) {
    var count = 0;
    for (var i = 0; i < freeIds.length; i += 1) {
      for (var j = i + 1; j < freeIds.length; j += 1) {
        if (isFaceMatch(tiles[freeIds[i]].face, tiles[freeIds[j]].face)) count += 1;
      }
    }
    return count;
  }

  function geometricPairOptions(tiles, removed) {
    var freeIds = freeFrom(tiles, removed);
    var options = [];
    for (var i = 0; i < freeIds.length; i += 1) {
      for (var j = i + 1; j < freeIds.length; j += 1) options.push([freeIds[i], freeIds[j]]);
    }
    return options;
  }

  function canFinishAfter(tiles, removed, pair) {
    var nextRemoved = removed.slice();
    nextRemoved[pair[0]] = true;
    nextRemoved[pair[1]] = true;
    var remaining = 0;
    for (var i = 0; i < tiles.length; i += 1) if (!nextRemoved[tiles[i].id]) remaining += 1;
    if (remaining === 0) return true;
    if (remaining > 8) return true;
    var freeIds = freeFrom(tiles, nextRemoved);
    return freeIds.length >= 2;
  }

  function layoutHeuristic(tiles, pair, difficulty) {
    var first = tiles[pair[0]];
    var second = tiles[pair[1]];
    var centerX = 0;
    var centerY = 0;
    for (var i = 0; i < tiles.length; i += 1) {
      centerX += tiles[i].x;
      centerY += tiles[i].y;
    }
    centerX /= tiles.length || 1;
    centerY /= tiles.length || 1;
    var depth = first.z + second.z;
    var centrality = Math.abs(first.x - centerX) + Math.abs(first.y - centerY) +
      Math.abs(second.x - centerX) + Math.abs(second.y - centerY);
    return -depth * (difficulty === 'master' ? 1000 : 100) -
      centrality * (difficulty === 'master' ? 2 : 0.25);
  }

  function chooseGeometryPair(tiles, removed, random, difficulty) {
    var options = geometricPairOptions(tiles, removed);
    var safe = options.filter(function (pair) { return canFinishAfter(tiles, removed, pair); });
    if (safe.length === 0) return null;
    if (difficulty === 'normal') return safe[Math.floor(random() * safe.length)];
    var scored = safe.map(function (pair) {
      return { pair: pair, score: layoutHeuristic(tiles, pair, difficulty) };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    var pickCount = difficulty === 'master' ? Math.min(2, scored.length) : Math.max(1, Math.ceil(scored.length * 0.2));
    return scored[Math.floor(random() * pickCount)].pair;
  }

  function makeFacePairs(count, random, tiles) {
    var used = new Array(42).fill(0);
    tiles.forEach(function (tile) {
      if (tile.removed && Number.isInteger(tile.face) && tile.face >= 0 && tile.face < 42) used[tile.face] += 1;
    });
    var pairs = [];
    for (var face = 0; face < 34; face += 1) {
      var remainingCopies = 4 - used[face];
      if (remainingCopies < 0 || remainingCopies % 2 !== 0) return null;
      for (var copies = 0; copies < remainingCopies / 2; copies += 1) pairs.push([face, face]);
    }
    var flowers = [];
    var seasons = [];
    for (var special = 34; special < 42; special += 1) {
      if (used[special] === 0) (special < 38 ? flowers : seasons).push(special);
      else if (used[special] !== 1) return null;
    }
    shuffle(flowers, random);
    shuffle(seasons, random);
    for (var f = 0; f + 1 < flowers.length; f += 2) pairs.push([flowers[f], flowers[f + 1]]);
    for (var s = 0; s + 1 < seasons.length; s += 2) pairs.push([seasons[s], seasons[s + 1]]);
    if (pairs.length !== count) return null;
    return shuffle(pairs, random);
  }

  function reverseGenerate(tiles, activeIds, random, difficulty) {
    var removed = [];
    for (var i = 0; i < tiles.length; i += 1) removed[i] = true;
    activeIds.forEach(function (id) { removed[id] = false; });
    var sequence = [];
    var maxAttempts = 256;
    for (var attempt = 0; attempt < maxAttempts; attempt += 1) {
      var working = removed.slice();
      var pairs = [];
      var failed = false;
      while (true) {
        var left = 0;
        for (var k = 0; k < activeIds.length; k += 1) if (!working[activeIds[k]]) left += 1;
        if (left === 0) break;
        var pair = chooseGeometryPair(tiles, working, random, difficulty);
        if (!pair) { failed = true; break; }
        working[pair[0]] = true;
        working[pair[1]] = true;
        pairs.push(pair);
      }
      if (!failed) {
        sequence = pairs;
        break;
      }
    }
    if (sequence.length * 2 !== activeIds.length) return null;
    var facePairs = makeFacePairs(sequence.length, random, tiles);
    if (!facePairs) return null;
    // 反向消除時配發相符牌面，因此每一組位置都構成可驗證的解答步驟。
    for (var p = 0; p < sequence.length; p += 1) {
      tiles[sequence[p][0]].face = facePairs[p][0];
      tiles[sequence[p][1]].face = facePairs[p][1];
    }
    return sequence;
  }

  function faceInfo(face) {
    return Number.isInteger(face) && face >= 0 && face < FACES.length ? Object.assign({}, FACES[face]) : null;
  }

  function newGame(options) {
    options = options || {};
    var layoutId = options.layout || 'turtle';
    var layout = LAYOUT_DATA.filter(function (candidate) { return candidate.id === layoutId; })[0];
    if (!layout) throw new RangeError('Unknown layout: ' + layoutId);
    var difficulty = options.difficulty || 'normal';
    if (['normal', 'hard', 'master'].indexOf(difficulty) < 0) throw new RangeError('Unknown difficulty: ' + difficulty);
    var seed = Number.isFinite(options.seed) ? options.seed >>> 0 : Date.now() >>> 0;
    var random = mulberry32(seed);
    var tiles = layout.cells.map(function (cell, id) {
      return { id: id, x: cell.x, y: cell.y, z: cell.z, face: 0, removed: false };
    });
    var activeIds = tiles.map(function (tile) { return tile.id; });
    var solution = reverseGenerate(tiles, activeIds, random, difficulty);
    if (!solution) throw new Error('Unable to generate a solvable board for ' + layoutId);
    var history = [];
    var game = {
      width: Math.max.apply(null, tiles.map(function (tile) { return tile.x + 2; })),
      height: Math.max.apply(null, tiles.map(function (tile) { return tile.y + 2; })),
      layers: Math.max.apply(null, tiles.map(function (tile) { return tile.z; })) + 1,
      tiles: tiles,
      layoutId: layoutId,
      seed: seed,
      difficulty: difficulty,
      history: history,
      solution: solution.map(function (pair) { return pair.slice(); }),
      isFree: function (id) { return tileIsFree(tiles[id], tiles, tiles.map(function (tile) { return tile.removed; })); },
      canMatch: function (idA, idB) {
        if (idA === idB || !tiles[idA] || !tiles[idB]) return false;
        var removed = tiles.map(function (tile) { return tile.removed; });
        return tileIsFree(tiles[idA], tiles, removed) && tileIsFree(tiles[idB], tiles, removed) &&
          isFaceMatch(tiles[idA].face, tiles[idB].face);
      },
      remove: function (idA, idB) {
        if (!game.canMatch(idA, idB)) return false;
        tiles[idA].removed = true;
        tiles[idB].removed = true;
        history.push([idA, idB]);
        return true;
      },
      undo: function () {
        if (history.length === 0) return null;
        var pair = history.pop();
        tiles[pair[0]].removed = false;
        tiles[pair[1]].removed = false;
        return pair.slice();
      },
      freeTiles: function () {
        return freeFrom(tiles, tiles.map(function (tile) { return tile.removed; }));
      },
      findPair: function () {
        var removed = tiles.map(function (tile) { return tile.removed; });
        for (var solutionIndex = 0; solutionIndex < game.solution.length; solutionIndex += 1) {
          var solutionPair = game.solution[solutionIndex];
          if (removed[solutionPair[0]] || removed[solutionPair[1]]) continue;
          if (tileIsFree(tiles[solutionPair[0]], tiles, removed) &&
              tileIsFree(tiles[solutionPair[1]], tiles, removed) &&
              isFaceMatch(tiles[solutionPair[0]].face, tiles[solutionPair[1]].face)) return solutionPair.slice();
          break;
        }
        var freeIds = freeFrom(tiles, removed);
        var candidates = [];
        for (var i = 0; i < freeIds.length; i += 1) {
          for (var j = i + 1; j < freeIds.length; j += 1) {
            var a = freeIds[i];
            var b = freeIds[j];
            if (!isFaceMatch(tiles[a].face, tiles[b].face)) continue;
            var nextRemoved = removed.slice();
            nextRemoved[a] = true;
            nextRemoved[b] = true;
            var remaining = 0;
            for (var k = 0; k < tiles.length; k += 1) if (!nextRemoved[k]) remaining += 1;
            var nextFree = freeFrom(tiles, nextRemoved);
            var nextPairCount = remaining > 0 ? countPairs(nextFree, tiles) : 1;
            var newlyFree = 0;
            var before = {};
            freeIds.forEach(function (id) { before[id] = true; });
            for (var m = 0; m < tiles.length; m += 1) {
              if (!nextRemoved[m] && !before[m] && tileIsFree(tiles[m], tiles, nextRemoved)) newlyFree += 1;
            }
            candidates.push({ pair: [a, b], score: (nextPairCount > 0 ? 100000 : -100000) + newlyFree * 100 + Math.min(nextPairCount, 50) });
          }
        }
        if (candidates.length === 0) return null;
        candidates.sort(function (a, b) { return b.score - a.score; });
        return candidates[0].pair;
      },
      remaining: function () {
        return tiles.reduce(function (sum, tile) { return sum + (tile.removed ? 0 : 1); }, 0);
      },
      isWon: function () { return game.remaining() === 0; },
      isStuck: function () { return !game.isWon() && game.findPair() === null; },
      shuffle: function () {
        var remainingIds = tiles.filter(function (tile) { return !tile.removed; }).map(function (tile) { return tile.id; });
        if (remainingIds.length === 0) return false;
        var nextSolution = reverseGenerate(tiles, remainingIds, random, difficulty);
        if (!nextSolution) return false;
        history.length = 0;
        game.solution = nextSolution.map(function (pair) { return pair.slice(); });
        return true;
      },
      canUndo: function () { return history.length > 0; }
    };
    return game;
  }

  var MjEngine = { faceInfo: faceInfo, LAYOUTS: LAYOUTS, newGame: newGame };
  root.MjEngine = MjEngine;
  if (typeof module !== 'undefined') module.exports = MjEngine;
}(typeof globalThis !== 'undefined' ? globalThis : this));
