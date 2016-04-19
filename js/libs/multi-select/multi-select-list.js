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
				require: '^iStevenMultiSelectContainer',
				templateUrl: 'iStevenMultiSelectList.html',
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
					
					// // type is either 'itemLabel' or 'buttonLabel'
					// var temp = scope.itemLabel.split(' ');
					// var label = '';

					// angular.forEach(temp, function(value, key) {
					// 	scope.item[value] && (label += '&nbsp;' + value.split('.').reduce(function(prev, current) {
					// 		return prev[current];
					// 	}, scope.item));
					// });

					// if (type.toUpperCase() === 'BUTTONLABEL') {
					// 	return label;
					// }
					// return $sce.trustAsHtml(label);
				}

				function onClickSyncItems(e, ng_repeat_index) {
					e.preventDefault();
					e.stopPropagation();

					//if isDisabled is boolean or string true do nothing, if this is a 
					if (scope.isDisabled == 'true') {
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
					return scope.isDisabled == 'true';
					//return (attrs.hasOwnProperty('disableProperty') && scope.item[attrs.disableProperty] === 'true') || scope.isDisabled === true;
				}

				function addStyle(classToAdd) {
					elem.addClass(classToAdd);
				}

				function removeStyle(classToRemove) {
					elem.removeClass(classToRemove);
				}
			}

		}])
		.run(['$templateCache', function($templateCache) {
			$templateCache.put('iStevenMultiSelectList.html',
				'<div ' +
				'class="multiSelectItem" ' +
				'ng-class="{selected: item[ tickProperty ], horizontal: orientation !== \'v\', vertical: orientation === \'v\', ' +
				'multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"' +
				'ng-click="onClickSyncItems( $event, $index );" ' +
				'ng-mouseleave="removeStyle( \'multiSelectFocus\' );"> ' +
				// this is the spacing for grouped items
				'<div class="acol" ng-if="spacingProperty > 0" ng-repeat="i in numberToArray( spacingProperty ) track by $index">' +
				'</div>  ' +
				'<div class="acol">' +
				'<label>' +
				// input, so that it can accept focus on keyboard click
				'<input class="checkbox focusable" type="checkbox" ' +
				'ng-disabled="itemIsDisabled( item )" ' +
				'ng-checked="item[ tickProperty ]" ' +
				'ng-click="syncItems( item, $event, $index )" />' +
				// item label using ng-bind-hteml
				'<span ' +
				'ng-class="{disabled:itemIsDisabled( item )}" ' +
				'ng-bind-html="writeLabel(\'itemLabel\' )">' +
				'</span>' +
				'</label>' +
				'</div>' +
				// the tick/check mark
				'<span class="tickMark" ng-if="item[ groupProperty ] !== true && item[ tickProperty ] === true">&#10003;</span>' +
                '</div>'
			);
		}]);
})();