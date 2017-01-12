angular.module(
		'2048App',
		[ 'mobile-angular-ui.gestures.swipe', 'Game', 'Grid', 'ngAnimate',
				'ngStorage' ]).config(function(GridServiceProvider) {
	GridServiceProvider.setSize(4);
}).controller(
		'GameController',
		function($scope, $localStorage, $q, $timeout, GridService) {		
			function setDefaultProperties(){
				$scope.game.grid = GridService.grid;
				$scope.game.tiles = GridService.tiles;
				$scope.game.gameSize = GridService.getSize();
				$scope.game.winningValue = 2048;
				$scope.game.maxWinningValue = 131072;
			}
			
			function setFunctions(){
				$scope.game.getHighScore = getHighScore;
				$scope.game.reinit = reinit;
				$scope.game.newGame = newGame;
				$scope.game.continueGame = continueGame;
				$scope.game.move = move;
				$scope.game.movesAvailable = movesAvailable;
				$scope.game.updateScore = updateScore;
			}

			function getHighScore() {
				return parseInt($localStorage.highScore) || 0;
			};

			function reinit() {
				this.gameOver = false;
				this.gameMaxOver = false;
				this.goForMax = false;
				this.win = false;
				this.maxWin = false;
				this.currentScore = 0;
				this.highScore = getHighScore();
			};

			function newGame() {
				GridService.buildEmptyGameBoard();
				GridService.buildStartingPosition();
				this.reinit();
			};
			
			function continueGame() {
				GridService.buildEmptyGameBoard();
				$scope.game.tiles = GridService.buildContinuePosition($scope.game.tiles);
			};

			/*
			 * The game loop
			 * 
			 * Inside here, we'll run every 'interesting' event (interesting
			 * events are listed in the Keyboard service) For every event,
			 * we'll: 1. look up the appropriate vector 2. find the furthest
			 * possible locations for each tile and the next tile over 3. find
			 * any spots that can be 'merged' a. if we find a spot that can be
			 * merged: i. remove both tiles ii. add a new tile with the double
			 * value b. if we don't find a merge: i. move the original tile
			 */
			function move(key) {
				var f = function() {
					if ($scope.game.win) {
						return false;
					}
					var positions = GridService.traversalDirections(key);
					var hasMoved = false;
					var hasWon = false;
					var hasMaxWon = false;

					// Update Grid
					GridService.prepareTiles();

					positions.x.forEach(function(x) {
						positions.y.forEach(function(y) {
							var originalPosition = {
								x : x,
								y : y
							};
							var tile = GridService.getCellAt(originalPosition);

							if (tile) {
								var cell = GridService.calculateNextPosition(
										tile, key), next = cell.next;

								if (next && next.value === tile.value
										&& !next.merged) {

									// MERGE
									var newValue = tile.value * 2;

									var merged = GridService.newTile(tile,
											newValue);
									merged.merged = [ tile, cell.next ];

									
									GridService.insertTile(merged);
									GridService.removeTile(tile);

									GridService.moveTile(merged, next);

									$scope.game.updateScore($scope.game.currentScore
											+ cell.next.value);

									if (merged.value >= $scope.game.winningValue) {
										hasWon = true;
									}

									if (merged.value >= $scope.game.maxWinningValue) {
										hasMaxWon = true;
									}

									hasMoved = true; // we moved with a merge
								} else {
									GridService
											.moveTile(tile, cell.newPosition);
								}

								if (!GridService.samePositions(
										originalPosition, cell.newPosition)) {
									hasMoved = true;
								}
							}
						});
					});

					if (hasWon && !$scope.game.win && !$scope.game.goForMax) {
						$scope.game.win = true;
					}

					if (hasMaxWon && !$scope.game.maxWin) {
						$scope.game.maxWin = true;
					}

					if (hasMoved) {
						GridService.randomlyInsertNewTile();

						if (!$scope.game.movesAvailable()) {
							sel$scope.gamef.gameOver = true;
						}

						if ($scope.game.maxWin) {
							$scope.game.gameMaxOver = true;
						}
					}

				};
				$scope.game.tiles = GridService.tiles;
				return $q.when(f());
			};

			function movesAvailable() {
				return GridService.anyCellsAvailable()
						|| GridService.tileMatchesAvailable();
			};

			function updateScore(newScore) {
				$scope.game.currentScore = newScore;
				if ($scope.game.currentScore > getHighScore()) {
					$scope.game.highScore = newScore;
					$localStorage.highScore = newScore;
				}
				$localStorage.game = $scope.game;
			};

			this.newGame = function() {
				$scope.game.newGame();
			};
			
			this.continueGame = function() {
				$scope.game.continueGame();
			};

			$scope.swiped = function(direction) {
				$scope.game.move(direction);
			};

			if ($localStorage.game) {
				$scope.game = $localStorage.game;
				setFunctions();
				this.continueGame();
			} else {
				$scope.game = {};
				setDefaultProperties();
				setFunctions();
				this.newGame();
			}

			var buttonEvent = function(e) {
				if (e.keyName == "back") {
					tizen.application.getCurrentApplication().exit();
				}
			}

			document.addEventListener('tizenhwkey', buttonEvent);
		});