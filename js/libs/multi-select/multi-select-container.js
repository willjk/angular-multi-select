(function() {
	angular.module('isteven-multi-select.container', ['isteven-multi-select.filters', 'isteven-multi-select.list', 'isteven-multi-select.off-click'])
		.directive('iStevenMultiSelectContainer', ['$sce', '$filter', function($sce, $filter) {
			var directive = {
				restrict: 'E',
				scope: {
					inputModel: '=',
					outputModel: '=',
					isDisabled: '=',

					// callbacks
					onClear: '&',
					onClose: '&',
					onSearchChange: '&',
					onItemClick: '&',
					onOpen: '&',
					onReset: '&',
					onSelectAll: '&',
					onSelectNone: '&',

					//attributes
					groupProperty: '@',
					tickProperty: '@',
					directiveId: '@',
					orientation: '@',
					itemLabel: '@',

					// i18n
					translation: '='
				},
				templateUrl: 'iStevenMultiSelectContainer.html',
				controller: controller//, //The controller handles inner directives talking to an outer directive(controller of all inner baby directives)
				//link: link //Handles manipulation of the dom, changes based on attributes assigned to this element
			};

			return directive;

			function controller($scope, $element, $attrs) {

				$scope.registeredListDirectives = []; //we use this so we don't have to get a bunch of children elements
				$scope.listDirectiveCount = 0;
				$scope.spacingBasedOnGrouping = [];
				$scope.lang = {
					selectAll: $attrs.lang && $attrs.lang.selectAll ? $attrs.lang.selectAll : 'Select All',
					selectNone: $attrs.lang && $attrs.lang.selectNone ? $attrs.lang.selectNone : 'Select None',
					reset: $attrs.lang && $attrs.lang.reset ? $attrs.lang.reset : 'Reset',
					search: $attrs.search ? $attrs.search : 'Search...'
				};
				$scope.buttonLabel = $attrs.buttonLabel ? $attrs.buttonLabel : $attrs.nothingSelected ? $attrs.nothingSelected : 'Nothing Selected <span class="caret"></span>';
				$scope.tabIndex = 0;
				$scope.filteredModel = [];
				$scope.helperStatus = {
					all: true,
					none: true,
					reset: true,
					filter: true
				};
				$scope.icon = {
					selectAll: '&#10003;',
					selectNone: '&times;',
					reset: '&#8630;',
					tickMark: '&#10003;'
				}
				$scope.search = {
					name: ''
				};
				$scope.ignoreProperties = [$scope.tickProperty, $scope.groupProperty];
				//$scope.itemLabel = $attrs.itemLabel;
				$scope.showDropdown = false;

				//Functions children directives have access too
				this.registerListDirective = registerListDirective;
				this.itemClicked = itemClicked;
				this.selectedGroupProperty = selectedGroupProperty;//when a list item clicked is a grouped property we need to select all or none of that group
				this.writeLabel = writeLabel;

				$scope.keyboardListener = keyboardListener;
				$scope.toggleCheckboxes = toggleCheckboxes;
				$scope.checkIfGroupFalse = checkIfGroupFalse;
				$scope.calculateSpacingBasedOnGrouping = calculateSpacingBasedOnGrouping;
				$scope.generateSafeHtml = generateSafeHtml;
				$scope.selectAll = selectAll;
				$scope.writeButtonLabel = writeButtonLabel;
				$scope.selectNone = selectNone;
				$scope.offClick = offClick;


				$scope.writeButtonLabel();

				$scope.$watch('inputModel', function(nVal) {
					if (nVal !== undefined) {
						$scope.calculateSpacingBasedOnGrouping();
					}

				}, true);

				function keyboardListener() {

				};
				
				function offClick(){
					if(!$scope.showDropdown){
						return;
					}
					$scope.toggleCheckboxes();
					$scope.onClose();
				}

				function selectAll() {
					selectedGroupProperty(0, true, true);
				}

				function selectNone() {
					selectedGroupProperty(0, true, false);
				};

				//to lazy to optimize. can be optimized later
				//when a grouped item is selected it turns selects or deselects all values within that group
				function selectedGroupProperty(inputModelIndex, force, forceValue) {
					$scope.filteredModel = [];
					force = force !== undefined ? force : false;
					var filteredInputModel = $filter('isteven')($scope.inputModel, $scope.search, $scope.ignoreProperties), 
					length = filteredInputModel.length, groupNestCount = 0, endGroupIndex = inputModelIndex, allTicked = true;
					for (var i = inputModelIndex; i < length; i++) {
						if (force) { //we are forcing. no need to loop through this.
							//set all ticked to the inverse of the forceValue(when we set the tick we set it to inverse allTicked below)
							allTicked = !forceValue;
							break;
						}
						if (filteredInputModel[i].hasOwnProperty($scope.groupProperty)) {
							groupNestCount = filteredInputModel[i][$scope.groupProperty] === true ? groupNestCount + 1 : groupNestCount - 1;
							if (groupNestCount === 0) {
								endGroupIndex = i;
								break;
							}
						} else if (!filteredInputModel[i][$scope.tickProperty]) {
							allTicked = false;
							break;
						}
					}
					groupNestCount = 0;
					for (var j = inputModelIndex; j < length; j++) {
						if (filteredInputModel[j].hasOwnProperty($scope.groupProperty)) {
							groupNestCount = filteredInputModel[j][$scope.groupProperty] === true ? groupNestCount + 1 : groupNestCount - 1;
							if (groupNestCount === 0) {
								endGroupIndex = i;
								break;
							}
						} else {
							filteredInputModel[j][$scope.tickProperty] = !allTicked;
							itemClicked(j, filteredInputModel[j][$scope.tickProperty]);
							if (!allTicked) {
								$scope.filteredModel.push(filteredInputModel[j]);
							}
						}
					}
					// for (var i = inputModelIndex; i < length; i++) {
					// 	if (force) { //we are forcing. no need to loop through this.
					// 		//set all ticked to the inverse of the forceValue(when we set the tick we set it to inverse allTicked below)
					// 		allTicked = !forceValue;
					// 		break;
					// 	}
					// 	if ($scope.inputModel[i].hasOwnProperty($scope.groupProperty)) {
					// 		groupNestCount = $scope.inputModel[i][$scope.groupProperty] === true ? groupNestCount + 1 : groupNestCount - 1;
					// 		if (groupNestCount === 0) {
					// 			endGroupIndex = i;
					// 			break;
					// 		}
					// 	} else if (!$scope.inputModel[i][$scope.tickProperty]) {
					// 		allTicked = false;
					// 		break;
					// 	}
					// }
					// groupNestCount = 0;
					// for (var j = inputModelIndex; j < length; j++) {
					// 	if ($scope.inputModel[j].hasOwnProperty($scope.groupProperty)) {
					// 		groupNestCount = $scope.inputModel[j][$scope.groupProperty] === true ? groupNestCount + 1 : groupNestCount - 1;
					// 		if (groupNestCount === 0) {
					// 			endGroupIndex = i;
					// 			break;
					// 		}
					// 	} else {
					// 		$scope.inputModel[j][$scope.tickProperty] = !allTicked;
					// 		itemClicked(j, $scope.inputModel[j][$scope.tickProperty]);
					// 		if (!allTicked) {
					// 			$scope.filteredModel.push($scope.inputModel[j]);
					// 		}
					// 	}
					// }
					writeButtonLabel();
				}

				function writeButtonLabel() {
					var length = $scope.outputModel.length, label = '';
					if (length === 0) {
						label = $attrs.buttonLabel ? $attrs.buttonLabel : $attrs.nothingSelected ? $attrs.nothingSelected : 'Nothing Selected ';
					}
					for (var i = 0; i < length; i++) {
						label += writeLabel($scope.outputModel[i], true);
						if (i + 1 < length) {
							label += ', ';
						}
					}
					$scope.buttonLabel = $sce.trustAsHtml(label + ' <span class="caret"></span>');
				}

				function findObjectInArrayBasedOnProperty(array, property, value) {

					var results = array.filter(function(obj) {
						return obj[property] == value;
					});

					return results;
				}

				function findIndexOfObjectInArrayBasedOnProperty(array, property, value) {
					var length = array.length, i;
					for (i = 0; i < length; i++) {
						if (array[i][property] == value) {
							break;
						}
					}
					return i < length ? i : -1;
				}

				function itemClicked(index, isChecked) {
					var found_index = findIndexOfObjectInArrayBasedOnProperty($scope.outputModel, 'array_index', index);
					if (isChecked) {
						if (found_index === -1) {
							var copy = angular.copy($filter('isteven')($scope.inputModel, $scope.search, $scope.ignoreProperties)[index]);
							copy.array_index = index;
							$scope.outputModel.push(copy);
						}
					} else {
						$scope.outputModel.splice(found_index, 1);
					}
					writeButtonLabel();
				}

				function writeLabel(item, trustAsHtml) {

					if (item.hasOwnProperty($scope.groupProperty)) {
						return $sce.trustAsHtml(item.name);
					}

					// type is either 'itemLabel' or 'buttonLabel'
					var temp = $scope.itemLabel.split(' ');
					var label = '', length = temp.length;

					angular.forEach(temp, function(value, key) {
						item[value] && (label += '&nbsp;' + value.split('.').reduce(function(prev, current) {
							return prev[current];
						}, item));
					});

					if (trustAsHtml == true) {
						return label;
					}
					return $sce.trustAsHtml(label);
				}

				function registerListDirective(listDirective) {
					$scope.listDirectiveCount++;
					listDirective.id = $scope.listDirectiveCount;
					$scope.listDirectives.push(listDirective);
					return $scope.listDirectiveCount;
				}

				// // select All / select None / reset buttons
				// function select(type, e) {

				// 	var helperIndex = helperItems.indexOf(e.target), functionToCall = '';
				// 	$scope.tabIndex = helperIndex;

				// 	switch (type.toUpperCase()) {
				// 		case 'ALL':
				// 			loopFilterModelSetTickProperty(false, true);
				// 			functionToCall = 'onSelectAll';
				// 			break;
				// 		case 'NONE':
				// 			loopFilterModelSetTickProperty(false, false);
				// 			functionToCall = 'onSelectNone';
				// 			break;
				// 		case 'RESET':
				// 			loopFilterModelSetTickProperty(true);
				// 			functionToCall = 'onReset';
				// 			break;
				// 		case 'CLEAR':
				// 			$scope.tabIndex = $scope.tabIndex + 1;
				// 			$scope.onClear();
				// 			break;
				// 		case 'FILTER':
				// 			$scope.tabIndex = helperItems.length - 1;
				// 			break;
				// 	}

				// 	if (functionToCall !== '') {
				// 		$scope.refreshOutputModel();
				// 		$scope.refreshButton();
				// 		$scope[functionToCall]();
				// 	}
				// }

				// function loopFilterModelSetTickProperty(reset, setValue) {
				// 	var len = $scope.filteredModel.length, currentFilterModelValue;
				// 	for (var i = 0; i < len; i++) {
				// 		currentFilterModelValue = $scope.filteredModel[i];
				// 		if (typeof currentFilterModelValue !== 'undefined'
				// 			&& currentFilterModelValue.hasOwnProperty(scope.groupProperty)
				// 			&& !currentFilterModelValue[scope.disableProperty]) {
				// 			currentFilterModelValue[$scope.tickProperty] = reset ? $scope.backUp[currentFilterModelValue[$scope.indexProperty]][$scope.tickProperty] : setValue;
				// 		}
				// 	}
				// }

				function generateSafeHtml(text) {
					return $sce.trustAsHtml(text);
				}

				// UI operations to show/hide checkboxes based on click event..
				function toggleCheckboxes(e) {
					$scope.showDropdown = !$scope.showDropdown;
					$scope.onOpen();
				}

				function addRemoveShowClassToButtonClickedAndCheckboxLayer(clickedEl, classFunction) {
					$element[classFunction]('show');
					angular.element(clickedEl)[classFunction]('buttonClicked');
				}

				function calculateSpacingBasedOnGrouping() {
					var len = $scope.inputModel.length;
					$scope.spacingBasedOnGrouping = [];
					//initial spacing
					$scope.spacingBasedOnGrouping.push(0);
					for (var i = 1; i < len; i++) {
						if ($scope.inputModel[i].hasOwnProperty($scope.groupProperty)) {
							if ($scope.inputModel[i][$scope.groupProperty]) {
								$scope.spacingBasedOnGrouping.push($scope.spacingBasedOnGrouping[i - 1] + 1);
							} else {
								$scope.spacingBasedOnGrouping.push($scope.spacingBasedOnGrouping[i - 1] - 1);
							}
						} else {
							$scope.spacingBasedOnGrouping.push($scope.spacingBasedOnGrouping[i - 1]);
						}
					}
				}

				function checkIfGroupFalse(item) {
					return (!item.hasOwnProperty($scope.groupProperty) || item[$scope.groupProperty]);
				}
				
			}
		}])
		.run(['$templateCache', function($templateCache) {
			$templateCache.put('iStevenMultiSelectContainer.html',
				'<span class="multiSelect" click-anywhere-but-here="offClick()">' +
				'<button id="{{directiveId}}" type="button"' +
                'ng-click="toggleCheckboxes( $event )"' +
                'ng-bind-html="buttonLabel"' +
                'ng-disabled="disable-button"' +
				'>' +
				'</button>' +
				'	<div class="checkboxLayer" ng-class="{\'show\': showDropdown}">' +
				'	<div class="helperContainer">' +
				'		<i-steven-multi-select-filters icon="icon" lang="lang" v-min-search-length="" update-filter="" search="search" search-changed="" select-all="selectAll()" select-none="selectNone()" select=""></i-steven-multi-select-filters>' +
				'	</div>' +
				'	<div class="checkBoxContainer">' +
				'		<div ng-repeat="item in inputModel | isteven: search : ignoreProperties" ng-if="checkIfGroupFalse(item)">' +
				'			<i-steven-multi-select-list ' +
				'			item="item" tick-marker="{{icon.tickMark}}" is-disabled="{{isDisabled}}" index="{{$index}}" tick-property="{{tickProperty}}" orientation="{{orientation}}" group-property="{{groupProperty}}" ' +
				'			spacing-property="{{spacingBasedOnGrouping[$index]}}" item-label="{{itemLabel}}"></i-steven-multi-select-list>' +
				'		</div>' +
				'	</div>' +
				'</div>' +
				'</span>'
			)
		}]);
})();