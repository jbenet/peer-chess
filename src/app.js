var PeerStarApp = require('peer-base')

// const ChessCRDT = new require('./chess-crdt')
// var ChessBoard = require('chess.js').Chess

class PeerChessApp {

  constructor(gameid, elemid) {
    this.gameid = gameid
    // this.ccrdt = new ChessCRDT('')
    // await this.peerApp.start()
    // this.collab = await app.collaborate('peer-chess-' + gameid, 'rga');
    this.game = new Chess()
    this.moves = []
    this.board = ChessBoard(elemid, {
      draggable: true,
      position: 'start',
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this),
      pieceTheme: 'src/chessboardjs-0.3.0/img/chesspieces/wikipedia/{piece}.png',
    })

    this.setupPeerApp()
    this.processedMoves = []
  }

  async setupPeerApp() {
    var appname = 'peer-chess' + window.location.hash
    console.log('loading', appname)
    this.peerApp = PeerStarApp(appname)
    this.peerApp.on('error', (err) => console.error('error in app:', err))
    await this.peerApp.start()

    this.collab = await this.peerApp.collaborate(appname, 'rga')
    this.collab.shared.value().forEach((move) => {
      this.makeMove(move)
    })

    this.collab.removeAllListeners('state changed')
    this.collab.on('state changed', this.onStateChanged.bind(this))
  }

  // pickSide() {
  //   var a = Math.random()
  //   this.peerApp.
  // }

  // only pick up pieces for White
  onDragStart(source, piece, position, orientation) {
    console.log('onDragStart')

    // do not pick up pieces if the game is over
    if (this.game.in_checkmate() === true ||
      (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }

  onDrop(source, target) {
    console.log('onDrop')

    var move = {
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for simplicity
    }

    var move = this.makeMove(move, true)
    // illegal move
    if (move === null) return 'snapback'
  }

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    console.log('onSnapEnd')
    this.board.position(this.game.fen())
  }

  onStateChanged() {
    console.log('state changed')
    var a = this.collab.shared.value()
    var b = this.processedMoves

    console.log(a.length, '=?=', b.length)
    console.log(a)
    console.log(b)

    var safety = 10
    while(b.length < a.length) {
      if (safety-- < 0) return // gtfo

      console.log(a.length, '=?=', b.length)
      this.makeMove(a[b.length], false)
    }
  }

  makeMove(move, isLocal) {
    console.log('trying move')
    console.log(move)
    move = this.game.move(move)
    if (move) {
      this.board.position(this.game.fen())
      this.processedMoves.push(move)
      if (isLocal) {
        // announce it
        this.collab.shared.push(move)
      }
    }
    return move
  }
}

window.onDomReady = function() {
  var app = new PeerChessApp('game', 'board')
  return false;
}
