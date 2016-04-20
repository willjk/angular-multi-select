(function() {
	angular.module('isteven-multi-select.list', [])
		.directive('iStevenMultiSelectList', ['$sce', function($sce) {
			var directive = {
				restrict: 'E',
				scope: {
					item: '=',
					isDisabled: '@',
					orientation: '@',
					groupProperty: '@',
					spacingProperty: '@',
					itemLabel: '@',
					tickProperty: '@',
					tickMarker: '@'
				},
				require: '^iStevenMultiSelect',
				templateUrl: 'list/iStevenMultiSelectList.html',
				link: link
			};

			return directive;

			function link(scope, elem, attrs, ctrl) {
				scope.removeStyle = removeStyle;
				scope.addStyle = addStyle;
				scope.itemIsDisabled = itemIsDisabled;
				scope.numberToArray = numberToArray;
				scope.writeLabel = writeLabel; // A simple function to parse the item label settings. Used on the buttons and checkbox labels.
				scope.onClickSyncItems = onClickSyncItems;
				scope.removeGroupEndMarker = removeGroupEndMarker;


				function removeGroupEndMarker() {
					if(scope.item.hasOwnProperty(scope.groupProperty) && scope.item[scope.groupProperty] === false){
						return false;
					}
					return true;
				}
				
				function generateSafeHtml(text){
					return $sce.trustAsHtml(text);
				}

				function writeLabel(type) {
					
					if(scope.item.hasOwnProperty(scope.groupProperty)){
						return $sce.trustAsHtml(scope.item.name);
					}
					return ctrl.writeLabel(scope.item, false);
				}

				function onClickSyncItems(e, ng_repeat_index) {
					e.preventDefault();
					e.stopPropagation();

					//if isDisabled is boolean or string true do nothing, if this is a 
					if (itemIsDisabled()) {
						return;
					}
					
					if(scope.item.hasOwnProperty(scope.groupProperty) && scope.item[scope.groupProperty] === true){
						ctrl.selectedGroupProperty(parseInt(attrs.index));
					} else if(!scope.item.hasOwnProperty(scope.groupProperty)){
						scope.item[scope.tickProperty] = !scope.item[scope.tickProperty];
						ctrl.itemClicked(parseInt(attrs.index), scope.item[scope.tickProperty]);
					}
				}

				function numberToArray(num) {
					return new Array(num);
				}

				function itemIsDisabled() {
					return (scope.isDisabled == 'true' || (attrs.hasOwnProperty('disableProperty') && scope.item.hasOwnProperty(attrs.disableProperty) && scope.item[attrs.disableProperty] === true));
				}

				function addStyle(classToAdd) {
					elem.addClass(classToAdd);
				}

				function removeStyle(classToRemove) {
					elem.removeClass(classToRemove);
				}
			}

		}]);
})();