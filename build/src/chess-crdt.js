var Chess = require('chess.js').Chess

const ChessCRDT = (id) => ({
  initial: () => {
    return {
      game: new Chess(),
      tries: [], // superset of moves
      moves: [], // only valid moves
    }
  },

  join: (state, delta) => {
    if (delta.turnpick) {

    } else if (delta.move) {
      // handle move being sent
      var move = delta.move
      move.promotion = 'q' // NOTE: always promote to a queen for example simplicity
      state.tries.push(move)
      var vmove = state.game.move(move)
      if (vmove !== null) state.moves.push(vmove)
    }
    return state
  },

  value: (state) => state
})

module.exports = ChessCRDT
