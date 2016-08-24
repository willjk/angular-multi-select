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
(function() {
	angular.module('isteven-multi-select', ['isteven-multi-select.filters', 'isteven-multi-select.list', 'isteven-multi-select.off-click', 'templates'])
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
						label = $attrs.buttonLabel ? $attrs.buttonLabel : $attrs.nothingSelected ? $attrs.nothingSelected : 'Nothing Selected ';
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
/* 
 * Angular JS Multi Select
 * Creates a dropdown-like button with checkboxes. 
 *
 * Project started on: Tue, 14 Jan 2014 - 5:18:02 PM
 * Current version: 4.0.0
 * 
 * Released under the MIT License
 * --------------------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Ignatius Steven (https://github.com/isteven)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal 
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions: 
 *
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 * --------------------------------------------------------------------------------
 */

'use strict'

angular.module( 'isteven-multi-select', ['ng'] ).directive( 'istevenMultiSelect' , [ '$sce', '$timeout', '$templateCache', function ( $sce, $timeout, $templateCache ) {
    return {
        restrict: 
            'AE',

        scope: 
        {   
            // models
            inputModel      : '=',
            outputModel     : '=',

            // settings based on attribute
            isDisabled      : '=',

            // callbacks
            onClear         : '&',  
            onClose         : '&',
            onSearchChange  : '&',  
            onItemClick     : '&',            
            onOpen          : '&', 
            onReset         : '&',  
            onSelectAll     : '&',  
            onSelectNone    : '&',  

            // i18n
            translation     : '='   
        },
        
        /* 
         * The rest are attributes. They don't need to be parsed / binded, so we can safely access them by value.
         * - buttonLabel, directiveId, helperElements, isDisabled, itemLabel, maxLabels, orientation, selectionMode, minSearchLength,
         *   tickProperty, disableProperty, groupProperty, searchProperty, maxHeight
         */
                                                         
         templateUrl: 
            'isteven-multi-select.htm',
        link: function ( $scope, element, attrs ) {                       

            $scope.backUp           = [];
            $scope.varButtonLabel   = '';               
            $scope.spacingProperty  = '';
            $scope.indexProperty    = '';                        
            $scope.orientationH     = false;
            $scope.orientationV     = true;
            $scope.filteredModel    = [];
            $scope.inputLabel       = { labelFilter: '' };                        
            $scope.tabIndex         = 0;            
            $scope.lang             = {};
            $scope.helperStatus     = {
                all     : true,
                none    : true,
                reset   : true,
                filter  : true
            };

            var 
                prevTabIndex        = 0,
                helperItems         = [],
                helperItemsLength   = 0,
                checkBoxLayer       = '',
                scrolled            = false,
                selectedItems       = [],
                formElements        = [],
                vMinSearchLength    = 0,
                clickedItem         = null                

            // v3.0.0
            // clear button clicked
            $scope.clearClicked = function( e ) {                
                $scope.inputLabel.labelFilter = '';
                $scope.updateFilter();
                $scope.select( 'clear', e );                
            }

            // A little hack so that AngularJS ng-repeat can loop using start and end index like a normal loop
            // http://stackoverflow.com/questions/16824853/way-to-ng-repeat-defined-number-of-times-instead-of-repeating-over-array
            $scope.numberToArray = function( num ) {
                return new Array( num );   
            }

            // Call this function when user type on the filter field
            $scope.searchChanged = function() {                                                
                if ( $scope.inputLabel.labelFilter.length < vMinSearchLength && $scope.inputLabel.labelFilter.length > 0 ) {
                    return false;
                }                
                $scope.updateFilter();
            }

            $scope.updateFilter = function()
            {      
                // we check by looping from end of input-model
                $scope.filteredModel = [];
                var i = 0;

                if ( typeof $scope.inputModel === 'undefined' ) {
                    return false;                   
                }

                for( i = $scope.inputModel.length - 1; i >= 0; i-- ) {

                    // if it's group end, we push it to filteredModel[];
                    if ( typeof $scope.inputModel[ i ][ attrs.groupProperty ] !== 'undefined' && $scope.inputModel[ i ][ attrs.groupProperty ] === false ) {
                        $scope.filteredModel.push( $scope.inputModel[ i ] );
                    }
                    
                    // if it's data 
                    var gotData = false;
                    if ( typeof $scope.inputModel[ i ][ attrs.groupProperty ] === 'undefined' ) {                        
                        
                        // If we set the search-key attribute, we use this loop. 
                        if ( typeof attrs.searchProperty !== 'undefined' && attrs.searchProperty !== '' ) {

                            for (var key in $scope.inputModel[ i ]  ) {
                                if ( 
                                    typeof $scope.inputModel[ i ][ key ] !== 'boolean'
                                    && String( $scope.inputModel[ i ][ key ] ).toUpperCase().indexOf( $scope.inputLabel.labelFilter.toUpperCase() ) >= 0                                     
                                    && attrs.searchProperty.indexOf( key ) > -1
                                ) {
                                    gotData = true;
                                    break;
                                }
                            }                        
                        }
                        // if there's no search-key attribute, we use this one. Much better on performance.
                        else {
                            for ( var key in $scope.inputModel[ i ]  ) {
                                if ( 
                                    typeof $scope.inputModel[ i ][ key ] !== 'boolean'
                                    && String( $scope.inputModel[ i ][ key ] ).toUpperCase().indexOf( $scope.inputLabel.labelFilter.toUpperCase() ) >= 0                                     
                                ) {
                                    gotData = true;
                                    break;
                                }
                            }                        
                        }

                        if ( gotData === true ) {    
                            // push
                            $scope.filteredModel.push( $scope.inputModel[ i ] );
                        }
                    }

                    // if it's group start
                    if ( typeof $scope.inputModel[ i ][ attrs.groupProperty ] !== 'undefined' && $scope.inputModel[ i ][ attrs.groupProperty ] === true ) {

                        if ( typeof $scope.filteredModel[ $scope.filteredModel.length - 1 ][ attrs.groupProperty ] !== 'undefined' 
                                && $scope.filteredModel[ $scope.filteredModel.length - 1 ][ attrs.groupProperty ] === false ) {
                            $scope.filteredModel.pop();
                        }
                        else {
                            $scope.filteredModel.push( $scope.inputModel[ i ] );
                        }
                    }
                }                

                $scope.filteredModel.reverse();  
                
                $timeout( function() {                    

                    $scope.getFormElements();               
                    
                    // Callback: on filter change                      
                    if ( $scope.inputLabel.labelFilter.length > vMinSearchLength ) {

                        var filterObj = [];

                        angular.forEach( $scope.filteredModel, function( value, key ) {
                            if ( typeof value !== 'undefined' ) {                   
                                if ( typeof value[ attrs.groupProperty ] === 'undefined' ) {                                                                    
                                    var tempObj = angular.copy( value );
                                    var index = filterObj.push( tempObj );                                
                                    delete filterObj[ index - 1 ][ $scope.indexProperty ];
                                    delete filterObj[ index - 1 ][ $scope.spacingProperty ];      
                                }
                            }
                        });

                        $scope.onSearchChange({ 
                            data: 
                            {
                                keyword: $scope.inputLabel.labelFilter, 
                                result: filterObj 
                            } 
                        });
                    }
                },0);
            };

            // List all the input elements. We need this for our keyboard navigation.
            // This function will be called everytime the filter is updated. 
            // Depending on the size of filtered mode, might not good for performance, but oh well..
            $scope.getFormElements = function() {                                     
                formElements = [];
                var 
                    selectButtons   = [],
                    inputField      = [],
                    checkboxes      = [],
                    clearButton     = [];
                
                // If available, then get select all, select none, and reset buttons
                if ( $scope.helperStatus.all || $scope.helperStatus.none || $scope.helperStatus.reset ) {                                                       
                    selectButtons = element.children().children().next().children().children()[ 0 ].getElementsByTagName( 'button' );                    
                    // If available, then get the search box and the clear button
                    if ( $scope.helperStatus.filter ) {                                            
                        // Get helper - search and clear button. 
                        inputField =    element.children().children().next().children().children().next()[ 0 ].getElementsByTagName( 'input' );                    
                        clearButton =   element.children().children().next().children().children().next()[ 0 ].getElementsByTagName( 'button' );                        
                    }
                }
                else {
                    if ( $scope.helperStatus.filter ) {   
                        // Get helper - search and clear button. 
                        inputField =    element.children().children().next().children().children()[ 0 ].getElementsByTagName( 'input' );                    
                        clearButton =   element.children().children().next().children().children()[ 0 ].getElementsByTagName( 'button' );
                    }
                }
               
                // Get checkboxes
                if ( !$scope.helperStatus.all && !$scope.helperStatus.none && !$scope.helperStatus.reset && !$scope.helperStatus.filter ) {
                    checkboxes = element.children().children().next()[ 0 ].getElementsByTagName( 'input' );
                }
                else {
                    checkboxes = element.children().children().next().children().next()[ 0 ].getElementsByTagName( 'input' );
                }

                // Push them into global array formElements[] 
                for ( var i = 0; i < selectButtons.length ; i++ )   { formElements.push( selectButtons[ i ] );  }
                for ( var i = 0; i < inputField.length ; i++ )      { formElements.push( inputField[ i ] );     }
                for ( var i = 0; i < clearButton.length ; i++ )     { formElements.push( clearButton[ i ] );    }
                for ( var i = 0; i < checkboxes.length ; i++ )      { formElements.push( checkboxes[ i ] );     }                                
            }        

            // check if an item has attrs.groupProperty (be it true or false)
            $scope.isGroupMarker = function( item , type ) {
                if ( typeof item[ attrs.groupProperty ] !== 'undefined' && item[ attrs.groupProperty ] === type ) return true; 
                return false;
            }

            $scope.removeGroupEndMarker = function( item ) {
                if ( typeof item[ attrs.groupProperty ] !== 'undefined' && item[ attrs.groupProperty ] === false ) return false; 
                return true;
            }                       

            // call this function when an item is clicked
            $scope.syncItems = function( item, e, ng_repeat_index ) {                                      

                e.preventDefault();
                e.stopPropagation();

                // if the directive is globaly disabled, do nothing
                if ( typeof attrs.disableProperty !== 'undefined' && item[ attrs.disableProperty ] === true ) {                                        
                    return false;
                }

                // if item is disabled, do nothing
                if ( typeof attrs.isDisabled !== 'undefined' && $scope.isDisabled === true ) {                        
                    return false;
                }                                

                // if end group marker is clicked, do nothing
                if ( typeof item[ attrs.groupProperty ] !== 'undefined' && item[ attrs.groupProperty ] === false ) {
                    return false;
                }                

                var index = $scope.filteredModel.indexOf( item );       

                // if the start of group marker is clicked ( only for multiple selection! )
                // how it works:
                // - if, in a group, there are items which are not selected, then they all will be selected
                // - if, in a group, all items are selected, then they all will be de-selected                
                if ( typeof item[ attrs.groupProperty ] !== 'undefined' && item[ attrs.groupProperty ] === true ) {                                  

                    // this is only for multiple selection, so if selection mode is single, do nothing
                    if ( typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE' ) {
                        return false;
                    }
                    
                    var i,j,k;
                    var startIndex = 0;
                    var endIndex = $scope.filteredModel.length - 1;
                    var tempArr = [];

                    // nest level is to mark the depth of the group.
                    // when you get into a group (start group marker), nestLevel++
                    // when you exit a group (end group marker), nextLevel--
                    var nestLevel = 0;                    

                    // we loop throughout the filtered model (not whole model)
                    for( i = index ; i < $scope.filteredModel.length ; i++) {  

                        // this break will be executed when we're done processing each group
                        if ( nestLevel === 0 && i > index ) 
                        {
                            break;
                        }
                    
                        if ( typeof $scope.filteredModel[ i ][ attrs.groupProperty ] !== 'undefined' && $scope.filteredModel[ i ][ attrs.groupProperty ] === true ) {
                            
                            // To cater multi level grouping
                            if ( tempArr.length === 0 ) {
                                startIndex = i + 1; 
                            }                            
                            nestLevel = nestLevel + 1;
                        }                                                

                        // if group end
                        else if ( typeof $scope.filteredModel[ i ][ attrs.groupProperty ] !== 'undefined' && $scope.filteredModel[ i ][ attrs.groupProperty ] === false ) {

                            nestLevel = nestLevel - 1;                            

                            // cek if all are ticked or not                            
                            if ( tempArr.length > 0 && nestLevel === 0 ) {                                

                                var allTicked = true;       

                                endIndex = i;

                                for ( j = 0; j < tempArr.length ; j++ ) {                                
                                    if ( typeof tempArr[ j ][ $scope.tickProperty ] !== 'undefined' &&  tempArr[ j ][ $scope.tickProperty ] === false ) {
                                        allTicked = false;
                                        break;
                                    }
                                }                                                                                    

                                if ( allTicked === true ) {
                                    for ( j = startIndex; j <= endIndex ; j++ ) {
                                        if ( typeof $scope.filteredModel[ j ][ attrs.groupProperty ] === 'undefined' ) {
                                            if ( typeof attrs.disableProperty === 'undefined' ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = false;
                                            }
                                            else if ( $scope.filteredModel[ j ][ attrs.disableProperty ] !== true ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = false;
                                            }
                                        }
                                    }                                
                                }

                                else {
                                    for ( j = startIndex; j <= endIndex ; j++ ) {
                                        if ( typeof $scope.filteredModel[ j ][ attrs.groupProperty ] === 'undefined' ) {
                                            if ( typeof attrs.disableProperty === 'undefined' ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = true;                                                
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = true;

                                            }                                            
                                            else if ( $scope.filteredModel[ j ][ attrs.disableProperty ] !== true ) {
                                                $scope.filteredModel[ j ][ $scope.tickProperty ] = true;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[ j ][ $scope.indexProperty ];
                                                $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = true;
                                            }
                                        }
                                    }                                
                                }                                                                                    
                            }
                        }
            
                        // if data
                        else {                            
                            tempArr.push( $scope.filteredModel[ i ] );                                                                                    
                        }
                    }                                 
                }

                // if an item (not group marker) is clicked
                else {

                    // If it's single selection mode
                    if ( typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE' ) {
                        
                        // first, set everything to false
                        for( i=0 ; i < $scope.filteredModel.length ; i++) {                            
                            $scope.filteredModel[ i ][ $scope.tickProperty ] = false;                            
                        }        
                        for( i=0 ; i < $scope.inputModel.length ; i++) {                            
                            $scope.inputModel[ i ][ $scope.tickProperty ] = false;                            
                        }        
                        
                        // then set the clicked item to true
                        $scope.filteredModel[ index ][ $scope.tickProperty ] = true;                                                                 
                    }   

                    // Multiple
                    else {
                        $scope.filteredModel[ index ][ $scope.tickProperty ]   = !$scope.filteredModel[ index ][ $scope.tickProperty ];
                    }

                    // we refresh input model as well
                    var inputModelIndex = $scope.filteredModel[ index ][ $scope.indexProperty ];                                        
                    $scope.inputModel[ inputModelIndex ][ $scope.tickProperty ] = $scope.filteredModel[ index ][ $scope.tickProperty ];                    
                }                                  

                // we execute the callback function here
                clickedItem = angular.copy( item );                                                    
                if ( clickedItem !== null ) {                        
                    $timeout( function() {
                        delete clickedItem[ $scope.indexProperty ];
                        delete clickedItem[ $scope.spacingProperty ];      
                        $scope.onItemClick( { data: clickedItem } );
                        clickedItem = null;                    
                    }, 0 );                                                 
                }                                    
                
                $scope.refreshOutputModel();
                $scope.refreshButton();                              

                // We update the index here
                prevTabIndex = $scope.tabIndex;
                $scope.tabIndex = ng_repeat_index + helperItemsLength;
                                
                // Set focus on the hidden checkbox 
                e.target.focus();

                // set & remove CSS style
                $scope.removeFocusStyle( prevTabIndex );
                $scope.setFocusStyle( $scope.tabIndex );

                if ( typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE' ) {
                    // on single selection mode, we then hide the checkbox layer
                    $scope.toggleCheckboxes( e );       
                }
            }     

            // update $scope.outputModel
            $scope.refreshOutputModel = function() {            
                
                $scope.outputModel  = [];
                var 
                    outputProps     = [],
                    tempObj         = {};

                // v4.0.0
                if ( typeof attrs.outputProperties !== 'undefined' ) {                    
                    outputProps = attrs.outputProperties.split(' ');                
                    angular.forEach( $scope.inputModel, function( value, key ) {                    
                        if ( 
                            typeof value !== 'undefined' 
                            && typeof value[ attrs.groupProperty ] === 'undefined' 
                            && value[ $scope.tickProperty ] === true 
                        ) {
                            tempObj         = {};
                            angular.forEach( value, function( value1, key1 ) {                                
                                if ( outputProps.indexOf( key1 ) > -1 ) {                                                                         
                                    tempObj[ key1 ] = value1;                                    
                                }
                            });
                            var index = $scope.outputModel.push( tempObj );                                                               
                            delete $scope.outputModel[ index - 1 ][ $scope.indexProperty ];
                            delete $scope.outputModel[ index - 1 ][ $scope.spacingProperty ];                                      
                        }
                    });         
                }
                else {
                    angular.forEach( $scope.inputModel, function( value, key ) {                    
                        if ( 
                            typeof value !== 'undefined' 
                            && typeof value[ attrs.groupProperty ] === 'undefined' 
                            && value[ $scope.tickProperty ] === true 
                        ) {
                            var temp = angular.copy( value );
                            var index = $scope.outputModel.push( temp );                                                               
                            delete $scope.outputModel[ index - 1 ][ $scope.indexProperty ];
                            delete $scope.outputModel[ index - 1 ][ $scope.spacingProperty ];                                      
                        }
                    });         
                }
            }

            // refresh button label
            $scope.refreshButton = function() {

                $scope.varButtonLabel   = '';                
                var ctr                 = 0;                  

                // refresh button label...
                if ( $scope.outputModel.length === 0 ) {
                    // https://github.com/isteven/angular-multi-select/pull/19                    
                    $scope.varButtonLabel = $scope.lang.nothingSelected;
                }
                else {                
                    var tempMaxLabels = $scope.outputModel.length;
                    if ( typeof attrs.maxLabels !== 'undefined' && attrs.maxLabels !== '' ) {
                        tempMaxLabels = $scope.maxLabels;
                    }

                    // if max amount of labels displayed..
                    if ( $scope.outputModel.length > tempMaxLabels ) {
                        $scope.more = true;
                    }
                    else {
                        $scope.more = false;
                    }                
                    
                    angular.forEach( $scope.inputModel, function( value, key ) {
                        if ( typeof value !== 'undefined' && value[ attrs.tickProperty ] === true ) {                        
                            if ( ctr < tempMaxLabels ) {                            
                                $scope.varButtonLabel += ( $scope.varButtonLabel.length > 0 ? '</div>, <div class="buttonLabel">' : '<div class="buttonLabel">') + $scope.writeLabel( value, 'buttonLabel' );
                            }
                            ctr++;
                        }
                    });                

                    if ( $scope.more === true ) {
                        // https://github.com/isteven/angular-multi-select/pull/16
                        if (tempMaxLabels > 0) {
                            $scope.varButtonLabel += ', ... ';
                        }
                        $scope.varButtonLabel += '(' + $scope.outputModel.length + ')';                        
                    }
                }
                $scope.varButtonLabel = $sce.trustAsHtml( $scope.varButtonLabel + '<span class="caret"></span>' );                
            }

            // Check if a checkbox is disabled or enabled. It will check the granular control (disableProperty) and global control (isDisabled)
            // Take note that the granular control has higher priority.
            $scope.itemIsDisabled = function( item ) {
                
                if ( typeof attrs.disableProperty !== 'undefined' && item[ attrs.disableProperty ] === true ) {                                        
                    return true;
                }
                else {             
                    if ( $scope.isDisabled === true ) {                        
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                
            }

            // A simple function to parse the item label settings. Used on the buttons and checkbox labels.
            $scope.writeLabel = function( item, type ) {
                
                // type is either 'itemLabel' or 'buttonLabel'
                var temp    = attrs[ type ].split( ' ' );                    
                var label   = '';                

                angular.forEach( temp, function( value, key ) {                
                    item[ value ] || ( label += '&nbsp;' + value.split( '.' ).reduce( function( prev, current ) {
                        return prev[ current ]; 
                    }, item ));        
                });
                
                if ( type.toUpperCase() === 'BUTTONLABEL' ) {                    
                    return label;
                }
                return $sce.trustAsHtml( label );
            }
                          

            // UI operations to show/hide checkboxes based on click event..
            $scope.toggleCheckboxes = function( e ) {                                    
                
                // We grab the button
                var clickedEl = element.children()[0];

                // Just to make sure.. had a bug where key events were recorded twice
                angular.element( document ).off( 'click', $scope.externalClickListener );
                angular.element( document ).off( 'keydown', $scope.keyboardListener );        

                // The idea below was taken from another multi-select directive - https://github.com/amitava82/angular-multiselect 
                // His version is awesome if you need a more simple multi-select approach.                                

                // close
                if ( angular.element( checkBoxLayer ).hasClass( 'show' )) {                         

                    angular.element( checkBoxLayer ).removeClass( 'show' );                    
                    angular.element( clickedEl ).removeClass( 'buttonClicked' );                    
                    angular.element( document ).off( 'click', $scope.externalClickListener );
                    angular.element( document ).off( 'keydown', $scope.keyboardListener );                                    

                    // clear the focused element;
                    $scope.removeFocusStyle( $scope.tabIndex );
                    if ( typeof formElements[ $scope.tabIndex ] !== 'undefined' ) {
                        formElements[ $scope.tabIndex ].blur();
                    }

                    // close callback
                    $timeout( function() {
                        $scope.onClose();
                    }, 0 );

                    // set focus on button again
                    element.children().children()[ 0 ].focus();
                } 
                // open
                else                 
                {    
                    // clear filter
                    $scope.inputLabel.labelFilter = '';                
                    $scope.updateFilter();                                

                    helperItems = [];
                    helperItemsLength = 0;

                    angular.element( checkBoxLayer ).addClass( 'show' );
                    angular.element( clickedEl ).addClass( 'buttonClicked' );       

                    // Attach change event listener on the input filter. 
                    // We need this because ng-change is apparently not an event listener.                    
                    angular.element( document ).on( 'click', $scope.externalClickListener );
                    angular.element( document ).on( 'keydown', $scope.keyboardListener );  

                    // to get the initial tab index, depending on how many helper elements we have. 
                    // priority is to always focus it on the input filter 
                    $scope.getFormElements();
                    $scope.tabIndex = 0;

                    var helperContainer = angular.element( element[ 0 ].querySelector( '.helperContainer' ) )[0];                
                    
                    if ( typeof helperContainer !== 'undefined' ) {
                        for ( var i = 0; i < helperContainer.getElementsByTagName( 'BUTTON' ).length ; i++ ) {
                            helperItems[ i ] = helperContainer.getElementsByTagName( 'BUTTON' )[ i ];
                        }
                        helperItemsLength = helperItems.length + helperContainer.getElementsByTagName( 'INPUT' ).length;
                    }
                    
                    // focus on the filter element on open. 
                    if ( element[ 0 ].querySelector( '.inputFilter' ) ) {                        
                        element[ 0 ].querySelector( '.inputFilter' ).focus();    
                        $scope.tabIndex = $scope.tabIndex + helperItemsLength - 2;
                    }
                    // if there's no filter then just focus on the first checkbox item
                    else {                                      
                        $scope.tabIndex = $scope.tabIndex + helperItemsLength;
                        if ( $scope.inputModel.length > 0 ) {
                            formElements[ $scope.tabIndex ].focus();
                            $scope.setFocusStyle( $scope.tabIndex );
                        }
                    }                       

                    // open callback
                    $scope.onOpen();
                }                            
            }
            
            // handle clicks outside the button / multi select layer
            $scope.externalClickListener = function( e ) {                   

                var targetsArr = element.find( e.target.tagName );
                for (var i = 0; i < targetsArr.length; i++) {                                        
                    if ( e.target == targetsArr[i] ) {
                        return;
                    }
                }

                angular.element( checkBoxLayer.previousSibling ).removeClass( 'buttonClicked' );                    
                angular.element( checkBoxLayer ).removeClass( 'show' );
                angular.element( document ).off( 'click', $scope.externalClickListener ); 
                angular.element( document ).off( 'keydown', $scope.keyboardListener );                
                
                // close callback                
                $timeout( function() {
                    $scope.onClose();
                }, 0 );

                // set focus on button again
                //element.children().children()[ 0 ].focus();
            }
   
            // select All / select None / reset buttons
            $scope.select = function( type, e ) {

                var helperIndex = helperItems.indexOf( e.target );
                $scope.tabIndex = helperIndex;

                switch( type.toUpperCase() ) {
                    case 'ALL':
                        angular.forEach( $scope.filteredModel, function( value, key ) {                            
                            if ( typeof value !== 'undefined' && value[ attrs.disableProperty ] !== true ) {                                
                                if ( typeof value[ attrs.groupProperty ] === 'undefined' ) {                                
                                    value[ $scope.tickProperty ] = true;
                                }
                            }
                        });                            
                        $scope.refreshOutputModel();                                    
                        $scope.refreshButton();                                                  
                        $scope.onSelectAll();                                                
                        break;
                    case 'NONE':
                        angular.forEach( $scope.filteredModel, function( value, key ) {
                            if ( typeof value !== 'undefined' && value[ attrs.disableProperty ] !== true ) {                        
                                if ( typeof value[ attrs.groupProperty ] === 'undefined' ) {                                
                                    value[ $scope.tickProperty ] = false;
                                }
                            }
                        });               
                        $scope.refreshOutputModel();                                    
                        $scope.refreshButton();                                                                          
                        $scope.onSelectNone();                        
                        break;
                    case 'RESET':            
                        angular.forEach( $scope.filteredModel, function( value, key ) {                            
                            if ( typeof value[ attrs.groupProperty ] === 'undefined' && typeof value !== 'undefined' && value[ attrs.disableProperty ] !== true ) {                        
                                var temp = value[ $scope.indexProperty ];                                
                                value[ $scope.tickProperty ] = $scope.backUp[ temp ][ $scope.tickProperty ];
                            }
                        });               
                        $scope.refreshOutputModel();                                    
                        $scope.refreshButton();                                                                          
                        $scope.onReset();                        
                        break;
                    case 'CLEAR':
                        $scope.tabIndex = $scope.tabIndex + 1;
                        $scope.onClear();    
                        break;
                    case 'FILTER':                        
                        $scope.tabIndex = helperItems.length - 1;
                        break;
                    default:                        
                }                                                                                 
            }            

            // just to create a random variable name                
            function genRandomString( length ) {                
                var possible    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                var temp        = '';
                for( var i=0; i < length; i++ ) {
                     temp += possible.charAt( Math.floor( Math.random() * possible.length ));
                }
                return temp;
            }

            // count leading spaces
            $scope.prepareGrouping = function() {
                var spacing     = 0;                                                
                angular.forEach( $scope.filteredModel, function( value, key ) {
                    value[ $scope.spacingProperty ] = spacing;                    
                    if ( value[ attrs.groupProperty ] === true ) {
                        spacing+=2;
                    }                    
                    else if ( value[ attrs.groupProperty ] === false ) {
                        spacing-=2;
                    }                 
                });
            }

            // prepare original index
            $scope.prepareIndex = function() {
                var ctr = 0;
                angular.forEach( $scope.filteredModel, function( value, key ) {
                    value[ $scope.indexProperty ] = ctr;
                    ctr++;
                });
            }

            // navigate using up and down arrow
            $scope.keyboardListener = function( e ) { 

                var key = e.keyCode ? e.keyCode : e.which;      
                var isNavigationKey = false;                                                

                // ESC key (close)
                if ( key === 27 ) {
                    e.preventDefault();                   
                    $scope.toggleCheckboxes( e );
                }                    
                
                // next element ( tab, down & right key )                    
                else if ( key === 40 || key === 39 || ( !e.shiftKey && key == 9 ) ) {                    
                    
                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex; 
                    $scope.tabIndex++;                         
                    if ( $scope.tabIndex > formElements.length - 1 ) {
                        $scope.tabIndex = 0;
                        prevTabIndex = formElements.length - 1; 
                    }                                                            
                    while ( formElements[ $scope.tabIndex ].disabled === true ) {                                                                        
                        $scope.tabIndex++;
                        if ( $scope.tabIndex > formElements.length - 1 ) {
                            $scope.tabIndex = 0;                            
                        }                                                                                    
                    }              
                }
                
                // prev element ( shift+tab, up & left key )
                else if ( key === 38 || key === 37 || ( e.shiftKey && key == 9 ) ) { 
                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex; 
                    $scope.tabIndex--;                              
                    if ( $scope.tabIndex < 0 ) {
                        $scope.tabIndex = formElements.length - 1;
                        prevTabIndex = 0;
                    }                                         
                    while ( formElements[ $scope.tabIndex ].disabled === true ) {
                        $scope.tabIndex--;
                        if ( $scope.tabIndex < 0 ) {
                            $scope.tabIndex = formElements.length - 1;
                        }                                                                 
                    }                                 
                }                    

                if ( isNavigationKey === true ) {                                         
                    
                    e.preventDefault();

                    // set focus on the checkbox
                    formElements[ $scope.tabIndex ].focus();    
                    var actEl = document.activeElement;                     
                    
                    if ( actEl.type.toUpperCase() === 'CHECKBOX' ) {                                                   
                        $scope.setFocusStyle( $scope.tabIndex );
                        $scope.removeFocusStyle( prevTabIndex );
                    }                    
                    else {
                        $scope.removeFocusStyle( prevTabIndex );
                        $scope.removeFocusStyle( helperItemsLength );
                        $scope.removeFocusStyle( formElements.length - 1 );
                    } 
                }                

                isNavigationKey = false;
            }

            // set (add) CSS style on selected row
            $scope.setFocusStyle = function( tabIndex ) {                                
                angular.element( formElements[ tabIndex ] ).parent().parent().parent().addClass( 'multiSelectFocus' );                        
            }

            // remove CSS style on selected row
            $scope.removeFocusStyle = function( tabIndex ) {                
                angular.element( formElements[ tabIndex ] ).parent().parent().parent().removeClass( 'multiSelectFocus' );
            }

            /*********************
             *********************             
             *
             * 1) Initializations
             *
             *********************
             *********************/

            // Copy some properties that will be used on the template. They need to be in the $scope.
            $scope.groupProperty    = attrs.groupProperty;   
            $scope.tickProperty     = attrs.tickProperty;
            $scope.directiveId      = attrs.directiveId;
            
            // Unfortunately I need to add these grouping properties into the input model
            var tempStr = genRandomString( 5 );
            $scope.indexProperty = 'idx_' + tempStr;
            $scope.spacingProperty = 'spc_' + tempStr;         

            // set orientation css            
            if ( typeof attrs.orientation !== 'undefined' ) {

                if ( attrs.orientation.toUpperCase() === 'HORIZONTAL' ) {                    
                    $scope.orientationH = true;
                    $scope.orientationV = false;
                }
                else 
                {
                    $scope.orientationH = false;
                    $scope.orientationV = true;
                }
            }            

            // get elements required for DOM operation
            checkBoxLayer = element.children().children().next()[0];

            // set max-height property if provided
            if ( typeof attrs.maxHeight !== 'undefined' ) {                
                var layer = element.children().children().children()[0];
                angular.element( layer ).attr( "style", "height:" + attrs.maxHeight + "; overflow-y:scroll;" );                                
            }

            // some flags for easier checking            
            for ( var property in $scope.helperStatus ) {
                if ( $scope.helperStatus.hasOwnProperty( property )) {                    
                    if ( 
                        typeof attrs.helperElements !== 'undefined' 
                        && attrs.helperElements.toUpperCase().indexOf( property.toUpperCase() ) === -1 
                    ) {
                        $scope.helperStatus[ property ] = false;
                    }
                }
            }
            if ( typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE' )  {
                $scope.helperStatus[ 'all' ] = false;
                $scope.helperStatus[ 'none' ] = false;
            }

            // helper button icons.. I guess you can use html tag here if you want to. 
            $scope.icon        = {};            
            $scope.icon.selectAll  = '&#10003;';    // a tick icon
            $scope.icon.selectNone = '&times;';     // x icon
            $scope.icon.reset      = '&#8630;';     // undo icon            
            // this one is for the selected items
            $scope.icon.tickMark   = '&#10003;';    // a tick icon 

            // configurable button labels                       
            if ( typeof attrs.translation !== 'undefined' ) {
                $scope.lang.selectAll       = $sce.trustAsHtml( $scope.icon.selectAll  + '&nbsp;&nbsp;' + $scope.translation.selectAll );
                $scope.lang.selectNone      = $sce.trustAsHtml( $scope.icon.selectNone + '&nbsp;&nbsp;' + $scope.translation.selectNone );
                $scope.lang.reset           = $sce.trustAsHtml( $scope.icon.reset      + '&nbsp;&nbsp;' + $scope.translation.reset );
                $scope.lang.search          = $scope.translation.search;                
                $scope.lang.nothingSelected = $sce.trustAsHtml( $scope.translation.nothingSelected );                
            }
            else {
                $scope.lang.selectAll       = $sce.trustAsHtml( $scope.icon.selectAll  + '&nbsp;&nbsp;Select All' );                
                $scope.lang.selectNone      = $sce.trustAsHtml( $scope.icon.selectNone + '&nbsp;&nbsp;Select None' );
                $scope.lang.reset           = $sce.trustAsHtml( $scope.icon.reset      + '&nbsp;&nbsp;Reset' );
                $scope.lang.search          = 'Search...';
                $scope.lang.nothingSelected = 'None Selected';                
            }
            $scope.icon.tickMark = $sce.trustAsHtml( $scope.icon.tickMark );
                
            // min length of keyword to trigger the filter function
            if ( typeof attrs.MinSearchLength !== 'undefined' && parseInt( attrs.MinSearchLength ) > 0 ) {
                vMinSearchLength = Math.floor( parseInt( attrs.MinSearchLength ) );
            }

            /*******************************************************
             *******************************************************
             *
             * 2) Logic starts here, initiated by watch 1 & watch 2
             *
             *******************************************************
             *******************************************************/
            
            // watch1, for changes in input model property
            // updates multi-select when user select/deselect a single checkbox programatically
            // https://github.com/isteven/angular-multi-select/issues/8            
            $scope.$watch( 'inputModel' , function( newVal ) {                                 
                if ( newVal ) {                            
                    $scope.refreshOutputModel();                                    
                    $scope.refreshButton();                                                  
                }
            }, true );
            
            // watch2 for changes in input model as a whole
            // this on updates the multi-select when a user load a whole new input-model. We also update the $scope.backUp variable
            $scope.$watch( 'inputModel' , function( newVal ) {  
                if ( newVal ) {
                    $scope.backUp = angular.copy( $scope.inputModel );    
                    $scope.updateFilter();
                    $scope.prepareGrouping();
                    $scope.prepareIndex();                                                              
                    $scope.refreshOutputModel();                
                    $scope.refreshButton();                                                                                                                 
                }
            });                        

            // watch for changes in directive state (disabled or enabled)
            $scope.$watch( 'isDisabled' , function( newVal ) {         
                $scope.isDisabled = newVal;                               
            });            

            // this is for touch enabled devices. We don't want to hide checkboxes on scroll. 
            angular.element( document ).on( 'touchstart', function( e ) { 
                $scope.$apply( function() {
                    scrolled = false;
                }); 
            });
            
            // also for touch enabled devices
            angular.element( document ).on( 'touchmove', function( e ) { 
                $scope.$apply( function() {
                    scrolled = true;                
                });
            });
			
			//$scope.toggleCheckboxes();                              
        }
    }
}])
.directive('iStevenMultiSelectRow', [function(){
	var directive = {
			restrict: 'E',
			scope: {
				syncItems: '&',
				tickProperty: '@',
				orientation: '@',
				spacingProperty: '@',
				groupProperty: '@',
				disabledProperty: '@',
				disabled: '&',
				item: '=',
				tickMarker: '='
			},
			require: 'istevenMultiSelect^',
			template: '<div '+
                        //'ng-repeat="item in filteredModel | filter:removeGroupEndMarker" ' + 
						'class="multiSelectItem" '+
                        'ng-class="{selected: item[ tickProperty ], horizontal: orientation === \'h\', vertical: orientation === \'v\', multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"'+
                        'ng-click="syncItems( item, $event, $index );" '+
                        'ng-mouseleave="removeFocusStyle( tabIndex );"> '+
                        // this is the spacing for grouped items
                        '<div class="acol" ng-if="item[ spacingProperty ] > 0" ng-repeat="i in numberToArray( item[ spacingProperty ] ) track by $index">'+                        
                    	'</div>  '+        
						'<div class="acol">'+
							'<label>'+                                
								// input, so that it can accept focus on keyboard click
								'<input class="checkbox focusable" type="checkbox" '+
									'ng-disabled="itemIsDisabled( item )" '+
									'ng-checked="item[ tickProperty ]" '+
									'ng-click="syncItems( item, $event, $index )" />'+
								// item label using ng-bind-hteml
								'<span '+
									'ng-class="{disabled:itemIsDisabled( item )}" '+
									'ng-bind-html="writeLabel( item, \'itemLabel\' )">'+
								'</span>'+
							'</label>'+
						'</div>'+
						// the tick/check mark
						'<span class="tickMark" ng-if="item[ groupProperty ] !== true && item[ tickProperty ] === true" ng-bind-html="tickMarker"></span>'+
                '</div>',
			link: link
		};

		return directive;

		function link(scope, elem, attrs, ctrl) {


			scope.syncItems = syncItems;

			scope.numberToArray = numberToArray;
			
			scope.itemIsDisabled = itemIsDisabled;
			
			scope.removeFocusStyle = removeFocusStyle;
			
			function removeFocusStyle(){
				elem.removeClass( 'multiSelectFocus' );
			}
			
			function itemIsDisabled( item ) {
				var itemIsDisabledReturn = false;
                
                if ( typeof attrs.disableProperty !== 'undefined' && item[ attrs.disableProperty ] === true ) {                                        
                    itemIsDisabledReturn = true;
                }
                else {
					itemIsDisabledReturn = $scope.isDisabled === true;
                }		
				return itemIsDisabledReturn;            
            }
			
			debugger;

			function numberToArray(num) {
				return new Array(num);
			}

			function syncItems($event) {

			}
		}
}]).run( [ '$templateCache' , function( $templateCache ) {
    var template = 
        '<span class="multiSelect inlineBlock">' +
            // main button
            '<button id="{{directiveId}}" type="button"' +                
                'ng-click="toggleCheckboxes( $event ); refreshSelectedItems(); refreshButton(); prepareGrouping; prepareIndex();"' +
                'ng-bind-html="varButtonLabel"' +
                'ng-disabled="disable-button"' +
            '>' +
            '</button>' +
            // overlay layer
            '<div class="checkboxLayer">' +
                // container of the helper elements
                '<div class="helperContainer" ng-if="helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset ">' +
                    // container of the first 3 buttons, select all, none and reset
                    '<div class="line" ng-if="helperStatus.all || helperStatus.none || helperStatus.reset ">' +
                        // select all
                        '<button type="button" class="helperButton"' +
                            'ng-if="!isDisabled && helperStatus.all"' +
                            'ng-click="select( \'all\', $event );"' +
                            'ng-bind-html="lang.selectAll">' +
                        '</button>'+
                        // select none
                        '<button type="button" class="helperButton"' +
                            'ng-if="!isDisabled && helperStatus.none"' +
                            'ng-click="select( \'none\', $event );"' +
                            'ng-bind-html="lang.selectNone">' +
                        '</button>'+
                        // reset
                        '<button type="button" class="helperButton reset"' +
                            'ng-if="!isDisabled && helperStatus.reset"' +
                            'ng-click="select( \'reset\', $event );"' +
                            'ng-bind-html="lang.reset">'+
                        '</button>' +
                    '</div>' +
                    // the search box
                    '<div class="line" style="position:relative" ng-if="helperStatus.filter">'+
                        // textfield                
                        '<input placeholder="{{lang.search}}" type="text"' +
                            'ng-click="select( \'filter\', $event )" '+
                            'ng-model="inputLabel.labelFilter" '+
                            'ng-change="searchChanged()" class="inputFilter"'+
                            '/>'+
                        // clear button
                        '<button type="button" class="clearButton" ng-click="clearClicked( $event )" >×</button> '+
                    '</div> '+
                '</div> '+
                // selection items
                '<div class="checkBoxContainer">'+
                    '<div '+
                        'ng-repeat="item in filteredModel | filter:removeGroupEndMarker" class="multiSelectItem"'+
                        'ng-class="{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"'+
                        'ng-click="syncItems( item, $event, $index );" '+
                        'ng-mouseleave="removeFocusStyle( tabIndex );"> '+
                        // this is the spacing for grouped items
                        '<div class="acol" ng-if="item[ spacingProperty ] > 0" ng-repeat="i in numberToArray( item[ spacingProperty ] ) track by $index">'+                        
                    	'</div>  '+        
						'<div class="acol">'+
							'<label>'+                                
								// input, so that it can accept focus on keyboard click
								'<input class="checkbox focusable" type="checkbox" '+
									'ng-disabled="itemIsDisabled( item )" '+
									'ng-checked="item[ tickProperty ]" '+
									'ng-click="syncItems( item, $event, $index )" />'+
								// item label using ng-bind-hteml
								'<span '+
									'ng-class="{disabled:itemIsDisabled( item )}" '+
									'ng-bind-html="writeLabel( item, \'itemLabel\' )">'+
								'</span>'+
							'</label>'+
						'</div>'+
						// the tick/check mark
						'<span class="tickMark" ng-if="item[ groupProperty ] !== true && item[ tickProperty ] === true" ng-bind-html="icon.tickMark"></span>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</span>';

	$templateCache.put( 'isteven-multi-select.htm' , template );

}]); 
