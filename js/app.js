angular.module(
		'2048App',
		[ 'mobile-angular-ui.gestures.swipe', 'Game', 'Grid', 'ngAnimate',
				'ngStorage' ]).config(function(GridServiceProvider) {
	GridServiceProvider.setSize(4);
}).controller('GameController', function(GameManager, $scope, $localStorage) {

	this.game = GameManager;

	this.newGame = function() {
		this.game.newGame();
	};

	this.startGame = function() {
		var self = this;
		$scope.swiped = function(direction) {
			self.game.move(direction);
		};
	};

	/*if ($localStorage.game) {
		this.game = $localStorage.game;
		this.startGame();
	} else {*/
		this.newGame();
		this.startGame();
	/*}*/

	var buttonEvent = function(e) {
		if (e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
		}
	}

	document.addEventListener('tizenhwkey', buttonEvent);
});