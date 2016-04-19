(function() {
	//taken from http://plnkr.co/edit/kHvyDG1EEho4OkPhN7hJ?p=preview
	//http://stackoverflow.com/questions/12931369/click-everywhere-but-here-event
	angular.module('isteven-multi-select.off-click', [])
		.factory('clickAnywhereButHereService', ['$document', function($document) {
			var tracker = [];

			return function($scope, expr) {
				var i, t, len;
				for (i = 0, len = tracker.length; i < len; i++) {
					t = tracker[i];
					if (t.expr === expr && t.scope === $scope) {
						return t;
					}
				}
				var handler = function() {
					$scope.$apply(expr);
				};

				$document.on('click', handler);

				// IMPORTANT! Tear down this event handler when the scope is destroyed.
				$scope.$on('$destroy', function() {
					$document.off('click', handler);
				});

				t = { scope: $scope, expr: expr };
				tracker.push(t);
				return t;
			};
		}])
		.directive('clickAnywhereButHere', ['clickAnywhereButHereService', function(clickAnywhereButHereService) {
			return {
				restrict: 'A',
				link: function(scope, elem, attr, ctrl) {
					var handler = function(e) {
						e.stopPropagation();
					};
					elem.on('click', handler);

					scope.$on('$destroy', function() {
						elem.off('click', handler);
					});

					clickAnywhereButHereService(scope, attr.clickAnywhereButHere);
				}
			};
		}]);
})();