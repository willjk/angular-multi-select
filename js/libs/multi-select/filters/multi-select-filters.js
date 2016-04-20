(function() {
	angular.module('isteven-multi-select.filters', [])
		.filter('isteven', [function(){
			return function(input, search, ignoreProperties, filterProperties){
					if(search.name.trim() === ''){
						return input;
					}
					var length = input.length, groups = [], returnArray = [], filterProperties = filterProperties ? filterProperties.split(' ') : ['name'];
					for (var i = 0; i < length; i++) {
						//ignoreProperties[0] is tick property and ignoreProperties[1] is group properties
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
							//if(input[i].name.toLowerCase().trim().search(search.name.toLowerCase().trim()) > -1){
							if(searchObj(input[i], filterProperties, search.name)){
								returnArray.push(input[i]);
								for(var j = groups.length - 1; j >= 0; j--){
									groups[j].filteredValuesInside = true;
								}
							};
						}
					}
				return returnArray;
				
				function searchObj(obj, parametersToSearch, value){
					for(var k = 0; k < parametersToSearch.length;k++){
						if(obj[parametersToSearch[k]].toLowerCase().trim().search(value.toLowerCase().trim()) > -1){
							return true;
						}
					}
					return false;
				}
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
				templateUrl: 'filters/iStevenMultiSelectFilters.html',
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

				function clearClicked() {
					scope.search.name = '';
				}

			}
		}]);
})();