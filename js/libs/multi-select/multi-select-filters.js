(function() {
	angular.module('isteven-multi-select.filters', [])
		.filter('isteven', [function(){
			return function(input, search, ignoreProperties){
					if(search.name.trim() === ''){
						return input;
					}
					var length = input.length, groups = [], returnArray = [];
					for (var i = 0; i < length; i++) {
						if (input[i].hasOwnProperty(ignoreProperties[1])) {
							
							if(input[i][ignoreProperties[1]] === true){
								groups.push({
									filteredValuesInside: false,
									returnArrayIndex: returnArray.length	
								});
								returnArray.push(input[i]);
							} else {
								if(!groups[groups.length - 1].filteredValuesInside){
									returnArray.splice(groups[groups.length - 1].returnArrayIndex, 1);
								} else {
									returnArray.push(input[i]);
								}
								groups.pop();
							}
						} else {
							if(input[i].name.toLowerCase().trim().search(search.name.toLowerCase().trim()) > -1){
								returnArray.push(input[i]);
								for(var j = groups.length - 1; j >= 0; j--){
									groups[j].filteredValuesInside = true;
								}
							};
						}
					}
				return returnArray;
			}
		}])
		.directive('iStevenMultiSelectFilters', ['$sce', function($sce) {
			var directive = {
				restrict: 'E',
				scope: {
					lang: '=',
					search: '=',
					select: '&',
					selectAll: '&',
					selectNone: '&',
					searchChanged: '&',
					updateFilter: '&',
					vMinSearchLength: '@'
				},
				templateUrl: 'iStevenMultiSelectFilters.html',
				link: link
			};

			return directive;

			function link(scope, elem, attrs, ctrl) {
				
				scope.helperStatus = {
					all: true,
					none: true,
					reset: true,
					filter: true
				};
				
				scope.clearClicked = clearClicked;
				scope.generateHTMLSafeText = generateHTMLSafeText;
				
				function generateHTMLSafeText(text){
					return $sce.trustAsHtml(text);
				}

				function clearClicked($event) {
					scope.search.name = '';
				}

			}
		}])
		.run(['$templateCache', function($templateCache) {
			$templateCache.put('iStevenMultiSelectFilters.html',
				// container of the helper elements
                '<div class="helperContainer" ng-if="helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset ">' +
				// container of the first 3 buttons, select all, none and reset
				'<div class="line" ng-if="helperStatus.all || helperStatus.none || helperStatus.reset ">' +
				// select all
				'<button type="button" class="helperButton"' +
				'ng-if="!isDisabled && helperStatus.all"' +
				'ng-click="selectAll();"' +
				'ng-bind-html="generateHTMLSafeText(lang.selectAll)">' +
				'</button>' +
				// select none
				'<button type="button" class="helperButton"' +
				'ng-if="!isDisabled && helperStatus.none"' +
				'ng-click="selectNone();"' +
				'ng-bind-html="generateHTMLSafeText(lang.selectNone)">' +
				'</button>' +
				// reset
				'<button type="button" class="helperButton reset"' +
				'ng-if="!isDisabled && helperStatus.reset"' +
				'ng-click="select( \'reset\', $event );"' +
				'ng-bind-html="generateHTMLSafeText(lang.reset)">' +
				'</button>' +
				'</div>' +
				// the search box
				'<div class="line" style="position:relative" ng-if="helperStatus.filter">' +
				// textfield                
				'<input placeholder="{{::lang.search}}" type="text"' +
				'ng-click="select( \'filter\', $event )" ' +
				'ng-model="search.name" ' +
				' class="inputFilter"' +
				'/>' +
				// clear button
				'<button type="button" class="clearButton" ng-click="clearClicked( $event )" >×</button> ' +
				'</div> ' +
                '</div> '
			)
		}]);
})();