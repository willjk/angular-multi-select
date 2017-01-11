(function() {
	angular.module('isteven-multi-select', ['isteven-multi-select.filters', 'isteven-multi-select.list', 'isteven-multi-select.off-click'])
		.directive('iStevenMultiSelect', ['$sce', '$filter', function($sce, $filter) {
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
					disableProperty: '@',
					directiveId: '@',
					orientation: '@',
					itemLabel: '@',
					hideSelect: '@', //will make dropdown autoshow if it is hidden
					filterProperties: '@',
					listCss: '@',

					// i18n
					translation: '='
				},
				templateUrl: 'container/iStevenMultiSelectContainer.html',
				controller: controller//The controller handles inner directives talking to an outer directive(controller of all inner baby directives)
			};

			return directive;

			function controller($scope, $element, $attrs) {
				$scope.hideSelect = !$attrs.hideSelect ? 'false' : $attrs.hideSelect == 'true';
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
				$scope.maxHeight = $attrs.hasOwnProperty('maxHeight') ? $attrs.maxHeight : '';
				$scope.onSearchChange = $scope.onSearchChange ? $scope.onSearchChange : onSearchChange;
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
				$scope.maxLabels = $attrs.maxLabels;

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

				$attrs.$observe('maxLabels', function(nVal) {
					$scope.maxLabels = $attrs.maxLabels;
					$scope.writeButtonLabel();
				});

				$scope.$watch('inputModel', function(nVal) {
					if (nVal !== undefined) {
						$scope.calculateSpacingBasedOnGrouping();
						writeButtonLabel();
					}
				}, true);

				function keyboardListener() {

				};

				function offClick() {
					if (!$scope.showDropdown) {
						return;
					}
					$scope.toggleCheckboxes();
				}

				function selectAll() {
					selectedGroupProperty(0, true, true);
					$scope.onSelectAll();
				}

				function selectNone() {
					selectedGroupProperty(0, true, false);
					$scope.onSelectNone();
				};
				
				function isItemDisabled(item){
					return ($scope.isDisabled == 'true' || (item.hasOwnProperty($scope.disableProperty) && item[$scope.disableProperty] === true))
				}

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
						} else if (!filteredInputModel[i][$scope.tickProperty] && !isItemDisabled(filteredInputModel[i])) {
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
							if (!isItemDisabled(filteredInputModel[j])) {
								filteredInputModel[j][$scope.tickProperty] = !allTicked;
								itemClicked(j, filteredInputModel[j][$scope.tickProperty]);
								if (!allTicked) {
									$scope.filteredModel.push(filteredInputModel[j]);
								}
							}

						}
					}
					writeButtonLabel();
				}

				function writeButtonLabel() {
					var length = $scope.outputModel.length, label = '', labelCount = 0, maxLabels = parseInt($scope.maxLabels);
					if (length === 0) {
						label = $attrs.nothingSelected ? $attrs.nothingSelected : 'Nothing Selected ';
					}
					if (maxLabels === 0 && length !== 0) {
						label = '(' + length + ')';
						length = 0;
					}
					for (var i = 0; i < length; i++) {
						if (maxLabels !== -1 && maxLabels <= i) {
							label += '...(' + (length - i).toString() + ')';
							break;
						}
						label += writeLabel($scope.outputModel[i],true, $attrs.buttonLabel ? $attrs.buttonLabel : $attrs.itemLabel);
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

				function itemClicked(index,  isChecked) {
					var found_index = findIndexOfObjectInArrayBasedOnProperty($scope.outputModel, 'array_index', index);
					if (isChecked) {
						if (found_index === -1) {
							var copy = angular.copy($filter('isteven')($scope.inputModel, $scope.search, $scope.ignoreProperties, $scope.filterProperties)[index]);
							copy.array_index = index;
							$scope.outputModel.push(copy);
						}
					} else {
						$scope.outputModel.splice(found_index, 1);
					}
					writeButtonLabel();
					$scope.onItemClick();
				}

				function writeLabel(item, trustAsHtml, itemLabel) {

					if (item.hasOwnProperty($scope.groupProperty)) {
						return $sce.trustAsHtml(item.name);
					}

					// type is either 'itemLabel' or 'buttonLabel'
					var temp = itemLabel ? itemLabel.split(' ') : $scope.itemLabel.split(' ');
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

				function generateSafeHtml(text) {
					return $sce.trustAsHtml(text);
				}

				// UI operations to show/hide checkboxes based on click event..
				function toggleCheckboxes(e) {
					$scope.showDropdown = !$scope.showDropdown;
					if ($scope.showDropdown) {
						$scope.onOpen();
					} else {
						$scope.onClose();
					}
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
		}]);
})();